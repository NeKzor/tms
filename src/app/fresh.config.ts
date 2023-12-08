// Copyright (c) 2023, NeKz
// SPDX-License-Identifier: MIT

import { defineConfig } from '$fresh/server.ts';
import tailwind from '$fresh/plugins/tailwind.ts';

export default defineConfig({
  plugins: [tailwind()],
});
