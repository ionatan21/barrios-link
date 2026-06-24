import { createServer } from 'vite';

const port = Number(process.env.PORT) || 3000;

const server = await createServer({
  server: {
    host: '0.0.0.0',
    port,
    strictPort: true,
  },
});

await server.listen();
server.printUrls();

const shutdown = async () => {
  await server.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
