import { Core } from "@/core.ts";
import { readKeypress } from "@/keypress.ts";
import { DexiEvent } from "@/types.d.ts";
import { MuxAsyncIterator } from "async/mod.ts";

export async function edit(filename: string) {
  const core = new Core();

  const mux = new MuxAsyncIterator<DexiEvent>();
  mux.add(readKeypress());
  mux.add(core.receiveEvent());

  core.startClient();

  core.newView(filename);

  for await (const event of mux) {
    console.log(event.data);
    if (event.data === "q") {
      break;
    }
  }

  core.close();
}
