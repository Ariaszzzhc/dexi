import type { DexiEvent } from "@/types.d.ts";

export async function* readKeypress(): AsyncIterable<DexiEvent> {
  const stdin = Deno.stdin;


  while (true) {
    const buffer = new Uint8Array(1024);
    Deno.setRaw(stdin.rid, true);
    const length = await stdin.read(buffer);
    Deno.setRaw(stdin.rid, false);

    if (length) {
      const event: DexiEvent = {
        type: 'keypress',
        data: decodeKeypress(buffer.subarray(0, length)),
      }

      yield event;
    }
  }
}

export function decodeKeypress(buffer:Uint8Array): string {
  const decoder = new TextDecoder();
  const sequence = decoder.decode(buffer)

  if (sequence.length === 1) return sequence;

  return "\\" + sequence;
}
