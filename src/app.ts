import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sdmRouter from './routes/sdm.router';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Server F-2 Master SDM Berjalan' });
});
app.use(cors());
app.use(express.json());

app.use('/api/v1', sdmRouter);

app.listen(PORT, () => {
  console.log(`Server F-2 Backend berjalan di http://localhost:${PORT}`);
});