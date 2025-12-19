import express, { type Request, type Response } from 'express';
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const SERVER_API_URL = process.env.API_URL || "http://localhost:8000/api";
const cronJob = require('./lib/cron').default;

app.use(express.static('public'));

const handleHealth = (req: Request, res: Response) => {
  res.status(200).json({success:true})
}

app.get(SERVER_API_URL + "/health", handleHealth);
cronJob.start();
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});