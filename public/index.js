document.addEventListener("DOMContentLoaded", () => {
  // Mobile Menu
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }

  // Smooth Scrolling - targeting the scroll container
  const scrollContainer = document.querySelector('.scroll-container');

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
      if (navLinks) navLinks.classList.remove('active');

      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement && scrollContainer) {
        const headerOffset = 60; // Approx nav height
        const containerTop = scrollContainer.getBoundingClientRect().top;
        const elementTop = targetElement.getBoundingClientRect().top;
        const offsetPosition = scrollContainer.scrollTop + (elementTop - containerTop) - headerOffset;

        scrollContainer.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });

        // Update active link immediately on click
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        this.classList.add('active');
      }
    });
  });

  // Navbar Floating Effect - using scroll container
  const navbar = document.querySelector('.navbar');
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', () => {
      if (scrollContainer.scrollTop > 50) {
        navbar.classList.add('floating');
      } else {
        navbar.classList.remove('floating');
      }
    });
  }

  // Intersection Observer for Animations AND Active Nav Link
  const observerOptions = {
    root: scrollContainer, // Use the scroll container as root
    threshold: 0.3,
    rootMargin: '-60px 0px 0px 0px' // Account for navbar height
  };


  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

        // Update active nav link
        const sectionId = entry.target.getAttribute('id');
        if (sectionId) {
          document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
              link.classList.add('active');
            }
          });
        }
      }
    });
  }, observerOptions);

  document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
  });

  // ========== CUSTOM SNAP SCROLL ==========
  const sections = document.querySelectorAll('.section');
  let currentIndex = 0;
  let isScrolling = false;
  let startY = 0;

  function scrollToSection(index) {
    if (index < 0 || index >= sections.length) return;

    isScrolling = true;
    currentIndex = index;

    sections[index].scrollIntoView({ behavior: 'smooth' });

    // Update active nav link
    const sectionId = sections[index].getAttribute('id');
    if (sectionId) {
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
          link.classList.add('active');
        }
      });
    }

    // Update navbar floating state
    if (navbar) {
      if (index > 0) {
        navbar.classList.add('floating');
      } else {
        navbar.classList.remove('floating');
      }
    }

    setTimeout(() => {
      isScrolling = false;
    }, 1000); // Delay to prevent rapid scrolling
  }

  // Wheel event for snap scroll
  if (scrollContainer) {
    scrollContainer.addEventListener('wheel', (e) => {
      if (isScrolling) return;
      e.preventDefault();

      if (e.deltaY > 0 && currentIndex < sections.length - 1) {
        scrollToSection(currentIndex + 1);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        scrollToSection(currentIndex - 1);
      }
    }, { passive: false });

    // Touch events for mobile snap scroll
    scrollContainer.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
    }, { passive: true });

    scrollContainer.addEventListener('touchend', (e) => {
      if (isScrolling) return;

      const endY = e.changedTouches[0].clientY;
      const diff = startY - endY;

      // Minimum swipe distance threshold
      if (Math.abs(diff) < 50) return;

      if (diff > 0 && currentIndex < sections.length - 1) {
        scrollToSection(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        scrollToSection(currentIndex - 1);
      }
    }, { passive: true });
  }

  // Update anchor click to also update currentIndex
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function () {
      const targetId = this.getAttribute('href').substring(1);
      sections.forEach((section, idx) => {
        if (section.getAttribute('id') === targetId) {
          currentIndex = idx;
        }
      });
    });
  });

  // Contact Form Submission
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending...';

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const response = await fetch('/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
          alert(result.message); // Could replace with custom toast
          contactForm.reset();
        } else {
          alert('Error: ' + result.message);
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('Failed to send message. Please try again.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }

  // Init Mentor Carousel if exists
  initMentorCarousel();
});

// FAQ Accordion
function toggleFaq(button) {
  const item = button.parentElement;
  const isActive = item.classList.contains('active');

  // Close all
  document.querySelectorAll('.faq-item').forEach(faq => {
    faq.classList.remove('active');
  });

  // Toggle clicked
  if (!isActive) {
    item.classList.add('active');
  }
}

function initMentorCarousel() {
  const carousel = document.getElementById('mentorCarousel');
  if (!carousel) return;

  const cards = carousel.querySelectorAll('.mentor-carousel-card');
  if (cards.length === 0) return;

  /* Fix: Stop page snap when scrolling carousel */
  // Vertical list logic: Just stop propagation so page doesn't snap.
  // Let default browser behavior handle vertical scrolling of the container.
  carousel.addEventListener('wheel', (e) => {
    e.stopPropagation();
  }, { passive: true });

  carousel.addEventListener('touchstart', (e) => {
    e.stopPropagation();
  }, { passive: true });

  carousel.addEventListener('touchmove', (e) => {
    e.stopPropagation();
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    e.stopPropagation();
  }, { passive: true });


  function updateActiveCard() {
    // Vertical scrolling logic - find card closest to vertical center
    const center = carousel.scrollTop + (carousel.offsetHeight / 2);
    let minDiff = Infinity;
    let targetCard = null;

    cards.forEach(card => {
      // Calculate card center relative to carousel content (vertical)
      const cardCenter = card.offsetTop + (card.offsetHeight / 2);
      const diff = Math.abs(center - cardCenter);

      if (diff < minDiff) {
        minDiff = diff;
        targetCard = card;
      }
    });

    cards.forEach(c => c.classList.remove('active'));
    if (targetCard) targetCard.classList.add('active');
  }


  carousel.addEventListener('scroll', updateActiveCard);

  // Initial call
  updateActiveCard();

  // Center the middle card initially if needed
  // setTimeout(() => {
  //   const middleIndex = Math.floor(cards.length / 2);
  //   const middleCard = cards[middleIndex];
  //   if(middleCard) {
  //      const scrollPos = middleCard.offsetLeft - (carousel.offsetWidth / 2) + (middleCard.offsetWidth / 2);
  //      carousel.scrollTo({ left: scrollPos, behavior: 'instant' }); 
  //   }
  // }, 100);
}

