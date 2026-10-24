export type Category =
  | "Sayur & Buah"
  | "Bibit & Tanaman"
  | "Makanan Olahan"
  | "Merchandise"
  | "Tiket Acara";

export type Product = {
  id: string;
  name: string;
  category: Category;
  price: number;
  seller: string;
  cohort: string;
  status: "Ready" | "Pre-order";
  image: string;
  description: string;
  stock: number;
  whatsapp?: string;
  origin: string;
};

export const demoNotice = "Data demonstrasi — belum berasal dari pengguna HortiKita.";

const photo = (id: string, width = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=82`;

export const cohorts = [
  {
    slug: "angkatan-24",
    name: "Angkatan 24",
    tagline: "Berakar kuat, tumbuh hebat.",
    members: 32,
    projects: 4,
    products: 3,
    image: photo("photo-1500382017468-9049fed747ef"),
    logo: "24",
    location: "Kebun praktik PTH",
    bio: "Teman-teman PTH Angkatan 24 yang terus belajar, berkarya, dan berbagi hasil baik.",
  },
  {
    slug: "angkatan-25",
    name: "Angkatan 25",
    tagline: "Tumbuh bersama, berbagi rasa.",
    members: 36,
    projects: 5,
    products: 4,
    image: photo("photo-1464226184884-fa280b87c399"),
    logo: "25",
    location: "Kampus 3, Jember",
    bio: "Berkarya di kebun, berbagi cerita, dan mendukung hasil tani lokal.",
  },
  {
    slug: "angkatan-26",
    name: "Angkatan 26",
    tagline: "Si Hijau Muda, siap berdaya.",
    members: 40,
    projects: 6,
    products: 5,
    image: photo("photo-1499529112087-3cb3b73cec95"),
    logo: "26",
    location: "Kebun hortikultura PTH",
    bio: "Mahasiswa PTH yang senang mencoba hal baru dan tumbuh lewat proses bersama.",
  },
  {
    slug: "angkatan-27",
    name: "Angkatan 27",
    tagline: "Mulai tumbuh, banyak cerita.",
    members: 38,
    projects: 2,
    products: 2,
    image: photo("photo-1500937386664-56d1dfef3854"),
    logo: "27",
    location: "Jember, Jawa Timur",
    bio: "Kenalan dengan PTH Angkatan 27: belajar hal baru sambil menanam harapan.",
  },
];

export const products: Product[] = [
  {
    id: "cabai-rawit",
    name: "Cabai Rawit Segar",
    category: "Sayur & Buah",
    price: 18000,
    seller: "Kebun Angkatan 26",
    cohort: "Angkatan 26",
    status: "Ready",
    image: photo("photo-1588252303782-cb80119abd6d", 700),
    description: "Cabai rawit segar dari kebun praktik. Dipetik dan dikemas setelah pesanan masuk.",
    stock: 12,
    origin: "Ditanam di kebun praktik PTH, Jember.",
  },
  {
    id: "selada-hidroponik",
    name: "Selada Hidroponik",
    category: "Sayur & Buah",
    price: 12000,
    seller: "Kebun Angkatan 25",
    cohort: "Angkatan 25",
    status: "Ready",
    image: photo("photo-1622206151226-18ca2c9ab4a1", 700),
    description: "Selada segar hasil budidaya hidroponik mahasiswa, cocok untuk salad dan lalapan.",
    stock: 9,
    origin: "Dibudidayakan secara hidroponik di Jember.",
  },
  {
    id: "pisang-goreng",
    name: "Pisang Goreng Kebun",
    category: "Makanan Olahan",
    price: 10000,
    seller: "Angkatan 24",
    cohort: "Angkatan 24",
    status: "Pre-order",
    image: photo("photo-1601050690597-df0568f70950", 700),
    description: "Camilan pisang rumahan, digoreng hangat setelah jadwal pre-order ditutup.",
    stock: 20,
    origin: "Diolah oleh tim kewirausahaan Angkatan 24.",
  },
  {
    id: "bibit-tomat",
    name: "Bibit Tomat Cherry",
    category: "Bibit & Tanaman",
    price: 8000,
    seller: "Kebun Angkatan 27",
    cohort: "Angkatan 27",
    status: "Ready",
    image: photo("photo-1592841200221-a6898f307baa", 700),
    description: "Bibit tomat cherry siap pindah tanam. Satu paket berisi lima bibit.",
    stock: 18,
    origin: "Disemai di persemaian praktik PTH.",
  },
  {
    id: "keripik-bayam",
    name: "Keripik Bayam Renyah",
    category: "Makanan Olahan",
    price: 15000,
    seller: "Angkatan 25",
    cohort: "Angkatan 25",
    status: "Ready",
    image: photo("photo-1512621776951-a57141f2eefd", 700),
    description: "Keripik bayam produksi kelompok pengolahan hasil pertanian.",
    stock: 14,
    origin: "Diolah dan dikemas oleh kelompok PBL Angkatan 25.",
  },
  {
    id: "kemangi",
    name: "Kemangi Ikat Segar",
    category: "Sayur & Buah",
    price: 5000,
    seller: "Kebun Angkatan 26",
    cohort: "Angkatan 26",
    status: "Ready",
    image: photo("photo-1615485500704-8e990f9900f6", 700),
    description: "Daun kemangi segar, dipanen sesuai pesanan.",
    stock: 25,
    origin: "Dipanen dari kebun praktik mahasiswa.",
  },
  {
    id: "tanaman-hias",
    name: "Monstera Mini",
    category: "Bibit & Tanaman",
    price: 25000,
    seller: "Angkatan 27",
    cohort: "Angkatan 27",
    status: "Pre-order",
    image: photo("photo-1501004318641-b39e6451bec6", 700),
    description: "Tanaman hias mini dalam pot semai. Tanyakan pilihan ukuran pot ke penjual.",
    stock: 7,
    origin: "Diperbanyak dan dirawat oleh tim tanaman hias.",
  },
  {
    id: "tote-bag",
    name: "Tote Bag Horti",
    category: "Merchandise",
    price: 35000,
    seller: "BEM PTH",
    cohort: "Organisasi",
    status: "Pre-order",
    image: photo("photo-1544816155-12df9643f363", 700),
    description: "Tote bag edisi komunitas dengan desain karya mahasiswa.",
    stock: 30,
    origin: "Diproduksi melalui pre-order bersama mitra lokal.",
  },
  {
    id: "tiket-seminar",
    name: "Tiket Seminar Pertanian",
    category: "Tiket Acara",
    price: 20000,
    seller: "Himpunan PTH",
    cohort: "Organisasi",
    status: "Ready",
    image: photo("photo-1540575467063-178a50c2df87", 700),
    description: "Tiket seminar pertanian mahasiswa. Informasi jadwal dibagikan oleh panitia.",
    stock: 45,
    origin: "Tiket acara yang dikelola oleh organisasi mahasiswa.",
  },
  {
    id: "paket-sayur",
    name: "Paket Sayur Panen",
    category: "Sayur & Buah",
    price: 22000,
    seller: "Kebun Angkatan 24",
    cohort: "Angkatan 24",
    status: "Ready",
    image: photo("photo-1540420773420-3366772f4999", 700),
    description: "Sayur musiman dari kebun praktik, isi mengikuti ketersediaan panen.",
    stock: 8,
    origin: "Dipanen di kebun praktik, Jember.",
  },
  {
    id: "bibit-cabai",
    name: "Bibit Cabai Rawit",
    category: "Bibit & Tanaman",
    price: 7000,
    seller: "Kebun Angkatan 26",
    cohort: "Angkatan 26",
    status: "Ready",
    image: photo("photo-1518977676601-b53f82aba655", 700),
    description: "Tiga bibit cabai rawit yang sehat, siap dipindah ke polybag.",
    stock: 16,
    origin: "Disemai di kebun pembelajaran PTH.",
  },
  {
    id: "stiker-horti",
    name: "Paket Stiker Horti",
    category: "Merchandise",
    price: 12000,
    seller: "Himpunan PTH",
    cohort: "Organisasi",
    status: "Ready",
    image: photo("photo-1513364776144-60967b0f800f", 700),
    description: "Satu paket stiker ilustrasi pertanian karya mahasiswa.",
    stock: 40,
    origin: "Desain komunitas, dicetak oleh mitra lokal.",
  },
];

export const events = [
  {
    day: "08",
    month: "NOV",
    title: "Panen Raya Kebun PTH",
    location: "Kebun praktik, Kampus 3",
    description: "Pagi bersama di kebun, belajar panen dan kenalan dengan teman lintas angkatan.",
    image: photo("photo-1499529112087-3cb3b73cec95"),
  },
  {
    day: "15",
    month: "NOV",
    title: "Kelas Olah Hasil Panen",
    location: "Laboratorium pascapanen",
    description: "Sesi berbagi tentang pengolahan sederhana hasil hortikultura.",
    image: photo("photo-1547592180-85f173990554"),
  },
];

export const projects = [
  {
    title: "Kebun mini sirkular",
    cohort: "PBL Angkatan 26",
    description: "Mencoba menghubungkan pengomposan sederhana dan kebun sayur di ruang terbatas.",
    image: photo("photo-1416879595882-3373a0480b5b"),
  },
  {
    title: "Selada dari botol bekas",
    cohort: "PBL Angkatan 25",
    description: "Eksperimen budidaya hidroponik skala kecil menggunakan wadah guna ulang.",
    image: photo("photo-1466692476868-aef1dfb1e735"),
  },
];

export const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
