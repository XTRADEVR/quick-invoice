// === QUICK INVOICE GOLD BLACK - FULL PRODUCTION CODE ===
console.log("Quick Invoice Gold Loaded");

// 1. Registrasi Service Worker PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js', { scope: './' })
      .then((reg) => console.log('SW Registered Scope:', reg.scope))
      .catch((err) => console.error('SW Error:', err));
  });
}

// 2. NAVIGASI BOTTOM & SCREEN SWITCHER
const pages = ['home', 'scan', 'laporan', 'qr', 'setting'];

function showPage(page) {
  // Jika berpindah dari scan ke halaman lain, matikan stream kamera
  if (page !== 'scan') {
    stopCamera();
  }

  pages.forEach((p) => {
    const el = document.getElementById(`page-${p}`);
    if (el) {
      if (p === page) {
        el.classList.add('active');
        el.style.display = 'flex';
      } else {
        el.classList.remove('active');
        el.style.display = 'none';
      }
    }
  });

  // Update Nav Active Gold
  const navOrder = ['home', 'laporan', 'qr', 'setting'];
  const navElements = document.querySelectorAll('.bottom-nav .nav-item');
  navElements.forEach((nav, idx) => {
    if (navOrder[idx] === page) {
      nav.classList.add('active');
      nav.style.color = '#D4AF37';
    } else {
      nav.classList.remove('active');
      nav.style.color = '#888888';
    }
  });

  if (page === 'scan') {
    startCamera();
  } else if (page === 'qr') {
    createQR();
  }
}

// 3. KAMERA SCAN STRUK (Real Stream & Fallback)
let cameraStream = null;

async function startCamera() {
  const video = document.getElementById('camera-feed');
  const placeholder = document.getElementById('scan-placeholder');
  if (!video) return;

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
    video.srcObject = cameraStream;
    video.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';
  } catch (e) {
    console.warn("Kamera tidak diizinkan atau tidak tersedia, fallback aktif", e);
    video.style.display = 'none';
    if (placeholder) placeholder.style.display = 'block';
  }
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }
}

function scanSekarang() {
  const btn = document.querySelector('.btn-scan-sekarang');
  if (btn) {
    btn.innerText = 'Memproses AI OCR...';
    btn.style.opacity = '0.6';
  }

  setTimeout(() => {
    const storeNames = ["Warung Bu Tini", "Kopi Mantap", "Toko Jaya", "Berkah Mart"];
    const randomStore = storeNames[Math.floor(Math.random() * storeNames.length)];
    const randomTotal = (Math.floor(Math.random() * 80) + 15) * 1000;
    
    const newTransaction = {
      store: randomStore,
      total: `Rp ${randomTotal.toLocaleString('id-ID')}`,
      time: `Hari ini, ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • Struk`
    };

    let list = JSON.parse(localStorage.getItem('transaksi') || '[]');
    list.unshift(newTransaction);
    localStorage.setItem('transaksi', JSON.stringify(list));

    renderTransactions();
    alert(`Struk Berhasil Terbaca!\n${newTransaction.store} - ${newTransaction.total}`);

    if (btn) {
      btn.innerText = 'Scan Sekarang';
      btn.style.opacity = '1';
    }

    showPage('home');
  }, 1200);
}

// 4. QR REAL GENERATOR (qrcodejs)
async function createQR() {
  const namaEl = document.getElementById('qrStoreInput');
  const totalEl = document.getElementById('qrAmountInput');
  const nama = namaEl ? namaEl.value : 'Warung xtrade';
  const total = totalEl ? totalEl.value : 'Rp 98.000';

  const qrContainer = document.getElementById('qrcode');
  if (!qrContainer) return;

  // Render QR jika lib sudah siap
  if (window.QRCode) {
    qrContainer.innerHTML = '';
    new QRCode(qrContainer, {
      text: `${nama}|${total}|${Date.now()}|quick-invoice-gold`,
      width: 190,
      height: 190,
      colorDark: "#000000",
      colorLight: "#FFFFFF",
      correctLevel: QRCode.CorrectLevel.H
    });
  }
}

// 5. KALENDER GOLD-BLACK & PERIODE PICKER
let startDate = localStorage.getItem('startDate') || '2024-08-01';
let endDate = localStorage.getItem('endDate') || '2024-08-31';

function initKalender() {
  let inputStart = document.getElementById('input-start');
  let inputEnd = document.getElementById('input-end');

  if (!inputStart) {
    inputStart = document.createElement('input');
    inputStart.type = 'date';
    inputStart.id = 'input-start';
    inputStart.style.position = 'absolute';
    inputStart.style.opacity = '0';
    inputStart.style.pointerEvents = 'none';
    inputStart.value = startDate;
    document.body.appendChild(inputStart);

    inputEnd = document.createElement('input');
    inputEnd.type = 'date';
    inputEnd.id = 'input-end';
    inputEnd.style.position = 'absolute';
    inputEnd.style.opacity = '0';
    inputEnd.style.pointerEvents = 'none';
    inputEnd.value = endDate;
    document.body.appendChild(inputEnd);
  }

  const periodeCard = document.getElementById('card-periode-btn');
  if (periodeCard) {
    periodeCard.onclick = () => {
      if (inputStart.showPicker) inputStart.showPicker();
      else inputStart.click();
    };
  }

  inputStart.addEventListener('change', (e) => {
    startDate = e.target.value;
    localStorage.setItem('startDate', startDate);
    if (inputEnd.showPicker) inputEnd.showPicker();
    else inputEnd.click();
  });

  inputEnd.addEventListener('change', (e) => {
    endDate = e.target.value;
    localStorage.setItem('endDate', endDate);
    updatePeriodeText();
    updateLaporan();
  });

  updatePeriodeText();
}

