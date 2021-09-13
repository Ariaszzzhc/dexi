import { ansi } from "cliffy/ansi/mod.ts";

const { cursorTo, eraseLine, cursorSave, cursorRestore, clearScreen } = ansi;
export class DexiWindow {
  writer: typeof Deno.stdout;
  pos: { x: number; y: number };

  constructor(pos: { x: number; y: number }) {
    this.writer = Deno.stdout;
    this.pos = pos;

    this.writer.writeSync(clearScreen.toBuffer());
  }

  size() {
    const { columns, rows } = Deno.consoleSize(this.writer.rid);

    return {
      height: rows,
      width: columns,
    };
  }

  async moveCursor(y: number, x: number) {
    await this.writeBuffer(
      cursorTo(this.pos.x + x + 1, this.pos.y + y + 1).toBuffer(),
    );
  }

  async moveCursorAndClearLine(line: number) {
    const action = cursorTo(1, this.pos.y + line + 1) + eraseLine();
    await this.write(action);
  }

  async saveCursor() {
    await this.writeBuffer(cursorSave.toBuffer());
  }

  async restoreCursor() {
    await this.writeBuffer(cursorRestore.toBuffer());
  }

  async write(str: string) {
    const encoder = new TextEncoder();
    await Deno.stdout.write(encoder.encode(str));
  }

  async writeBuffer(buf: Uint8Array) {
    await Deno.stdout.write(buf);
  }

  async appendStr(str: string) {
    await this.write(str);
  }
}
