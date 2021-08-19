import type { DexiEvent } from "@/types.d.ts";
import { keypress } from "cliffy/keypress/mod.ts";

export async function* readKeypress(): AsyncIterable<DexiEvent> {
  for await (const event of keypress()) {
    const res: DexiEvent = {
      type: "keypress",
      data: ""
    }
    if (event.ctrlKey) {
      res.data += "<C>"
    }
    if (event.altKey) {
      res.data += "<A>"
    }

    res.data += event.key

    yield res;
  }
}
