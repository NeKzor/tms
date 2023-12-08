// Copyright (c) 2023, NeKz
// SPDX-License-Identifier: MIT

/// <reference lib="deno.unstable" />

import { ServerRoom } from '../models.ts';

const kv = await Deno.openKv('../../.kv');

export class Database {
  async room(id: number) {
    return (await kv.get<ServerRoom>(['rooms', id])).value;
  }
  async rooms(options?: { max?: number; filter?: (value: ServerRoom) => boolean }) {
    const { filter, max = 50 } = options ?? {};
    const rooms: ServerRoom[] = [];
    for await (
      const { value } of kv.list<ServerRoom>({ prefix: ['rooms'] })
    ) {
      if (!filter || filter(value)) {
        rooms.push(value);

        if (rooms.length === max) {
          break;
        }
      }
    }
    return rooms;
  }
}

export const db = new Database();
