import { FreshContext } from '$fresh/server.ts';

export interface State {
  context: Context;
}

export class Context {
  domain = 'tms.nekz.io';

  private static context: Context;

  protected constructor() {
  }

  // deno-lint-ignore require-await
  public static async init() {
    Context.context = new Context();
  }

  public static instance() {
    return this.context;
  }
}

export async function handler(
  _req: Request,
  ctx: FreshContext<State>,
) {
  ctx.state.context = Context.instance();
  return await ctx.next();
}
