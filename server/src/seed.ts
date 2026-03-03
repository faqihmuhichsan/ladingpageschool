import "dotenv/config";
import { db } from "./db/index.js";
import { programs } from "./db/schema/programs";
import { advantages } from "./db/schema/advantages";
import { gallery } from "./db/schema/gallery";
import { siteSettings } from "./db/schema/site-settings";

async function seed() {
    console.log("🌱 Seeding database...\n");

    // ===== PROGRAMS =====
    console.log("📚 Seeding programs...");
    await db.delete(programs); // Clear existing
    await db.insert(programs).values([
        {
            title: "Pendidikan Anak Usia Dini",
            level: "tk",
            levelLabel: "TK / PAUD",
            description: "Program PAUD untuk anak usia 4-6 tahun dengan pendekatan bermain sambil belajar.",
            imageUrl: "/images/tk.png",
            features: ["Usia 4 - 6 Tahun", "Belajar Sambil Bermain", "Pengembangan Karakter", "Kreativitas & Motorik"],
            sortOrder: 1,
        },
        {
            title: "Pendidikan Kesetaraan SD",
            level: "sd",
            levelLabel: "SD / Paket A",
            description: "Program Paket A setara SD untuk anak usia 7-12 tahun dengan kurikulum lengkap.",
            imageUrl: "/images/sd.png",
            features: ["Setara SD / MI", "Kurikulum Merdeka", "Baca Tulis Hitung", "Ijazah Setara SD"],
            sortOrder: 2,
        },
        {
            title: "Pendidikan Kesetaraan SMP",
            level: "smp",
            levelLabel: "SMP / Paket B",
            description: "Program Paket B setara SMP dengan pembelajaran interaktif dan kolaboratif.",
            imageUrl: "/images/smp.png",
            features: ["Setara SMP / MTs", "Pembelajaran Interaktif", "Ekskul & Keterampilan", "Ijazah Setara SMP"],
            sortOrder: 3,
        },
        {
            title: "Pendidikan Kesetaraan SMA",
            level: "sma",
            levelLabel: "SMA / Paket C",
            description: "Program Paket C setara SMA untuk persiapan kuliah dan karir profesional.",
            imageUrl: "/images/sma.png",
            features: ["Setara SMA / MA", "Persiapan Kuliah", "Keterampilan Kerja", "Ijazah Setara SMA"],
            sortOrder: 4,
        },
    ]);
    console.log("  ✅ 4 programs inserted");

    // ===== ADVANTAGES =====
    console.log("⭐ Seeding advantages...");
    await db.delete(advantages);
    await db.insert(advantages).values([
        {
            title: "Jadwal Fleksibel",
            description: "Waktu belajar yang dapat disesuaikan dengan kebutuhan peserta didik. Cocok untuk yang bekerja atau memiliki kesibukan lain.",
            icon: "🕐",
            sortOrder: 1,
        },
        {
            title: "Biaya Terjangkau",
            description: "Kami menawarkan biaya pendidikan yang sangat terjangkau tanpa mengurangi kualitas pembelajaran.",
            icon: "💰",
            sortOrder: 2,
        },
        {
            title: "Tenaga Pendidik Kompeten",
            description: "Diajar oleh guru-guru berpengalaman dan tersertifikasi yang berdedikasi untuk kemajuan siswa.",
            icon: "👨‍🏫",
            sortOrder: 3,
        },
        {
            title: "Ijazah Resmi",
            description: "Lulusan mendapatkan ijazah yang diakui oleh pemerintah dan setara dengan pendidikan formal.",
            icon: "📜",
            sortOrder: 4,
        },
        {
            title: "Pembelajaran Modern",
            description: "Menggunakan metode dan teknologi pembelajaran terkini untuk pengalaman belajar yang interaktif.",
            icon: "💻",
            sortOrder: 5,
        },
        {
            title: "Lingkungan Suportif",
            description: "Komunitas belajar yang mendukung dan inklusif, di mana setiap peserta didik dihargai dan didorong untuk berkembang.",
            icon: "🤝",
            sortOrder: 6,
        },
    ]);
    console.log("  ✅ 6 advantages inserted");

    // ===== GALLERY =====
    console.log("📸 Seeding gallery...");
    await db.delete(gallery);
    await db.insert(gallery).values([
        { title: "Kegiatan PAUD", imageUrl: "/images/tk.png", category: "kegiatan", sortOrder: 1 },
        { title: "Pembelajaran Paket A", imageUrl: "/images/sd.png", category: "pembelajaran", sortOrder: 2 },
        { title: "Diskusi Paket B", imageUrl: "/images/smp.png", category: "pembelajaran", sortOrder: 3 },
        { title: "Kelas Paket C", imageUrl: "/images/sma.png", category: "pembelajaran", sortOrder: 4 },
        { title: "Kegiatan Bersama", imageUrl: "/images/hero.png", category: "acara", sortOrder: 5 },
    ]);
    console.log("  ✅ 5 gallery items inserted");

    // ===== SITE SETTINGS =====
    console.log("⚙️  Seeding site settings...");
    await db.delete(siteSettings);
    await db.insert(siteSettings).values([
        { key: "total_students", value: "500", label: "Siswa Aktif" },
        { key: "total_teachers", value: "50", label: "Tenaga Pendidik" },
        { key: "years_established", value: "15", label: "Tahun Berdiri" },
        { key: "graduation_rate", value: "98", label: "% Kelulusan" },
    ]);
    console.log("  ✅ 4 site settings inserted");

    console.log("\n🎉 Seeding complete!");
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
