import dotenv from 'dotenv';
// 1. Wajib dipanggil paling atas sebelum mengimpor router/modul internal
dotenv.config();

import express from 'express';
import cors from 'cors';
import sdmRouter from './routes/sdm.router';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 8080;

// 2. Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));

// 3. Health Check / Root Endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Server F-2 Master SDM Berjalan' });
});

// 4. Router API Mounting
app.use('/api/v1', sdmRouter);

// 5. Fallback Handler (404 Not Found)
app.use((req, res) => {
  res.status(404).json({ code: 404, message: 'Endpoint tidak ditemukan.' });
});

// 6. Global Error Handler (500 Internal Server Error)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ code: 500, message: 'Terjadi kesalahan internal pada server.' });
});

// 7. Start Server
app.listen(PORT, () => {
  console.log(`Server F-2 Backend berjalan di http://localhost:${PORT}`);
});