export type StartClientParams = {
  configDir?: string
  clientExtrasDir?: string
}

export type DexiEvent = {
  type: "core" | "keypress"
  data: string
}
