import { readLines } from "std/io/mod.ts";
import type { DexiEvent, RpcRequest, StartClientParams } from "@/types.d.ts";

const CORE_PATH = "bin/core";

export class Core {
  process: Deno.Process;
  encoder: TextEncoder;
  messageId: number;

  constructor() {
    this.process = Deno.run({
      cmd: [CORE_PATH],
      stdin: "piped",
      stdout: "piped",
      stderr: "piped",
    });
    this.messageId = 0;
    this.encoder = new TextEncoder();
  }

  async sendMessage(message: string) {
    const stdin = this.process.stdin;
    if (stdin) {
      await stdin.write(new Uint8Array(this.encoder.encode(message + "\n")));
    }
  }

  async startClient(params?: StartClientParams) {
    if (params) {
      const message = JSON.stringify({
        "method": "client_started",
        "params": {
          "config_dir": params.configDir,
          "client_extras_dir": params.clientExtrasDir,
        },
      });

      await this.sendMessage(message);
    } else {
      const message = JSON.stringify({
        "method": "client_started",
        "params": {},
      });

      await this.sendMessage(message);
    }
  }

  async request(req: RpcRequest) {
    await this.sendMessage(JSON.stringify({ ...req }));
  }

  async newView(filename: string) {
    await this.request({
      id: this.messageId,
      method: "new_view",
      params: {
        "file_path": filename,
      },
    });
    this.messageId++;
  }

  async *receiveEvent(): AsyncIterable<DexiEvent> {
    const stdout = this.process.stdout!;
    for await (const message of readLines(stdout)) {
      const event: DexiEvent = {
        type: "core",
        data: message,
      };
      yield event;
    }
  }

  close() {
    this.process.close();
  }
}
