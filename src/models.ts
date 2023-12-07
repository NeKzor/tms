// Copyright (c) 2023, NeKz
// SPDX-License-Identifier: MIT

import { ClubRoom, Server } from './api.ts';

export interface ServerRoom {
  room: ClubRoom;
  lastUpdate: Date;
  server?: Server;
  host?: string;
  openRpcPort?: boolean;
  sc?: string;
  serverData?: {
    connected?: boolean;
    canLoginUser?: boolean;
    canLoginAdmin?: boolean;
    canLoginSuperAdmin?: boolean;
    maplist?: any;
    systemInfo?: any;
  };
}
