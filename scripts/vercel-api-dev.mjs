import { createServer } from "node:http";

const port = Number(process.env.PORT) || 3001;

const server = createServer((req, res) => {
  res.writeHead(req.url === "/" ? 200 : 404, {
    "Content-Type": "text/plain; charset=utf-8",
  });
  res.end("Barrios Link API dev server");
});

server.listen(port, "127.0.0.1", () => {
  console.log(`API dev placeholder listening on http://127.0.0.1:${port}`);
});

const shutdown = () => {
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

