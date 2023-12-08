// Copyright (c) 2023, NeKz
// SPDX-License-Identifier: MIT

import { load } from 'dotenv/mod.ts';
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
];

logger.info('Fetched', rooms.length, 'rooms');

const decoder = new TextDecoder();

for (const room of rooms) {
  (room as ServerRoom['room']).name_readable = stripControlCharacters(room.name);

  await kv.set(['rooms', room.id], { room, lastUpdate: new Date() } satisfies ServerRoom);

  if (room.room.serverAccountId) {
    try {
      const server = await trackmania.servers(room.room.serverAccountId);

      (server as ServerRoom['server'])!.name_readable = stripControlCharacters(server.name);

      await kv.set(
        ['rooms', room.id],
        { room, lastUpdate: new Date(), server } satisfies ServerRoom,
      );

      const { name, ip, port, login } = server;

      logger.info(room.name, room.room.serverAccountId, name, ip, port, login);

      if (/^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/.test(ip)) {
        const nmap = new Deno.Command(`/usr/bin/nmap`, { args: [ip, '-p', '5000', '-oG', '-'], stdout: 'piped' });
        const proc = nmap.spawn();
        const stdout = decoder.decode((await proc.output()).stdout);
        logger.info(stdout);

        const openRpcPort = /Ports: 5000\/open\//.test(stdout);
        const host = /\((.+?)\)\s+Status:/.exec(stdout)?.at(1);

        logger.info('Getting server data');
        const serverData = await getServerData(ip);
        logger.info('Saving');

        await kv.set(
          ['rooms', room.id],
          { room, lastUpdate: new Date(), server, host, openRpcPort, serverData } satisfies ServerRoom,
        );
      }
    } catch (err) {
      logger.error(err);
    }
  }

  flushFileLogger();
}
