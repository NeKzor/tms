// Copyright (c) 2023, NeKz
// SPDX-License-Identifier: MIT

import { ServerRoom } from './models.ts';
import { chunk } from 'collections/chunk.ts';

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

const toResolve = new Map<number, ServerRoom>();
const uniqueIps = new Set<string>();

for await (const { value } of kv.list<ServerRoom>({ prefix: ['rooms'] })) {
  if (value.server?.ip) {
    toResolve.set(value.room.id, value);
    uniqueIps.add(value.server.ip);
  }

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

type GeoIp = {
  status: string;
  message: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  query: string;
};

const _updateGeoLocations = async () => {
  const resolvedIps: GeoIp[] = [];

  for (const ips of chunk([...uniqueIps.values()], 100)) {
    const url = 'http://ip-api.com/batch?fields=57359';

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'User-Agent': Deno.env.get('USER_AGENT')!,
      },
      body: JSON.stringify(ips),
    });

    console.log(`[POST] ${url} : ${res.status}`);

    if (res.ok) {
      const data = await res.json() as (GeoIp | null)[];
      resolvedIps.push(...data.filter((geoIp) => geoIp !== null && geoIp !== undefined) as GeoIp[]);
    }
  }

  for (const [roomId, room] of toResolve) {
    const geoIp = resolvedIps.find((geoIp) => geoIp.query === room.server?.ip);
    if (geoIp) {
      room.serverLocation = {
        country: geoIp.country,
        countryCode: geoIp.countryCode,
        region: geoIp.region,
        regionName: geoIp.regionName,
      };
      await kv.set(['rooms', roomId], room);
    }
  }
};
