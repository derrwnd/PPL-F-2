import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    akunId: string;
    employeeId: string;
    kodePeran: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: 'Sesi berakhir atau token tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];

  // Simulasi token dari F-1
  if (token === 'token-coo') {
    req.user = {
      akunId: '01929b4a-83a1-7d55-8b12-9f7c2e4a6b10',
      employeeId: '01929b4a-5f10-7a22-9d44-3c8f1b2e7a90',
      kodePeran: 'COO'
    };
  } else if (token === 'token-karyawan') {
    req.user = {
      akunId: '01929b4a-9999-7d55-8b12-9f7c2e4a6b99',
      employeeId: '01a1598a-6356-7933-8239-589944b35d30', // Rina Maharani
      kodePeran: 'KARYAWAN'
    };
  } else {
    return res.status(401).json({ code: 401, message: 'Token tidak valid.' });
  }

  next();
};

export const requireCOOOrAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.kodePeran !== 'COO' && req.user.kodePeran !== 'ADMIN')) {
    return res.status(403).json({ code: 403, message: 'Anda tidak memiliki izin mengakses data ini.' });
  }
  next();
};