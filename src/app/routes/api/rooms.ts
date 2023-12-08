// Copyright (c) 2023, NeKz
// SPDX-License-Identifier: MIT

import { Handlers } from '$fresh/server.ts';
import { ServerRoom } from '../../../models.ts';
import { db } from '../../db.ts';

const serverTypeFilters: Record<string, ((value: ServerRoom) => boolean) | undefined> = {
  'dedicated': (value) => value.room.room.serverAccountId !== '',
  'nadeo': (value) => value.room.room.serverAccountId === '',
};

const sorters: Record<string, (a: ServerRoom, b: ServerRoom) => number> = {
  'player-count-asc': (a, b) => a.room.room.playerCount - b.room.room.playerCount,
  'player-count-desc': (a, b) => b.room.room.playerCount - a.room.room.playerCount,
  'room-id-asc': (a, b) => a.room.id - b.room.id,
  'room-id-desc': (a, b) => b.room.id - a.room.id,
  'room-name-asc': (a, b) => a.room.name_readable.localeCompare(b.room.name_readable),
  'room-name-desc': (a, b) => b.room.name_readable.localeCompare(a.room.name_readable),
  'sever-name-asc': (a, b) => a.server?.name_readable?.localeCompare(b.server?.name_readable ?? '') ?? 0,
  'sever-name-desc': (a, b) => b.server?.name_readable?.localeCompare(a.server?.name_readable ?? '') ?? 0,
};

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);

    const search = (url.searchParams.get('search')?.trim() ?? '').toLowerCase();
    const maxItems = Number(url.searchParams.get('max-items') ?? '');
    const page = Number(url.searchParams.get('page') ?? '');

    const serverTypeFilter = serverTypeFilters[url.searchParams.get('server-type') ?? ''];

    const rooms = await db.rooms({
      filter: search.length
        ? (value) => {
          return (!serverTypeFilter || serverTypeFilter(value)) && (
            value.room.name_readable.toLowerCase().includes(search) ||
            !!value.server?.name_readable?.toLowerCase()?.includes(search) ||
            !!value.server?.login?.toLowerCase()?.includes(search) ||
            !!value.host?.toLowerCase()?.includes(search)
          );
        }
        : serverTypeFilter,
    });

    rooms.sort(sorters[url.searchParams.get('sort-by') ?? 'player-count-desc']);

    const count = !isNaN(maxItems) && maxItems ? maxItems : 50;
    const index = page >= 0 ? page : 0;
    const start = index * count;
    const end = (index + 1) * count;

    return new Response(JSON.stringify({ rooms: rooms.slice(start, end), total: rooms.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
