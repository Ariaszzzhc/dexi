import { Core } from "./core.ts";
import { DexiWindow } from "./window.ts";
import type { Op } from "./types.d.ts";

const SPACES_IN_LINE_SECTION = 2;

interface Line {
  raw: string;
  /// The "real" line number.
  ///
  /// A line wrapped in two lines will keep the same `ln` value.
  ln?: number;
  /// Indicate if the line needs to be rendered during the next redraw.
  isDirty: boolean;
  isValid: boolean;
}

interface Cursor {
  x: number;
  y: number;
}

export enum RedrawBehavior {
  OnlyDirty,
  Everything,
}

class Buffer {
  lines: Line[];
  invalidLineCount: number;

  constructor() {
    this.lines = [];
    this.invalidLineCount = 0;
  }

  totalLength() {
    return this.lines.length + this.invalidLineCount;
  }

  linesAvailableAfter(start: number) {
    return this.lines.length - start;
  }
}

export class View {
  id: string;
  cursor: Cursor;
  buffer: Buffer;
  win: DexiWindow;
  filename?: string;
  screenStart: number;
  lineSectionWidth: number;
  ctx: Core;

  constructor(viewId: string, core: Core) {
    this.id = viewId;
    this.cursor = {
      x: 0,
      y: 0,
    };
    this.screenStart = 0;
    this.win = new DexiWindow({ x: 0, y: 0 });
    this.buffer = new Buffer();
    this.ctx = core;
    this.lineSectionWidth = 0;

    const { width, height } = this.win.size();

    this.ctx.request({
      method: "edit",
      params: {
        "method": "resize",
        "view_id": this.id,
        "params": {
          "width": width,
          "height": height,
        },
      },
    });

    this.ctx.request({
      method: "edit",
      params: {
        "method": "scroll",
        "view_id": this.id,
        "params": [0, height + 1],
      },
    });
  }

  async saveFile() {
    if (this.filename) {
      await this.ctx.request({
        method: "save",
        params: {
          "view_id": this.id,
          "file_path": this.filename,
        },
      });
    }
  }

  async moveCursor(line: number, column: number) {
    const { height } = this.win.size();

    let cursorY = line - this.screenStart;
    let scroll = false;

    if (cursorY >= height) {
      this.screenStart += cursorY - height + 1;
      scroll = true;
      cursorY -= cursorY - height + 1;
    } else if (cursorY <= -1) {
      this.screenStart -= Math.abs(cursorY);
      scroll = true;
      cursorY = 0;
    }

    this.cursor.x = column + this.lineSectionWidth;
    this.cursor.y = cursorY;

    if (scroll) {
      this.redraw(RedrawBehavior.Everything);
    } else {
      await this.win.moveCursor(this.cursor.y, this.cursor.x);
    }
  }

  async updateBuffer(ops: Array<Op>) {
    const newBuffer = new Buffer();
    let oldIdx = 0;
    let newIdx = 0;

    for (const op of ops) {
      switch (op.op) {
        case "copy":
          const isDirty = oldIdx !== newIdx;

          for (let i = 0; i < op.n; i++) {
            const oldBuffer = this.buffer.lines[oldIdx + i];
            newBuffer.lines.push({
              raw: oldBuffer.raw,
              ln: op.ln,
              isDirty,
              isValid: true,
            });

            newIdx += 1;
          }

          oldIdx += op.n;
          break;

        case "skip":
          oldIdx += op.n;
          break;

        case "invalidate":
          for (let _ = 0; _ < op.n; _++) {
            newBuffer.lines.push({
              raw: "",
              isDirty: true,
              isValid: true,
            });
          }

          break;

        case "ins":
          if (op.lines) {
            for (const line of op.lines) {
              newBuffer.lines.push({
                raw: line.text!,
                ln: line.ln,
                isDirty: true,
                isValid: true,
              });
              newIdx += 1;
            }
          }

          break;

        default:
          console.error(`unhandled update: ${op}`);
      }
    }

    this.lineSectionWidth = newBuffer.totalLength.toString().length +
      SPACES_IN_LINE_SECTION;
    this.buffer = newBuffer;
    await this.redraw(RedrawBehavior.OnlyDirty);
  }

  async redraw(behavior: RedrawBehavior) {
    const winSize = this.win.size();

    let bufferLength: number;
    if (this.buffer.linesAvailableAfter(this.screenStart) < winSize.height) {
      bufferLength = this.buffer.linesAvailableAfter(this.screenStart);
    } else {
      bufferLength = winSize.height;
    }

    const lines = this.buffer.lines.splice(this.screenStart);

    for (let index = 0; index < lines.length; index++) {
      if (behavior === RedrawBehavior.Everything || lines[index].isDirty) {
        // TODO: window move curser and clear line
        await this.win.moveCursorAndClearLine(index);
        // let ln: string;
        // if (lines[index].ln) {
        //   ln = lines[index].ln!.toString();
        // } else {
        //   ln = "";
        // }

        // const lineSize = this.lineSectionWidth - SPACES_IN_LINE_SECTION;
        // let lineSection =
        await this.win.appendStr(lines[index].raw);
      }
    }

    if (bufferLength < winSize.height) {
      for (let i = bufferLength; i < winSize.height; i++) {
        await this.win.moveCursorAndClearLine(i);
      }
    }

    await this.win.moveCursor(this.cursor.y, this.cursor.x);
  }
}
