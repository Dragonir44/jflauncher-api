import express from 'express';
import dotenv from 'dotenv';

// import routes
import channelRoutes from './routes/channel';

// load environment variables
dotenv.config()
const app = express();

app.use(express.json());

// use routes
app.use('/channel', channelRoutes);

export default app;