import { Core } from "@/core.ts";
import { readKeypress } from "@/keypress.ts";
import type { DexiEvent, ScrollParams, UpdateParams, AddStatusItemParams } from "@/types.d.ts";
import { MuxAsyncIterator } from "std/async/mod.ts";
import { View } from "@/view.ts";

export class Editor {
  core: Core;
  views: Map<string, View>;
  currentView: string;
  events: MuxAsyncIterator<DexiEvent>;

  constructor() {
    this.currentView = "";
    this.core = new Core();
    this.views = new Map<string, View>();

    // prepare events generator
    this.events = new MuxAsyncIterator<DexiEvent>();
    this.events.add(readKeypress());
    this.events.add(this.core.receiveEvent());

    // start client
    this.core.startClient();
  }

  async edit(filename: string) {
    await this.core.newView(filename);
    for await (const event of this.events) {
      console.log(event)
      if (event.type === "core") {
        await this.resolveCoreEvent(event.data);
      } else {
        if (event.data === "q") {
          break;
        }
        this.resolveKeypressEvent(event.data);
      }
    }
  }

  async resolveCoreEvent(eventData: string) {
    try {
      const data = JSON.parse(eventData);
      const method = data["method"];
      if (method) {
        switch (method) {
          case "scroll_to":
            {
              const params = data["params"] as ScrollParams;
              await this.handleCursorMove(params);
            }
            break;

          case "update":
            {
              const params = data["params"] as UpdateParams;
              await this.handleUpdate(params);
            }
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
            {
              const params = data["params"] as AddStatusItemParams
              this.handleAddStatusItem(params);
            }
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
        const result = data["result"];
        if (result) {
          this.currentView = result;
        }
      }
    } catch {
      console.error("Unknown error");
    }
  }

  resolveKeypressEvent(eventData: string) {
  }

  async handleUpdate(params: UpdateParams) {
    const id = params["view_id"];
    this.createView(id);
    const view = this.views.get(id);
    // console.dir(params)
    // console.dir(view)

    if (view) {
      await view.updateBuffer(params.update.ops);
    }
  }

  createView(viewId: string) {
    if (this.views.has(viewId)) {
      return;
    }

    const view = new View(viewId, this.core);
    this.views.set(viewId, view);

    this.currentView = viewId;
  }

  async handleAddStatusItem(params: AddStatusItemParams) {
    // TODO
  }

  async handleCursorMove(params: ScrollParams) {
    const id = params["view_id"];
    this.createView(id);
    const view = this.views.get(id);

    if (view) {
      await view.moveCursor(params.line, params.col);
    }
  }

  async saveFile() {
  }

  async close() {
    await this.saveFile();
    this.core.close();
  }
}
