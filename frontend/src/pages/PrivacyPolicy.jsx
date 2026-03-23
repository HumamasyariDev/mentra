import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import '../styles/pages/Legal.css';

export default function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link to="/register" className="legal-back">
          <ArrowLeft size={16} />
          Kembali ke Register
        </Link>

        <div className="legal-header">
          <div className="legal-logo">M</div>
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-updated">Terakhir diperbarui: 23 Maret 2026</p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Pendahuluan</h2>
            <p>
              Mentra ("kami") menghargai privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami
              mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda saat Anda
              menggunakan layanan kami.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Informasi yang Kami Kumpulkan</h2>
            <h3>2.1 Informasi yang Anda Berikan</h3>
            <ul>
              <li><strong>Data akun</strong> — nama, alamat email, kata sandi (terenkripsi)</li>
              <li><strong>Data profil</strong> — avatar, preferensi pengaturan</li>
              <li><strong>Konten pengguna</strong> — tugas, jadwal, catatan, pesan forum, data mood</li>
            </ul>

            <h3>2.2 Informasi yang Dikumpulkan Otomatis</h3>
            <ul>
              <li><strong>Data penggunaan</strong> — sesi Pomodoro, statistik produktivitas, level dan EXP</li>
              <li><strong>Data teknis</strong> — jenis browser, alamat IP, waktu akses</li>
            </ul>

            <h3>2.3 Informasi dari Pihak Ketiga</h3>
            <p>
              Jika Anda login menggunakan Google atau Facebook, kami menerima nama, email, dan foto profil
              dari penyedia layanan tersebut sesuai izin yang Anda berikan.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Penggunaan Informasi</h2>
            <p>Kami menggunakan informasi Anda untuk:</p>
            <ul>
              <li>Menyediakan dan memelihara Layanan</li>
              <li>Mengelola akun dan autentikasi Anda</li>
              <li>Menyimpan tugas, jadwal, dan data produktivitas Anda</li>
              <li>Menyediakan fitur AI chat dan rekomendasi</li>
              <li>Mengirim email verifikasi OTP dan reset kata sandi</li>
              <li>Menghitung statistik gamifikasi (level, EXP, streak)</li>
              <li>Meningkatkan dan mengembangkan Layanan</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Penyimpanan Data</h2>
            <p>
              Data Anda disimpan di server yang aman. Kata sandi dienkripsi menggunakan bcrypt hashing.
              Token autentikasi menggunakan Laravel Sanctum. Kami tidak menyimpan kata sandi dalam
              bentuk teks biasa.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Berbagi Data</h2>
            <p>Kami <strong>tidak menjual</strong> data pribadi Anda. Data Anda hanya dibagikan dalam kondisi berikut:</p>
            <ul>
              <li><strong>Forum publik</strong> — pesan yang Anda kirim di forum dapat dilihat pengguna lain</li>
              <li><strong>Penyedia layanan</strong> — kami menggunakan layanan pihak ketiga untuk email (Gmail SMTP)
                dan AI (OpenAI) yang memproses data sesuai kebutuhan</li>
              <li><strong>Kewajiban hukum</strong> — jika diwajibkan oleh hukum yang berlaku</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. Layanan Pihak Ketiga</h2>
            <p>Kami menggunakan layanan pihak ketiga berikut:</p>
            <ul>
              <li><strong>Google OAuth</strong> — untuk autentikasi login sosial</li>
              <li><strong>Facebook OAuth</strong> — untuk autentikasi login sosial</li>
              <li><strong>OpenAI API</strong> — untuk fitur AI chat dan agen</li>
              <li><strong>Gmail SMTP</strong> — untuk pengiriman email verifikasi dan notifikasi</li>
            </ul>
            <p>
              Masing-masing layanan ini memiliki kebijakan privasi sendiri yang mengatur pemrosesan data mereka.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Keamanan</h2>
            <p>
              Kami menerapkan langkah-langkah keamanan untuk melindungi data Anda, termasuk:
            </p>
            <ul>
              <li>Enkripsi kata sandi dengan bcrypt</li>
              <li>Token-based authentication (Sanctum)</li>
              <li>Rate limiting pada endpoint sensitif (OTP, reset password)</li>
              <li>Validasi dan sanitasi input pada semua form</li>
            </ul>
            <p>
              Namun, tidak ada metode transmisi atau penyimpanan elektronik yang 100% aman. Kami tidak
              dapat menjamin keamanan absolut.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Hak Anda</h2>
            <p>Anda memiliki hak untuk:</p>
            <ul>
              <li><strong>Mengakses</strong> — melihat data pribadi yang kami simpan tentang Anda</li>
              <li><strong>Memperbaiki</strong> — memperbarui informasi yang tidak akurat</li>
              <li><strong>Menghapus</strong> — meminta penghapusan akun dan data Anda</li>
              <li><strong>Mengekspor</strong> — meminta salinan data Anda</li>
            </ul>
            <p>
              Untuk menggunakan hak ini, hubungi kami di{' '}
              <a href="mailto:humamozik@gmail.com" className="legal-link">humamozik@gmail.com</a>.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Cookie</h2>
            <p>
              Kami menggunakan localStorage browser untuk menyimpan token autentikasi dan preferensi
              pengguna. Kami tidak menggunakan cookie pelacakan pihak ketiga untuk tujuan iklan.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Anak di Bawah Umur</h2>
            <p>
              Layanan kami tidak ditujukan untuk anak di bawah usia 13 tahun. Kami tidak secara sadar
              mengumpulkan data dari anak di bawah 13 tahun. Jika Anda mengetahui bahwa anak di bawah
              umur telah memberikan data kepada kami, silakan hubungi kami.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Perubahan Kebijakan</h2>
            <p>
              Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan akan
              dipublikasikan di halaman ini dengan tanggal pembaruan yang baru.
            </p>
          </section>

          <section className="legal-section">
            <h2>12. Kontak</h2>
            <p>
              Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami di{' '}
              <a href="mailto:humamozik@gmail.com" className="legal-link">humamozik@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
