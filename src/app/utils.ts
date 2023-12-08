// Copyright (c) 2023, NeKz
// SPDX-License-Identifier: MIT

import * as flags from 'country-flag-emoji';
import { ServerRoom } from '../models.ts';

export const getRegion = (room: ServerRoom['room']) => {
  switch (room.room.region) {
    case 'eu-west':
      return '🇪🇺';
    case 'ca-central':
      return '🇨🇦';
    default:
      return room.room.region;
  }
};

export const getCountry = (location: ServerRoom['serverLocation']) => {
  const flag = location
    ? flags.list.find((flag: { code: string; emoji: string }) => flag.code === location.countryCode)
    : null;
  return flag ? flag.emoji + ' ' : '';
};
