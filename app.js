

console.log('JavaScript Rental Mobil aktif');


const NAMA_MIN = 3;
const LAMA_MIN = 1;    
const LAMA_MAX = 30;   
const HARGA_MOBIL = {
  'Avanza 035': 1000000000,
  'Innova 035': 1500000000,
  'Xenia 035': 250000000,
  'Brio 035': 1000000000,
  'Ertiga 035': 2000000000,
  'Agya 035': 250000000
};

function buatElemen(tag, atribut, teks) {
  const el = document.createElement(tag);
  if (atribut) {
    Object.keys(atribut).forEach(function (key) {
      el.setAttribute(key, atribut[key]);
    });
  }
  if (teks !== undefined) el.textContent = teks;  
  return el;
}

function formatRupiah(angka) {
  return 'Rp ' + Number(angka).toLocaleString('id-ID');
}

function tampilNotifikasi(pesan) {
  const lama = document.getElementById('notifikasi');
  if (lama) lama.remove();

  const overlay = buatElemen('div', {
    id: 'notifikasi', class: 'notif-overlay', role: 'dialog',
    'aria-modal': 'true', 'aria-labelledby': 'notifJudul'
  });
  const kotak = buatElemen('div', { class: 'notif-kotak' });
  kotak.appendChild(buatElemen('p', { id: 'notifJudul', class: 'notif-judul' }, 'Pemberitahuan'));
  kotak.appendChild(buatElemen('p', { class: 'notif-isi' }, pesan));   // textContent, aman dari injeksi HTML
  const tombolOk = buatElemen('button', { type: 'button', class: 'notif-ok' }, 'OK');
  kotak.appendChild(tombolOk);
  overlay.appendChild(kotak);
  document.body.appendChild(overlay);

  function tutup() {
    overlay.remove();
    document.removeEventListener('keydown', saatTekan);
  }
  function saatTekan(e) { if (e.key === 'Escape') tutup(); }
  tombolOk.addEventListener('click', tutup);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) tutup(); });
  document.addEventListener('keydown', saatTekan);
  tombolOk.focus();
}

function pasangCss() {
  if (document.getElementById('rental-style')) return;
  const style = buatElemen('style', { id: 'rental-style' });
  style.textContent =
    '.preview{color:#5b6676;font-size:.9rem;margin:.25rem 0 1rem;}' +
    '.kartu[hidden]{display:none;}' +
    '#pesanKosong{font-style:italic;color:#5b6676;}' +
    '#cariMobil{margin-bottom:1rem;}';
  document.head.appendChild(style);
}

function setError(input, errorEl, pesan) {
  errorEl.textContent = pesan;
  input.classList.add('input-error');
}

function clearError(input, errorEl) {
  errorEl.textContent = '';
  input.classList.remove('input-error');
}


