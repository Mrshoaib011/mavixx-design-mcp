import { createHttpServer } from './http.js';
const port = Number(process.env.PORT ?? 3000);
const server = createHttpServer();
server.listen(port, '0.0.0.0', () => console.log(`Mavixx MCP listening on port ${port}`));
for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => server.close(() => process.exit(0)));
