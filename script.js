// ============================================
//  PAGE LOADER
// ============================================
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  setTimeout(() => {
    loader.classList.add('hidden');
  }, 400);
});


// ============================================
//  THEME TOGGLE
// ============================================
const themeToggle = document.getElementById('theme-toggle');

function getStoredTheme() {
  return localStorage.getItem('theme');
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  updateToggleIcon(theme);
}

function updateToggleIcon(theme) {
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
}

// Initialize theme — default to dark
const stored = getStoredTheme();
if (stored) {
  setTheme(stored);
} else {
  setTheme('dark');
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  setTheme(current === 'dark' ? 'light' : 'dark');
});



// ============================================
//  NAVBAR SCROLL SHADOW
// ============================================
const navbar = document.getElementById('navbar');

function handleNavScroll() {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll();



// ============================================
//  SCROLL REVEAL ANIMATIONS
// ============================================
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));


// ============================================
//  ACTIVE NAV LINK HIGHLIGHT ON SCROLL
// ============================================
const sections = document.querySelectorAll('section[id]');
const allNavLinks = document.querySelectorAll('.nav-links a[href^="#"]');

function highlightNav() {
  const scrollY = window.scrollY + 100;

  let currentSection = '';

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollY >= top && scrollY < top + height) {
      currentSection = id;
    }
  });

  allNavLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSection}`) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', highlightNav, { passive: true });
highlightNav();


// ============================================
//  STAT COUNTER ANIMATION
// ============================================
const statNumbers = document.querySelectorAll('.stat-number');

function animateCounters() {
  statNumbers.forEach(stat => {
    const target = parseInt(stat.getAttribute('data-count'));
    const duration = 1500;
    const start = performance.now();

    function updateCount(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(easedProgress * target);

      stat.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    }

    requestAnimationFrame(updateCount);
  });
}

// Observe stats section to start counting
const statsSection = document.querySelector('.about-stats');
if (statsSection) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statsObserver.observe(statsSection);
}


// ============================================
//  BACK-TO-TOP BUTTON
// ============================================
const backToTop = document.getElementById('back-to-top');

function handleBackToTop() {
  if (window.scrollY > 500) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
}

window.addEventListener('scroll', handleBackToTop, { passive: true });

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


// ============================================
//  CONTACT FORM — VALIDATION + FETCH
// ============================================
const contactForm = document.getElementById('contact-form');
const contactBtn = document.getElementById('contact-btn');
const formStatus = document.getElementById('form-status');

function showError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const error = document.getElementById(`${fieldId}-error`);
  input.classList.add('input-error');
  error.textContent = message;
}

function clearErrors() {
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
  formStatus.textContent = '';
  formStatus.className = 'form-status';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  let hasError = false;

  if (!name) {
    showError('name', 'Name is required.');
    hasError = true;
  }

  if (!email) {
    showError('email', 'Email is required.');
    hasError = true;
  } else if (!isValidEmail(email)) {
    showError('email', 'Please enter a valid email.');
    hasError = true;
  }

  if (!message) {
    showError('message', 'Message is required.');
    hasError = true;
  }

  if (hasError) return;

  // Disable button while submitting
  contactBtn.disabled = true;
  const btnText = contactBtn.querySelector('.btn-text');
  if (btnText) btnText.textContent = 'Sending...';

  try {
    const res = await fetch('https://portfolio-website-n29f.onrender.com/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });

    if (res.ok) {
      formStatus.textContent = '✓ Message sent successfully!';
      formStatus.className = 'form-status success';
      contactForm.reset();
    } else {
      formStatus.textContent = 'Something went wrong. Please try again.';
      formStatus.className = 'form-status error';
    }
  } catch (err) {
    formStatus.textContent = 'Could not reach the server. Please try again later.';
    formStatus.className = 'form-status error';
  } finally {
    contactBtn.disabled = false;
    if (btnText) btnText.textContent = 'Send Message';
  }
});


// ============================================
//  EXPERIENCE DURATION CALCULATOR
// ============================================
function calculateDuration() {
  const startDate = new Date(2024, 5); // June 2024
  const currentDate = new Date();

  let years = currentDate.getFullYear() - startDate.getFullYear();
  let months = currentDate.getMonth() - startDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  let result = "";

  if (years > 0) {
    result += years + (years === 1 ? " year " : " years ");
  }

  if (months > 0) {
    result += months + (months === 1 ? " month" : " months");
  }

  if (years === 0 && months === 0) {
    result = "Less than a month";
  }

  const el = document.getElementById("teachingDuration");
  if (el) {
    el.textContent = result.trim();
  }
}

calculateDuration();


// ============================================
//  SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});


// ============================================
//  MOBILE HAMBURGER MENU
// ============================================
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');
const navOverlay = document.getElementById('nav-overlay');

function openMobileMenu() {
  navLinks.classList.add('open');
  menuToggle.classList.add('open');
  navOverlay.classList.add('visible');
  navOverlay.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  navLinks.classList.remove('open');
  menuToggle.classList.remove('open');
  navOverlay.classList.remove('visible');
  document.body.style.overflow = '';
  // Wait for the fade-out transition before hiding overlay
  setTimeout(() => {
    if (!navOverlay.classList.contains('visible')) {
      navOverlay.style.display = 'none';
    }
  }, 350);
}

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('open');
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });
}

// Close menu when a nav link is clicked
if (navLinks) {
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  });
}

// Close menu when overlay is tapped
if (navOverlay) {
  navOverlay.addEventListener('click', closeMobileMenu);
}

// Close menu on window resize past mobile breakpoint
window.addEventListener('resize', () => {
  if (window.innerWidth > 768 && navLinks.classList.contains('open')) {
    closeMobileMenu();
  }
});
