import { Core } from "@/core.ts";

const core = new Core();

const messages = core.receiveMessage();

core.startClient();

for await (const message of messages) {
  console.log(message);
}
