// Copyright (c) 2023, NeKz
// SPDX-License-Identifier: MIT

import { Signal, useComputed } from '@preact/signals';

interface PaginationProps {
  page: Signal<number>;
  total: Signal<number>;
}

export default function Pagination({ page, total }: PaginationProps) {
  const pages = useComputed(() => {
    const maxPages = Math.ceil(total.value / 50);
    const pages = new Array(maxPages).fill(0).map((_, idx) => idx);
    if (pages.length <= 1) {
      return [];
    }

    const currentPage = page.value;
    if (currentPage < 4 || currentPage > maxPages - 5) {
      if (maxPages < 6) {
        return [...pages.slice(0, 5)];
      }
      return [...pages.slice(0, 5), -1, ...pages.slice(-5)];
    } else {
      return [...pages.slice(0, 2), -1, ...pages.slice(currentPage - 2, currentPage + 3), -1, ...pages.slice(-2)];
    }
  });

  return (
    <div class='join'>
      {pages.value.map((value) => {
        const isDisabled = value === -1;
        return (
          <button
            class={`join-item btn btn-md ${page.value === value ? 'btn-active' : isDisabled ? 'btn-disabled' : ''}`}
            onClick={isDisabled ? undefined : () => page.value = value}
          >
            {isDisabled ? '...' : value + 1}
          </button>
        );
      })}
    </div>
  );
}
