// Copyright (c) 2023, NeKz
// SPDX-License-Identifier: MIT

import { db } from '../db.ts';
import { Handlers, PageProps } from '$fresh/server.ts';
import { ServerRoom } from '../../models.ts';
import Rooms from '../islands/rooms.tsx';

interface IndexData {
  rooms: ServerRoom[];
  total: number;
}

export const handler: Handlers<IndexData> = {
  async GET(_req, ctx) {
    const rooms = await db.rooms();
    rooms.sort((a, b) => b.room.room.playerCount - a.room.room.playerCount);
    return ctx.render({ rooms: rooms.slice(0, 50), total: rooms.length });
  },
};

export default function Home(props: PageProps<IndexData>) {
  return (
    <div class='max-w-screen-md mx-auto flex flex-col items-center justify-center'>
      <Rooms rooms={props.data.rooms} total={props.data.total} />
    </div>
  );
}
