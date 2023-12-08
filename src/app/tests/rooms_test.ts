// Copyright (c) 2023, NeKz
// SPDX-License-Identifier: MIT

import { assert } from '$std/assert/mod.ts';
import { ServerRoom } from '../../models.ts';

Deno.test('Rooms API', async () => {
  const res = await fetch('http://localhost:8000/api/rooms');
  const json = await res.json() as { rooms: ServerRoom[] };
  assert(json);
  assert(json.rooms);
});

Deno.test('Rooms API sorted by player count desc', async () => {
  const res = await fetch('http://localhost:8000/api/rooms?sort-by=player-count-desc');
  const json = await res.json() as { rooms: ServerRoom[] };
  assert(json);
  assert(json.rooms);
  assert(json.rooms.length > 1);
  assert(json.rooms.at(0)!.room.room.playerCount > json.rooms.at(-1)!.room.room.playerCount);
});

Deno.test('Rooms API sorted by player count asc', async () => {
    const res = await fetch('http://localhost:8000/api/rooms?sort-by=player-count-asc');
    const json = await res.json() as { rooms: ServerRoom[] };
    assert(json);
    assert(json.rooms);
    assert(json.rooms.length > 1);
    assert(json.rooms.at(0)!.room.room.playerCount < json.rooms.at(-1)!.room.room.playerCount);
  });
  

Deno.test('Rooms API sorted by room ID desc', async () => {
  const res = await fetch('http://localhost:8000/api/rooms?sort-by=room-id-desc');
  const json = await res.json() as { rooms: ServerRoom[] };
  assert(json);
  assert(json.rooms);
  assert(json.rooms.length > 1);
  assert(json.rooms.at(0)!.room.id > json.rooms.at(-1)!.room.id);
});

Deno.test('Rooms API sorted by room ID asc', async () => {
    const res = await fetch('http://localhost:8000/api/rooms?sort-by=room-id-asc');
    const json = await res.json() as { rooms: ServerRoom[] };
    assert(json);
    assert(json.rooms);
    assert(json.rooms.length > 1);
    assert(json.rooms.at(0)!.room.id < json.rooms.at(-1)!.room.id);
  });
  