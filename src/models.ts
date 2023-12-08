// Copyright (c) 2023, NeKz
// SPDX-License-Identifier: MIT

import { ClubRoom, Server } from './api.ts';

export interface ServerRoom {
  room: ClubRoom & { name_readable: string };
  lastUpdate: Date;
  server?: Server & { name_readable: string };
  host?: string;
  openRpcPort?: boolean;
  sc?: string;
  serverData?: {
    connected?: boolean;
    canLoginUser?: boolean;
    canLoginAdmin?: boolean;
    canLoginSuperAdmin?: boolean;
    maplist?: {
      UId: string;
      Name: string;
      FileName: string;
      Environnement: string;
      Author: string;
      AuthorNickname: string;
      GoldTime: number;
      CopperPrice: number;
      MapType: string;
      MapStyle: string;
    }[];
    systemInfo?: {
      PublishedIp: string;
      Port: number;
      P2PPort: number;
      TitleId: string;
      ServerLogin: string;
      ServerPlayerId: number;
      ConnectionDownloadRate: number;
      ConnectionUploadRate: number;
      IsServer: boolean;
      IsDedicated: boolean;
    };
  };
  serverLocation?: {
    country: string;
    countryCode: string;
    region: string;
    regionName: string;
  };
}
