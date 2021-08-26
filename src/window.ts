export class DexiWindow {
  writer: typeof Deno.stdout;
  pos: { x: number; y: number };

  constructor(pos: { x: number; y: number }) {
    this.writer = Deno.stdout;
    this.pos = pos;
  }

  size() {
    const { columns, rows } = Deno.consoleSize(this.writer.rid);

    return {
      height: rows,
      width: columns,
    };
  }

  async moveCursor(y: number, x: number) {
    const goto = `\x1b[${this.pos.y + y + 1};${this.pos.x + x + 1}H`;
    await this.write(goto);
  }

  async moveCursorAndClearLine(line: number) {
    const goto = `\x1b[${this.pos.y + line + 1};${1}H`;
    const clear = ``
    await this.write(`${goto}${clear}`);
  }

  async write(str: string) {
    const encoder = new TextEncoder();
    await Deno.stdout.write(encoder.encode(str));
  }

  async appendStr(str: string) {
    await this.write(str)
  }
}
