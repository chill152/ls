/* ==========================================================================
   LỊCH SỬ VIỆT NAM QUA CÁC THỜI KỲ - JAVASCRIPT ENGINE
   GSAP 3, ScrollTrigger, Lenis Smooth Scroll & Web Audio API
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- GLOBAL STATE ---
  let erasData = [];
  let allGalleryItems = [];
  let currentModalImageIndex = 0;
  let lenis = null;
  let audioCtx = null;
  let isSoundOn = false;
  let activeEraIndex = 0;

  // --- 1. LENIS SMOOTH SCROLL & GSAP SETUP ---
  function initScrollEngine() {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // Khởi tạo Lenis Smooth Scroll
    lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.5,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  // --- 2. WEB AUDIO API SYNTHESIZER (TRỐNG ĐỒNG & AMBIENT) ---
  function initAudioEngine() {
    const audioBtn = document.getElementById('btn-audio-toggle');
    const soundOnIcon = audioBtn.querySelector('.icon-sound-on');
    const soundOffIcon = audioBtn.querySelector('.icon-sound-off');

    function playBronzeDrumSound() {
      if (!isSoundOn) return;
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      // Synthesize Bronze Drum Resonance Gong
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, audioCtx.currentTime); // Low gong fundamental
      osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 1.2);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.5);
    }

    audioBtn.addEventListener('click', () => {
      isSoundOn = !isSoundOn;
      soundOnIcon.classList.toggle('hidden', !isSoundOn);
      soundOffIcon.classList.toggle('hidden', isSoundOn);

      if (isSoundOn) {
        playBronzeDrumSound();
      }
    });

    return { playBronzeDrumSound };
  }

  const soundEngine = initAudioEngine();

  // --- 3. CANVAS BACKGROUND PARTICLES & FOG ENGINE ---
  function initCanvasBackground() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = Math.min(80, Math.floor(width / 20));

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.5 + 0.5,
        color: Math.random() > 0.3 ? '#D4AF37' : '#E60000',
        alpha: Math.random() * 0.6 + 0.1,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.6 - 0.2,
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Draw dust particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  // --- 4. DYNAMIC DATA LOADER & RENDER ENGINE ---
  async function loadHistoryData() {
    try {
      const response = await fetch('data/history_vietnam.json');
      erasData = await response.json();

      // Flat list of all gallery items for filter modal & search
      allGalleryItems = [];
      erasData.forEach((era) => {
        if (era.gallery && Array.isArray(era.gallery)) {
          era.gallery.forEach((item) => {
            allGalleryItems.push({
              ...item,
              eraId: era.id,
              eraTitle: era.title,
              period: era.period,
            });
          });
        }
      });

      renderSidebarTimeline(erasData);
      renderErasJourney(erasData);
      initScrollAnimations();
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu lịch sử:', err);
    }
  }

  // Render Sidebar Left Timeline Nodes
  function renderSidebarTimeline(eras) {
    const listContainer = document.getElementById('timeline-nodes-list');
    listContainer.innerHTML = '';

    eras.forEach((era, index) => {
      const li = document.createElement('li');
      li.className = `timeline-node-item ${index === 0 ? 'active' : ''}`;
      li.dataset.index = index;
      li.dataset.eraId = era.id;

      li.innerHTML = `
        <span class="node-dot"></span>
        <span class="node-label">${era.title} (${era.period})</span>
      `;

      li.addEventListener('click', () => {
        const targetElement = document.getElementById(`era-${era.id}`);
        if (targetElement && lenis) {
          lenis.scrollTo(targetElement, { offset: -40 });
          soundEngine.playBronzeDrumSound();
        }
      });

      listContainer.appendChild(li);
    });
  }

  // Render Eras Journey Slides
  function renderErasJourney(eras) {
    const container = document.getElementById('eras-container');
    container.innerHTML = '';

    eras.forEach((era) => {
      const slide = document.createElement('div');
      slide.className = 'era-slide';
      slide.id = `era-${era.id}`;
      slide.style.background = era.bgGradient || 'var(--bg-primary)';

      const keyEventsHTML = era.keyEvents
        ? era.keyEvents
            .map(
              (ev) => `
          <div class="event-card">
            <span class="event-year">${ev.year}</span>
            <div class="event-detail">
              <h4>${ev.title}</h4>
              <p>${ev.desc}</p>
            </div>
          </div>
        `
            )
            .join('')
        : '';

      const galleryCardsHTML = era.gallery
        ? era.gallery
            .map(
              (art) => `
          <div class="art-card" data-item-id="${art.id}">
            <img src="${art.image}" alt="${art.title}" class="art-card-img" loading="lazy">
            <div class="art-card-overlay">
              <span class="art-badge">${art.type || art.category}</span>
              <h3 class="art-title">${art.title}</h3>
            </div>
          </div>
        `
            )
            .join('')
        : '';

      slide.innerHTML = `
        <div class="era-bg-layer" style="background-image: url('${era.bgImage}');"></div>
        <div class="era-content-grid">
          <div class="era-text-box">
            <span class="era-period-pill">${era.period} • Đô: ${era.capital}</span>
            <h2 class="era-title">${era.title}</h2>
            <p class="era-subtitle">${era.subtitle}</p>
            <p class="era-desc">${era.description}</p>
            
            <div class="era-quote-box">
              <p class="quote-text">"${era.quote}"</p>
              <span class="quote-author">— ${era.quoteAuthor}</span>
            </div>

            <div class="key-events-list">
              ${keyEventsHTML}
            </div>
          </div>

          <div class="era-gallery-box">
            <h3 class="gallery-section-title">DI VẬT & BẮC BẠC THIÊNG LIÊNG</h3>
            <div class="gallery-cards-wrapper">
              ${galleryCardsHTML}
            </div>
          </div>
        </div>
      `;

      container.appendChild(slide);
    });

    // Attach click events for gallery cards
    document.querySelectorAll('.art-card').forEach((card) => {
      card.addEventListener('click', () => {
        const itemId = card.dataset.itemId;
        openImageDetailModal(itemId);
      });
    });
  }

  // --- 5. GSAP SCROLLTRIGGER ANIMATIONS (BI-DIRECTIONAL REVERSIBLE) ---
  function initScrollAnimations() {
    // Hero Title Reveal Animation
    gsap.from('#hero-title .line-1', {
      opacity: 0,
      y: 60,
      duration: 1.5,
      ease: 'power3.out',
    });
    gsap.from('#hero-title .line-2', {
      opacity: 0,
      y: 40,
      duration: 1.5,
      delay: 0.3,
      ease: 'power3.out',
    });
    gsap.from('.hero-subtitle', {
      opacity: 0,
      y: 30,
      duration: 1.2,
      delay: 0.6,
      ease: 'power3.out',
    });

    // Map Section Parallax Zoom
    gsap.from('#interactive-map-graphic', {
      scrollTrigger: {
        trigger: '#vietnam-map',
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 1,
      },
      scale: 0.85,
      rotation: -3,
      opacity: 0.7,
    });

    // Era Slides Scroll Animations & Timeline Node Active Sync
    erasData.forEach((era, idx) => {
      const slide = document.getElementById(`era-${era.id}`);
      if (!slide) return;

      const bgLayer = slide.querySelector('.era-bg-layer');
      const textBox = slide.querySelector('.era-text-box');
      const galleryBox = slide.querySelector('.era-gallery-box');

      // Parallax Background
      if (bgLayer) {
        gsap.fromTo(
          bgLayer,
          { y: '-15%' },
          {
            y: '15%',
            ease: 'none',
            scrollTrigger: {
              trigger: slide,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }

      // Reversible Fade & Scale Content Reveal
      gsap.from([textBox, galleryBox], {
        scrollTrigger: {
          trigger: slide,
          start: 'top 75%',
          end: 'top 25%',
          toggleActions: 'play reverse play reverse', // Reverses perfectly when scrolling up!
        },
        opacity: 0,
        y: 60,
        scale: 0.96,
        stagger: 0.2,
        duration: 1,
        ease: 'power3.out',
      });

      // Update Sidebar Timeline Node state
      ScrollTrigger.create({
        trigger: slide,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => updateActiveTimelineNode(idx),
        onEnterBack: () => updateActiveTimelineNode(idx),
      });
    });
  }

  function updateActiveTimelineNode(index) {
    activeEraIndex = index;
    const nodes = document.querySelectorAll('.timeline-node-item');
    nodes.forEach((node, i) => {
      node.classList.toggle('active', i === index);
    });

    // Update left progress bar height
    const progressBar = document.getElementById('timeline-progress-bar');
    if (progressBar && nodes.length > 1) {
      const progressPercent = (index / (nodes.length - 1)) * 100;
      progressBar.style.height = `${progressPercent}%`;
    }
  }

  // --- 6. MODAL SYSTEM ENGINE ---
  const imageDetailModal = document.getElementById('image-detail-modal');
  const galleryModal = document.getElementById('gallery-modal');
  const searchModal = document.getElementById('search-modal');

  // Zoom State for Image Viewer
  let currentZoom = 1;

  function openImageDetailModal(itemId) {
    const itemIndex = allGalleryItems.findIndex((x) => x.id === itemId);
    if (itemIndex === -1) return;

    currentModalImageIndex = itemIndex;
    renderModalImageContent(allGalleryItems[currentModalImageIndex]);

    if (imageDetailModal.showModal) {
      imageDetailModal.showModal();
    } else {
      imageDetailModal.setAttribute('open', 'true');
    }
    soundEngine.playBronzeDrumSound();
  }

  function renderModalImageContent(item) {
    currentZoom = 1;
    const modalImg = document.getElementById('detail-modal-img');
    modalImg.style.transform = `scale(${currentZoom})`;
    modalImg.src = item.image;
    modalImg.alt = item.title;

    document.getElementById('modal-era-badge').innerText = `${item.eraTitle} (${item.period})`;
    document.getElementById('modal-item-title').innerText = item.title;
    document.getElementById('modal-year').innerText = item.year || 'N/A';
    document.getElementById('modal-type').innerText = item.type || item.category;
    document.getElementById('modal-character').innerText = item.character || 'N/A';
    document.getElementById('modal-location').innerText = item.location || 'N/A';
    document.getElementById('modal-significance').innerText = item.significance || '';
    document.getElementById('modal-description').innerText = item.description || '';
    document.getElementById('modal-source').innerText = item.source || 'Bảo tàng Lịch sử Việt Nam';

    document.getElementById('modal-counter').innerText = `${currentModalImageIndex + 1} / ${allGalleryItems.length}`;
  }

  // Image Modal Controls
  document.getElementById('btn-close-detail').addEventListener('click', () => {
    imageDetailModal.close();
  });

  document.getElementById('btn-prev-img').addEventListener('click', () => {
    currentModalImageIndex = (currentModalImageIndex - 1 + allGalleryItems.length) % allGalleryItems.length;
    renderModalImageContent(allGalleryItems[currentModalImageIndex]);
  });

  document.getElementById('btn-next-img').addEventListener('click', () => {
    currentModalImageIndex = (currentModalImageIndex + 1) % allGalleryItems.length;
    renderModalImageContent(allGalleryItems[currentModalImageIndex]);
  });

  document.getElementById('btn-zoom-in').addEventListener('click', () => {
    currentZoom = Math.min(3, currentZoom + 0.3);
    document.getElementById('detail-modal-img').style.transform = `scale(${currentZoom})`;
  });

  document.getElementById('btn-zoom-out').addEventListener('click', () => {
    currentZoom = Math.max(0.8, currentZoom - 0.3);
    document.getElementById('detail-modal-img').style.transform = `scale(${currentZoom})`;
  });

  document.getElementById('btn-zoom-reset').addEventListener('click', () => {
    currentZoom = 1;
    document.getElementById('detail-modal-img').style.transform = `scale(1)`;
  });

  // --- 7. GALLERY FILTER MODAL ---
  document.getElementById('btn-open-gallery').addEventListener('click', () => {
    renderGalleryFilterGrid('all');
    galleryModal.showModal();
  });

  document.getElementById('btn-close-gallery').addEventListener('click', () => {
    galleryModal.close();
  });

  function renderGalleryFilterGrid(filter) {
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '';

    const filtered = filter === 'all'
      ? allGalleryItems
      : allGalleryItems.filter((x) => x.category === filter || x.type === filter);

    filtered.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'art-card';
      card.innerHTML = `
        <img src="${item.image}" alt="${item.title}" class="art-card-img" loading="lazy">
        <div class="art-card-overlay">
          <span class="art-badge">${item.eraTitle}</span>
          <h3 class="art-title">${item.title}</h3>
        </div>
      `;
      card.addEventListener('click', () => {
        galleryModal.close();
        openImageDetailModal(item.id);
      });
      grid.appendChild(card);
    });
  }

  // Filter Chip Event Handlers
  document.querySelectorAll('.filter-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      renderGalleryFilterGrid(chip.dataset.filter);
    });
  });

  // --- 8. INSTANT SEARCH ENGINE ---
  document.getElementById('btn-open-search').addEventListener('click', () => {
    searchModal.showModal();
    document.getElementById('search-input').focus();
  });

  document.getElementById('btn-close-search').addEventListener('click', () => {
    searchModal.close();
  });

  const searchInput = document.getElementById('search-input');
  const searchResultsList = document.getElementById('search-results-list');

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    searchResultsList.innerHTML = '';

    if (!query) return;

    const matchedGallery = allGalleryItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        (item.character && item.character.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        item.eraTitle.toLowerCase().includes(query)
    );

    matchedGallery.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'search-result-item';
      div.innerHTML = `
        <img src="${item.image}" alt="${item.title}" class="search-thumb">
        <div>
          <h4 style="color: var(--text-gold); font-size: 1rem;">${item.title}</h4>
          <p style="color: var(--text-secondary); font-size: 0.85rem;">${item.eraTitle} • ${item.year || ''}</p>
        </div>
      `;
      div.addEventListener('click', () => {
        searchModal.close();
        openImageDetailModal(item.id);
      });
      searchResultsList.appendChild(div);
    });
  });

  // --- 9. THEME SWITCHER (DARK / ANTIQUE PAPER LIGHT MODE) ---
  const themeBtn = document.getElementById('btn-theme-toggle');
  const moonIcon = themeBtn.querySelector('.icon-moon');
  const sunIcon = themeBtn.querySelector('.icon-sun');

  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('theme-light');
    const isLight = document.body.classList.contains('theme-light');
    moonIcon.classList.toggle('hidden', isLight);
    sunIcon.classList.toggle('hidden', !isLight);
  });

  // --- 10. KEYBOARD SHORTCUTS ---
  window.addEventListener('keydown', (e) => {
    if (imageDetailModal.open) {
      if (e.key === 'ArrowRight') document.getElementById('btn-next-img').click();
      if (e.key === 'ArrowLeft') document.getElementById('btn-prev-img').click();
    }
  });

  // --- INITIALIZE ALL ENGINES ---
  initScrollEngine();
  initCanvasBackground();
  loadHistoryData();
});
