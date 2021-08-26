import { Command } from "cliffy/command/mod.ts";
import { Editor } from "@/editor.ts";

const cli = new Command();
cli.name("dexi")
  .version("0.1.0")
  .description("Terminal frontend for xi-editor, built by deno.")
  .arguments("<file> [string]");

const { args } = await cli.parse(Deno.args);

const editor = new Editor();

await editor.edit();

editor.close();
