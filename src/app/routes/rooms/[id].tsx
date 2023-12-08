// Copyright (c) 2023, NeKz
// SPDX-License-Identifier: MIT

import { Handlers, PageProps } from '$fresh/server.ts';
import { ServerRoom } from '../../../models.ts';
import { db } from '../../db.ts';

interface RoomData {
  room: ServerRoom;
}

export const handler: Handlers<RoomData> = {
  async GET(_reg, ctx) {
    const id = Number(ctx.params.id);
    if (isNaN(id)) {
      return ctx.renderNotFound();
    }

    const room = await db.room(id);
    if (!room) {
      return ctx.renderNotFound();
    }

    return ctx.render({ room });
  },
};

export default function Room(props: PageProps<RoomData>) {
  return (
    <>
      <div className='overflow-x-auto'>
        {props.data.room.room.name}
      </div>
    </>
  );
}
