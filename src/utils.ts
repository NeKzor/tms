// Copyright (c) 2023, NeKz
// SPDX-License-Identifier: MIT

export const stripControlCharacters = (value: string) =>
  value.replace(/(\$[0-9a-fA-F]{1,3}|\$[WNOITSGZBEMwnoitsgzbem]{1})/g, '');
