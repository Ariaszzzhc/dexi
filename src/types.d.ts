export type StartClientParams = {
  configDir?: string;
  clientExtrasDir?: string;
};

export type DexiEvent = {
  type: "core" | "keypress" | "common";
  data: string;
};

export type RpcRequest = {
  id?: number;
  method: string;
  params: unknown;
};

export type Op = {
  op: "copy" | "skip" | "invalidate" | "update" | "ins";
  n: number; // number of lines affected
  lines?: Line[]; // only present when op is "update" or "ins"
  ln?: number; // the logical number for this line; null if this line is a soft break
};

export type AnnotationSlice = {
  type: string;
  ranges: Array<[number, number, number, number]>; // start_line, start_col, end_line, end_col
  payloads: Array<Record<string, unknown>>; // can be any json object or value
  n: number; // number of ranges
};

export type Line = {
  text?: string; // present when op is "update"
  ln?: number; // the logical/'real' line number for this line.
  cursor?: number[]; // utf-8 code point offsets, in increasing order
  styles?: number[]; // length is a multiple of 3, see below
};

export type UpdateParams = {
  "view_id": string;
  update: {
    annotations:AnnotationSlice[];
    ops: Op[];
    pristine: boolean;
  }
};

export type ScrollParams = {
  col: number;
  line: number;
  "view_id": string;
};

export type AddStatusItemParams = {
  source: string;
  key: string;
  value: string;
  alignment: string;
};
