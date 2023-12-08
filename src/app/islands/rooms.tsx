// Copyright (c) 2023, NeKz
// SPDX-License-Identifier: MIT

import { useSignal } from '@preact/signals';
import { ServerRoom } from '../../models.ts';
import Filters from '../islands/filters.tsx';
import { getCountry, getRegion } from '../utils.ts';

interface RoomsProps {
  rooms: ServerRoom[];
}

export default function Rooms(props: RoomsProps) {
  const isLoading = useSignal(false);
  const rooms = useSignal<ServerRoom[]>(props.rooms);

  return (
    <>
      <div className='overflow-x-auto'>
        <Filters isLoading={isLoading} rooms={rooms} />
        <div className='h-10'>
          {isLoading.value && <progress class='progress'></progress>}
        </div>
        <table className='table-md'>
          <thead>
            <tr>
              <th title='Name of club room'>Room</th>
              <th title='Region name'>Region</th>
              <th title='Players online/maximum allowed'>Players</th>
              <th title='Server login'>Server</th>
              <th title='Name of server'>Name</th>
              <th title='Server host'>Host</th>
              <th title='Public RPC port available?'>RPC?</th>
            </tr>
          </thead>
          <tbody>
            {rooms.value.map(({ room, server, host, serverData, serverLocation }) => {
              return (
                <tr key={room.id}>
                  <td>
                    <a class='hover:text-primary' href={`/rooms/${room.id}`}>
                      {room.name_readable}
                    </a>
                  </td>
                  <td>
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
                  <td>{[room.room.playerCount, '/', room.room.maxPlayers].join('')}</td>
                  <td>{room.playerServerLogin}</td>
                  <td>{server?.name_readable !== undefined ? server.name_readable : ''}</td>
                  <td>{host}</td>
                  <td>
                    {[
                      [serverData?.canLoginUser, 'User'],
                      [serverData?.canLoginAdmin, 'Admin'],
                      [serverData?.canLoginSuperAdmin, 'SuperAdmin'],
                    ].filter((x) => !!x.at(0)).map((x) => x.at(1)).join('/')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
