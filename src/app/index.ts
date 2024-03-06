import express from 'express';
import dotenv from 'dotenv';

// import routes
import channelRoutes from './routes/channel';
import addChannelRoutes from './routes/addChannel';
import healthRoutes from './routes/health';
import removeRoutes from './routes/remove';

// load environment variables
dotenv.config()
const app = express();

app.use(express.json());

// use routes
app.use('/channel', channelRoutes);
app.use('/addchannel', addChannelRoutes);
app.use('/health', healthRoutes);
app.use('/remove', removeRoutes);

export default app;