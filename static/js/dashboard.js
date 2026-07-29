/* dashboard.js — Dashboard Stats, Charts, Activity Feed */

// ── Fetch Stats ───────────────────────────────────────
async function fetchStats() {
  try {
    const res  = await fetch('/api/stats');
    const data = await res.json();

    // Stat cards
    document.querySelectorAll('[data-stat]').forEach(el => {
      const key = el.dataset.stat;
      if (data[key] !== undefined) {
        const val = data[key];
        el.textContent = typeof val === 'number' ? val.toLocaleString('en-IN') : val;
      }
    });

    // Profile completion ring
    const pct     = data.profile_complete || 0;
    const arc     = document.getElementById('profileArc');
    const pctEl   = document.getElementById('profilePct');
    const badgeEl = document.getElementById('profileBadge');
    const circumference = 2 * Math.PI * 48; // 301.6

    if (arc) setTimeout(() => {
      arc.style.strokeDashoffset = circumference - (pct / 100) * circumference;
      arc.style.transition = 'stroke-dashoffset 1.5s ease';
    }, 400);
    if (pctEl)   pctEl.textContent   = `${pct}%`;
    if (badgeEl) badgeEl.textContent = `${pct}%`;

    // Profile fields checklist
    const fieldsEl = document.getElementById('profileFields');
    if (fieldsEl) {
      const fieldItems = [
        { key: 'name',    label: 'Name',             done: pct >= 10 },
        { key: 'state',   label: 'State / Location',  done: pct >= 20 },
        { key: 'edu',     label: 'Education Level',   done: pct >= 30 },
        { key: 'skills',  label: 'Skills Listed',     done: pct >= 40 },
        { key: 'career',  label: 'Career Goal',       done: pct >= 50 },
        { key: 'income',  label: 'Family Income',     done: pct >= 60 },
      ];
      fieldsEl.innerHTML = fieldItems.map(f =>
        `<div class="field-check ${f.done ? 'done' : 'missing'}">
           <i class="fas fa-${f.done ? 'check-circle' : 'times-circle'}"></i>${f.label}
         </div>`
      ).join('');
    }

    // Opportunity Score gauge
    const gaugeArc = document.getElementById('gaugeArc');
    const gaugeNum = document.getElementById('gaugeNum');
    const scoreInterp = document.getElementById('scoreInterpretation');
    const oScore = data.opportunity_score || 0;

    if (gaugeArc) {
      const total  = 251.3;
      const offset = total - (oScore / 100) * total;
      setTimeout(() => {
        gaugeArc.style.strokeDashoffset = offset;
        gaugeArc.style.transition = 'stroke-dashoffset 1.5s ease';
      }, 500);
    }
    if (gaugeNum) {
      let current = 0;
      const step = oScore / 60;
      const timer = setInterval(() => {
        current = Math.min(current + step, oScore);
        gaugeNum.textContent = Math.round(current);
        if (current >= oScore) clearInterval(timer);
      }, 25);
    }
    if (scoreInterp) {
      let msg = '';
      if      (oScore >= 80) msg = '<i class="fas fa-star" style="color:var(--clr-success)"></i> <strong>Excellent!</strong> You have a high opportunity score. Explore senior roles and advanced courses.';
      else if (oScore >= 60) msg = '<i class="fas fa-thumbs-up" style="color:var(--clr-accent)"></i> <strong>Good.</strong> Complete your profile and pick 2–3 recommended courses to boost your score.';
      else if (oScore >= 40) msg = '<i class="fas fa-info-circle" style="color:var(--clr-primary)"></i> <strong>Getting there.</strong> Fill out more profile details and apply for government schemes.';
      else                   msg = '<i class="fas fa-arrow-up" style="color:var(--clr-error)"></i> <strong>Low.</strong> Complete your profile to unlock better recommendations and a higher score.';
      scoreInterp.innerHTML = `<p style="font-size:.88rem">${msg}</p>`;
    }

  } catch (e) {
    console.error('Stats fetch error:', e);
  }
}

// ── Animate Progress Bars ─────────────────────────────
function animateBars() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        const w    = fill.dataset.width || 0;
        fill.style.width = `${w}%`;
        obs.unobserve(fill);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.pi-fill').forEach(el => obs.observe(el));
}

// ── Activity Feed ─────────────────────────────────────
async function loadActivity() {
  try {
    const res  = await fetch('/api/notifications');
    const data = await res.json();
    const listEl = document.getElementById('activityList');
    if (!listEl) return;

    if (!data.notifications || !data.notifications.length) {
      listEl.innerHTML = '<div class="activity-empty"><i class="fas fa-inbox"></i><p>No recent activity yet. Complete your profile to get started.</p></div>';
      return;
    }

    listEl.innerHTML = data.notifications.slice(0, 8).map(n => {
      const typeClass = { recommendation:'rec', contact:'contact', system:'system' }[n.type] || 'system';
      const icon      = { recommendation:'lightbulb', contact:'envelope', system:'bell' }[n.type] || 'bell';
      const time      = new Date(n.created_at).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
      return `
        <div class="activity-item">
          <div class="activity-icon ${typeClass}"><i class="fas fa-${icon}"></i></div>
          <div class="activity-text">
            <div class="activity-title">${n.title}</div>
            <div class="activity-msg">${n.message.substring(0, 100)}${n.message.length > 100 ? '…' : ''}</div>
            <div class="activity-time"><i class="fas fa-clock"></i> ${time}</div>
          </div>
        </div>`;
    }).join('');
  } catch (e) {
    console.error('Activity error:', e);
  }
}

document.getElementById('refreshNotifs')?.addEventListener('click', () => {
  loadActivity();
  showToast('Activity feed refreshed', 'success');
});

// Init
fetchStats();
animateBars();
loadActivity();
