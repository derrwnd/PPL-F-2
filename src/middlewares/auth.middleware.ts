import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface UserPayload {
  akunId: string;
  employeeId: string;
  kodePeran: string;
  [key: string]: any;
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: 'Sesi berakhir atau token tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];

  // A. SIMULASI / MOCK TOKEN (Untuk Demo Frontend UI & Pengujian Lokal)
  if (token === 'token-coo') {
    req.user = {
      akunId: '01929b4a-83a1-7d55-8b12-9f7c2e4a6b10',
      employeeId: '01929b4a-5f10-7a22-9d44-3c8f1b2e7a90',
      kodePeran: 'COO'
    };
    return next();
  }

  if (token === 'token-karyawan') {
    req.user = {
      akunId: '01929b4a-9999-7d55-8b12-9f7c2e4a6b99',
      employeeId: '01a1598a-6356-7933-8239-589944b35d30',
      kodePeran: 'KARYAWAN'
    };
    return next();
  }

  // B. VERIFIKASI TOKEN JWT SUNGGUHAN DARI F-1
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('CRITICAL: JWT_SECRET belum dikonfigurasi di file .env');
    return res.status(500).json({ code: 500, message: 'Kesalahan konfigurasi server.' });
  }

  try {
    const decoded = jwt.verify(token, secret) as UserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ code: 401, message: 'Token tidak valid atau telah kadaluwarsa.' });
  }
};

export const requireCOOOrAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ code: 401, message: 'Pengguna belum terautentikasi.' });
  }

  const roleUpper = req.user.kodePeran?.toUpperCase();
  if (roleUpper !== 'COO' && roleUpper !== 'ADMIN') {
    return res.status(403).json({ code: 403, message: 'Anda tidak memiliki izin mengakses data ini.' });
  }

  next();
};