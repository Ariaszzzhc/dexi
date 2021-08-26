import { Core } from "@/core.ts";
import { readKeypress } from "@/keypress.ts";
import type  { DexiEvent, UpdateParams } from "@/types.d.ts";
import { MuxAsyncIterator } from "async/mod.ts";
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
            this.handleUpdate(params);
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
          this.currentView = result
        }
      }
    } catch {
      console.error("Unknown error");
    }
  }

  resolveKeypressEvent(eventData: string) {
  }

  async handleUpdate(params: UpdateParams) {
    const id = params["view-id"]
    this.createView(id);
    const view = this.views.get(id);

    if (view) {
      await view.updateBuffer(params.ops);
    }
  }

  createView(viewId: string) {
    if (this.views.has(viewId)) {
      return;
    }

    const view = new View(viewId, this.core);
    this.views.set(viewId, view);

    this.currentView = viewId
  }

  async saveFile() {
  }

  async close() {
    await this.saveFile();
    this.core.close();
  }
}
