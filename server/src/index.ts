import 'dotenv/config';
import { config } from './config.js';
import { runMigrations } from './db/migrate.js';
import { buildApp } from './app.js';

async function main() {
  // Run database migrations
  runMigrations();

  // Build and start the server
  const app = await buildApp();

  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`Server running on http://localhost:${config.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
