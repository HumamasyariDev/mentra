import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import '../styles/pages/Legal.css';

export default function TermsOfService() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link to="/register" className="legal-back">
          <ArrowLeft size={16} />
          Kembali ke Register
        </Link>

        <div className="legal-header">
          <div className="legal-logo">M</div>
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-updated">Terakhir diperbarui: 23 Maret 2026</p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Penerimaan Ketentuan</h2>
            <p>
              Dengan mengakses dan menggunakan Mentra ("Layanan"), Anda menyetujui untuk terikat oleh
              Ketentuan Layanan ini. Jika Anda tidak menyetujui ketentuan ini, mohon untuk tidak
              menggunakan Layanan kami.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Deskripsi Layanan</h2>
            <p>
              Mentra adalah platform produktivitas yang menyediakan fitur manajemen tugas, sesi Pomodoro,
              penjadwalan, pelacakan mood, chat AI, forum komunitas, dan gamifikasi berupa forest tree care.
              Layanan ini dirancang untuk membantu pengguna mengorganisir aktivitas dan meningkatkan
              produktivitas mereka.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Akun Pengguna</h2>
            <p>
              Untuk menggunakan Layanan, Anda harus membuat akun dengan memberikan informasi yang akurat
              dan lengkap. Anda bertanggung jawab untuk:
            </p>
            <ul>
              <li>Menjaga kerahasiaan kata sandi akun Anda</li>
              <li>Semua aktivitas yang terjadi di bawah akun Anda</li>
              <li>Memberitahu kami segera jika ada penggunaan akun yang tidak sah</li>
              <li>Memastikan informasi akun Anda selalu akurat dan terkini</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Penggunaan yang Diperbolehkan</h2>
            <p>Anda setuju untuk menggunakan Layanan hanya untuk tujuan yang sah. Anda tidak diperbolehkan:</p>
            <ul>
              <li>Menggunakan Layanan untuk tujuan ilegal atau tidak sah</li>
              <li>Mengganggu atau merusak Layanan atau server yang terhubung</li>
              <li>Mengunggah konten yang bersifat berbahaya, menyinggung, atau melanggar hak orang lain</li>
              <li>Mencoba mengakses akun pengguna lain tanpa izin</li>
              <li>Menggunakan bot, scraper, atau alat otomatis lainnya tanpa izin tertulis</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Konten Pengguna</h2>
            <p>
              Anda mempertahankan kepemilikan atas konten yang Anda buat melalui Layanan (tugas, catatan,
              pesan forum, dll). Dengan mengunggah konten, Anda memberikan Mentra lisensi non-eksklusif
              untuk menyimpan dan menampilkan konten tersebut dalam rangka menyediakan Layanan kepada Anda.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Fitur AI</h2>
            <p>
              Mentra menyediakan fitur chat AI dan agen AI untuk membantu produktivitas. Respons AI
              bersifat informatif dan tidak boleh dianggap sebagai nasihat profesional. Kami tidak
              menjamin keakuratan atau kelengkapan respons yang dihasilkan AI.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Ketersediaan Layanan</h2>
            <p>
              Kami berusaha menyediakan Layanan secara terus-menerus, namun tidak menjamin bahwa
              Layanan akan selalu tersedia tanpa gangguan. Kami berhak melakukan pemeliharaan,
              pembaruan, atau perubahan pada Layanan kapan saja.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Penghentian</h2>
            <p>
              Kami berhak menangguhkan atau menghentikan akun Anda jika Anda melanggar Ketentuan Layanan
              ini. Anda juga dapat menghapus akun Anda kapan saja melalui pengaturan akun.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Batasan Tanggung Jawab</h2>
            <p>
              Layanan disediakan "sebagaimana adanya" tanpa jaminan apapun. Mentra tidak bertanggung jawab
              atas kerugian langsung, tidak langsung, insidental, atau konsekuensial yang timbul dari
              penggunaan Layanan.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Perubahan Ketentuan</h2>
            <p>
              Kami dapat memperbarui Ketentuan Layanan ini dari waktu ke waktu. Perubahan akan berlaku
              segera setelah dipublikasikan di halaman ini. Penggunaan Layanan yang berkelanjutan setelah
              perubahan merupakan penerimaan Anda terhadap ketentuan yang diperbarui.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Kontak</h2>
            <p>
              Jika Anda memiliki pertanyaan tentang Ketentuan Layanan ini, silakan hubungi kami di{' '}
              <a href="mailto:humamozik@gmail.com" className="legal-link">humamozik@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
