import app from './app.js';
import { config } from './config/index.js';

const PORT = config.port;

const startServer = async () => {
  try {

    app.listen(PORT, () => {
      console.log(`Server url is http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
