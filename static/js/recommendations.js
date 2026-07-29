/* recommendations.js — Fetch & Render AI Recommendation Cards */

const userId      = typeof USER_ID !== 'undefined' ? USER_ID : null;
const loadingEl   = document.getElementById('recsLoading');
const contentEl   = document.getElementById('recsContent');
const noUserEl    = document.getElementById('noUserState');

// ── Tab switching ─────────────────────────────────────
document.querySelectorAll('.rec-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.rec-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.rec-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`panel-${tab}`)?.classList.add('active');
  });
});

// ── Fetch Recommendations ─────────────────────────────
async function loadRecommendations() {
  if (loadingEl) loadingEl.style.display = 'block';

  try {
    const url = userId ? `/api/recommendations/${userId}` : '/api/recommendations/latest';
    const res  = await fetch(url);

    if (res.status === 404) {
      loadingEl.style.display = 'none';
      noUserEl.style.display  = 'block';
      return;
    }

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    loadingEl.style.display  = 'none';
    contentEl.style.display  = 'block';
    renderAll(data);
  } catch (err) {
    loadingEl.style.display = 'none';
    noUserEl.style.display  = 'block';
    console.error('Recommendations error:', err);
  }
}

// ── Render All Sections ───────────────────────────────
function renderAll(data) {
  // User banner
  const user = data.user || {};
  const nameEl = document.getElementById('recUserName');
  if (nameEl) nameEl.textContent = user.name || 'Valued User';

  const tagsEl = document.getElementById('userTags');
  if (tagsEl && user) {
    const tags = [user.state, user.education, user.employment].filter(Boolean);
    tagsEl.innerHTML = tags.map(t => `<span class="user-tag"><i class="fas fa-tag"></i>${t}</span>`).join('');
  }

  // Priority score ring
  const score = data.priority_score || 0;
  const scoreText = document.getElementById('priorityScoreText');
  const scoreCircle = document.getElementById('priorityCircle');
  if (scoreText) scoreText.textContent = Math.round(score);
  if (scoreCircle) {
    const circumference = 2 * Math.PI * 32; // 201.06
    const offset = circumference - (score / 100) * circumference;
    setTimeout(() => { scoreCircle.style.strokeDashoffset = offset; scoreCircle.style.transition = 'stroke-dashoffset 1.5s ease'; }, 300);
  }

  // Salary range
  const salaryEl = document.getElementById('salaryRange');
  if (salaryEl) salaryEl.textContent = data.salary_range || '—';

  // Render each section
  renderJobs(data.jobs || []);
  renderCourses(data.courses || []);
  renderScholarships(data.scholarships || []);
  renderSchemes(data.schemes || []);
  renderRoadmap(data.roadmap || []);
  renderMissingSkills(data.missing_skills || []);
}

// ── Jobs ──────────────────────────────────────────────
function renderJobs(jobs) {
  const grid = document.getElementById('jobsGrid');
  if (!grid) return;
  if (!jobs.length) { grid.innerHTML = '<p style="color:var(--clr-text-muted)">No job recommendations found. Try updating your profile.</p>'; return; }

  grid.innerHTML = jobs.map((j, i) => `
    <div class="job-card" style="animation-delay:${i * 0.08}s">
      <div class="card-chip"><i class="fas fa-briefcase"></i>${j.type || 'Job'}</div>
      <div class="card-title">${j.title}</div>
      <div class="card-sub">${j.company || ''}</div>
      <div class="card-salary">${j.salary || ''}</div>
      <div class="card-meta">
        <span><i class="fas fa-map-marker-alt"></i> India</span>
        <span><i class="fas fa-clock"></i> ${j.type || 'Full Time'}</span>
      </div>
    </div>`).join('');
}

