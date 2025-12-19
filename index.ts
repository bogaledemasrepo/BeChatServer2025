import express, { type Request, type Response } from 'express';
import dotenv from "dotenv";
import authRouter from './routes/authRoute';

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
cronJob.start();
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/api/health`);
});