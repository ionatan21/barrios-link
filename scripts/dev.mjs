import { spawn } from "node:child_process";

const processes = [];
let shuttingDown = false;

const run = (name, command, args, env = {}) => {
  const child = spawn(command, args, {
    env: { ...process.env, ...env },
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  processes.push(child);

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;

    if (code && code !== 0) {
      console.error(`${name} exited with code ${code}.`);
      shutdown(code);
      return;
    }

    if (signal) {
      console.error(`${name} exited with signal ${signal}.`);
      shutdown(1);
    }
  });

  return child;
};

const shutdown = (code = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of processes) {
    if (!child.killed) child.kill();
  }

  process.exit(code);
};

process.on("SIGINT", () => shutdown());
process.on("SIGTERM", () => shutdown());

run("API", "vercel", ["dev", "--listen", "3000"]);
run("Vite", "vite", ["--host", "127.0.0.1", "--port", "5173", "--strictPort"]);

