import { readLines } from "io/mod.ts";
import type { StartClientParams } from "@/types.d.ts";

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
        "method": "new_view",
        "params": {
          "config_dir": params.configDir,
          "client_extras_dir": params.clientExtrasDir,
        },
      });

      await this.sendMessage(message);
    } else {
      const message = JSON.stringify({
        "method": "new_view",
        "params": {},
      });

      await this.sendMessage(message);
    }
  }

  receiveMessage(): AsyncIterable<unknown> {
    const stdout = this.process.stdout!;
    return readLines(stdout);
  }

  close() {
    this.process.close();
  }
}
