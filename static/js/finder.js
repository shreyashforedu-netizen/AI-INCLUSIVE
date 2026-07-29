/* finder.js — Multi-step Form & API Submission */

const steps       = [1, 2, 3];
let currentStep   = 1;

const formStepEls = {
  1: document.getElementById('formStep1'),
  2: document.getElementById('formStep2'),
  3: document.getElementById('formStep3'),
};
const stepInds = {
  1: document.getElementById('step-ind-1'),
  2: document.getElementById('step-ind-2'),
  3: document.getElementById('step-ind-3'),
};
const lines = {
  1: document.getElementById('line-1'),
  2: document.getElementById('line-2'),
};
const progressFill = document.getElementById('progressFill');

function goToStep(n) {
  Object.values(formStepEls).forEach(el => el.classList.remove('active'));
  formStepEls[n]?.classList.add('active');

  Object.values(stepInds).forEach(el => el.classList.remove('active', 'done'));
  Object.values(lines).forEach(el => el.classList.remove('active', 'done'));

  for (let i = 1; i < n; i++) {
    stepInds[i]?.classList.add('done');
    lines[i]?.classList.add('done');
  }
  stepInds[n]?.classList.add('active');

  if (progressFill) progressFill.style.width = `${(n / 3) * 100}%`;
  currentStep = n;
  if (n === 3) buildSummary();
}

// ── Validation ───────────────────────────────────────
function required(id, errId, msg) {
  const el  = document.getElementById(id);
  const err = document.getElementById(errId);
  if (!el || !el.value.trim()) {
    if (err) err.textContent = msg || 'This field is required.';
    el?.classList.add('error');
    return false;
  }
  if (err) err.textContent = '';
  el.classList.remove('error');
  return true;
}

function validateStep(n) {
  if (n === 1) {
    const a = required('name',  'nameErr',  'Please enter your full name.');
    const b = required('age',   'ageErr',   'Please enter your age.');
    const c = required('state', 'stateErr', 'Please select your state.');
    return a && b && c;
  }
  if (n === 2) {
    return required('education', 'educationErr', 'Please select your education level.');
  }
  if (n === 3) {
    return required('preferred_career', 'careerErr', 'Please select a preferred career field.');
  }
  return true;
}

// ── Navigation buttons ───────────────────────────────
document.getElementById('toStep2')?.addEventListener('click', () => {
  if (validateStep(1)) goToStep(2);
});
document.getElementById('toStep3')?.addEventListener('click', () => {
  if (validateStep(2)) goToStep(3);
});
document.getElementById('toStep1Back')?.addEventListener('click', () => goToStep(1));
document.getElementById('toStep2Back')?.addEventListener('click', () => goToStep(2));

// ── Skills chips ─────────────────────────────────────
const skillsInput = document.getElementById('skills');
const skillsChips = document.getElementById('skillsChips');

function renderSkillChips() {
  if (!skillsChips || !skillsInput) return;
  const chips = skillsInput.value.split(',').map(s => s.trim()).filter(Boolean);
  skillsChips.innerHTML = chips.map(s => `<span class="skill-chip"><i class="fas fa-tag"></i>${s}</span>`).join('');
}
skillsInput?.addEventListener('input', renderSkillChips);

// ── Summary Preview (Step 3) ─────────────────────────
function buildSummary() {
  const chips = document.getElementById('summaryChips');
  if (!chips) return;
  const fields = [
    { icon: 'fa-user',        id: 'name',             label: '' },
    { icon: 'fa-map-marker',  id: 'state',            label: '' },
    { icon: 'fa-graduation-cap', id: 'education',     label: '' },
    { icon: 'fa-briefcase',   id: 'employment',       label: '' },
    { icon: 'fa-rupee-sign',  id: 'annual_income',    label: '₹' },
  ];
  chips.innerHTML = fields
    .filter(f => document.getElementById(f.id)?.value)
    .map(f => {
      const val = document.getElementById(f.id).options
        ? document.getElementById(f.id).selectedOptions[0]?.text
        : document.getElementById(f.id).value;
      return `<span class="summary-chip"><i class="fas ${f.icon}"></i>${val}</span>`;
    }).join('');
}

// ── Form Submission ──────────────────────────────────
const form      = document.getElementById('opportunityForm');
const loadingEl = document.getElementById('formLoading');
const step3El   = document.getElementById('formStep3');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateStep(3)) return;

  // Show loading
  step3El.style.display = 'none';
  if (loadingEl) loadingEl.style.display = 'block';

  // Simulate progressive loading steps
  const loadSteps = loadingEl?.querySelectorAll('.loading-step');
  if (loadSteps) {
    loadSteps.forEach((s, i) => {
      setTimeout(() => {
        s.classList.remove('pending');
        s.querySelector('i').className = 'fas fa-check-circle';
      }, (i + 1) * 800);
    });
  }

  const payload = {
    name:             document.getElementById('name')?.value,
    age:              document.getElementById('age')?.value,
    gender:           document.getElementById('gender')?.value,
    state:            document.getElementById('state')?.value,
    education:        document.getElementById('education')?.value,
    skills:           document.getElementById('skills')?.value,
    interests:        document.getElementById('interests')?.value,
    employment:       document.getElementById('employment')?.value,
    annual_income:    document.getElementById('annual_income')?.value,
    preferred_career: document.getElementById('preferred_career')?.value,
    language:         document.getElementById('language')?.value,
  };

  try {
    await new Promise(r => setTimeout(r, 3200)); // let steps animate
    const res  = await fetch('/api/submit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success) {
      showToast('🎯 Recommendations ready! Redirecting…', 'success', 'Analysis Complete');
      setTimeout(() => window.location.href = data.redirect || '/recommendations', 1000);
    } else {
      throw new Error(data.error || 'Submission failed');
    }
  } catch (err) {
    loadingEl.style.display = 'none';
    step3El.style.display   = 'block';
    showToast(err.message || 'Something went wrong. Please try again.', 'error', 'Error');
  }
});

// ── Input error clear on typing ──────────────────────
document.querySelectorAll('.form-control').forEach(el => {
  el.addEventListener('input', () => el.classList.remove('error'));
});
