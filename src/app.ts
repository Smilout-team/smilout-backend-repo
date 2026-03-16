import express from 'express';
import { publicRoute, protectedRoute } from './routes/index.js';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandle.middleware.js';
import { NotFoundError } from './core/apiError.js';
import cors from 'cors';

const corsOptions = {
  origin: ['http://localhost:5173', 'https://smilout.dev'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
import { setupSwagger } from './swagger/index.swagger.js';

const app = express();

app.set('trust proxy', 1);

app.use(cors(corsOptions));

app.use(helmet());
app.use(cookieParser());

app.use(express.json());

setupSwagger(app);

app.use('/api/v1', publicRoute);

app.use('/api/v1', protectedRoute);

app.use((req, res, next) => {
  next(new NotFoundError('Route không tồn tại'));
});

app.use(errorHandler);

export default app;
