import { Category, Period } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'pokok', name: 'Kebutuhan Pokok', color: '#ea580c', isDefault: true }, // Orange
  { id: 'utilitas', name: 'Utilitas & Tagihan', color: '#ca8a04', isDefault: true }, // Yellow
  { id: 'keluarga', name: 'Kebutuhan Keluarga', color: '#2563eb', isDefault: true }, // Blue
  { id: 'keuangan', name: 'Keuangan & Perencanaan', color: '#16a34a', isDefault: true }, // Green
  { id: 'transportasi', name: 'Transportasi', color: '#475569', isDefault: true }, // Slate
  { id: 'kesehatan', name: 'Kesehatan', color: '#dc2626', isDefault: true }, // Red
  { id: 'pendidikan', name: 'Pendidikan', color: '#7c3aed', isDefault: true }, // Violet
  { id: 'rumah', name: 'Perawatan Rumah', color: '#0891b2', isDefault: true }, // Cyan
  { id: 'sosial', name: 'Sosial', color: '#db2777', isDefault: true }, // Pink
  { id: 'hiburan', name: 'Hiburan & Gaya Hidup', color: '#c026d3', isDefault: true }, // Fuchsia
  { id: 'darurat', name: 'Dana Tidak Terduga', color: '#be123c', isDefault: true }, // Rose
];

export const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const INITIAL_PERIOD: Period = {
  month: new Date().getMonth(),
  year: new Date().getFullYear(),
};

export const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i);

// Mapping for Auto-Categorization
// Structured as an array to allow sorting by length (longest match first) to handle "airpam" vs "air"
const RAW_KEYWORDS = [
  // Kebutuhan Pokok
  { ids: ['beras', 'nasi', 'sayur', 'buah', 'telur', 'daging', 'ikan', 'minyak', 'gula', 'garam', 'tepung', 'mie', 'roti', 'air'], catId: 'pokok' },
  
  // Utilitas & Tagihan
  { ids: ['listrik', 'wifi', 'airpam', 'pulsa', 'paketdata', 'gas', 'lpg', 'iuran', 'sampah'], catId: 'utilitas' },
  
  // Kebutuhan Keluarga
  { ids: ['popok', 'susu', 'mainan', 'seragam', 'sepatu', 'pakaian', 'tas', 'hijab', 'kosmetik', 'perawatan'], catId: 'keluarga' },
  
  // Keuangan & Perencanaan
  { ids: ['tabungan', 'investasi', 'asuransi', 'bpjs', 'cicilan', 'angsuran', 'deposito'], catId: 'keuangan' },
  
  // Transportasi
  { ids: ['bensin', 'parkir', 'tol', 'ojek', 'taksi', 'bus', 'kereta', 'servis', 'oli', 'ban'], catId: 'transportasi' },
  
  // Kesehatan
  { ids: ['obat', 'vitamin', 'dokter', 'klinik', 'rumahsakit', 'teslab', 'masker', 'alkohol'], catId: 'kesehatan' },
  
  // Pendidikan
  { ids: ['sekolah', 'les', 'buku', 'alat', 'kursus', 'pelatihan', 'seminar', 'ujian'], catId: 'pendidikan' },
  
  // Perawatan Rumah
  { ids: ['sabun', 'deterjen', 'pewangi', 'pel', 'sapu', 'vacuum', 'pembersih', 'lap'], catId: 'rumah' },
  
  // Sosial
  { ids: ['kondangan', 'sumbangan', 'donasi', 'hadiah', 'arisan', 'tahlilan', 'syukuran'], catId: 'sosial' },
  
  // Hiburan & Gaya Hidup
  { ids: ['hiburan', 'nongkrong', 'nonton', 'liburan', 'game', 'musik', 'streaming', 'kopi'], catId: 'hiburan' },
  
  // Dana Tidak Terduga
  { ids: ['darurat', 'perbaikan', 'kehilangan', 'denda', 'rusak'], catId: 'darurat' },
];

// Flatten and sort by keyword length descending (to match "airpam" before "air")
export const AUTO_CATEGORY_KEYWORDS = RAW_KEYWORDS.flatMap(group => 
  group.ids.map(keyword => ({ keyword, catId: group.catId }))
).sort((a, b) => b.keyword.length - a.keyword.length);
