import express, { type Request, type Response } from 'express';
import dotenv from "dotenv";
import authRouter from './routes/authRoute';
import userRouter from './routes/userRoute';
import messagesRouter from './routes/messagesRoute';
import requestRouter from './routes/requestRoouter';
import { Server, Socket } from 'socket.io'; // Import Server for the instance, Socket for the type


dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const cronJob = require('./lib/cron').default;

app.use(express.static('public'));

const handleHealth = (req: Request, res: Response) => {
  res.status(200).json({success:true})
}

app.get(`/api/health`, handleHealth);
app.use('/api/auth', authRouter);
app.use("/api/users", userRouter);
app.use("/api/messages",messagesRouter);
app.use("api/requests",requestRouter)

cronJob.start();

const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/api/health`);
});

// 1. Use 'Server' to initialize the socket instance
const SocketIO = new Server(server, {
  cors: {
    origin: "*", // Adjust this for your frontend URL for security
  }
});

SocketIO.on('connection', (socket: Socket) => { // 'socket' here is the individual client
  console.log('a user connected', socket.id);

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

export { SocketIO };