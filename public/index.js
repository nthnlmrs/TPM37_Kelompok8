document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }

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
        const headerOffset = 60;
        const containerTop = scrollContainer.getBoundingClientRect().top;
        const elementTop = targetElement.getBoundingClientRect().top;
        const offsetPosition = scrollContainer.scrollTop + (elementTop - containerTop) - headerOffset;

        scrollContainer.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });

        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        this.classList.add('active');
      }
    });
  });

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

  const observerOptions = {
    root: scrollContainer,
    threshold: 0.3,
    rootMargin: '-60px 0px 0px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

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

  const sections = document.querySelectorAll('.section');
  let currentIndex = 0;
  let isScrolling = false;
  let startY = 0;

  function scrollToSection(index) {
    if (index < 0 || index >= sections.length) return;

    isScrolling = true;
    currentIndex = index;

    sections[index].scrollIntoView({ behavior: 'smooth' });

    const sectionId = sections[index].getAttribute('id');
    if (sectionId) {
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
          link.classList.add('active');
        }
      });
    }

    setTimeout(() => {
      isScrolling = false;
    }, 1000);
  }

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

    scrollContainer.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
    }, { passive: true });

    scrollContainer.addEventListener('touchend', (e) => {
      if (isScrolling) return;

      const endY = e.changedTouches[0].clientY;
      const diff = startY - endY;

      if (Math.abs(diff) < 50) return;

      if (diff > 0 && currentIndex < sections.length - 1) {
        scrollToSection(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        scrollToSection(currentIndex - 1);
      }
    }, { passive: true });
  }

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
          alert(result.message);
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

  initMentorCarousel();
});

function toggleFaq(button) {
  const item = button.parentElement;
  const isActive = item.classList.contains('active');

  document.querySelectorAll('.faq-item').forEach(faq => {
    faq.classList.remove('active');
  });

  if (!isActive) {
    item.classList.add('active');
  }
}

function initMentorCarousel() {
  const carousel = document.getElementById('mentorCarousel');
  if (!carousel) return;

  const cards = carousel.querySelectorAll('.mentor-carousel-card');
  if (cards.length === 0) return;

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
    const center = carousel.scrollTop + (carousel.offsetHeight / 2);
    let minDiff = Infinity;
    let targetCard = null;

    cards.forEach(card => {
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
  updateActiveCard();
}
