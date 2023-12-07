// Copyright (c) 2023, NeKz
// SPDX-License-Identifier: MIT

import { GbxClient } from '@evotm/gbxclient';
import * as net from 'node:net';
import promiseToolbox from 'npm:promise-toolbox@0.21.0';
import { logger } from './logger.ts';

// Fix connection logic:
//    * Emit "connect" false on error and not connected
//    * Emit "connect" false on timeout (2 seconds)
// deno-lint-ignore no-explicit-any
(GbxClient.prototype as any).connect = async function (host?: string, port?: number): Promise<boolean> {
  this.host = host || '127.0.0.1';
  this.port = port || 5000;
  this.socket = net.connect(this.port, this.host);
  this.socket.setKeepAlive(true);
  this.socket.setTimeout(2_000);
  this.socket.on('timeout', () => {
    this.socket.destroy();
    this.emit('connect', false);
  });
  // deno-lint-ignore no-explicit-any
  this.socket.on('error', (error: any) => {
    if (this.isConnected) {
      console.error('Client socket error:', error.message);
      console.error('Retrying connection in 5 seconds.');
      this.socket?.destroy();
      this.isConnected = false;
      setTimeout(() => {
        this.tryReconnect();
      }, 5000);
    } else {
      this.emit('connect', false);
    }
  });
  this.socket.on('end', () => {
    this.isConnected = false;
    this.socket?.destroy();
    this.emit('disconnect');
    this.socket = null;
  });
  // deno-lint-ignore no-explicit-any
  this.socket?.on('data', (data: any) => {
    this.handleData(data);
  });
  return await promiseToolbox.fromEvent(this, 'connect');
};

// Can we connect to the server?
export const getServerData = async (address: string, port = 5_000) => {
  const client = new GbxClient();

  let connected, canLoginUser, canLoginAdmin, canLoginSuperAdmin = false;

  try {
    connected = await client.connect(address, port) as boolean;
    if (!connected) {
      return { connected };
    }

    canLoginUser = await loginAs(client, 'User');
    canLoginAdmin = await loginAs(client, 'Admin');
    canLoginSuperAdmin = await loginAs(client, 'SuperAdmin');

    const [maplist, systemInfo] = await client.multicall([
      ['GetMapList', -1, 0],
      ['GetSystemInfo'],
    ]);

    return { connected, canLoginUser, canLoginAdmin, canLoginSuperAdmin, maplist, systemInfo };
  } catch (err) {
    logger.error(err);
  } finally {
    client.disconnect();
  }

  return { connected, canLoginUser, canLoginAdmin, canLoginSuperAdmin };
};

// Nadeo decided to have default passwords. What a great idea!
// Make sure to:
//      Change all three passwords.
//      Do not delete anything or we fallback to defaults again!
const loginAs = async (client: GbxClient, user: 'SuperAdmin' | 'Admin' | 'User') => {
  try {
    // Password = User lol
    await client.call('Authenticate', user, user);
  } catch {
    return false;
  }
  return true;
};
