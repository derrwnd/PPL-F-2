# 🏢 ERP PT Anaheim Nimbus Universal — Modul F-2 (Master SDM dan Tenaga Ahli)

Repositori backend untuk **Modul F-2 (Master SDM dan Tenaga Ahli)** pada sistem ERP PT Anaheim Nimbus Universal, dikembangkan oleh **Kelompok 2 Kelas F (PPL 2026)**.

Layanan ini bertanggung jawab mengelola seluruh data induk pegawai (*Master SDM*), tenaga ahli, master jabatan, riwayat transisi status kerja, serta metadata berkas dokumen identitas.

## 🛠️ Teknologi dan Dependensi

* **Runtime:** Node.js (v20+)

* **Framework:** Express.js + TypeScript

* **Development Runner:** `tsx` (TypeScript Execution Engine)

* **ID Generator:** `uuidv7` (Universally Unique Identifier Version 7)

* **Keamanan & Otorisasi:** Bearer Token (JWT) terintergrasi dengan Layanan F-1

## 📑 Kesepakatan Integrasi & Standar Data

Modul ini sepenuhnya mengacu pada **Daftar Kontrak API F-1 v1.0 Final** dan **Daftar Kontrak API F-2 v0.1/v1.1**:

1. **Format Identifier (ID):**

   * Primary Key teknis (`employeeId`, `jabatanId`, `riwayatId`, `dokumenId`, `akunId`) menggunakan format **`string (UUID v7)`** yang dihasilkan otomatis oleh sistem.

   * Identitas internal manual NIP/NIK yang diinput COO/Admin diwadahi pada atribut **`nomorPegawai`**.

2. **Format Waktu:** Menggunakan standar **ISO 8601 UTC** (`YYYY-MM-DDTHH:mm:ssZ`) untuk *timestamp* audit (`dibuatPada`, `diubahPada`) dan format `YYYY-MM-DD` untuk tanggal bisnis (`tanggalEfektif`).

3. **Format Status Enum:** Ditulis menggunakan huruf kecil (*lowercase*), contoh: `komisaris`, `direksi`, `karyawan`, `kontrak`, `mitra`, `tenaga_ahli`.

4. **Otorisasi Lintas Layanan:** Menggunakan *Header Authorization* (`Bearer <token>`).

## 🚀 Panduan Memulai (Quick Start)

### 1. Prasyarat

Pastikan komputer Anda telah terinstal Node.js (v20.0.0 atau lebih baru) dan Git.

### 2. Kloning Repositori

```
git clone https://github.com/derrwnd/PPL-F-2.git
cd PPL-F-2

```

### 3. Instalasi Dependency

```
npm install

```

### 4. Konfigurasi Environment (`.env`)

Buat berkas `.env` di akar direktori proyek (opsional, default port 8080):

```
PORT=8080

```

### 5. Menjalankan Server Lokal

```
# Menjalankan server pengembangan dengan hot-reload
npm run dev

```

Server akan aktif dan siap menerima permintaan HTTP di **`http://localhost:8080`**.

## 🔌 Rangkuman API Endpoints (v1)

Base URL: `http://localhost:8080/api/v1`

| Metode | Endpoint | Deskripsi | Akses Peran | 
| ----- | ----- | ----- | ----- | 
| **GET** | `/sdm` | Mencari dan menampilkan daftar profil SDM | COO / Admin | 
| **POST** | `/sdm` | Menambahkan profil SDM baru | COO / Admin | 
| **GET** | `/sdm/:employeeId` | Menampilkan detail profil SDM | COO, Admin, Pemilik Profil (*Self-Service*) | 
| **GET** | `/referensi/sdm/:employeeId` | Menyediakan data referensi aman untuk F-1 & ERP | Layanan Internal Terotorisasi | 

## 🧪 Simulasi Token Autentikasi (Demo Testing)

Untuk kebutuhan pengujian lokal (*Thunder Client / Postman / cURL*), gunakan header berikut:

```
Authorization: Bearer <token_simulasi>

```

### Token Simulasi Tersedia:

* **`token-coo`**: Mensimulasikan akun berhak akses **COO / Admin**. Mengizinkan seluruh operasi CRUD dan pembacaan data sensitif.

* **`token-karyawan`**: Mensimulasikan akun **Karyawan / Tenaga Ahli** (`UI-K02-08`). Mengizinkan pembacaan detail profil sendiri dengan penyamaran data sensitif.

## 📝 Contoh Pengujian Endpoint API

### 1. Ambil Daftar Profil SDM (COO / Admin)

* **Request:** `GET http://localhost:8080/api/v1/sdm`

* **Header:** `Authorization: Bearer token-coo`

* **Response (200 OK):**

```
{
  "items": [
    {
      "employeeId": "01929b4a-5f10-7a22-9d44-3c8f1b2e7a90",
      "nomorPegawai": "SDM-2026-001",
      "namaLengkap": "Sandy Walsh",
      "jabatanId": "01929b4a-83a1-7d55-8b12-9f7c2e4a6b10",
      "namaJabatan": "Project Manager",
      "statusKerja": "karyawan",
      "email": "sandy.walsh@example.com",
      "nomorTelepon": "081200000001",
      "alamat": "Bandung",
      "dibuatPada": "2026-10-20T10:00:00Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 1
}

```

### 2. Tambah Profil SDM Baru (Kasus Berhasil)

* **Request:** `POST http://localhost:8080/api/v1/sdm`

* **Header:** `Authorization: Bearer token-coo`

* **Body (JSON):**

```
{
  "nomorPegawai": "SDM-2026-002",
  "namaLengkap": "Rina Maharani",
  "jabatanId": "01929b4a-83a1-7d55-8b12-9f7c2e4a6b10",
  "statusKerja": "kontrak"
}

```

* **Response (201 Created):**

```
{
  "employeeId": "01a1598a-6356-7933-8239-589944b35d30",
  "nomorPegawai": "SDM-2026-002",
  "namaLengkap": "Rina Maharani",
  "jabatanId": "01929b4a-83a1-7d55-8b12-9f7c2e4a6b10",
  "statusKerja": "kontrak",
  "email": null,
  "nomorTelepon": null,
  "alamat": null,
  "dibuatPada": "2026-10-20T13:40:04.062Z"
}

```

### 3. Tambah Profil SDM Baru (Kasus Ditolak Duplikat)

* **Request:** `POST http://localhost:8080/api/v1/sdm` (mengirim `nomorPegawai` yang sama)

* **Response (409 Conflict):**

```
{
  "code": 409,
  "message": "Nomor identitas internal sudah digunakan."
}

```

## 👥 Tim Penyusun (Kelompok 2 / Kelas F)

* **Asep Deri Dermawan**

* **M. Haekal Al-Ghazy**

* **Tim Kelompok 2 Kelas F**
