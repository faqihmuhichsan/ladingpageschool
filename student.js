// ===== STUDENT PORTAL — PKBM Bintang Literasi =====
const API = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : window.location.origin;
let studentSession = JSON.parse(localStorage.getItem('student_session') || 'null');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    if (studentSession) {
        showDashboard();
    } else {
        showAuthPage();
    }

    // Tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            tab.classList.add('active');
            const form = tab.dataset.tab === 'login' ? 'loginForm' : 'registerForm';
            document.getElementById(form).classList.add('active');
        });
    });

    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('btnStudentLogout').addEventListener('click', handleLogout);

    // Sidebar navigation
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection(item.dataset.section);
        });
    });

    // Profile forms
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
    document.getElementById('passwordForm').addEventListener('submit', handlePasswordChange);
});

// ===== AUTH HANDLERS =====
async function handleLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('btnLogin');
    const errorEl = document.getElementById('loginError');
    errorEl.textContent = '';

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    btn.innerHTML = '⏳ Masuk...';
    btn.disabled = true;

    try {
        const res = await fetch(`${API}/api/student/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Email atau password salah');

        studentSession = {
            email: data.user.email,
            name: data.user.name,
            userId: data.user.id,
            token: data.token,
        };
        localStorage.setItem('student_session', JSON.stringify(studentSession));
        showDashboard();
    } catch (error) {
        errorEl.textContent = error.message || 'Login gagal';
    }

    btn.innerHTML = '🔐 Masuk';
    btn.disabled = false;
}

async function handleRegister(e) {
    e.preventDefault();
    const btn = document.getElementById('btnRegister');
    const errorEl = document.getElementById('registerError');
    const successEl = document.getElementById('registerSuccess');
    errorEl.textContent = '';
    successEl.textContent = '';

    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const phone = document.getElementById('regPhone').value.trim();
    const program = document.getElementById('regProgram').value;
    const message = document.getElementById('regMessage').value.trim();

    if (!name || !email || !password || !phone || !program) {
        errorEl.textContent = 'Harap isi semua field yang wajib';
        return;
    }

    btn.innerHTML = '⏳ Mendaftar...';
    btn.disabled = true;

    try {
        const signupRes = await fetch(`${API}/api/student/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });

        const signupData = await signupRes.json();
        if (!signupRes.ok) throw new Error(signupData.message || 'Gagal membuat akun.');

        const regRes = await fetch(`${API}/api/registrations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName: name, email, phone, program, message: message || undefined }),
        });

        if (!regRes.ok) throw new Error('Gagal mengirim pendaftaran');

        successEl.textContent = '✅ Pendaftaran berhasil! Silakan login.';
        document.getElementById('registerForm').reset();

        setTimeout(() => {
            document.querySelector('[data-tab="login"]').click();
            document.getElementById('loginEmail').value = email;
            successEl.textContent = '';
        }, 2500);
    } catch (error) {
        errorEl.textContent = error.message || 'Pendaftaran gagal';
    }

    btn.innerHTML = '📝 Daftar Sekarang';
    btn.disabled = false;
}

function handleLogout() {
    studentSession = null;
    localStorage.removeItem('student_session');
    showAuthPage();
}

// ===== PAGE SWITCHING =====
function showAuthPage() {
    document.getElementById('authPage').style.display = 'flex';
    document.getElementById('studentDashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('authPage').style.display = 'none';
    document.getElementById('studentDashboard').style.display = 'flex';

    document.getElementById('studentName').textContent = studentSession.name;
    document.getElementById('welcomeName').textContent = studentSession.name.split(' ')[0];

    loadStudentData();
    loadQuickAnnouncements();
}

// ===== SECTION NAVIGATION =====
function switchSection(section) {
    document.querySelectorAll('.sidebar-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`[data-section="${section}"]`)?.classList.add('active');

    document.querySelectorAll('.student-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`sec-${section}`)?.classList.add('active');

    const titles = {
        home: 'Dashboard',
        announcements: 'Pengumuman',
        events: 'Jadwal & Acara',
        profile: 'Profil Saya',
    };
    document.getElementById('sectionTitle').textContent = titles[section] || section;

    const loaders = {
        home: () => { loadStudentData(); loadQuickAnnouncements(); },
        announcements: loadAnnouncements,
        events: loadEvents,
        profile: loadProfile,
    };
    if (loaders[section]) loaders[section]();
}

// ===== LOAD STUDENT DATA =====
async function loadStudentData() {
    try {
        const accountHtml = `
            <div class="info-item">
                <span class="info-label">Nama</span>
                <span class="info-value">${esc(studentSession.name)}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">${esc(studentSession.email)}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Status Akun</span>
                <span class="info-value" style="color: #22c55e;">✅ Aktif</span>
            </div>
        `;
        document.getElementById('accountInfo').innerHTML = accountHtml;

        const res = await fetch(`${API}/api/registrations/check?email=${encodeURIComponent(studentSession.email)}`);

        if (res.ok) {
            const regData = await res.json();
            if (regData && regData.id) {
                renderRegistrationStatus(regData);
            } else {
                document.getElementById('statusContent').innerHTML = `
                    <div class="status-message"><p>📋 Belum ada data pendaftaran terkait akun ini.</p></div>
                `;
            }
        } else {
            document.getElementById('statusContent').innerHTML = `
                <div class="status-message"><p>📋 Belum ada data pendaftaran terkait akun ini.</p></div>
            `;
        }
    } catch (err) {
        console.error('Load student data error:', err);
    }
}

function renderRegistrationStatus(reg) {
    const statusMap = {
        new: { label: '📬 Menunggu Proses', class: 'status-new', desc: 'Pendaftaran Anda telah diterima dan sedang menunggu proses oleh admin.' },
        contacted: { label: '📞 Sudah Dihubungi', class: 'status-contacted', desc: 'Admin telah menghubungi Anda. Silakan periksa email/telepon.' },
        enrolled: { label: '✅ Diterima', class: 'status-enrolled', desc: 'Selamat! Anda telah resmi terdaftar sebagai siswa.' },
        rejected: { label: '❌ Ditolak', class: 'status-rejected', desc: 'Maaf, pendaftaran Anda belum dapat diterima saat ini.' },
    };
    const status = statusMap[reg.status] || statusMap.new;

    document.getElementById('statusContent').innerHTML = `
        <div style="margin-bottom: 12px;"><span class="status-label">Status saat ini:</span></div>
        <span class="status-badge ${status.class}">${status.label}</span>
        <div class="status-message">${status.desc}</div>
    `;

    const detailCard = document.getElementById('registrationDetails');
    detailCard.style.display = 'block';
    document.getElementById('detailContent').innerHTML = `
        <div class="detail-grid">
            <div class="detail-item"><label>Nama</label><span>${esc(reg.fullName)}</span></div>
            <div class="detail-item"><label>Email</label><span>${esc(reg.email)}</span></div>
            <div class="detail-item"><label>Telepon</label><span>${esc(reg.phone)}</span></div>
            <div class="detail-item"><label>Program</label><span>${esc(reg.program)}</span></div>
            <div class="detail-item"><label>Tanggal Daftar</label><span>${formatDate(reg.createdAt)}</span></div>
            <div class="detail-item"><label>Status</label><span class="status-badge ${status.class}" style="font-size:0.75rem;padding:4px 10px;">${status.label}</span></div>
        </div>
    `;
}

// ===== QUICK ANNOUNCEMENTS (Dashboard) =====
async function loadQuickAnnouncements() {
    try {
        const res = await fetch(`${API}/api/announcements`);
        if (!res.ok) return;
        const data = await res.json();
        const container = document.getElementById('quickAnnouncements');

        if (data.length === 0) {
            container.innerHTML = '<div class="empty-msg">Belum ada pengumuman.</div>';
            return;
        }

        const priorityEmoji = { normal: '📋', penting: '⚠️', urgent: '🚨' };
        container.innerHTML = data.slice(0, 3).map(a => `
            <div class="quick-item">
                <span class="quick-icon">${priorityEmoji[a.priority] || '📋'}</span>
                <div class="quick-info">
                    <strong>${esc(a.title)}</strong>
                    <span>${esc(a.category)} · ${timeAgo(a.createdAt)}</span>
                </div>
            </div>
        `).join('');
    } catch (err) { console.error(err); }
}

// ===== FULL ANNOUNCEMENTS =====
async function loadAnnouncements() {
    try {
        const res = await fetch(`${API}/api/announcements`);
        if (!res.ok) return;
        const data = await res.json();
        const container = document.getElementById('announcementsList');

        if (data.length === 0) {
            container.innerHTML = '<div class="empty-msg">📢 Belum ada pengumuman.</div>';
            return;
        }

        const priorityEmoji = { normal: '📋', penting: '⚠️', urgent: '🚨' };
        const catColors = { umum: '#3b82f6', akademik: '#8b5cf6', acara: '#f59e0b', penting: '#ef4444' };

        container.innerHTML = data.map(a => `
            <div class="ann-card priority-${a.priority}">
                <div class="ann-header">
                    <span class="ann-priority">${priorityEmoji[a.priority] || '📋'}</span>
                    <div class="ann-meta">
                        <span class="ann-category" style="color:${catColors[a.category] || '#3b82f6'}">${esc(a.category)}</span>
                        <span class="ann-date">${timeAgo(a.createdAt)}</span>
                    </div>
                </div>
                <h3>${esc(a.title)}</h3>
                <p>${esc(a.content)}</p>
            </div>
        `).join('');
    } catch (err) { console.error('Load announcements error:', err); }
}

// ===== EVENTS =====
async function loadEvents() {
    try {
        const res = await fetch(`${API}/api/events`);
        if (!res.ok) return;
        const data = await res.json();
        const container = document.getElementById('eventsList');

        if (data.length === 0) {
            container.innerHTML = '<div class="empty-msg">📅 Belum ada acara mendatang.</div>';
            return;
        }

        const catEmoji = { umum: '📌', akademik: '📖', ujian: '📝', libur: '🏖️', kegiatan: '🎉' };

        container.innerHTML = data.map(e => {
            const d = new Date(e.eventDate);
            const month = d.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase();
            const day = d.getDate();
            const fullDate = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            return `
                <div class="event-card">
                    <div class="event-date-badge">
                        <span class="event-month">${month}</span>
                        <span class="event-day">${day}</span>
                    </div>
                    <div class="event-info">
                        <span class="event-category">${catEmoji[e.category] || '📌'} ${esc(e.category)}</span>
                        <h3>${esc(e.title)}</h3>
                        <p>📆 ${fullDate}</p>
                        ${e.eventTime ? `<p>🕐 ${esc(e.eventTime)}</p>` : ''}
                        ${e.location ? `<p>📍 ${esc(e.location)}</p>` : ''}
                        ${e.description ? `<p class="event-desc">${esc(e.description)}</p>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) { console.error('Load events error:', err); }
}

// ===== PROFILE =====
function loadProfile() {
    document.getElementById('profileName').value = studentSession.name || '';
    document.getElementById('profileEmail').value = studentSession.email || '';
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    const msgEl = document.getElementById('profileMsg');
    msgEl.textContent = '';

    const name = document.getElementById('profileName').value.trim();
    const email = document.getElementById('profileEmail').value.trim();

    try {
        const res = await fetch(`${API}/api/student/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${studentSession.token}`,
            },
            body: JSON.stringify({ name, email }),
        });

        if (!res.ok) throw new Error('Gagal update profil');
        const data = await res.json();

        studentSession.name = data.name || name;
        studentSession.email = data.email || email;
        localStorage.setItem('student_session', JSON.stringify(studentSession));

        document.getElementById('studentName').textContent = studentSession.name;
        document.getElementById('welcomeName').textContent = studentSession.name.split(' ')[0];
        msgEl.textContent = '✅ Profil berhasil diperbarui!';
        msgEl.style.color = '#22c55e';
    } catch (err) {
        msgEl.textContent = '❌ ' + err.message;
        msgEl.style.color = '#ef4444';
    }
}

async function handlePasswordChange(e) {
    e.preventDefault();
    const msgEl = document.getElementById('passwordMsg');
    msgEl.textContent = '';

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        msgEl.textContent = '❌ Password tidak cocok';
        msgEl.style.color = '#ef4444';
        return;
    }
    if (newPassword.length < 8) {
        msgEl.textContent = '❌ Password minimal 8 karakter';
        msgEl.style.color = '#ef4444';
        return;
    }

    try {
        const res = await fetch(`${API}/api/student/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${studentSession.token}`,
            },
            body: JSON.stringify({ newPassword }),
        });

        if (!res.ok) throw new Error('Gagal ubah password');
        msgEl.textContent = '✅ Password berhasil diubah!';
        msgEl.style.color = '#22c55e';
        document.getElementById('passwordForm').reset();
    } catch (err) {
        msgEl.textContent = '❌ ' + err.message;
        msgEl.style.color = '#ef4444';
    }
}

// ===== UTILITIES =====
function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

function formatDate(isoString) {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
}

function timeAgo(isoString) {
    const now = new Date();
    const date = new Date(isoString);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return Math.floor(diff / 60) + ' menit lalu';
    if (diff < 86400) return Math.floor(diff / 3600) + ' jam lalu';
    if (diff < 2592000) return Math.floor(diff / 86400) + ' hari lalu';
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}
