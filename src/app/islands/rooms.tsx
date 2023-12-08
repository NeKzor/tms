// Copyright (c) 2023, NeKz
// SPDX-License-Identifier: MIT

import { useComputed, useSignal } from '@preact/signals';
import { ServerRoom } from '../../models.ts';
import Filters from '../islands/filters.tsx';
import { getCountry, getRegion } from '../utils.ts';

interface RoomsProps {
  rooms: ServerRoom[];
  total: number;
}

export default function Rooms(props: RoomsProps) {
  const isLoading = useSignal(false);
  const rooms = useSignal<ServerRoom[]>(props.rooms);
  const page = useSignal(0);
  const total = useSignal(props.total);
  const pages = useComputed(() => new Array(Math.ceil(total.value / 50)).fill(1));

  return (
    <>
      <div className='overflow-x-auto'>
        <Filters isLoading={isLoading} rooms={rooms} total={total} page={page} />
        <div className='h-10'>
          {isLoading.value && <progress class='progress'></progress>}
        </div>
        <table className='rooms table-md'>
          <thead>
            <tr>
              <th class='room' title='Name of club room'>Room</th>
              <th class='region' title='Region name'>Region</th>
              <th class='players' title='Players online/maximum allowed'>Players</th>
              <th class='server' title='Server login'>Server</th>
              <th class='name' title='Name of server'>Name</th>
              <th class='host' title='Server host'>Host</th>
              <th class='rpc' title='Public RPC port available?'>RPC?</th>
            </tr>
          </thead>
          <tbody>
            {rooms.value.map(({ room, server, host, serverData, serverLocation }) => {
              return (
                <tr key={room.id}>
                  <td class='room'>
                    <a class='hover:text-primary' href={`/rooms/${room.id}`}>
                      {room.name_readable}
                    </a>
                  </td>
                  <td class='region'>
                    {room.room.region
                      ? (
                        <span class='cursor-help' title={room.room.region}>
                          {getRegion(room)}
                        </span>
                      )
                      : (
                        <span
                          class='cursor-help'
                          title={serverLocation
                            ? (serverLocation?.regionName + ' | ' + serverLocation?.country)
                            : undefined}
                        >
                          {getCountry(serverLocation)}
                        </span>
                      )}
                  </td>
                  <td class='players'>{[room.room.playerCount, '/', room.room.maxPlayers].join('')}</td>
                  <td class='server'>{room.playerServerLogin}</td>
                  <td class='name'>{server?.name_readable !== undefined ? server.name_readable : ''}</td>
                  <td class='host'>{host}</td>
                  <td class='rpc'>
                    {[
                      [serverData?.canLoginUser, 'User'],
                      [serverData?.canLoginAdmin, 'Admin'],
                      [serverData?.canLoginSuperAdmin, 'SuperAdmin'],
                    ].filter((x) => !!x.at(0)).map((x) => x.at(1)).join(' ')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div class='join mt-4'>
          {pages.value.map((_, index) => {
            return (
              <button
                class={`join-item btn btn-md ${page.value === index ? 'btn-active' : ''}`}
                onClick={() => page.value = index}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