function initFormSewa() {
  const form = document.getElementById('formSewa');
  const nama = document.getElementById('nama');
  const mobil = document.getElementById('mobil');
  const lama = document.getElementById('lama');
  const errorNama = document.getElementById('errorNama');
  const errorMobil = document.getElementById('errorMobil');
  const errorLama = document.getElementById('errorLama');
  const hasil = document.getElementById('hasil');


  if (!form || !nama || !mobil || !lama || !errorNama || !errorMobil || !errorLama || !hasil) return;

  form.noValidate = true;  

  
  const pNama = buatElemen('p', { class: 'preview' }, 'Pratinjau nama: ');
  const previewNama = buatElemen('strong');
  pNama.appendChild(previewNama);
  errorNama.insertAdjacentElement('afterend', pNama);


  const pBiaya = buatElemen('p', { class: 'preview' }, 'Estimasi biaya: ');
  const previewBiaya = buatElemen('strong', null, '-');
  pBiaya.appendChild(previewBiaya);
  errorLama.insertAdjacentElement('afterend', pBiaya);

  
  const mobilDariUrl = new URLSearchParams(location.search).get('mobil');
  if (mobilDariUrl && Array.from(mobil.options).some(function (o) { return o.value === mobilDariUrl; })) {
    mobil.value = mobilDariUrl;
  }

  function hitungEstimasi() {
    const harga = HARGA_MOBIL[mobil.value];
    const hari = Number(lama.value);
    if (!harga || lama.value.trim() === '' || !Number.isInteger(hari) || hari < LAMA_MIN || hari > LAMA_MAX) {
      previewBiaya.textContent = '-';
      return;
    }
    previewBiaya.textContent = formatRupiah(harga * hari) + ' (' + hari + ' hari)';
  }

  function validateNama() {
    if (nama.value.trim().length < NAMA_MIN) {
      setError(nama, errorNama, 'Nama lengkap minimal ' + NAMA_MIN + ' karakter.');
      return false;
    }
    clearError(nama, errorNama);
    return true;
  }

  function validateMobil() {
    if (mobil.value === '') {
      setError(mobil, errorMobil, 'Silakan pilih mobil.');
      return false;
    }
    clearError(mobil, errorMobil);
    return true;
  }

  function validateLama() {
    const nilai = lama.value.trim();
    const hari = Number(nilai);
    if (nilai === '' || !Number.isInteger(hari)) {
      setError(lama, errorLama, 'Lama sewa wajib diisi dengan angka (hari).');
      return false;
    }
    if (hari < LAMA_MIN) {
      setError(lama, errorLama, 'Lama sewa minimal ' + LAMA_MIN + ' hari.');
      return false;
    }
    if (hari > LAMA_MAX) {
      setError(lama, errorLama, 'Lama sewa maksimal ' + LAMA_MAX + ' hari.');
      return false;
    }
    clearError(lama, errorLama);
    return true;
  }

  function resetFeedback() {
    clearError(nama, errorNama);
    clearError(mobil, errorMobil);
    clearError(lama, errorLama);
    previewNama.textContent = '';
    previewBiaya.textContent = '-';
    hasil.textContent = '';
  }

  
  nama.addEventListener('blur', validateNama);
  mobil.addEventListener('change', function () { validateMobil(); hitungEstimasi(); });
  lama.addEventListener('blur', validateLama);

  
  nama.addEventListener('input', function () {
    if (errorNama.textContent) validateNama();
    previewNama.textContent = nama.value;
  });
  lama.addEventListener('input', function () {
    if (errorLama.textContent) validateLama();
    hitungEstimasi();
  });

  form.addEventListener('reset', resetFeedback);

  form.addEventListener('submit', function (event) {
  
    event.preventDefault();
    hasil.textContent = '';

    
    const namaValid = validateNama();
    const mobilValid = validateMobil();
    const lamaValid = validateLama();
    if (!namaValid || !mobilValid || !lamaValid) return;

    const hari = Number(lama.value);
    const total = HARGA_MOBIL[mobil.value] * hari;
    hasil.textContent =
      'Validasi sukses. ' + nama.value.trim() + ' menyewa ' + mobil.value +
      ' selama ' + hari + ' hari. Estimasi total: ' + formatRupiah(total) + '.';
    tampilNotifikasi('Validasi berhasil. Data penyewaan siap diproses ke server.');
  });

  hitungEstimasi();   
}

function initKatalog() {
  const daftar = document.querySelector('.daftar-mobil');
  if (!daftar) return;

  const cards = daftar.querySelectorAll('.kartu');

  const label = buatElemen('label', { for: 'cariMobil' }, 'Cari Mobil');
  const cari = buatElemen('input', {
    type: 'search', id: 'cariMobil', placeholder: 'Cari nama mobil...', autocomplete: 'off'
  });
  const pesanKosong = buatElemen('p', { id: 'pesanKosong', hidden: '' }, 'Mobil tidak ditemukan.');

  daftar.insertAdjacentElement('beforebegin', label);
  daftar.insertAdjacentElement('beforebegin', cari);
  daftar.insertAdjacentElement('afterend', pesanKosong);

  cari.addEventListener('input', function () {
    const keyword = cari.value.trim().toLowerCase();
    let tampil = 0;
    cards.forEach(function (kartu) {
      const cocok = kartu.textContent.toLowerCase().includes(keyword);
      kartu.hidden = !cocok;
      if (cocok) tampil++;
    });
    pesanKosong.hidden = tampil > 0;
  });
}


function mulai() {
  pasangCss();
  initFormSewa();
  initKatalog();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mulai);
} else {
  mulai();
}