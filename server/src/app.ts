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
import sttRoutes from './routes/stt.js';
import commentRoutes from './routes/comments.js';
import feedbackRoutes from './routes/feedback.js';
import reminderRoutes from './routes/reminders.js';
import membershipCardRoutes from './routes/membershipCards.js';
import specialBudgetRoutes from './routes/specialBudgets.js';

export async function buildApp() {
  const app = Fastify({
    logger: true,
    bodyLimit: 10 * 1024 * 1024, // 10 MB for audio uploads
  });

  // Register raw body content type parsers for audio uploads
  const audioTypes = ['audio/webm', 'audio/mp4', 'audio/m4a', 'audio/wav', 'audio/ogg', 'audio/mpeg', 'audio/mp3', 'audio/x-m4a', 'audio/aac', 'application/octet-stream'];
  for (const ct of audioTypes) {
    app.addContentTypeParser(ct, { parseAs: 'buffer' }, (req: any, body: any, done: any) => {
      done(null, body);
    });
  }

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
  await app.register(sttRoutes);
  await app.register(commentRoutes);
  await app.register(feedbackRoutes);
  await app.register(reminderRoutes);
  await app.register(membershipCardRoutes);
  await app.register(specialBudgetRoutes);

  // Health check
  app.get('/api/health', async () => {
    return { status: 'ok', time: new Date().toISOString() };
  });

  return app;
}
