// Copyright (c) 2023, NeKz
// SPDX-License-Identifier: MIT

import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';

export const useIsMounted = () => {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => isMounted.current = false;
  }, []);

  return isMounted;
};

export const useDebounce = <T>(delay: number, value: T) => {
  const debounce = useSignal(value);

  useEffect(() => {
    const timer = setTimeout(() => debounce.value = value, delay);
    return () => clearTimeout(timer);
  }, [value]);

  return debounce;
};
