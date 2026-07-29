/* home.js — Home Page Specific Scripts */

// Typewriter effect
const words   = ['Opportunities', 'Career Paths', 'Scholarships', 'Skills', 'Futures'];
const el      = document.getElementById('typewriterText');
let wordIndex = 0, charIndex = 0, isDeleting = false;

function typeWriter() {
  if (!el) return;
  const word    = words[wordIndex];
  const current = isDeleting ? word.substring(0, charIndex - 1) : word.substring(0, charIndex + 1);
  el.textContent = current;
  charIndex = isDeleting ? charIndex - 1 : charIndex + 1;

  let delay = isDeleting ? 60 : 120;
  if (!isDeleting && charIndex === word.length) { delay = 2000; isDeleting = true; }
  if (isDeleting && charIndex === 0) { isDeleting = false; wordIndex = (wordIndex + 1) % words.length; delay = 400; }
  setTimeout(typeWriter, delay);
}

typeWriter();

// Particles mini animation on hero canvas (optional visual polish)
// Lazy loading images
document.querySelectorAll('img[data-src]').forEach(img => {
  const obs = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { img.src = img.dataset.src; obs.disconnect(); }
  });
  obs.observe(img);
});
