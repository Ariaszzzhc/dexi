import { Core } from "@/core.ts";
import { readKeypress } from "@/keypress.ts";
import type  { DexiEvent, UpdateParams } from "@/types.d.ts";
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

  async edit() {
    for await (const event of this.events) {
      if (event.type === "core") {
        this.resolveCoreEvent(event.data);
      } else {
        if (event.data === "q") {
          break;
        }
        this.resolveKeypressEvent(event.data);
      }
    }
  }

  resolveCoreEvent(eventData: string) {
    try {
      const data = JSON.parse(eventData);
      const method = data["method"]
      if (method) {
        switch (method) {
          case "scroll_to":
            break;

          case "update":
            const params = data["params"] as UpdateParams;

            break;

          case "measure_width":
            break;

          case "theme_changed":
            break;

          case "available_themes":
            break;

          case "language_changed":
            break;

          case "available_languages":
            break;

          case "config_changed":
            break;

          case "available_plugins":
            break;

          case "plugin_started":
            break;

          case "plugin_stopped":
            break;

          case "update_cmds":
            break;

          case "show_hover":
            break;

          case "add_status_item":
            break;

          case "update_status_item":
            break;

          case "remove_status_item":
            break;

          case "find_status":
            break;

          case "replace_status":
            break;


        }
      } else {
        const result = data["result"]
        if (result) {
          this.viewId = result
        }
      }
    }
  }

  resolveKeypressEvent(eventData: string) {
  }

  async handleUpdate(params: UpdateParams) {

  }

  async createView() {

  }

  async saveFile() {
  }

  async close() {
    await this.saveFile();
    this.core.close();
  }
}
