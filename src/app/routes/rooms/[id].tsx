// Copyright (c) 2023, NeKz
// SPDX-License-Identifier: MIT

import { Handlers, PageProps } from '$fresh/server.ts';
import { Head } from '$fresh/runtime.ts';
import { ServerRoom } from '../../../models.ts';
import { db } from '../../db.ts';
import type { State } from '../_middleware.ts';

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

export default function Room({ data: { room }, state: { context } }: PageProps<RoomData, State>) {
  return (
    <>
      <Head>
        <title>{room.room.name_readable} | Room | {context.domain}</title>
      </Head>
      <div className='overflow-x-auto'>
        {room.room.name_readable}
      </div>
    </>
  );
}
