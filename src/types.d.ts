export type StartClientParams = {
  configDir?: string;
  clientExtrasDir?: string;
};

export type DexiEvent = {
  type: "core" | "keypress" | "common";
  data: string;
};

export type RpcRequest = {
  method: string;
  params: unknown;
};

export type Cursor = {
  x: number;
  y: number;
}
