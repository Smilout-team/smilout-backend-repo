import express from 'express';
import { authRoute, protectedRoute } from './routes/index.js';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandle.middleware.js';
import { NotFoundError } from './core/apiError.js';
import cors from 'cors';

const corsOptions = {
  origin: [
    'http://localhost:5173',
  ],
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

app.use('/api/v1/auth', authRoute);

app.use('/api/v1', protectedRoute);

app.use((req, res, next) => {
  next(new NotFoundError('Route not found'));
});

app.use(errorHandler);

export default app;