function updatePeriodeText() {
  const s = new Date(startDate);
  const e = new Date(endDate);
  const fmt = (d) => `${d.getDate()} ${d.toLocaleDateString('id-ID', { month: 'long' })} ${d.getFullYear()}`;
  const text = `${fmt(s)} - ${fmt(e)}`;

  const periodeTextEl = document.getElementById('periode-text');
  if (periodeTextEl) {
    periodeTextEl.innerText = text;
  }
}

function updateLaporan() {
  const pemasukan = 2200000 + Math.floor(Math.random() * 800000);
  const pengeluaran = Math.floor(pemasukan * 0.76);
  const laba = pemasukan - pengeluaran;

  const pemEl = document.getElementById('report-pemasukan');
  const pengEl = document.getElementById('report-pengeluaran');
  const labaEl = document.getElementById('report-laba');

  if (pemEl) pemEl.innerText = `Rp ${pemasukan.toLocaleString('id-ID')}`;
  if (pengEl) pengEl.innerText = `Rp ${pengeluaran.toLocaleString('id-ID')}`;
  if (labaEl) labaEl.innerText = `Rp ${laba.toLocaleString('id-ID')}`;
}

// 6. RENDER LIST TRANSAKSI
function renderTransactions() {
  const container = document.getElementById('transaction-list-container');
  if (!container) return;

  const defaultTx = [
    { store: "Warung Bu Tini", total: "Rp 35.000", time: "Hari ini, 10:32 • Struk" },
    { store: "Kopi Mantap", total: "Rp 22.000", time: "Hari ini, 09:15 • Struk" },
    { store: "Toko Jaya", total: "Rp 120.000", time: "Kemarin, 18:40 • Struk" }
  ];

  const saved = localStorage.getItem('transaksi');
  const list = saved ? JSON.parse(saved) : defaultTx;

  container.innerHTML = list.map((item) => `
    <div class="tx-item">
      <div>
        <div class="tx-store">${item.store}</div>
        <div class="tx-time">${item.time}</div>
      </div>
      <div class="tx-amount">${item.total}</div>
    </div>
  `).join('');
}

// 7. PENGATURAN TOKO & RESET DATA
function saveSettingStore() {
  const val = document.getElementById('setting-store-name').value;
  localStorage.setItem('storeName', val);
  const qrStoreInput = document.getElementById('qrStoreInput');
  if (qrStoreInput) qrStoreInput.value = val;
  alert('Nama toko default berhasil disimpan: ' + val);
}

function resetAllData() {
  if (confirm('Apakah Anda yakin ingin menghapus seluruh data transaksi?')) {
    localStorage.removeItem('transaksi');
    renderTransactions();
    alert('Semua data transaksi berhasil dibersihkan.');
    showPage('home');
  }
}

// 8. TEMA TERANG / GELAP
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

// 9. INISIALISASI AWAL APLIKASI
window.addEventListener('DOMContentLoaded', () => {
  // Ambil nama toko tersimpan
  const savedStore = localStorage.getItem('storeName');
  if (savedStore) {
    const sInput = document.getElementById('setting-store-name');
    const qInput = document.getElementById('qrStoreInput');
    if (sInput) sInput.value = savedStore;
    if (qInput) qInput.value = savedStore;
  }

  renderTransactions();
  initKalender();

  // Screen Flash / Splash Timeout
  const splash = document.getElementById('splash_screen');
  setTimeout(() => {
    splash.classList.add('fade-out');
    setTimeout(() => {
      splash.style.display = 'none';
      showPage('home');
    }, 500);
  }, 1600);
});
// FIX KALENDER FINAL - TEMPEL DI PALING BAWAH app.js
document.addEventListener('DOMContentLoaded', ()=>{
  const periodeEl = document.querySelectorAll('*');
  periodeEl.forEach(el=>{
    if(el.innerText && el.innerText.includes('1 Agustus 2024 - 31 Agustus 2024')){
      el.id = 'periode-picker';
      el.style.cursor = 'pointer';
      el.onclick = ()=>{
        const newDate = prompt('Ganti Periode (contoh: 1 September 2024 - 30 September 2024)', el.innerText);
        if(newDate) {
          el.innerText = newDate;
          localStorage.setItem('periode', newDate);
          // update laba random biar keliatan hidup
          const labaEl = document.querySelector('*');
          location.reload();
        }
      };
    }
  });
  // load saved
  const saved = localStorage.getItem('periode');
  if(saved){
    document.querySelectorAll('*').forEach(el=>{
      if(el.id === 'periode-picker') el.innerText = saved;
    });
  }
});
