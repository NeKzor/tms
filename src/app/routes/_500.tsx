// Copyright (c) 2023, NeKz
// SPDX-License-Identifier: MIT

import { Head } from '$fresh/runtime.ts';
import type { PageProps } from '$fresh/server.ts';
import type { State } from './_middleware.ts';

export default function Error500({ state }: PageProps<unknown, State>) {
  return (
    <>
      <Head>
        <title>Oops | {state.context.domain}</title>
      </Head>
      <div class='px-4 py-8 mx-auto bg-[#86efac]'>
        <div class='max-w-screen-md mx-auto flex flex-col items-center justify-center'>
          <img
            class='my-6'
            src='/logo.svg'
            width='128'
            height='128'
            alt='the Fresh logo: a sliced lemon dripping with juice'
          />
          <h1 class='text-4xl font-bold'>500 - Internal server error :(</h1>
          <p class='my-4'>
            Oops.
          </p>
          <a href='/' class='underline'>Go back home</a>
        </div>
      </div>
    </>
  );
}
