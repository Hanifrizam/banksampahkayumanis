document.addEventListener('DOMContentLoaded', () => {

    // ===== BAGIAN UTAMA STATISTIK DINAMIS =====

    // Variabel untuk elemen-elemen statistik (elemen Rupiah sudah dihapus)
    const elStatSampah = document.querySelector('.stat-item:nth-child(1) .stat-number');
    const elStatNasabah = document.querySelector('.stat-item:nth-child(2) .stat-number');
    const elStatJenis = document.querySelector('.stat-item:nth-child(3) .stat-number');

    /* DIMODIFIKASI: Fungsi inisialisasi tanpa Rupiah */
    function initializeStats() {
        let totalSampah = localStorage.getItem('totalSampah') || 0;
        let totalNasabah = localStorage.getItem('totalNasabah') || 0;
        let jenisTersimpan = JSON.parse(localStorage.getItem('jenisSampah')) || [];
        let totalJenis = jenisTersimpan.length;

        localStorage.setItem('totalSampah', totalSampah);
        localStorage.setItem('totalNasabah', totalNasabah);
        localStorage.setItem('jenisSampah', JSON.stringify(jenisTersimpan));

        updateStatDisplay(parseFloat(totalSampah), parseInt(totalNasabah), parseInt(totalJenis));
    }

    /* DIMODIFIKASI: Fungsi update display tanpa Rupiah */
    function updateStatDisplay(sampah, nasabah, jenis) {
        elStatSampah.setAttribute('data-target', sampah.toFixed(1));
        elStatNasabah.setAttribute('data-target', nasabah);
        elStatJenis.setAttribute('data-target', jenis);

        elStatSampah.innerText = sampah.toFixed(1);
        elStatNasabah.innerText = nasabah;
        elStatJenis.innerText = jenis;
    }

    // Panggil fungsi inisialisasi saat halaman pertama kali dimuat
    initializeStats();


    // ===== FUNGSI UNTUK NAVIGATION BAR SAAT SCROLL =====
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    // ===== FUNGSI UNTUK MOBILE MENU (HAMBURGER) =====
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });

    // ===== FUNGSI ANIMASI HITUNG NAIK (COUNTER) =====
    function animateCounters(elements) {
        elements.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const startValue = +counter.innerText;
            const duration = 1500;
            let startTime = null;

            function animation(currentTime) {
                if (startTime === null) startTime = currentTime;
                const progress = Math.min((currentTime - startTime) / duration, 1);
                let currentValue = startValue + (progress * (target - startValue));
                
                if (counter === elStatSampah) {
                    counter.innerText = currentValue.toFixed(1);
                } else {
                    counter.innerText = Math.floor(currentValue);
                }

                if (progress < 1) {
                    requestAnimationFrame(animation);
                }
            }
            requestAnimationFrame(animation);
        });
    }

    // ===== FUNGSI UNTUK ANIMASI SAAT ELEMENT MUNCUL DI LAYAR =====
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));


    // ===== FORM SUBMISSION DAN UPDATE STATISTIK =====
    const dataForm = document.getElementById('data-form');
    dataForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // 1. Ambil data dari form
        const tambahanNasabah = parseInt(document.getElementById('jumlah-nasabah').value);
        const tambahanSampah = parseFloat(document.getElementById('berat-sampah').value);
        // Data Rupiah tetap diambil untuk file Excel, tapi tidak ditampilkan
        const tambahanRupiah = parseInt(document.getElementById('total-rupiah').value);
        const jenisSampah = document.getElementById('jenis-sampah').value;

        // 2. Ambil nilai total saat ini dari localStorage
        let currentTotalSampah = parseFloat(localStorage.getItem('totalSampah'));
        let currentTotalNasabah = parseInt(localStorage.getItem('totalNasabah'));
        let currentJenisTersimpan = JSON.parse(localStorage.getItem('jenisSampah'));

        // 3. Hitung total baru
        const newTotalSampah = currentTotalSampah + tambahanSampah;
        const newTotalNasabah = currentTotalNasabah + tambahanNasabah;
        
        if (jenisSampah && !currentJenisTersimpan.includes(jenisSampah)) {
            currentJenisTersimpan.push(jenisSampah);
        }
        const newTotalJenis = currentJenisTersimpan.length;

        // 4. Simpan semua total baru ke localStorage
        localStorage.setItem('totalSampah', newTotalSampah);
        localStorage.setItem('totalNasabah', newTotalNasabah);
        localStorage.setItem('jenisSampah', JSON.stringify(currentJenisTersimpan));

        // 5. Proses pembuatan dan unduh Excel (masih menyertakan data Rupiah)
        const tanggalUpdate = new Date().toLocaleString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        const dataForExcel = [{'Tanggal Update': tanggalUpdate, 'Jumlah Nasabah': tambahanNasabah, 'Jenis Sampah': jenisSampah, 'Berat Sampah (kg)': tambahanSampah, 'Total Rupiah (Rp)': tambahanRupiah }];
        const ws = XLSX.utils.json_to_sheet(dataForExcel);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Laporan Sampah');
        const fileName = `Laporan_Bank_Sampah_${new Date().toISOString().slice(0,10)}.xlsx`;
        XLSX.writeFile(wb, fileName);

        alert('Laporan Excel berhasil diunduh! Statistik akan diperbarui.');

        // 6. /* DIMODIFIKASI */ Perbarui tampilan dan picu animasi tanpa Rupiah
        updateStatDisplay(newTotalSampah, newTotalNasabah, newTotalJenis);
        animateCounters([elStatSampah, elStatNasabah, elStatJenis]);

        // 7. Reset form
        dataForm.reset();
    });
});