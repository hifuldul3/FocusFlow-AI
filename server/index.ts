import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { router } from './routes';
import { generateSchedule } from './services/scheduler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize schedule on startup
generateSchedule();

// API Routes
app.use('/api', router);

// Serve client in production
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`⚡ FocusFlow AI Backend running on http://localhost:${PORT}`);
});
