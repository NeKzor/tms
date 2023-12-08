// Copyright (c) 2023, NeKz
// SPDX-License-Identifier: MIT

/// <reference lib="deno.unstable" />

import { ServerRoom } from '../models.ts';

const kv = await Deno.openKv('../../.kv');

export class Database {
  async room(id: number) {
    return (await kv.get<ServerRoom>(['rooms', id])).value;
  }
  async rooms(options?: { filter?: (value: ServerRoom) => boolean }) {
    const { filter } = options ?? {};
    const rooms: ServerRoom[] = [];
    for await (
      const { value } of kv.list<ServerRoom>({ prefix: ['rooms'] })
    ) {
      if (!filter || filter(value)) {
        if (value.server) {
          value.server.ip = '';
        }

        rooms.push(value);
      }
    }
    return rooms;
  }
}

export const db = new Database();
