import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB } from './db/index.js';

const start = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`Server listening on http://localhost:${env.PORT}`);
  });
};

start();
