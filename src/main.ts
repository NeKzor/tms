// Copyright (c) 2023, NeKz
// SPDX-License-Identifier: MIT

import { load } from 'dotenv/mod.ts';
import { chunk } from 'collections/chunk.ts';
import { Audiences, TrackmaniaClient, UbisoftApplication, UbisoftClient } from './api.ts';
import { flushFileLogger, logFetchRequest, logger } from './logger.ts';
import { Session } from './session.ts';
import { ServerRoom } from './models.ts';
import { getServerData } from './gbx.ts';
import { stripControlCharacters } from './utils.ts';

const isUsingDenoDeploy = Deno.env.get('DENO_DEPLOYMENT_ID') !== undefined;
if (!isUsingDenoDeploy) {
  await load({ export: true });
}

const checkForRpc = false;
const checkForGeoIp = false;

const kv = await Deno.openKv(isUsingDenoDeploy ? undefined : './.kv');

const session = new Session({
  loginFile: '.login',
});

const ubisoft = new UbisoftClient({
  applicationId: UbisoftApplication.Trackmania,
  email: Deno.env.get('UBI_EMAIL')!,
  password: Deno.env.get('UBI_PW')!,
  onFetch: logFetchRequest,
});

const trackmania = new TrackmaniaClient({
  onFetch: logFetchRequest,
});

await session.restore(ubisoft, trackmania);

const newUbisoftLogin = await ubisoft.login();
const newTrackmaniaLogin = await trackmania.login(ubisoft.loginData!.ticket);
const newTrackmaniaNadeoLogin = await trackmania.loginNadeo(Audiences.NadeoLiveServices);

if (newUbisoftLogin || newTrackmaniaLogin || newTrackmaniaNadeoLogin) {
  await session.save(ubisoft, trackmania);
}

const maxRooms = 810; // What on earth lol

const rooms = [
  ...(await trackmania.clubRoom(0, maxRooms)).clubRoomList,
  ...(await trackmania.clubRoom(maxRooms, maxRooms)).clubRoomList,
] as ServerRoom['room'][];

logger.info('Fetched', rooms.length, 'rooms');

const decoder = new TextDecoder();
const toResolve: Deno.KvKey[] = [];
const uniqueIps = new Set<string>();

for (const room of rooms) {
  const key = ['rooms', room.id];
  const value = (await kv.get<ServerRoom>(key)).value ?? Object.create(null) as ServerRoom;

  room.name_readable = stripControlCharacters(room.name).trim();
  value.room = room;
  value.lastUpdate = new Date();

  await kv.set(key, value);

  if (room.room.serverAccountId) {
    try {
      const server = await trackmania.servers(room.room.serverAccountId) as NonNullable<ServerRoom['server']>;

      server.name_readable = stripControlCharacters(server.name).trim();
      value.server = server;

      await kv.set(key, value);

      toResolve.push(key);
      uniqueIps.add(server.ip);

      const { name, ip, port, login } = server;

      logger.info(room.name, room.room.serverAccountId, name, ip, port, login);

      if (checkForRpc && /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/.test(ip)) {
        const nmap = new Deno.Command(`/usr/bin/nmap`, { args: [ip, '-p', '5000', '-oG', '-'], stdout: 'piped' });
        const proc = nmap.spawn();
        const stdout = decoder.decode((await proc.output()).stdout);
        logger.info(stdout);

        const openRpcPort = /Ports: 5000\/open\//.test(stdout);
        const host = /\((.+?)\)\s+Status:/.exec(stdout)?.at(1);

        logger.info('Getting server data');
        const serverData = await getServerData(ip);
        logger.info('Saving');

        value.host = host;
        value.openRpcPort = openRpcPort;
        value.serverData = serverData;

        await kv.set(key, value);
      }

      if (checkForGeoIp) {
        await kv.set(key, value);
      }
    } catch (err) {
      logger.error(err);
    }
  }

  flushFileLogger();
}

type GeoIp = {
  status: string;
  message: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  query: string;
};

if (checkForGeoIp) {
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

  const kvs = await kv.getMany<ServerRoom[]>(toResolve);

  for (const { key, value } of kvs) {
    if (!value) {
      continue;
    }

    const geoIp = resolvedIps.find((geoIp) => geoIp.query === value.server?.ip);
    if (!geoIp) {
      continue;
    }

    value.serverLocation = {
      country: geoIp.country,
      countryCode: geoIp.countryCode,
      region: geoIp.region,
      regionName: geoIp.regionName,
    };

    await kv.set(key, value);
  }
}
