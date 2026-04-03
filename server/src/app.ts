import Fastify from 'fastify';
import corsPlugin from './plugins/cors.js';
import authPlugin from './plugins/auth.js';
import wsPlugin from './plugins/websocket.js';
import authRoutes from './routes/auth.js';
import spaceRoutes from './routes/spaces.js';
import expenseRoutes from './routes/expenses.js';
import chatRoutes from './routes/chat.js';
import budgetRoutes from './routes/budgets.js';
import reportRoutes from './routes/reports.js';
import categoryRoutes from './routes/categories.js';

export async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  // Plugins
  await app.register(corsPlugin);
  await app.register(authPlugin);
  await app.register(wsPlugin);

  // Routes
  await app.register(authRoutes);
  await app.register(spaceRoutes);
  await app.register(expenseRoutes);
  await app.register(chatRoutes);
  await app.register(budgetRoutes);
  await app.register(reportRoutes);
  await app.register(categoryRoutes);

  // Health check
  app.get('/api/health', async () => {
    return { status: 'ok', time: new Date().toISOString() };
  });

  return app;
}
