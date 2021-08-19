import * as path from "path/mod.ts";
import * as fs from "fs/mod.ts";

const { cwd, run } = Deno;

const corePath = path.resolve(cwd(), "core/rust");
const artifactsPath = path.join(corePath, "target/release/xi-core");
const binPath = path.resolve(cwd(), "bin");

console.log("Start building core...");
// change workding dir
const buildProcess = run({
  cmd: ["cargo", "build", "--release"],
  cwd: corePath,
});

// waiting process finished
await buildProcess.status();
buildProcess.close();

console.log("Copy build artifacts...");
await fs.emptyDir(binPath);
await fs.copy(artifactsPath, path.resolve(binPath, "core"))
console.log("Finished !")
