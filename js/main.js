/* ============================================
   OBSIDO INTERIORS - MAIN JAVASCRIPT
   ============================================ */

// Navigation scroll effect
const nav = document.getElementById('nav');
const scrollTopButton = document.querySelector('.scroll-top');
const mobileNav = document.getElementById('mobile-nav');
const mobileClose = mobileNav?.querySelector('.mobile-close');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }

  if (scrollTopButton) {
    scrollTopButton.classList.toggle('is-visible', window.scrollY > 500);
  }
});

function getNavOffset() {
  return nav ? nav.offsetHeight + 16 : 96;
}

function closeMobileNav() {
  if (!mobileNav) return;
  mobileNav.classList.remove('open');
  mobileNav.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function openMobileNav() {
  if (!mobileNav) return;
  mobileNav.classList.add('open');
  mobileNav.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function scrollToHash(hash, replaceState = false) {
  if (!hash || hash === '#') return false;
  const target = document.querySelector(hash);
  if (!target) return false;

  const top = target.getBoundingClientRect().top + window.scrollY - getNavOffset();
  window.scrollTo({
    top,
    behavior: 'smooth'
  });

  if (replaceState) {
    history.replaceState(null, '', hash);
  }

  return true;
}

document.querySelectorAll('a[href]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;

    const url = new URL(href, window.location.href);
    const isSamePage = url.origin === window.location.origin && url.pathname === window.location.pathname;

    if (isSamePage && url.hash && document.querySelector(url.hash)) {
      e.preventDefault();
      closeMobileNav();
      scrollToHash(url.hash, true);
    } else if (mobileNav?.classList.contains('open')) {
      closeMobileNav();
    }
  });
});

window.addEventListener('load', () => {
  if (window.location.hash) {
    setTimeout(() => {
      scrollToHash(window.location.hash, false);
    }, 60);
  }
});

// Reveal animation on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.animation = 'fadeUp 0.8s ease forwards';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => {
  observer.observe(el);
});

// Mobile menu toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    if (!mobileNav) {
      navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
      return;
    }

    if (mobileNav.classList.contains('open')) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });
}

if (mobileClose) {
  mobileClose.addEventListener('click', closeMobileNav);
}

if (mobileNav) {
  mobileNav.addEventListener('click', (event) => {
    if (event.target === mobileNav) {
      closeMobileNav();
    }
  });
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMobileNav();
  }
});

if (scrollTopButton) {
  scrollTopButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Marquee animation
const marqueeTrack = document.querySelector('.marquee-track');
if (marqueeTrack) {
  const marqueeItem = document.querySelector('.marquee-item');
  const marqueeItemWidth = marqueeItem.offsetWidth;
  const marqueeTrackWidth = marqueeTrack.offsetWidth;
  
  // Clone items for seamless loop
  const itemsToClone = Math.ceil(marqueeTrackWidth / marqueeItemWidth) + 2;
  for (let i = 0; i < itemsToClone; i++) {
    const clone = marqueeItem.cloneNode(true);
    marqueeTrack.appendChild(clone);
  }
}

// Gallery filter
const galleryFilters = document.querySelectorAll('.gallery-filter');
const galleryCards = document.querySelectorAll('.gallery-card');

galleryFilters.forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.getAttribute('data-filter');

    galleryFilters.forEach(item => item.classList.remove('is-active'));
    button.classList.add('is-active');

    galleryCards.forEach(card => {
      const category = card.getAttribute('data-category');
      const shouldShow = filter === 'all' || category === filter;
      card.classList.toggle('is-hidden', !shouldShow);
    });
  });
});

// Tab switching for estimator
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const tabName = button.getAttribute('data-tab');
    
    // Remove active class from all buttons and contents
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked button and corresponding content
    button.classList.add('active');
    document.getElementById(tabName + '-tab').classList.add('active');

    if (typeof window.handleEstimatorTabSwitch === 'function') {
      window.handleEstimatorTabSwitch(tabName);
    }
  });
});

// Console message
console.log('%c🏠 Obsido Interiors', 'font-size: 20px; color: #c9a96e; font-weight: bold;');
console.log('%cPremium Custom Furniture & Interior Solutions', 'font-size: 12px; color: #8a8278;');
