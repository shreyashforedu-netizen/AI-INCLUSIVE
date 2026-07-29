/**
 * main.js — Shared JavaScript
 * Handles: Navbar scroll, mobile toggle, notification polling + panel, toast, scroll reveal, audio toggle
 */

// ── Navbar Scroll Effect ──────────────────────────────
const navbar = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── Mobile Nav Toggle ─────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close mobile nav on link click
navLinks?.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// ── Notification System ───────────────────────────────
const bell         = document.getElementById('notificationBell');
const panel        = document.getElementById('notifPanel');
const backdrop     = document.getElementById('notifBackdrop');
const badgeEl      = document.getElementById('notifBadge');
const notifList    = document.getElementById('notifList');
const markReadBtn  = document.getElementById('markAllRead');
const closePanelBtn= document.getElementById('closeNotifPanel');

let notifOpen = false;

function openNotifPanel() {
  panel?.classList.add('open');
  backdrop?.classList.add('show');
  bell?.setAttribute('aria-expanded', 'true');
  panel?.setAttribute('aria-hidden', 'false');
  notifOpen = true;
}

function closeNotifPanel() {
  panel?.classList.remove('open');
  backdrop?.classList.remove('show');
  bell?.setAttribute('aria-expanded', 'false');
  panel?.setAttribute('aria-hidden', 'true');
  notifOpen = false;
}

bell?.addEventListener('click', () => notifOpen ? closeNotifPanel() : openNotifPanel());
backdrop?.addEventListener('click', closeNotifPanel);
closePanelBtn?.addEventListener('click', closeNotifPanel);

markReadBtn?.addEventListener('click', async () => {
  try {
    await fetch('/api/notifications/read', { method: 'POST' });
    fetchNotifications();
    showToast('All notifications marked as read', 'success');
  } catch (_) {}
});

function renderNotifItem(n) {
  const icons = { recommendation: '🎯', contact: '📩', system: '🔔' };
  const icon  = icons[n.type] || '🔔';
  const time  = new Date(n.created_at).toLocaleString('en-IN', {
    day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'
  });
  const div = document.createElement('div');
  div.className = `notif-item${n.is_read ? '' : ' unread'}`;
  div.innerHTML = `
    <div class="notif-item-title">${icon} ${n.title}</div>
    <div class="notif-item-msg">${n.message}</div>
    <div class="notif-item-time"><i class="fas fa-clock"></i> ${time}</div>`;
  return div;
}

async function fetchNotifications() {
  try {
    const res  = await fetch('/api/notifications');
    const data = await res.json();

    if (badgeEl) {
      if (data.unread_count > 0) {
        badgeEl.textContent = data.unread_count > 9 ? '9+' : data.unread_count;
        badgeEl.style.display = 'flex';
      } else {
        badgeEl.style.display = 'none';
      }
    }

    if (notifList) {
      notifList.innerHTML = '';
      if (!data.notifications || data.notifications.length === 0) {
        notifList.innerHTML = `<div class="notif-empty"><i class="fas fa-bell-slash"></i><p>No notifications yet</p></div>`;
      } else {
        data.notifications.forEach(n => notifList.appendChild(renderNotifItem(n)));
      }
    }
  } catch (e) {
    console.warn('Notification fetch failed:', e);
  }
}

// Initial load + poll every 30s
fetchNotifications();
setInterval(fetchNotifications, 30000);

// ── Toast Notification System ─────────────────────────
/**
 * Show a toast notification.
 * @param {string} message
 * @param {'info'|'success'|'error'|'warning'} type
 * @param {string} [title]
 */
function showToast(message, type = 'info', title = '') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { info:'fas fa-info-circle', success:'fas fa-check-circle', error:'fas fa-exclamation-circle', warning:'fas fa-exclamation-triangle' };
  const colors = { info:'var(--clr-primary)', success:'var(--clr-success)', error:'var(--clr-error)', warning:'var(--clr-warning)' };
  const titles = { info:'Info', success:'Success', error:'Error', warning:'Warning' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="toast-icon ${icons[type] || icons.info}" style="color:${colors[type] || colors.info}"></i>
    <div class="toast-body">
      <div class="toast-title">${title || titles[type]}</div>
      <div class="toast-msg">${message}</div>
    </div>
    <button class="toast-close" aria-label="Close"><i class="fas fa-times"></i></button>
    <div class="toast-progress"></div>`;

  container.appendChild(toast);

  toast.querySelector('.toast-close').addEventListener('click', () => dismissToast(toast));
  setTimeout(() => dismissToast(toast), 4500);
}

function dismissToast(toast) {
  toast.style.animation = 'toastIn .3s ease reverse both';
  setTimeout(() => toast.remove(), 300);
}

window.showToast = showToast;

// ── Scroll Reveal (Intersection Observer) ─────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger-children').forEach(el => {
  revealObserver.observe(el);
});

// ── Counter Animation ─────────────────────────────────
function animateCounter(el, target, duration = 1800, suffix = '') {
  const start = performance.now();
  const from  = 0;
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  function update(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value    = Math.round(from + (target - from) * easeOut(progress));
    el.textContent = value.toLocaleString('en-IN') + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el     = entry.target;
      const target = parseInt(el.dataset.target || '0', 10);
      const suffix = el.dataset.suffix || '';
      animateCounter(el, target, 2000, suffix);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

// ── Audio Toggle (Hero Video) ─────────────────────────
const audioBtn = document.getElementById('audioToggleBtn');
const heroVid  = document.getElementById('heroBgVideo');

if (audioBtn && heroVid) {
  audioBtn.addEventListener('click', () => {
    heroVid.muted = !heroVid.muted;
    audioBtn.querySelector('i').className = heroVid.muted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
  });

  // Pause when tab is hidden (battery friendly)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { heroVid.pause(); }
    else { heroVid.play().catch(() => {}); }
  });
}

// ── Active nav highlighting on scroll ────────────────
const sections = document.querySelectorAll('section[id]');
const scrollSpy = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => scrollSpy.observe(s));
