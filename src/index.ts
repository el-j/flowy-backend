import { App } from './app.js';
import { logger } from './utils/logger.js';

const app = new App();

app.start().catch((error) => {
  logger.error('Failed to start application', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
