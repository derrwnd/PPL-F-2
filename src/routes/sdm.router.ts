import { Router } from 'express';
import { getDaftarSDM, tambahSDM, getDetailSDM, ubahSDM, getReferensiSDMDetail } from '../controllers/sdm.controller';
import { authenticateToken, requireCOOOrAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Middleware autentikasi global untuk seluruh rute terproteksi
router.use(authenticateToken);

// Rute Internal F-2
router.get('/sdm', requireCOOOrAdmin, getDaftarSDM);
router.post('/sdm', requireCOOOrAdmin, tambahSDM);
router.get('/sdm/:employeeId', getDetailSDM); // Mendukung COO, Admin, dan Self-Service
router.patch('/sdm/:employeeId', requireCOOOrAdmin, ubahSDM);

// Rute Referensi Antarmodul (F-1 / Modul Lain)
router.get('/referensi/sdm/:employeeId', getReferensiSDMDetail);

export default router;