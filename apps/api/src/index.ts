import { app } from './app';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {});

// Graceful shutdown
process.on('SIGTERM', () => {
  process.exit(0);
});

process.on('SIGINT', () => {
  process.exit(0);
});
