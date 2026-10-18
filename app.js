// Registrasi Service Worker PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js', { scope: './' })
      .then((reg) => console.log('SW Registered Scope:', reg.scope))
      .catch((err) => console.error('SW Error:', err));
  });
}

// Navigasi Layar Sesuai JSON Schema
function navigateTo(screenId) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach((s) => s.classList.remove('active'));

  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
  }

  // Update Bottom Nav state
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach((btn) => btn.classList.remove('active'));

  if (screenId === 'home_screen') navItems[0]?.classList.add('active');
  else if (screenId === 'laporan_screen') navItems[1]?.classList.add('active');
  else if (screenId === 'buat_qr_screen') navItems[2]?.classList.add('active');
}

// Screen Flash / Splash Screen Transition
window.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splash_screen');
  
  // Tampilkan splash screen selama 1.8 detik sebelum masuk Beranda
  setTimeout(() => {
    splash.classList.add('fade-out');
    setTimeout(() => {
      splash.style.display = 'none';
      navigateTo('home_screen');
    }, 600);
  }, 1800);
});

// Fitur Mode Gelap & Mode Terang
const themeToggleBtn = document.getElementById('theme-toggle');
let isDark = true;

themeToggleBtn?.addEventListener('click', () => {
  isDark = !isDark;
  if (!isDark) {
    document.documentElement.setAttribute('data-theme', 'light');
    themeToggleBtn.textContent = '🌙';
  } else {
    document.documentElement.removeAttribute('data-theme');
    themeToggleBtn.textContent = '☀️';
  }
});

// Aksi Simulasi
function simulateScan() {
  alert('📸 AI sedang memproses struk...\nTotal: Rp 35.000 berhasil dicatat ke Laba Rugi!');
  navigateTo('home_screen');
}

function generateQRPreview() {
  const store = document.getElementById('qrStoreInput').value;
  const total = document.getElementById('qrAmountInput').value;
  alert(`✨ QR Nota Berhasil Dibuat!\nToko: ${store}\nTotal: ${total}`);
                  }
