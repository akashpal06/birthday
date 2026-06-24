(function () {
  'use strict';

  const TOTAL_PAGES = 6;
  let currentPage = 0;
  let isTransitioning = false;

  const pages = document.querySelectorAll('.page');
  const progressFill = document.getElementById('progressFill');
  const progressDotsContainer = document.getElementById('progressDots');
  const navPrev = document.getElementById('navPrev');
  const navNext = document.getElementById('navNext');
  const musicBtn = document.getElementById('musicBtn');
  const bgMusic = document.getElementById('bgMusic');
  const smileBtn = document.getElementById('smileBtn');
  const missionPopup = document.getElementById('missionPopup');
  const quizForm = document.getElementById('quizForm');
  const submitSurpriseBtn = document.getElementById('submitSurpriseBtn');
  const successOverlay = document.getElementById('successOverlay');
  const errorOverlay = document.getElementById('errorOverlay');
  const retrySubmitBtn = document.getElementById('retrySubmitBtn');
  const extraNotes = document.getElementById('extraNotes');

  let formSubmitted = false;
  let isSending = false;
  const FINAL_PAGE_INDEX = 5;
  const HANGOUT_PAGE_INDEX = 4;

  /* ---- EmailJS ---- */
  function initEmailJS() {
    if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
      emailjs.init({ publicKey: EMAILJS_CONFIG.PUBLIC_KEY });
    }
  }

  function getFormValue(name) {
    const input = quizForm.querySelector(`[name="${name}"]`);
    if (!input) return '—';
    const value = input.value.trim();
    return value || '—';
  }

  function getSelectedTime() {
    const selected = document.querySelector('.time-chip.selected');
    return selected ? selected.dataset.value : '—';
  }

  function getSelectedActivities() {
    const selected = document.querySelectorAll('.activity-card.selected');
    if (!selected.length) return '—';
    return Array.from(selected).map((el) => el.dataset.value).join(', ');
  }

  function buildEmailMessage(data) {
    return [
      `Name: ${data.name}`,
      '',
      `Favourite food: ${data.fav_food}`,
      `Veg/Non Veg: ${data.food_type}`,
      `Tea/Coffee: ${data.tea_coffee}`,
      `Ice cream or Dessert: ${data.ice_dessert}`,
      `Music: ${data.music}`,
      `Movies/Series: ${data.movies_series}`,
      `Morning/Night: ${data.morning_night}`,
      `Rain/Winter: ${data.rain_winter}`,
      `Mountains/Beaches: ${data.mountains_beaches}`,
      `What makes her happy: ${data.happy_thing}`,
      `Preferred time: ${data.preferred_time}`,
      `Preferred outing: ${data.preferred_outing}`,
      `Extra note: ${data.extra_note}`
    ].join('\n');
  }

  function collectResponses() {
    const extraNoteValue = extraNotes.value.trim() || '—';

    return {
      name: 'Aruhi',
      to_email: EMAILJS_CONFIG.TO_EMAIL,
      subject: EMAILJS_CONFIG.SUBJECT,
      fav_food: getFormValue('fav_food'),
      food_type: getFormValue('food_type'),
      tea_coffee: getFormValue('tea_coffee'),
      ice_dessert: getFormValue('ice_dessert'),
      music: getFormValue('music'),
      movies_series: getFormValue('movies_series'),
      morning_night: getFormValue('morning_night'),
      rain_winter: getFormValue('rain_winter'),
      mountains_beaches: getFormValue('mountains_beaches'),
      happy_thing: getFormValue('happy_thing'),
      preferred_time: getSelectedTime(),
      preferred_outing: getSelectedActivities(),
      extra_note: extraNoteValue,
      message: ''
    };
  }

  function syncHiddenForm(data) {
    document.getElementById('field_to_email').value = data.to_email;
    document.getElementById('field_subject').value = data.subject;
    document.getElementById('field_fav_food').value = data.fav_food;
    document.getElementById('field_food_type').value = data.food_type;
    document.getElementById('field_tea_coffee').value = data.tea_coffee;
    document.getElementById('field_ice_dessert').value = data.ice_dessert;
    document.getElementById('field_music').value = data.music;
    document.getElementById('field_movies_series').value = data.movies_series;
    document.getElementById('field_morning_night').value = data.morning_night;
    document.getElementById('field_rain_winter').value = data.rain_winter;
    document.getElementById('field_mountains_beaches').value = data.mountains_beaches;
    document.getElementById('field_happy_thing').value = data.happy_thing;
    document.getElementById('field_preferred_time').value = data.preferred_time;
    document.getElementById('field_preferred_outing').value = data.preferred_outing;
    document.getElementById('field_extra_note').value = data.extra_note;
    document.getElementById('field_message').value = data.message;
  }

  function setSubmitLoading(loading) {
    isSending = loading;
    submitSurpriseBtn.disabled = loading;
    submitSurpriseBtn.classList.toggle('is-loading', loading);
    submitSurpriseBtn.querySelector('.submit-btn-text').classList.toggle('hidden', loading);
    submitSurpriseBtn.querySelector('.submit-btn-loading').classList.toggle('hidden', !loading);
  }

  function showOverlay(overlay) {
    overlay.classList.remove('hidden');
  }

  function hideOverlay(overlay) {
    overlay.classList.add('hidden');
  }

  async function sendResponses() {
    if (isSending || formSubmitted) return;

    if (EMAILJS_CONFIG.PUBLIC_KEY === 'YOUR_PUBLIC_KEY' ||
        EMAILJS_CONFIG.SERVICE_ID === 'YOUR_SERVICE_ID' ||
        EMAILJS_CONFIG.TEMPLATE_ID === 'YOUR_TEMPLATE_ID') {
      console.error('EmailJS is not configured. Update js/email-config.js');
      showOverlay(errorOverlay);
      return;
    }

    setSubmitLoading(true);

    const data = collectResponses();
    data.message = buildEmailMessage(data);
    syncHiddenForm(data);

    try {
      await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, data);
      formSubmitted = true;
      setSubmitLoading(false);
      launchConfetti();
      showOverlay(successOverlay);

      submitSurpriseBtn.classList.add('submitted');
      submitSurpriseBtn.querySelector('.submit-btn-text').textContent = '✨ Submitted Successfully';

      setTimeout(() => {
        hideOverlay(successOverlay);
        goToPage(FINAL_PAGE_INDEX);
      }, 2800);
    } catch (err) {
      console.error('EmailJS error:', err);
      setSubmitLoading(false);
      showOverlay(errorOverlay);
    }
  }

  submitSurpriseBtn.addEventListener('click', sendResponses);
  retrySubmitBtn.addEventListener('click', () => {
    hideOverlay(errorOverlay);
    sendResponses();
  });

  function canNavigateTo(index) {
    if (index === FINAL_PAGE_INDEX && !formSubmitted) return false;
    return true;
  }

  /* ---- Init Progress Dots ---- */
  function initProgressDots() {
    for (let i = 0; i < TOTAL_PAGES; i++) {
      const dot = document.createElement('button');
      dot.className = 'progress-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to page ${i + 1}`);
      dot.addEventListener('click', () => {
        if (canNavigateTo(i)) goToPage(i);
      });
      progressDotsContainer.appendChild(dot);
    }
  }

  function updateProgress() {
    const progress = ((currentPage + 1) / TOTAL_PAGES) * 100;
    progressFill.style.width = progress + '%';

    const dots = progressDotsContainer.querySelectorAll('.progress-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentPage);
      dot.classList.toggle('completed', i < currentPage);
      dot.classList.toggle('locked', i === FINAL_PAGE_INDEX && !formSubmitted);
    });

    navPrev.classList.toggle('hidden', currentPage === 0);
    navNext.classList.toggle('hidden', currentPage === TOTAL_PAGES - 1 || currentPage === HANGOUT_PAGE_INDEX);

    const navText = navNext.querySelector('.nav-next-text');
    navText.textContent = currentPage === TOTAL_PAGES - 1 ? '' : 'Continue';
  }

  /* ---- Page Navigation ---- */
  function goToPage(index) {
    if (!canNavigateTo(index)) return;
    if (isTransitioning || index === currentPage || index < 0 || index >= TOTAL_PAGES) return;
    isTransitioning = true;

    const current = pages[currentPage];
    const next = pages[index];

    current.classList.add('page-exiting');
    current.classList.remove('page-active');

    setTimeout(() => {
      current.classList.remove('page-exiting');
      next.classList.add('page-active');
      next.scrollTop = 0;
      currentPage = index;
      updateProgress();
      isTransitioning = false;

      if (index === 2) animateTraitCards();
    }, 400);
  }

  function nextPage() {
    if (currentPage < TOTAL_PAGES - 1) {
      const nextIndex = currentPage + 1;
      if (canNavigateTo(nextIndex)) goToPage(nextIndex);
    }
  }

  function prevPage() {
    if (currentPage > 0) goToPage(currentPage - 1);
  }

  navNext.addEventListener('click', nextPage);
  navPrev.addEventListener('click', prevPage);

  /* ---- Swipe Navigation ---- */
  let touchStartY = 0;
  let touchStartX = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const deltaY = touchStartY - e.changedTouches[0].clientY;
    const deltaX = Math.abs(touchStartX - e.changedTouches[0].clientX);

    if (deltaX > 50) return;

    const activePage = pages[currentPage];
    const atBottom = activePage.scrollHeight - activePage.scrollTop <= activePage.clientHeight + 10;
    const atTop = activePage.scrollTop <= 10;

    if (deltaY > 60 && atBottom) nextPage();
    else if (deltaY < -60 && atTop) prevPage();
  }, { passive: true });

  /* ---- Keyboard Navigation ---- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') nextPage();
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') prevPage();
  });

  /* ---- Ambient Elements ---- */
  function createStars() {
    const container = document.getElementById('stars');
    for (let i = 0; i < 40; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.animationDelay = Math.random() * 3 + 's';
      star.style.width = star.style.height = (Math.random() * 3 + 2) + 'px';
      container.appendChild(star);
    }
  }

  function createPetals() {
    const container = document.getElementById('petals');
    for (let i = 0; i < 12; i++) {
      const petal = document.createElement('div');
      petal.className = 'petal';
      petal.style.left = Math.random() * 100 + '%';
      petal.style.animationDuration = (Math.random() * 8 + 10) + 's';
      petal.style.animationDelay = Math.random() * 10 + 's';
      petal.style.width = petal.style.height = (Math.random() * 8 + 8) + 'px';
      container.appendChild(petal);
    }
  }

  function createButterflies() {
    const container = document.getElementById('butterflies');
    const positions = [
      { top: '15%', left: '8%' },
      { top: '45%', right: '10%' },
      { top: '70%', left: '15%' },
      { top: '30%', right: '20%' }
    ];
    positions.forEach((pos, i) => {
      const bf = document.createElement('div');
      bf.className = 'butterfly';
      bf.textContent = '🦋';
      Object.assign(bf.style, pos);
      bf.style.animationDelay = (i * 2) + 's';
      container.appendChild(bf);
    });
  }

  function createBalloons() {
    const container = document.getElementById('balloons');
    const colors = ['#f48fb1', '#ce93d8', '#ffccbc', '#f5e6a3', '#e1bee7'];
    for (let i = 0; i < 6; i++) {
      const balloon = document.createElement('div');
      balloon.className = 'balloon';
      balloon.style.background = colors[i % colors.length];
      balloon.style.left = (10 + i * 15) + '%';
      balloon.style.bottom = (5 + Math.random() * 15) + '%';
      balloon.style.animationDelay = (i * 0.8) + 's';
      balloon.style.animationDuration = (5 + Math.random() * 3) + 's';
      container.appendChild(balloon);
    }
  }

  /* ---- Trait Cards Animation ---- */
  function animateTraitCards() {
    const cards = document.querySelectorAll('.trait-card');
    cards.forEach((card, i) => {
      card.style.animation = 'none';
      card.offsetHeight;
      card.style.animation = '';
    });
  }

  /* ---- Quiz Chip Selection ---- */
  document.querySelectorAll('.quiz-item').forEach((item) => {
    const chips = item.querySelectorAll('.chip');
    const hiddenInput = item.querySelector('input[type="hidden"]');
    if (!chips.length || !hiddenInput) return;

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.remove('selected'));
        chip.classList.add('selected');
        hiddenInput.value = chip.dataset.value;
        chip.closest('.quiz-item').classList.add('answered');
      });
    });
  });

  /* ---- Hangout Selection (multi-select for activities) ---- */
  document.querySelectorAll('.time-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.time-chip').forEach((c) => c.classList.remove('selected'));
      chip.classList.add('selected');
    });
  });

  document.querySelectorAll('.activity-card').forEach((card) => {
    card.addEventListener('click', () => {
      card.classList.toggle('selected');
    });
  });

  /* ---- Music Toggle ---- */
  let musicPlaying = false;

  musicBtn.addEventListener('click', async () => {
    try {
      if (musicPlaying) {
        bgMusic.pause();
        musicPlaying = false;
        musicBtn.classList.remove('playing');
        musicBtn.querySelector('.music-off').classList.remove('hidden');
        musicBtn.querySelector('.music-on').classList.add('hidden');
      } else {
        await bgMusic.play();
        musicPlaying = true;
        musicBtn.classList.add('playing');
        musicBtn.querySelector('.music-off').classList.add('hidden');
        musicBtn.querySelector('.music-on').classList.remove('hidden');
      }
    } catch (err) {
      console.log(err);
      alert(JSON.stringify(err));
      setSubmitLoading(false);
      showOverlay(errorOverlay);
    }
  });

  /* ---- Smile Button ---- */
  smileBtn.addEventListener('click', () => {
    smileBtn.classList.add('clicked');
    smileBtn.querySelector('.smile-btn-text').textContent = '💫 Thank you!';
    missionPopup.classList.remove('hidden');
    launchConfetti();

    setTimeout(() => {
      missionPopup.classList.add('hidden');
    }, 3500);
  });

  function launchConfetti() {
    const colors = ['#f48fb1', '#ce93d8', '#ffccbc', '#f5e6a3', '#e1bee7'];
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
          position: fixed;
          width: ${Math.random() * 10 + 6}px;
          height: ${Math.random() * 10 + 6}px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          left: ${Math.random() * 100}vw;
          top: -10px;
          border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
          z-index: 300;
          pointer-events: none;
          animation: confettiFall ${Math.random() * 2 + 2}s linear forwards;
        `;
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 4000);
      }, i * 30);
    }
  }

  const confettiStyle = document.createElement('style');
  confettiStyle.textContent = `
    @keyframes confettiFall {
      to {
        transform: translateY(110vh) rotate(${Math.random() * 720}deg);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(confettiStyle);

  /* ---- Parallax on scroll ---- */
  pages.forEach((page) => {
    page.addEventListener('scroll', () => {
      const scrollRatio = page.scrollTop / (page.scrollHeight - page.clientHeight || 1);
      const ambient = document.querySelector('.ambient');
      if (ambient) {
        ambient.style.transform = `translateY(${scrollRatio * -20}px)`;
      }
    }, { passive: true });
  });

  /* ---- Init ---- */
  initEmailJS();
  initProgressDots();
  updateProgress();
  createStars();
  createPetals();
  createButterflies();
  createBalloons();
})();