// ── Courses ───────────────────────────────────────────
function renderCourses(courses) {
  const grid = document.getElementById('coursesGrid');
  if (!grid) return;
  grid.innerHTML = courses.map((c, i) => `
    <div class="course-card" style="animation-delay:${i * 0.08}s">
      <div class="card-chip" style="background:rgba(255,215,0,.1);color:var(--clr-accent);border-color:rgba(255,215,0,.2)"><i class="fas fa-graduation-cap"></i>Course</div>
      <div class="card-title">${c.name}</div>
      <div class="card-sub">${c.platform || ''}</div>
      <div class="card-meta">
        <span><i class="fas fa-clock"></i>${c.duration || 'Self-paced'}</span>
        <span><i class="fas fa-rupee-sign"></i>${c.fee || 'Free'}</span>
      </div>
    </div>`).join('');
}

// ── Scholarships ──────────────────────────────────────
function renderScholarships(list) {
  const grid = document.getElementById('scholarshipsGrid');
  if (!grid) return;
  if (!list.length) { grid.innerHTML = '<p style="color:var(--clr-text-muted)">No scholarships matched. Try updating income and education in your profile.</p>'; return; }
  grid.innerHTML = list.map((s, i) => `
    <div class="scholarship-card" style="animation-delay:${i * 0.08}s">
      <div class="card-chip" style="background:rgba(16,185,129,.1);color:var(--clr-success);border-color:rgba(16,185,129,.2)"><i class="fas fa-award"></i>Scholarship</div>
      <div class="card-title">${s.name}</div>
      <div class="scholarship-amount">${s.amount || ''}</div>
      <div class="card-sub"><i class="fas fa-info-circle"></i> ${s.eligibility || ''}</div>
    </div>`).join('');
}

// ── Government Schemes ────────────────────────────────
function renderSchemes(schemes) {
  const grid = document.getElementById('schemesGrid');
  if (!grid) return;
  grid.innerHTML = schemes.map((s, i) => `
    <div class="scheme-card" style="animation-delay:${i * 0.08}s">
      <div class="card-chip" style="background:rgba(221,19,103,.1);color:var(--clr-sdg10);border-color:rgba(221,19,103,.2)"><i class="fas fa-university"></i>Scheme</div>
      <div class="card-title">${s.name}</div>
      <div class="card-sub"><i class="fas fa-building"></i> ${s.ministry || 'Government of India'}</div>
      <div style="margin-top:.75rem;font-size:.85rem;color:var(--clr-text-muted)">${s.benefit || ''}</div>
    </div>`).join('');
}

// ── Roadmap ───────────────────────────────────────────
function renderRoadmap(steps) {
  const el = document.getElementById('roadmapTimeline');
  if (!el) return;
  el.innerHTML = steps.map((s, i) => `
    <div class="roadmap-step" style="animation-delay:${i * 0.1}s">
      <div class="roadmap-step-num">${s.step || i + 1}</div>
      <div class="roadmap-step-body">
        <h4>${s.title}</h4>
        <p>${s.desc}</p>
        <span class="roadmap-duration"><i class="fas fa-clock"></i> ${s.duration}</span>
      </div>
    </div>`).join('');
}

// ── Missing Skills ─────────────────────────────────────
function renderMissingSkills(skills) {
  const el = document.getElementById('missingSkillsContent');
  if (!el) return;
  if (!skills.length) {
    el.innerHTML = '<div class="glass-card" style="padding:2rem;text-align:center"><i class="fas fa-check-circle" style="font-size:2.5rem;color:var(--clr-success);display:block;margin-bottom:1rem"></i><h3>Great! No critical skill gaps found.</h3><p>Keep learning to stay ahead of the curve.</p></div>';
    return;
  }
  el.innerHTML = `
    <div class="missing-skills-grid">
      ${skills.map(s => `<span class="missing-skill-chip"><i class="fas fa-exclamation-triangle"></i>${s}</span>`).join('')}
    </div>
    <div class="missing-skills-note">
      <strong><i class="fas fa-lightbulb" style="color:var(--clr-accent)"></i> Tip:</strong>
      Focus on acquiring these skills through our recommended courses to boost your opportunity score and employability.
    </div>`;
}

// Init
loadRecommendations();
