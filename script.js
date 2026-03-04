// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', async () => {
    initNavbar();
    initHamburger();
    initHeroParticles();
    initScrollReveal();
    await loadSettingsFromAPI(); // Load dynamic stats BEFORE counter animation
    initCounterAnimation();
    initTestimoni();
    initContactForm();
    initBackToTop();
    initSmoothScroll();
    loadProgramsFromAPI();
    loadKeunggulanFromAPI();
    loadGalleryFromAPI();
    loadAnnouncementsFromAPI();
    loadEventsFromAPI();
});

// ===== NAVBAR SCROLL =====
function initNavbar() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ===== HAMBURGER MENU =====
function initHamburger() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

// ===== HERO PARTICLES =====
function initHeroParticles() {
    const container = document.getElementById('heroParticles');
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('span');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 5 + 5) + 's';
        particle.style.width = (Math.random() * 6 + 3) + 'px';
        particle.style.height = particle.style.width;
        container.appendChild(particle);
    }
}

// ===== SCROLL REVEAL =====
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    reveals.forEach(el => observer.observe(el));
}

// ===== COUNTER ANIMATION =====
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');
    let started = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !started) {
                started = true;
                counters.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-target'));
                    const suffix = counter.closest('.stat-item')
                        .querySelector('.stat-label').textContent.includes('%') ? '%' : '+';
                    animateCounter(counter, target, suffix);
                });
            }
        });
    }, { threshold: 0.5 });

    if (counters.length > 0) {
        observer.observe(counters[0].closest('.hero-stats'));
    }
}

function animateCounter(element, target, suffix) {
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + suffix;
    }, 30);
}

// ===== TESTIMONI (API) =====
const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : window.location.origin;

function initTestimoni() {
    loadTestimonials();

    const form = document.getElementById('testimoniForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('testiName').value.trim();
        const role = document.getElementById('testiRole').value;
        const rating = parseInt(document.getElementById('testiRating').value);
        const message = document.getElementById('testiMessage').value.trim();

        if (!name || !role || !rating || !message) return;

        const btn = document.getElementById('btnSubmitTesti');
        const originalText = btn.innerHTML;
        btn.innerHTML = '⏳ Mengirim...';
        btn.disabled = true;

        try {
            const res = await fetch(`${API_BASE}/api/testimonials`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    role,
                    rating,
                    message,
                    avatarColor: getRandomColor()
                })
            });

            if (!res.ok) throw new Error('Failed');

            const testimonial = await res.json();
            renderTestimonial(testimonial, true);
            form.reset();

            btn.innerHTML = '✅ Terkirim!';
            btn.style.background = 'linear-gradient(135deg, #4caf50, #81c784)';
        } catch (error) {
            btn.innerHTML = '❌ Gagal, coba lagi';
            btn.style.background = 'linear-gradient(135deg, #f44336, #ef5350)';
            console.error('Error submitting testimonial:', error);
        }

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.disabled = false;
        }, 2000);
    });
}

