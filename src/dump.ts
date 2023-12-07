// Copyright (c) 2023, NeKz
// SPDX-License-Identifier: MIT

import { ServerRoom } from './models.ts';

const kv = await Deno.openKv('./.kv');

const headers = [
  'Room',
  'Name',
  'Region',
  'Players',
  'Server',
  'Name',
  'IP',
  'Port',
  'Host',
  'RPC?',
  'User?',
  'Admin?',
  'SuperAdmin?',
];

console.log(headers.join('|'));
console.log(headers.map(() => '---').join('|'));

for await (const { value } of kv.list<ServerRoom>({ prefix: ['rooms'] })) {
  // if (!value.openRpcPort) {
  //   continue;
  // }

  console.log(
    [
      value.room.id,
      value.room.name.replace(/(\$[0-9a-fA-F]{1,3}|\$[WNOITSGZBEMwnoitsgzbem]{1})/g, '').replaceAll('|', '\\|'),
      value.room.room.region,
      [value.room.room.playerCount, '/', value.room.room.maxPlayers].join(''),
      value.room.playerServerLogin,
      value.server?.name,
      value.server?.ip,
      value.server?.port,
      value.host,
      value.openRpcPort ? 'open' : '',
      value.serverData?.canLoginUser ? 'yes' : '',
      value.serverData?.canLoginAdmin ? 'yes' : '',
      value.serverData?.canLoginSuperAdmin ? 'yes' : '',
    ].map((x) => x ?? '').join('|'),
  );
}

console.log('');
