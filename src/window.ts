export class DexiWindow {
  rid: number

  constructor(rid: number) {
    this.rid = rid
  }

  async size() {
    const { columns, rows } = await Deno.consoleSize(this.rid);

    return {
      height: rows,
      width: columns,
    }
  }

  async moveCursor(y: number, x: number) {}

  async refresh() {

  }
}
