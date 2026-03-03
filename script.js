// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initHamburger();
    initHeroParticles();
    initScrollReveal();
    initCounterAnimation();
    initTestimoni();
    initContactForm();
    initBackToTop();
    initSmoothScroll();
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
const API_BASE = 'http://localhost:3000';

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
