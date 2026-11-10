import { Response } from 'express';
import { uuidv7 } from 'uuidv7';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export interface SDMItem {
  employeeId: string;
  nomorPegawai: string;
  namaLengkap: string;
  jabatanId: string;
  namaJabatan?: string;
  statusKerja: string;
  email: string | null;
  nomorTelepon: string | null;
  alamat: string | null;
  rekeningDanBPJS?: string;
  dokumenIdentitas?: string;
  dibuatPada: string;
}

// In-memory Database dengan Type Definition
const sdmDatabase: SDMItem[] = [
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

// GET /api/v1/sdm (Cari & Daftar Profil dengan Filter & Paginasi)
export const getDaftarSDM = (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const searchQuery = (req.query.q as string || '').toLowerCase();

  let filteredData = sdmDatabase;
  if (searchQuery) {
    filteredData = sdmDatabase.filter(item => 
      item.namaLengkap.toLowerCase().includes(searchQuery) ||
      item.nomorPegawai.toLowerCase().includes(searchQuery)
    );
  }

  const startIndex = (page - 1) * limit;
  const paginatedItems = filteredData.slice(startIndex, startIndex + limit);

  return res.status(200).json({
    items: paginatedItems,
    page,
    limit,
    total: filteredData.length
  });
};

// POST /api/v1/sdm (Tambah Profil)
export const tambahSDM = (req: AuthenticatedRequest, res: Response) => {
  const { nomorPegawai, namaLengkap, jabatanId, namaJabatan, statusKerja, email, nomorTelepon, alamat } = req.body;

  if (!nomorPegawai || !namaLengkap || !jabatanId || !statusKerja) {
    return res.status(422).json({ code: 422, message: 'Field wajib belum diisi.' });
  }

  const isDuplicate = sdmDatabase.some(item => item.nomorPegawai === nomorPegawai);
  if (isDuplicate) {
    return res.status(409).json({ code: 409, message: 'Nomor identitas internal sudah digunakan.' });
  }

  const newProfil: SDMItem = {
    employeeId: uuidv7(),
    nomorPegawai,
    namaLengkap,
    jabatanId,
    namaJabatan: namaJabatan || 'Staf Operational',
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
  const currentUser = req.user;

  if (!currentUser) {
    return res.status(401).json({ code: 401, message: 'Sesi pengguna tidak valid.' });
  }

  const profil = sdmDatabase.find(item => item.employeeId === employeeId);
  if (!profil) {
    return res.status(404).json({ code: 404, message: 'Profil SDM tidak ditemukan.' });
  }

  const roleUpper = currentUser.kodePeran?.toUpperCase();
  const isOwner = currentUser.employeeId === employeeId;
  const isManager = roleUpper === 'COO' || roleUpper === 'ADMIN';

  if (!isManager && !isOwner) {
    return res.status(403).json({ code: 403, message: 'Anda tidak memiliki izin mengakses profil ini.' });
  }

  // Jika pemilik profil sendiri (bukan COO/Admin), samarkan data finansial & dokumen identitas
  if (isOwner && !isManager) {
    return res.status(200).json({
      ...profil,
      rekeningDanBPJS: '•••• •••• ••••',
      dokumenIdentitas: '••••••••'
    });
  }

  return res.status(200).json(profil);
};

// PATCH /api/v1/sdm/:employeeId (Ubah Profil SDM dengan Pengecekan Otorisasi)
export const ubahSDM = (req: AuthenticatedRequest, res: Response) => {
  const { employeeId } = req.params;
  const currentUser = req.user;
  const { namaLengkap, jabatanId, namaJabatan, statusKerja, email, nomorTelepon, alamat } = req.body;

  if (!currentUser) {
    return res.status(401).json({ code: 401, message: 'Sesi pengguna tidak valid.' });
  }

  const profilIndex = sdmDatabase.findIndex(item => item.employeeId === employeeId);
  if (profilIndex === -1) {
    return res.status(404).json({ code: 404, message: 'Profil SDM tidak ditemukan.' });
  }

  const roleUpper = currentUser.kodePeran?.toUpperCase();
  const isOwner = currentUser.employeeId === employeeId;
  const isManager = roleUpper === 'COO' || roleUpper === 'ADMIN';

  // Proteksi Hak Akses Ubah Data
  if (!isManager && !isOwner) {
    return res.status(403).json({ code: 403, message: 'Anda tidak memiliki izin mengedit profil ini.' });
  }

  // Jika Owner (bukan Manager), batasi pengubahan status kerja / jabatan
  const updatePayload: Partial<SDMItem> = {
    ...(namaLengkap && { namaLengkap }),
    ...(email !== undefined && { email }),
    ...(nomorTelepon !== undefined && { nomorTelepon }),
    ...(alamat !== undefined && { alamat })
  };

  // Hanya Manager (COO/Admin) yang dapat mengubah status kerja & jabatan
  if (isManager) {
    if (statusKerja) updatePayload.statusKerja = statusKerja;
    if (jabatanId) updatePayload.jabatanId = jabatanId;
    if (namaJabatan) updatePayload.namaJabatan = namaJabatan;
  }

  sdmDatabase[profilIndex] = {
    ...sdmDatabase[profilIndex],
    ...updatePayload
  };

  return res.status(200).json(sdmDatabase[profilIndex]);
};

// GET /api/v1/referensi/sdm/:employeeId (API-K02-17 untuk Sinkronisasi F-1)
export const getReferensiSDMDetail = (req: AuthenticatedRequest, res: Response) => {
  const { employeeId } = req.params;

  const profil = sdmDatabase.find(item => item.employeeId === employeeId);
  if (!profil) {
    return res.status(404).json({ code: 404, message: 'Profil SDM tidak ditemukan.' });
  }

  return res.status(200).json({
    employeeId: profil.employeeId,
    nomorPegawai: profil.nomorPegawai,
    namaLengkap: profil.namaLengkap,
    jabatanId: profil.jabatanId,
    namaJabatan: profil.namaJabatan || 'Staf Operational',
    statusKerja: profil.statusKerja
  });
};