import { Core } from "./core.ts";
import { DexiWindow } from "./window.ts"

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

class View {
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
    this.win = new DexiWindow(Deno.stdout.rid);
    this.buffer = new Buffer();
    this.ctx = core;
    this.lineSectionWidth = 0;
  }

  async init() {
    const { width, height } = await this.win.size();

    await this.ctx.request({
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

    await this.ctx.request({
      method: "edit",
      params: {
        "method": "scroll",
        "view_id": this.id,
        "params": [0, height + 1],
      },
    });
  }

  saveFile() {
    if (this.filename) {
      this.ctx.request({
        method: "save",
        params: {
          "view_id": this.id,
          "file_path": this.filename,
        },
      });
    }
  }

  async moveCursor(line: number, column: number ) {
    const { height } = await this.win.size();

    let cursorY = line - this.screenStart;
    let scroll = false;

    if (cursorY >= height) {
      this.screenStart += cursorY - height + 1;
      scroll = true;
      cursorY -= cursorY - height + 1;
    } else if (cursorY <= -1) {
      this.screenStart -= Math.abs(cursorY)
      scroll = true;
      cursorY = 0;
    }

    this.cursor.x = column + this.lineSectionWidth;
    this.cursor.y = cursorY

    if (scroll) {
      this.redraw(RedrawBehavior.Everything);
    } else {
      this.win.moveCursor(this.cursor.y, this.cursor.x);
      this.win.refresh();
    }
  }

  async redraw(behavior: RedrawBehavior) {
    const winSize = await this.win.size();

    let bufferLength: number
    if (this.buffer.linesAvailableAfter(this.screenStart) < winSize.height) {
      bufferLength = this.buffer.linesAvailableAfter(this.screenStart);
    } else {
      bufferLength = winSize.height;
    }

    const lines = this.buffer.lines.splice(this.screenStart)

    lines.forEach((line, index) => {
      if (behavior === RedrawBehavior.Everything || line.isDirty) {
        // TODO: window move curser and clear line
        // this.win.moveCursorAndClearLine(index)
        let ln: string;
        if (line.ln) {
          ln = line.ln.toString();
        } else {
          ln = "";
        }
      }
    })
  }
}
