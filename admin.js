// ===== ADMIN PANEL — PKBM Bintang Literasi =====
const API = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : window.location.origin;
let sessionToken = localStorage.getItem('admin_session') || null;
let currentAdminRole = localStorage.getItem('admin_role') || 'admin';

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    if (sessionToken) {
        showAdminPanel();
    } else {
        showLoginPage();
    }

    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('btnLogout').addEventListener('click', handleLogout);

    // Sidebar navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection(item.dataset.section);
        });
    });

    // Forms
    document.getElementById('announcementForm').addEventListener('submit', handleAnnouncementSubmit);
    document.getElementById('eventForm').addEventListener('submit', handleEventSubmit);
    document.getElementById('adminCreateForm').addEventListener('submit', handleAdminCreate);
});

// ===== AUTH =====
async function handleLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('btnLogin');
    const errorEl = document.getElementById('loginError');
    errorEl.textContent = '';

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    btn.innerHTML = '⏳ Masuk...';
    btn.disabled = true;

    try {
        const res = await fetch(`${API}/api/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Email atau password salah');

        sessionToken = data.token;
        currentAdminRole = data.user?.role || 'admin';
        localStorage.setItem('admin_session', sessionToken);
        localStorage.setItem('admin_role', currentAdminRole);
        document.getElementById('adminName').textContent = data.user?.name || 'Admin';

        showAdminPanel();
    } catch (error) {
        errorEl.textContent = error.message || 'Login gagal.';
    }

    btn.innerHTML = '🔐 Masuk';
    btn.disabled = false;
}

function handleLogout() {
    sessionToken = null;
    currentAdminRole = 'admin';
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_role');
    showLoginPage();
}

function showLoginPage() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
}

function showAdminPanel() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'flex';

    // Set role badge
    const roleLabels = { superadmin: 'Super Admin', admin: 'Admin', editor: 'Editor' };
    document.getElementById('adminRoleBadge').textContent = roleLabels[currentAdminRole] || 'Admin';
    document.getElementById('adminRoleBadge').className = `admin-badge role-${currentAdminRole}`;

    // Hide admin management for non-superadmin
    const navAdmins = document.getElementById('navAdmins');
    if (currentAdminRole !== 'superadmin') {
        navAdmins.style.display = 'none';
    } else {
        navAdmins.style.display = '';
    }

    loadDashboard();
}

// ===== API HELPER =====
async function api(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };
    if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
    }
    const res = await fetch(`${API}${endpoint}`, { ...options, headers });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'API Error');
    }
    return res.json();
}

// ===== NAVIGATION =====
function switchSection(section) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`[data-section="${section}"]`)?.classList.add('active');

    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`sec-${section}`)?.classList.add('active');

    const titles = {
        dashboard: 'Dashboard',
        registrations: 'Pendaftaran',
        students: 'Data Siswa',
        announcements: 'Pengumuman',
        events: 'Kalender Acara',
        testimonials: 'Testimoni',
        programs: 'Program',
        gallery: 'Galeri',
        admins: 'Manajemen Admin',
        settings: 'Pengaturan'
    };
    document.getElementById('pageTitle').textContent = titles[section] || section;

    const loaders = {
        dashboard: loadDashboard,
        registrations: loadRegistrations,
        students: loadStudents,
        announcements: loadAnnouncements,
        events: loadEvents,
        testimonials: loadTestimonials,
        programs: loadPrograms,
        gallery: loadGallery,
        admins: loadAdmins,
        settings: loadSettings,
    };
    if (loaders[section]) loaders[section]();
}

// ===== DASHBOARD =====
async function loadDashboard() {
    try {
        const [regs, students, anns, evts] = await Promise.all([
            api('/api/admin/registrations').catch(() => []),
            api('/api/admin/users/students').catch(() => []),
            api('/api/admin/announcements').catch(() => []),
            api('/api/admin/events').catch(() => []),
        ]);

        document.getElementById('statRegistrations').textContent = regs.length || 0;
        document.getElementById('statStudents').textContent = students.length || 0;
        document.getElementById('statAnnouncements').textContent = anns.length || 0;
        document.getElementById('statEvents').textContent = evts.length || 0;

        // Badges
        const newRegs = Array.isArray(regs) ? regs.filter(r => r.status === 'new').length : 0;
        const regBadge = document.getElementById('regBadge');
        if (newRegs > 0) { regBadge.textContent = newRegs; regBadge.classList.add('show'); }

        // Recent registrations
        const recentRegsHtml = (Array.isArray(regs) ? regs : []).slice(0, 5).map(r => `
            <div class="recent-item">
                <div class="recent-item-info">
                    <h4>${esc(r.fullName)}</h4>
                    <p>${esc(r.program)} · ${esc(r.email)}</p>
                </div>
                <span class="badge badge-${r.status}">${r.status}</span>
            </div>
        `).join('') || '<div class="empty-state"><p>Belum ada pendaftaran</p></div>';
        document.getElementById('recentRegistrations').innerHTML = recentRegsHtml;

        // Recent announcements
        const recentAnnsHtml = (Array.isArray(anns) ? anns : []).slice(0, 5).map(a => `
            <div class="recent-item">
                <div class="recent-item-info">
                    <h4>${esc(a.title)}</h4>
                    <p>${esc(a.category)} · ${formatDate(a.createdAt)}</p>
                </div>
                <span class="badge badge-${a.priority}">${a.priority}</span>
            </div>
        `).join('') || '<div class="empty-state"><p>Belum ada pengumuman</p></div>';
        document.getElementById('recentAnnouncements').innerHTML = recentAnnsHtml;

    } catch (err) {
        console.error('Dashboard load error:', err);
    }
}

// ===== REGISTRATIONS =====
async function loadRegistrations() {
    try {
        const data = await api('/api/admin/registrations');
        const tbody = document.getElementById('registrationsTable');
        if (!data.length) { tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><p>Belum ada pendaftaran</p></td></tr>'; return; }
        tbody.innerHTML = data.map(r => `
            <tr>
                <td><strong>${esc(r.fullName)}</strong></td>
                <td>${esc(r.email)}</td>
                <td>${esc(r.phone)}</td>
                <td>${esc(r.program)}</td>
                <td>
                    <select class="status-select" onchange="updateRegStatus('${r.id}', this.value)">
                        <option value="new" ${r.status === 'new' ? 'selected' : ''}>New</option>
                        <option value="contacted" ${r.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                        <option value="enrolled" ${r.status === 'enrolled' ? 'selected' : ''}>Enrolled</option>
                        <option value="rejected" ${r.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                </td>
                <td>${formatDate(r.createdAt)}</td>
                <td>${esc(r.message || '-')}</td>
            </tr>
        `).join('');
    } catch (err) { console.error('Load registrations error:', err); }
}

async function updateRegStatus(id, status) {
    try {
        await api(`/api/admin/registrations/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
    } catch (err) { alert('Gagal update status: ' + err.message); loadRegistrations(); }
}

// ===== STUDENTS =====
async function loadStudents() {
    try {
        const data = await api('/api/admin/users/students');
        const tbody = document.getElementById('studentsTable');
        if (!data.length) { tbody.innerHTML = '<tr><td colspan="3" class="empty-state"><p>Belum ada siswa terdaftar</p></td></tr>'; return; }
        tbody.innerHTML = data.map(s => `
            <tr>
                <td><strong>${esc(s.name)}</strong></td>
                <td>${esc(s.email)}</td>
                <td>${formatDate(s.createdAt)}</td>
            </tr>
        `).join('');
    } catch (err) { console.error('Load students error:', err); }
}

// ===== ANNOUNCEMENTS =====
async function loadAnnouncements() {
    try {
        const data = await api('/api/admin/announcements');
        const tbody = document.getElementById('announcementsTable');
        if (!data.length) { tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><p>Belum ada pengumuman</p></td></tr>'; return; }

        const priorityClass = { normal: 'badge-new', penting: 'badge-contacted', urgent: 'badge-rejected' };
        tbody.innerHTML = data.map(a => `
            <tr>
                <td><strong>${esc(a.title)}</strong></td>
                <td><span class="badge badge-enrolled">${esc(a.category)}</span></td>
                <td><span class="badge ${priorityClass[a.priority] || 'badge-new'}">${esc(a.priority)}</span></td>
                <td><span class="badge ${a.isPublished ? 'badge-approved' : 'badge-pending'}">${a.isPublished ? '✅ Published' : '📝 Draft'}</span></td>
                <td>${formatDate(a.createdAt)}</td>
                <td>
                    <button class="btn-action btn-approve" onclick="editAnnouncement('${a.id}')">✏️</button>
                    <button class="btn-action btn-delete" onclick="deleteAnnouncement('${a.id}')">🗑️</button>
                </td>
            </tr>
        `).join('');
    } catch (err) { console.error('Load announcements error:', err); }
}

let announcementsCache = [];
async function editAnnouncement(id) {
    try {
        const data = await api('/api/admin/announcements');
        const ann = data.find(a => a.id === id);
        if (!ann) return;

        document.getElementById('annId').value = ann.id;
        document.getElementById('annTitle').value = ann.title;
        document.getElementById('annContent').value = ann.content;
        document.getElementById('annCategory').value = ann.category;
        document.getElementById('annPriority').value = ann.priority;
        document.getElementById('annPublished').value = ann.isPublished ? 'true' : 'false';
        document.getElementById('announcementFormTitle').textContent = 'Edit Pengumuman';
        document.getElementById('announcementFormContainer').style.display = 'block';
    } catch (err) { console.error(err); }
}

function showAnnouncementForm() {
    document.getElementById('announcementForm').reset();
    document.getElementById('annId').value = '';
    document.getElementById('announcementFormTitle').textContent = 'Buat Pengumuman Baru';
    document.getElementById('announcementFormContainer').style.display = 'block';
}

function hideAnnouncementForm() {
    document.getElementById('announcementFormContainer').style.display = 'none';
}

async function handleAnnouncementSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('annId').value;
    const body = {
        title: document.getElementById('annTitle').value,
        content: document.getElementById('annContent').value,
        category: document.getElementById('annCategory').value,
        priority: document.getElementById('annPriority').value,
        isPublished: document.getElementById('annPublished').value === 'true',
    };

    try {
        if (id) {
            await api(`/api/admin/announcements/${id}`, { method: 'PUT', body: JSON.stringify(body) });
        } else {
            await api('/api/admin/announcements', { method: 'POST', body: JSON.stringify(body) });
        }
        hideAnnouncementForm();
        loadAnnouncements();
    } catch (err) { alert('Gagal simpan: ' + err.message); }
}

async function deleteAnnouncement(id) {
    if (!confirm('Hapus pengumuman ini?')) return;
    try { await api(`/api/admin/announcements/${id}`, { method: 'DELETE' }); loadAnnouncements(); }
    catch (err) { alert('Gagal hapus: ' + err.message); }
}

// ===== EVENTS =====
async function loadEvents() {
    try {
        const data = await api('/api/admin/events');
        const tbody = document.getElementById('eventsTable');
        if (!data.length) { tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><p>Belum ada acara</p></td></tr>'; return; }

        const catEmoji = { umum: '📌', akademik: '📖', ujian: '📝', libur: '🏖️', kegiatan: '🎉' };
        tbody.innerHTML = data.map(e => `
            <tr>
                <td><strong>${esc(e.title)}</strong></td>
                <td>${formatDate(e.eventDate)}</td>
                <td>${esc(e.eventTime || '-')}</td>
                <td>${esc(e.location || '-')}</td>
                <td><span class="badge badge-enrolled">${catEmoji[e.category] || '📌'} ${esc(e.category)}</span></td>
                <td>
                    <button class="btn-action btn-approve" onclick="editEvent('${e.id}')">✏️</button>
                    <button class="btn-action btn-delete" onclick="deleteEvent('${e.id}')">🗑️</button>
                </td>
            </tr>
        `).join('');
    } catch (err) { console.error('Load events error:', err); }
}

async function editEvent(id) {
    try {
        const data = await api('/api/admin/events');
        const evt = data.find(e => e.id === id);
        if (!evt) return;

        document.getElementById('evtId').value = evt.id;
        document.getElementById('evtTitle').value = evt.title;
        document.getElementById('evtDesc').value = evt.description || '';
        document.getElementById('evtDate').value = evt.eventDate ? evt.eventDate.substring(0, 10) : '';
        document.getElementById('evtTime').value = evt.eventTime || '';
        document.getElementById('evtLocation').value = evt.location || '';
        document.getElementById('evtCategory').value = evt.category;
        document.getElementById('eventFormTitle').textContent = 'Edit Acara';
        document.getElementById('eventFormContainer').style.display = 'block';
    } catch (err) { console.error(err); }
}

function showEventForm() {
    document.getElementById('eventForm').reset();
    document.getElementById('evtId').value = '';
    document.getElementById('eventFormTitle').textContent = 'Buat Acara Baru';
    document.getElementById('eventFormContainer').style.display = 'block';
}

function hideEventForm() {
    document.getElementById('eventFormContainer').style.display = 'none';
}

async function handleEventSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('evtId').value;
    const body = {
        title: document.getElementById('evtTitle').value,
        description: document.getElementById('evtDesc').value,
        eventDate: document.getElementById('evtDate').value,
        eventTime: document.getElementById('evtTime').value,
        location: document.getElementById('evtLocation').value,
        category: document.getElementById('evtCategory').value,
    };

    try {
        if (id) {
            await api(`/api/admin/events/${id}`, { method: 'PUT', body: JSON.stringify(body) });
        } else {
            await api('/api/admin/events', { method: 'POST', body: JSON.stringify(body) });
        }
        hideEventForm();
        loadEvents();
    } catch (err) { alert('Gagal simpan: ' + err.message); }
}

async function deleteEvent(id) {
    if (!confirm('Hapus acara ini?')) return;
    try { await api(`/api/admin/events/${id}`, { method: 'DELETE' }); loadEvents(); }
    catch (err) { alert('Gagal hapus: ' + err.message); }
}

// ===== TESTIMONIALS =====
async function loadTestimonials() {
    try {
        const data = await api('/api/testimonials');
        const tbody = document.getElementById('testimonialsTable');
        if (!data.length) { tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><p>Belum ada testimoni</p></td></tr>'; return; }

        tbody.innerHTML = data.map(t => `
            <tr>
                <td><strong>${esc(t.name)}</strong></td>
                <td>${esc(t.role)}</td>
                <td>${'⭐'.repeat(t.rating)}</td>
                <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(t.message)}</td>
                <td><span class="badge ${t.isApproved ? 'badge-approved' : 'badge-pending'}">${t.isApproved ? '✅ Yes' : '⏳ No'}</span></td>
                <td>${formatDate(t.createdAt)}</td>
                <td>
                    ${!t.isApproved ? `<button class="btn-action btn-approve" onclick="approveTestimonial('${t.id}')">✅ Approve</button>` : ''}
                    <button class="btn-action btn-delete" onclick="deleteTestimonial('${t.id}')">🗑️</button>
                </td>
            </tr>
        `).join('');
    } catch (err) { console.error('Load testimonials error:', err); }
}

async function approveTestimonial(id) {
    try { await api(`/api/admin/testimonials/${id}`, { method: 'PUT', body: JSON.stringify({ isApproved: true }) }); loadTestimonials(); }
    catch (err) { alert('Gagal approve: ' + err.message); }
}

async function deleteTestimonial(id) {
    if (!confirm('Hapus testimoni ini?')) return;
    try { await api(`/api/admin/testimonials/${id}`, { method: 'DELETE' }); loadTestimonials(); }
    catch (err) { alert('Gagal hapus: ' + err.message); }
}

// ===== PROGRAMS =====
async function loadPrograms() {
    try {
        const data = await api('/api/programs');
        const grid = document.getElementById('programsGrid');
        const levelEmoji = { tk: '🎒', sd: '📖', smp: '📐', sma: '🎓' };
        grid.innerHTML = data.map(p => `
            <div class="content-card">
                <div class="content-card-img">${p.imageUrl ? `<img src="${p.imageUrl}" alt="${esc(p.title)}">` : levelEmoji[p.level] || '📚'}</div>
                <div class="content-card-body">
                    <span class="badge badge-enrolled">${esc(p.levelLabel)}</span>
                    <h4 style="margin-top:8px;">${esc(p.title)}</h4>
                    <p>${esc(p.description)}</p>
                    <div style="margin-bottom:12px;">${(p.features || []).map(f => `<span class="badge badge-new" style="margin:2px;">${esc(f)}</span>`).join('')}</div>
                </div>
            </div>
        `).join('') || '<div class="empty-state"><div class="empty-state-icon">📚</div><p>Belum ada program</p></div>';
    } catch (err) { console.error('Load programs error:', err); }
}

// ===== GALLERY =====
async function loadGallery() {
    try {
        const data = await api('/api/gallery');
        const grid = document.getElementById('galleryGrid');
        grid.innerHTML = data.map(g => `
            <div class="content-card">
                <div class="content-card-img">${g.imageUrl ? `<img src="${g.imageUrl}" alt="${esc(g.title)}">` : '📸'}</div>
                <div class="content-card-body">
                    <h4>${esc(g.title)}</h4>
                    <p>${esc(g.category || 'Umum')}</p>
                    <div class="content-card-actions">
                        <button class="btn-action btn-delete" onclick="deleteGallery('${g.id}')">🗑️ Hapus</button>
                    </div>
                </div>
            </div>
        `).join('') || '<div class="empty-state"><div class="empty-state-icon">📸</div><p>Belum ada galeri</p></div>';
    } catch (err) { console.error('Load gallery error:', err); }
}

async function deleteGallery(id) {
    if (!confirm('Hapus item galeri ini?')) return;
    try { await api(`/api/admin/gallery/${id}`, { method: 'DELETE' }); loadGallery(); }
    catch (err) { alert('Gagal hapus: ' + err.message); }
}

// ===== ADMIN MANAGEMENT =====
async function loadAdmins() {
    try {
        const data = await api('/api/admin/users/admins');
        const tbody = document.getElementById('adminsTable');
        if (!data.length) { tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><p>Belum ada data admin</p></td></tr>'; return; }

        const roleLabels = { superadmin: '🔑 Super Admin', admin: '🛡️ Admin', editor: '✏️ Editor' };
        tbody.innerHTML = data.map(a => `
            <tr>
                <td><strong>${esc(a.name)}</strong></td>
                <td>${esc(a.email)}</td>
                <td>
                    ${currentAdminRole === 'superadmin' ? `
                        <select class="status-select" onchange="changeAdminRole('${a.id}', this.value)" ${a.role === 'superadmin' ? '' : ''}>
                            <option value="editor" ${a.role === 'editor' ? 'selected' : ''}>✏️ Editor</option>
                            <option value="admin" ${a.role === 'admin' ? 'selected' : ''}>🛡️ Admin</option>
                            <option value="superadmin" ${a.role === 'superadmin' ? 'selected' : ''}>🔑 Super Admin</option>
                        </select>
                    ` : `<span class="badge badge-enrolled">${roleLabels[a.role] || a.role}</span>`}
                </td>
                <td>${formatDate(a.createdAt)}</td>
                <td>
                    ${currentAdminRole === 'superadmin' ? `<button class="btn-action btn-delete" onclick="deleteAdmin('${a.id}')">🗑️</button>` : '-'}
                </td>
            </tr>
        `).join('');
    } catch (err) { console.error('Load admins error:', err); }
}

function showAdminForm() {
    document.getElementById('adminCreateForm').reset();
    document.getElementById('adminFormContainer').style.display = 'block';
}

function hideAdminForm() {
    document.getElementById('adminFormContainer').style.display = 'none';
}

async function handleAdminCreate(e) {
    e.preventDefault();
    const body = {
        name: document.getElementById('newAdminName').value,
        email: document.getElementById('newAdminEmail').value,
        password: document.getElementById('newAdminPassword').value,
        role: document.getElementById('newAdminRole').value,
    };
    try {
        await api('/api/admin/users', { method: 'POST', body: JSON.stringify(body) });
        hideAdminForm();
        loadAdmins();
        alert('✅ Admin berhasil dibuat!');
    } catch (err) { alert('Gagal buat admin: ' + err.message); }
}

async function changeAdminRole(id, role) {
    try {
        await api(`/api/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) });
    } catch (err) { alert('Gagal ubah role: ' + err.message); loadAdmins(); }
}

async function deleteAdmin(id) {
    if (!confirm('Hapus admin ini? Tindakan tidak bisa dibatalkan.')) return;
    try { await api(`/api/admin/users/${id}`, { method: 'DELETE' }); loadAdmins(); }
    catch (err) { alert('Gagal hapus: ' + err.message); }
}

// ===== SETTINGS =====
async function loadSettings() {
    try {
        const data = await api('/api/settings');
        const grid = document.getElementById('settingsGrid');
        const keys = Object.keys(data);
        if (keys.length === 0) { grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚙️</div><p>Belum ada pengaturan</p></div>'; return; }

        grid.innerHTML = keys.map(key => {
            const item = data[key];
            return `
                <div class="setting-card">
                    <label>${esc(item.label || key)}</label>
                    <input type="text" id="setting-${key}" value="${esc(item.value)}" placeholder="Nilai...">
                    <button class="btn-save" onclick="saveSetting('${key}')">💾 Simpan</button>
                </div>
            `;
        }).join('');
    } catch (err) { console.error('Load settings error:', err); }
}

async function saveSetting(key) {
    const input = document.getElementById(`setting-${key}`);
    const btn = input.nextElementSibling;
    try {
        btn.textContent = '⏳...';
        await api(`/api/admin/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value: input.value }) });
        btn.textContent = '✅ Saved!';
        setTimeout(() => btn.textContent = '💾 Simpan', 1500);
    } catch (err) {
        btn.textContent = '❌ Gagal';
        setTimeout(() => btn.textContent = '💾 Simpan', 1500);
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
        day: 'numeric', month: 'short', year: 'numeric'
    });
}
