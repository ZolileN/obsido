/* ============================================
   OBSIDO INTERIORS - MAIN JAVASCRIPT
   ============================================ */

// Navigation scroll effect
const nav = document.getElementById('nav');
const scrollTopButton = document.querySelector('.scroll-top');

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

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && document.querySelector(href)) {
      e.preventDefault();
      document.querySelector(href).scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
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
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
  });
}

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
  });
});

// Console message
console.log('%c🏠 Obsido Interiors', 'font-size: 20px; color: #c9a96e; font-weight: bold;');
console.log('%cPremium Custom Furniture & Interior Solutions', 'font-size: 12px; color: #8a8278;');
