import { Command } from "cliffy/command/mod.ts";
import { edit } from "@/editor.ts";

const cli = new Command();
cli.name("dexi")
  .version("0.1.0")
  .description("Terminal frontend for xi-editro, built by deno.")
  .arguments("<file> [string]");

const { args } = await cli.parse(Deno.args);

await edit(args[0]);
