import { Core } from "@/core.ts";
import { readKeypress } from "@/keypress.ts";
import { DexiEvent } from "@/types.d.ts";
import { MuxAsyncIterator } from "async/mod.ts";

export class Editor {
  core: Core;
  filename: string;
  viewId: string;
  events: MuxAsyncIterator<DexiEvent>;

  constructor(filename: string) {
    this.filename = filename;
    this.viewId = "";

    this.core = new Core();

    // prepare events generator
    this.events = new MuxAsyncIterator<DexiEvent>();
    this.events.add(readKeypress());
    this.events.add(this.core.receiveEvent());

    // start client
    this.core.startClient();
    this.core.newView(filename);
  }

  async init() {
    const { columns, rows } = await getWindowSize()
  }

  async edit() {
    for await (const event of this.events) {
      if (event.type === "core") {
        await this.resolveCoreEvent(event.data);
      } else {
        if (event.data === "q") {
          break;
        }
        await this.resolveKeypressEvent(event.data);
      }
    }
  }

  async resolveCoreEvent(eventData: string) {
  }

  async resolveKeypressEvent(eventData: string) {
  }

  async saveFile() {
  }

  async close() {
    await this.saveFile();
    this.core.close();
  }
}

async function getWindowSize() {
  return await Deno.consoleSize(Deno.stdout.rid)
}
