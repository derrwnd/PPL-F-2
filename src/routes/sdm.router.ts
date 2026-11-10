import { Router } from 'express';
import { 
  getDaftarSDM, 
  tambahSDM, 
  getDetailSDM, 
  ubahSDM, 
  getReferensiSDMDetail 
} from '../controllers/sdm.controller';
import { authenticateToken, requireCOOOrAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Middleware autentikasi global untuk seluruh rute terproteksi
router.use(authenticateToken);

// ==========================================
// Rute Internal F-2 (Master SDM)
// ==========================================

// Hanya COO / Admin yang dapat melihat seluruh daftar & menambah SDM baru
router.get('/sdm', requireCOOOrAdmin, getDaftarSDM);
router.post('/sdm', requireCOOOrAdmin, tambahSDM);

// Detail Profil: Mendukung COO/Admin & Self-Service (Pegawai melihat data sendiri)
router.get('/sdm/:employeeId', getDetailSDM);

// Ubah Profil: Pengamanan level granular (Manager vs Self-service) ditangani di controller
router.patch('/sdm/:employeeId', ubahSDM);

// ==========================================
// Rute Referensi Antarmodul (Integrasi F-1 / Modul Lain)
// ==========================================
router.get('/referensi/sdm/:employeeId', getReferensiSDMDetail);

export default router;