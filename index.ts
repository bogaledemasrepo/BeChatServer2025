import express, { type Request, type Response } from 'express';
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

const handleHealth = (req: Request, res: Response) => {
  res.status(200).json({success:true})
}

app.get("/health",handleHealth)

app.listen(port,() => {
  console.log(`Server running on http://localhost:${port}`);
});