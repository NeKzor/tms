// Copyright (c) 2023, NeKz
// SPDX-License-Identifier: MIT

import { type Config } from 'tailwindcss';

export default {
  content: [
    '{routes,islands,components}/**/*.{ts,tsx}',
  ],
} satisfies Config;
