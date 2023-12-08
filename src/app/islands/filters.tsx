// Copyright (c) 2023, NeKz
// SPDX-License-Identifier: MIT

import { Signal, useSignal, useSignalEffect } from '@preact/signals';
import { ServerRoom } from '../../models.ts';
import { useDebounce, useIsMounted } from './hooks.ts';

interface FiltersProps {
  rooms: Signal<ServerRoom[]>;
  total: Signal<number>;
  isLoading: Signal<boolean>;
  page: Signal<number>;
}

let ac = new AbortController();

export default function Filters({ isLoading, rooms, total, page }: FiltersProps) {
  const search = useSignal('');
  const searchDebounced = useDebounce(200, search.value);

  const serverType = useSignal('any');
  const sortBy = useSignal('player-count-desc');

  useSignalEffect(() => {
    const params = new URLSearchParams({
      'search': searchDebounced.value,
      'server-type': serverType.value,
      'sort-by': sortBy.value,
      'page': page.value.toString(),
    });

    if (isMounted.current) {
      ac.abort();
      isLoading.value = true;
      ac = new AbortController();

      fetch(`/api/rooms?${params.toString()}`, { signal: ac.signal })
        .then((res) => res.json() as Promise<{ rooms: ServerRoom[]; total: number }>)
        .then((data) => {
          if (isMounted.current) {
            rooms.value = data.rooms;
            total.value = data.total;
          }
        })
        .catch(console.error)
        .finally(() => isLoading.value = false);
    }
  });

  const isMounted = useIsMounted();

  return (
    <div>
      <div class='flex col gap-4'>
        <div class='flex-auto'>
          <input
            type='text'
            placeholder='Search...'
            className='input input-bordered input-md w-full mt-2'
            id='search'
            value={search}
            onInput={(event) => {
              search.value = (event.target as HTMLInputElement).value;
              page.value = 0;
            }}
          />
        </div>
        <div>
          <label class='form-control w-full max-w-xs'>
            <div class='label'>
              <span class='label-text w-40'>Server Type</span>
              <select
                className='select select-bordered w-full max-w-xs'
                id='server-type'
                value={serverType}
                onInput={(event) => {
                  serverType.value = (event.target as HTMLSelectElement).value;
                  page.value = 0;
                }}
              >
                <option value='any'>Any</option>
                <option value='dedicated'>Dedicated</option>
                <option value='nadeo'>Nadeo</option>
              </select>
            </div>
          </label>
        </div>
        <div>
          <label class='form-control w-full max-w-xs'>
            <div class='label'>
              <span class='label-text w-40'>Sort By</span>
              <select
                className='select select-bordered w-full max-w-xs'
                id='sort-by'
                value={sortBy}
                onInput={(event) => {
                  sortBy.value = (event.target as HTMLSelectElement).value;
                  page.value = 0;
                }}
              >
                <option value='player-count-asc'>Player Count (asc.)</option>
                <option value='player-count-desc'>Player Count (desc.)</option>
                <option value='room-id-asc'>Room ID (asc.)</option>
                <option value='room-id-desc'>Room ID (desc.)</option>
                <option value='room-name-asc'>Room Name (asc.)</option>
                <option value='room-name-desc'>Room Name (desc.)</option>
                <option value='sever-name-asc'>Server Name (asc.)</option>
                <option value='sever-name-desc'>Server Name (desc.)</option>
              </select>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
