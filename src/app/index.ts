import express from 'express';
import dotenv from 'dotenv';

// import routes
import channelRoutes from './routes/channel';
import healthRoutes from './routes/health';

// load environment variables
dotenv.config()
const app = express();

app.use(express.json());

// use routes
app.use('/channels', channelRoutes);
app.use('/health', healthRoutes);

export default app;