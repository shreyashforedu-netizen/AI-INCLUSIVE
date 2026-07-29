/* contact.js — Contact Form Submission & Star Rating */

// ── Star Rating ───────────────────────────────────────
const stars   = document.querySelectorAll('.star-rating i');
const ratingInput = document.getElementById('ratingVal');

stars.forEach(star => {
  star.addEventListener('mouseover', () => {
    const val = parseInt(star.dataset.val);
    stars.forEach((s, i) => {
      s.className = i < val ? 'fas fa-star' : 'far fa-star';
      s.classList.toggle('active', i < val);
    });
  });

  star.addEventListener('click', () => {
    const val = parseInt(star.dataset.val);
    if (ratingInput) ratingInput.value = val;
  });
});

document.querySelector('.star-rating')?.addEventListener('mouseleave', () => {
  const current = parseInt(ratingInput?.value || '0');
  stars.forEach((s, i) => {
    s.className = i < current ? 'fas fa-star' : 'far fa-star';
    s.classList.toggle('active', i < current);
  });
});

// ── Char Counter ──────────────────────────────────────
const messageEl  = document.getElementById('cMessage');
const charCountEl = document.getElementById('charCount');

messageEl?.addEventListener('input', () => {
  const len = messageEl.value.length;
  if (charCountEl) charCountEl.textContent = len;
  if (len > 450) charCountEl.style.color = 'var(--clr-warning)';
  else if (len > 490) charCountEl.style.color = 'var(--clr-error)';
  else charCountEl.style.color = '';
  if (messageEl.value.length > 500) messageEl.value = messageEl.value.substring(0, 500);
});

// ── Validation ────────────────────────────────────────
function validate(id, errId, msg) {
  const el  = document.getElementById(id);
  const err = document.getElementById(errId);
  if (!el || !el.value.trim()) {
    if (err) err.textContent = msg;
    el?.classList.add('error');
    return false;
  }
  if (err) err.textContent = '';
  el.classList.remove('error');
  return true;
}

function validateEmail(id, errId) {
  const el = document.getElementById(id);
  const err = document.getElementById(errId);
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!el || !re.test(el.value.trim())) {
    if (err) err.textContent = 'Please enter a valid email address.';
    el?.classList.add('error');
    return false;
  }
  if (err) err.textContent = '';
  el.classList.remove('error');
  return true;
}

// ── Form Submission ───────────────────────────────────
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn   = document.getElementById('contactSubmitBtn');
const sendAnother = document.getElementById('sendAnother');

contactForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const a = validate('cName',    'cNameErr',    'Please enter your name.');
  const b = validateEmail('cEmail', 'cEmailErr');
  const c = validate('cSubject', 'cSubjectErr', 'Please select a subject.');
  const d = validate('cMessage', 'cMessageErr', 'Please write a message.');
  if (!a || !b || !c || !d) return;

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';

  const payload = {
    name:    document.getElementById('cName').value.trim(),
    email:   document.getElementById('cEmail').value.trim(),
    subject: document.getElementById('cSubject').value,
    message: document.getElementById('cMessage').value.trim(),
    rating:  document.getElementById('ratingVal')?.value,
  };

  try {
    const res  = await fetch('/api/contact', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success) {
      contactForm.style.display = 'none';
      formSuccess.style.display = 'block';
      showToast('Message sent! We\'ll reply within 24–48 hours.', 'success', 'Thank You!');
    } else {
      throw new Error(data.error || 'Failed to send');
    }
  } catch (err) {
    showToast(err.message || 'Failed to send message. Please try again.', 'error', 'Error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
  }
});

sendAnother?.addEventListener('click', () => {
  contactForm.style.display = 'block';
  formSuccess.style.display = 'none';
  contactForm.reset();
  if (charCountEl) charCountEl.textContent = '0';
  if (ratingInput) ratingInput.value = '0';
  stars.forEach(s => { s.className = 'far fa-star'; s.classList.remove('active'); });
});

// Clear errors on input
document.querySelectorAll('.form-control').forEach(el => {
  el.addEventListener('input', () => el.classList.remove('error'));
});