function getRandomColor() {
    const colors = [
        'linear-gradient(135deg, #e91e63, #f06292)',
        'linear-gradient(135deg, #2196f3, #64b5f6)',
        'linear-gradient(135deg, #4caf50, #81c784)',
        'linear-gradient(135deg, #ff9800, #ffb74d)',
        'linear-gradient(135deg, #9c27b0, #ba68c8)',
        'linear-gradient(135deg, #00bcd4, #4dd0e1)',
        'linear-gradient(135deg, #3f51b5, #7986cb)',
        'linear-gradient(135deg, #ff5722, #ff8a65)',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

async function loadTestimonials() {
    const emptyState = document.getElementById('testimoniEmpty');

    try {
        const res = await fetch(`${API_BASE}/api/testimonials`);
        if (!res.ok) throw new Error('Failed');

        const testimonials = await res.json();

        if (testimonials.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        testimonials.forEach(t => renderTestimonial(t, false));
    } catch (error) {
        console.error('Error loading testimonials:', error);
        emptyState.style.display = 'block';
    }
}

function renderTestimonial(testimonial, isNew) {
    const container = document.getElementById('testimoniList');
    const emptyState = document.getElementById('testimoniEmpty');
    emptyState.style.display = 'none';

    const card = document.createElement('div');
    card.className = 'testimoni-card';

    const initials = testimonial.name.split(' ')
        .map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const stars = '⭐'.repeat(testimonial.rating);
    const timeAgo = getTimeAgo(testimonial.createdAt || testimonial.timestamp);

    card.innerHTML = `
        <div class="testimoni-card-header">
            <div class="testimoni-avatar" style="background: ${testimonial.avatarColor || testimonial.color}">${initials}</div>
            <div class="testimoni-card-header-info">
                <strong>${escapeHtml(testimonial.name)}</strong>
                <span>${escapeHtml(testimonial.role)}</span>
            </div>
        </div>
        <div class="testimoni-card-body">
            <p>"${escapeHtml(testimonial.message)}"</p>
        </div>
        <div class="testimoni-card-footer">
            <div class="testimoni-stars">${stars}</div>
            <div class="testimoni-time">${timeAgo}</div>
        </div>
    `;

    if (isNew) {
        container.insertBefore(card, container.firstChild);
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        container.appendChild(card);
    }
}

function getTimeAgo(isoString) {
    const now = new Date();
    const date = new Date(isoString);
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return Math.floor(diff / 60) + ' menit lalu';
    if (diff < 86400) return Math.floor(diff / 3600) + ' jam lalu';
    if (diff < 2592000) return Math.floor(diff / 86400) + ' hari lalu';
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== CONTACT / REGISTRATION FORM (API) =====
function initContactForm() {
    const form = document.getElementById('kontakForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = form.querySelector('.btn-submit');
        const originalText = btn.innerHTML;
        btn.innerHTML = '⏳ Mengirim...';
        btn.disabled = true;

        const data = {
            fullName: document.getElementById('kontakNama').value.trim(),
            email: document.getElementById('kontakEmail').value.trim(),
            phone: document.getElementById('kontakTelp').value.trim(),
            program: document.getElementById('kontakProgram').value,
            message: document.getElementById('kontakPesan').value.trim() || undefined,
        };

        try {
            const res = await fetch(`${API_BASE}/api/registrations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error('Failed');

            btn.innerHTML = '✅ Pendaftaran Terkirim!';
            btn.style.background = 'linear-gradient(135deg, #4caf50, #81c784)';
            form.reset();
        } catch (error) {
            btn.innerHTML = '❌ Gagal, coba lagi';
            btn.style.background = 'linear-gradient(135deg, #f44336, #ef5350)';
            console.error('Error submitting registration:', error);
        }

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.disabled = false;
        }, 3000);
    });
}

// ===== BACK TO TOP =====
function initBackToTop() {
    const btn = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
}

// ===== LOAD SETTINGS FROM API (Stats) =====
async function loadSettingsFromAPI() {
    try {
        const res = await fetch(`${API_BASE}/api/settings`);
        if (!res.ok) return;
        const settings = await res.json();

        // Map setting keys to stat labels
        const statMapping = {
            'total_students': 'Siswa Aktif',
            'total_teachers': 'Tenaga Pendidik',
            'years_established': 'Tahun Berdiri',
            'graduation_rate': '% Kelulusan',
        };

        const statItems = document.querySelectorAll('.stat-item');
        statItems.forEach(item => {
            const label = item.querySelector('.stat-label').textContent.trim();
            // Find matching setting key
            for (const [key, matchLabel] of Object.entries(statMapping)) {
                if (label === matchLabel && settings[key]) {
                    const numEl = item.querySelector('.stat-number');
                    const newValue = parseInt(settings[key].value) || 0;
                    numEl.setAttribute('data-target', newValue);
                }
            }
        });
    } catch (err) {
        console.log('Using default stats (API unavailable)');
    }
}

// ===== LOAD PROGRAMS FROM API =====
async function loadProgramsFromAPI() {
    const grid = document.getElementById('programGrid');
    if (!grid) return;

    try {
        const res = await fetch(`${API_BASE}/api/programs`);
        if (!res.ok) return;
        const programs = await res.json();

        const levelClasses = { tk: 'level-tk', sd: 'level-sd', smp: 'level-smp', sma: 'level-sma' };

        grid.innerHTML = programs.map(p => `
            <div class="program-card reveal">
                <div class="program-card-image">
                    <img src="${escapeHtml(p.imageUrl || '/images/hero.png')}" alt="${escapeHtml(p.title)}">
                    <div class="program-card-level ${levelClasses[p.level] || ''}">${escapeHtml(p.levelLabel)}</div>
                </div>
                <div class="program-card-content">
                    <h3>${escapeHtml(p.title)}</h3>
                    <p>${escapeHtml(p.description)}</p>
                    <ul class="program-card-features">
                        ${(p.features || []).map(f => `<li>${escapeHtml(f)}</li>`).join('')}
                    </ul>
                    <a href="#kontak" class="program-card-link">Info Selengkapnya →</a>
                </div>
            </div>
        `).join('');

        // Re-observe for scroll reveal
        initScrollReveal();
    } catch (err) {
        console.log('Using fallback programs');
    }
}

// ===== LOAD KEUNGGULAN FROM API =====
async function loadKeunggulanFromAPI() {
    const grid = document.getElementById('keunggulanGrid');
    if (!grid) return;

    try {
        const res = await fetch(`${API_BASE}/api/advantages`);
        if (!res.ok) return;
        const advantages = await res.json();

        grid.innerHTML = advantages.map(a => `
            <div class="keunggulan-card reveal">
                <div class="keunggulan-icon">${a.icon || '⭐'}</div>
                <h3>${escapeHtml(a.title)}</h3>
                <p>${escapeHtml(a.description)}</p>
            </div>
        `).join('');

        initScrollReveal();
    } catch (err) {
        console.log('Using fallback advantages');
    }
}

// ===== LOAD GALLERY FROM API =====
async function loadGalleryFromAPI() {
    const grid = document.getElementById('galeriGrid');
    if (!grid) return;

    try {
        const res = await fetch(`${API_BASE}/api/gallery`);
        if (!res.ok) return;
        const items = await res.json();

        grid.innerHTML = items.map(g => `
            <div class="galeri-item">
                <img src="${escapeHtml(g.imageUrl || '/images/hero.png')}" alt="${escapeHtml(g.title)}">
                <div class="galeri-overlay"><span>${escapeHtml(g.title)}</span></div>
            </div>
        `).join('');

        initScrollReveal();
    } catch (err) {
        console.log('Using fallback gallery');
    }
}

// ===== LOAD ANNOUNCEMENTS FROM API =====
async function loadAnnouncementsFromAPI() {
    const grid = document.getElementById('pengumumanGrid');
    if (!grid) return;

    try {
        const res = await fetch(`${API_BASE}/api/announcements`);
        if (!res.ok) return;
        const announcements = await res.json();

        if (announcements.length === 0) {
            grid.innerHTML = '<div class="pengumuman-empty"><p>Belum ada pengumuman saat ini.</p></div>';
            return;
        }

        const priorityEmoji = { normal: '📋', penting: '⚠️', urgent: '🚨' };
        const catColors = { umum: '#3b82f6', akademik: '#8b5cf6', acara: '#f59e0b', penting: '#ef4444' };

        grid.innerHTML = announcements.slice(0, 6).map(a => `
            <div class="pengumuman-card">
                <div class="pengumuman-card-priority priority-${escapeHtml(a.priority)}">
                    ${priorityEmoji[a.priority] || '📋'}
                </div>
                <div class="pengumuman-card-content">
                    <div class="pengumuman-card-meta">
                        <span class="pengumuman-category" style="color:${catColors[a.category] || '#3b82f6'}">${escapeHtml(a.category)}</span>
                        <span class="pengumuman-date">${getTimeAgo(a.createdAt)}</span>
                    </div>
                    <h3>${escapeHtml(a.title)}</h3>
                    <p>${escapeHtml(a.content.length > 150 ? a.content.substring(0, 150) + '...' : a.content)}</p>
                </div>
            </div>
        `).join('');

        initScrollReveal();
    } catch (err) {
        console.log('Using fallback announcements');
    }
}

// ===== LOAD EVENTS FROM API =====
async function loadEventsFromAPI() {
    const grid = document.getElementById('kalenderGrid');
    if (!grid) return;

    try {
        const res = await fetch(`${API_BASE}/api/events`);
        if (!res.ok) return;
        const events = await res.json();

        if (events.length === 0) {
            grid.innerHTML = '<div class="pengumuman-empty"><p>Belum ada acara mendatang.</p></div>';
            return;
        }

        const catEmoji = { umum: '📌', akademik: '📖', ujian: '📝', libur: '🏖️', kegiatan: '🎉' };

        grid.innerHTML = events.slice(0, 6).map(e => {
            const d = new Date(e.eventDate);
            const month = d.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase();
            const day = d.getDate();
            return `
                <div class="kalender-card">
                    <div class="kalender-card-date">
                        <span class="kalender-month">${month}</span>
                        <span class="kalender-day">${day}</span>
                    </div>
                    <div class="kalender-card-content">
                        <span class="kalender-category">${catEmoji[e.category] || '📌'} ${escapeHtml(e.category)}</span>
                        <h3>${escapeHtml(e.title)}</h3>
                        ${e.eventTime ? `<p>🕐 ${escapeHtml(e.eventTime)}</p>` : ''}
                        ${e.location ? `<p>📍 ${escapeHtml(e.location)}</p>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        initScrollReveal();
    } catch (err) {
        console.log('Using fallback events');
    }
}
