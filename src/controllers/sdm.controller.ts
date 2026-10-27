import { Response } from 'express';
import { uuidv7 } from 'uuidv7';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const sdmDatabase: any[] = [
  {
    employeeId: '01929b4a-5f10-7a22-9d44-3c8f1b2e7a90',
    nomorPegawai: 'SDM-2026-001',
    namaLengkap: 'Sandy Walsh',
    jabatanId: '01929b4a-83a1-7d55-8b12-9f7c2e4a6b10',
    namaJabatan: 'Project Manager',
    statusKerja: 'karyawan',
    email: 'sandy.walsh@example.com',
    nomorTelepon: '081200000001',
    alamat: 'Bandung',
    dibuatPada: '2026-10-20T10:00:00Z'
  },
  {
    employeeId: '01a1598a-6356-7933-8239-589944b35d30',
    nomorPegawai: 'SDM-2026-002',
    namaLengkap: 'Rina Maharani',
    jabatanId: '01929b4a-83a1-7d55-8b12-9f7c2e4a6b10',
    namaJabatan: 'Junior Programmer',
    statusKerja: 'kontrak',
    email: 'rina.maharani@example.com',
    nomorTelepon: '081200000002',
    alamat: 'Jakarta',
    dibuatPada: '2026-10-20T11:00:00Z'
  }
];

// GET /api/v1/sdm (Cari & Daftar Profil)
export const getDaftarSDM = (req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json({
    items: sdmDatabase,
    page: 1,
    limit: 20,
    total: sdmDatabase.length
  });
};

// POST /api/v1/sdm (Tambah Profil)
export const tambahSDM = (req: AuthenticatedRequest, res: Response) => {
  const { nomorPegawai, namaLengkap, jabatanId, statusKerja, email, nomorTelepon, alamat } = req.body;

  if (!nomorPegawai || !namaLengkap || !jabatanId || !statusKerja) {
    return res.status(422).json({ code: 422, message: 'Field wajib belum diisi.' });
  }

  const isDuplicate = sdmDatabase.some(item => item.nomorPegawai === nomorPegawai);
  if (isDuplicate) {
    return res.status(409).json({ code: 409, message: 'Nomor identitas internal sudah digunakan.' });
  }

  const newProfil = {
    employeeId: uuidv7(),
    nomorPegawai,
    namaLengkap,
    jabatanId,
    statusKerja,
    email: email || null,
    nomorTelepon: nomorTelepon || null,
    alamat: alamat || null,
    dibuatPada: new Date().toISOString()
  };

  sdmDatabase.push(newProfil);
  return res.status(201).json(newProfil);
};

// GET /api/v1/sdm/:employeeId (Detail Profil + Proteksi Data Sensitif)
export const getDetailSDM = (req: AuthenticatedRequest, res: Response) => {
  const { employeeId } = req.params;
  const currentUser = req.user!;

  const profil = sdmDatabase.find(item => item.employeeId === employeeId);
  if (!profil) {
    return res.status(404).json({ code: 404, message: 'Profil SDM tidak ditemukan.' });
  }

  const isOwner = currentUser.employeeId === employeeId;
  const isManager = currentUser.kodePeran === 'COO' || currentUser.kodePeran === 'ADMIN';

  // Jika bukan COO/Admin dan bukan pemilik profil sendiri
  if (!isManager && !isOwner) {
    return res.status(403).json({ code: 403, message: 'Anda tidak memiliki izin mengakses profil ini.' });
  }

  // Jika pemilik profil sendiri (bukan COO/Admin), samarkan data sensitif
  if (isOwner && !isManager) {
    return res.status(200).json({
      ...profil,
      email: profil.email,
      nomorTelepon: profil.nomorTelepon,
      alamat: profil.alamat,
      rekeningDanBPJS: '•••• •••• ••••', // Disamarkan untuk self-service
      dokumenIdentitas: '••••••••'
    });
  }

  return res.status(200).json(profil);
};

// PATCH /api/v1/sdm/:employeeId (Ubah Profil SDM)
export const ubahSDM = (req: AuthenticatedRequest, res: Response) => {
  const { employeeId } = req.params;
  const { namaLengkap, statusKerja, email, nomorTelepon, alamat } = req.body;

  const profilIndex = sdmDatabase.findIndex(item => item.employeeId === employeeId);
  if (profilIndex === -1) {
    return res.status(404).json({ code: 404, message: 'Profil SDM tidak ditemukan.' });
  }

  // Update field yang diizinkan (employeeId dan nomorPegawai tidak boleh diubah)
  sdmDatabase[profilIndex] = {
    ...sdmDatabase[profilIndex],
    ...(namaLengkap && { namaLengkap }),
    ...(statusKerja && { statusKerja }),
    ...(email !== undefined && { email }),
    ...(nomorTelepon !== undefined && { nomorTelepon }),
    ...(alamat !== undefined && { alamat })
  };

  return res.status(200).json(sdmDatabase[profilIndex]);
};

// GET /api/v1/referensi/sdm/:employeeId (API-K02-17 untuk Sinkronisasi F-1)
export const getReferensiSDMDetail = (req: AuthenticatedRequest, res: Response) => {
  const { employeeId } = req.params;

  const profil = sdmDatabase.find(item => item.employeeId === employeeId);
  if (!profil) {
    return res.status(404).json({ code: 404, message: 'EMPLOYEE_NOT_FOUND' });
  }

  // Kembalikan hanya data referensi aman (tanpa kontak/sensitif)
  return res.status(200).json({
    employeeId: profil.employeeId,
    nomorPegawai: profil.nomorPegawai,
    namaLengkap: profil.namaLengkap,
    jabatanId: profil.jabatanId,
    namaJabatan: profil.namaJabatan || 'Project Manager',
    statusKerja: profil.statusKerja
  });
};