// .test/e2e_verify.js
// Runs end-to-end verification of the actual game scripts inside macOS WebKit JavaScriptCore (jsc)

const timers = [];
let nextTimerId = 1;

globalThis.window = globalThis;
globalThis.performance = { now: () => Date.now() };
globalThis.requestAnimationFrame = function () { return 0; };
globalThis.setInterval = function () { return 0; };
globalThis.clearInterval = function () {};
globalThis.clearTimeout = function () {};

globalThis.setTimeout = function (fn, delay) {
  const id = nextTimerId++;
  timers.push({ id, fn, delay });
  return id;
};

function flushTimers() {
  while (timers.length > 0) {
    const batch = timers.splice(0, timers.length);
    for (const t of batch) {
      t.fn();
    }
  }
}

const rawStorageBacking = {};
globalThis.localStorage = {
  getItem(k) { return Object.prototype.hasOwnProperty.call(rawStorageBacking, k) ? rawStorageBacking[k] : null; },
  setItem(k, v) { rawStorageBacking[k] = String(v); },
  removeItem(k) { delete rawStorageBacking[k]; }
};

class MockClassList {
  constructor(el, initial = []) {
    this.el = el;
    this.set = new Set(initial);
  }
  add(...cls) { cls.forEach(c => { if (c) this.set.add(c); }); }
  remove(...cls) { cls.forEach(c => this.set.delete(c)); }
  contains(c) { return this.set.has(c); }
  toggle(c, force) {
    if (force === undefined) {
      if (this.set.has(c)) { this.set.delete(c); return false; }
      this.set.add(c); return true;
    }
    if (force) this.set.add(c); else this.set.delete(c);
    return Boolean(force);
  }
  toString() { return Array.from(this.set).join(' '); }
}

class MockElement {
  constructor(tag, id = '', classes = []) {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this._classList = new MockClassList(this, classes);
    this.attrs = {};
    this.style = {};
    this.children = [];
    this.listeners = {};
    this.textContent = '';
    this.value = '';
    this._innerHTML = '';
    this.disabled = false;
    this.width = 960;
    this.height = 540;
  }
  get className() { return this._classList.toString(); }
  set className(val) {
    this._classList = new MockClassList(this, String(val).trim().split(/\s+/).filter(Boolean));
  }
  get classList() { return this._classList; }
  get innerHTML() { return this._innerHTML; }
  set innerHTML(val) {
    this._innerHTML = val;
    if (val === '') this.children = [];
  }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] || null; }
  appendChild(child) {
    if (child && child.isFragment) {
      this.children.push(...child.children);
    } else {
      this.children.push(child);
    }
    return child;
  }
  focus() {}
  addEventListener(type, fn) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(fn);
  }
  dispatchEvent(type, eventObj = {}) {
    const list = this.listeners[type] || [];
    for (const fn of list) {
      fn({
        target: this,
        stopPropagation() {},
        preventDefault() {},
        ...eventObj
      });
    }
  }
  click() {
    if (this.disabled) return;
    this.dispatchEvent('click', {});
  }
  getBoundingClientRect() {
    return { left: 0, top: 0, width: 960, height: 540 };
  }
  getContext() {
    return {
      setTransform() {},
      createLinearGradient() { return { addColorStop() {} }; },
      createRadialGradient() { return { addColorStop() {} }; },
      fillRect() {},
      strokeRect() {},
      save() {},
      restore() {},
      beginPath() {},
      moveTo() {},
      lineTo() {},
      bezierCurveTo() {},
      quadraticCurveTo() {},
      closePath() {},
      stroke() {},
      fill() {},
      ellipse() {},
      arc() {},
      roundRect() {},
      translate() {},
      scale() {},
      rotate() {},
      setLineDash() {},
      fillText() {},
      strokeText() {},
      clip() {},
      drawImage() {},
      measureText(t) { return { width: String(t).length * 10 }; }
    };
  }
}

const elementsById = {};
const allScreens = [];
const regionCards = [];
const dexFilterBtns = [];
const modalOverlays = [];
const timeLimitBtns = [];
const heartLimitBtns = [];
const avatarCards = [];
const hatChipBtns = [];
const profileStepTabs = [];
const teamPresetBtns = [];

function registerEl(id, tag = 'div', classes = []) {
  const el = new MockElement(tag, id, classes);
  if (id) elementsById[id] = el;
  return el;
}

[
  'btn-home', 'btn-change-region', 'current-place-badge',
  'btn-header-limit-info', 'header-time-text', 'btn-header-heart-info', 'header-daily-heart-text',
  'btn-open-pokedex', 'header-pokedex-count',
  'btn-sound-toggle', 'sound-icon', 'sound-text', 'btn-open-admin',
  'title-subtitle-text', 'title-greeting-box', 'title-moving-avatar', 'title-avatar-hat', 'title-avatar-photo',
  'title-avatar-icon', 'title-avatar-body', 'title-team-badge', 'title-greeting-msg', 'btn-edit-profile',
  'btn-start-game', 'btn-title-pokedex', 'title-pokedex-ratio',
  'region-section-title', 'region-stat-forest', 'region-stat-city', 'region-stat-desert', 'region-stat-sea',
  'btn-respawn-balls', 'canvas-wrap', 'field-canvas',
  'battle-hearts', 'battle-daily-heart-badge', 'battle-ball-type-badge', 'battle-step-indicator',
  'battle-stage', 'stage-aura', 'mystery-marks', 'pokemon-figure-wrap',
  'battle-pokemon-img', 'battle-pokemon-fallback', 'capture-ball', 'capture-stars',
  'pokemon-reveal-banner', 'reveal-dex-no', 'reveal-pokemon-name', 'reveal-legendary-tag', 'reveal-pokemon-types',
  'battle-quiz-panel', 'quiz-category-badge', 'quiz-progress-text', 'quiz-question-box',
  'quiz-feedback-banner', 'quiz-options-grid',
  'english-story-card', 'story-scene-emojis', 'story-sentence-en', 'story-sentence-ko', 'btn-story-replay', 'btn-story-next',
  'battle-result-actions',
  'btn-back-to-field', 'btn-battle-open-pokedex',
  'modal-pokedex', 'pokedex-modal-title', 'pokedex-summary-text', 'btn-close-pokedex',
  'dex-count-all', 'dex-count-caught', 'dex-count-legendary', 'btn-dex-peek-all', 'pokedex-grid',
  'modal-daily-limit', 'limit-modal-icon', 'limit-modal-title', 'limit-modal-desc',
  'btn-limit-open-pokedex', 'btn-limit-open-admin',
  'modal-admin', 'admin-modal-title', 'btn-close-admin',
  'admin-gate-view', 'admin-gate-badge', 'admin-gate-desc', 'admin-password-input', 'btn-admin-password-submit', 'admin-gate-error',
  'admin-panel-view', 'admin-time-status', 'admin-time-choices', 'btn-admin-refill-time',
  'admin-heart-status', 'admin-heart-choices', 'btn-admin-refill-hearts',
  'admin-new-password-input', 'btn-admin-change-password',
  'btn-admin-reset-all', 'admin-reset-confirm-box', 'btn-admin-confirm-reset-yes', 'btn-admin-confirm-reset-no',
  'admin-toast',
  'modal-profile', 'profile-modal-title', 'btn-close-profile', 'profile-wizard-tabs',
  'profile-live-figure', 'profile-live-hat', 'profile-live-photo', 'profile-live-emoji', 'profile-live-body',
  'profile-step-1', 'profile-step-2', 'profile-step-3',
  'profile-photo-input', 'profile-camera-input', 'btn-take-camera', 'btn-upload-photo', 'btn-clear-photo',
  'webcam-capture-box', 'webcam-video', 'btn-webcam-snap', 'btn-webcam-cancel',
  'photo-adjust-box', 'photo-zoom-range', 'photo-offset-range',
  'avatar-select-grid', 'hat-select-row',
  'profile-player-name', 'profile-team-name', 'profile-preview-greeting',
  'btn-profile-prev-step', 'btn-profile-next-step', 'btn-save-profile'
].forEach(id => registerEl(id));

['screen-title', 'screen-region', 'screen-field', 'screen-battle'].forEach((id, i) => {
  const s = registerEl(id, 'section', i === 0 ? ['screen', 'active'] : ['screen']);
  allScreens.push(s);
});

['forest', 'city', 'desert', 'sea'].forEach(r => {
  const c = new MockElement('button', '', ['region-card', `region-${r}`]);
  c.setAttribute('data-region', r);
  regionCards.push(c);
});

['all', 'caught', 'legendary'].forEach((f, i) => {
  const b = new MockElement('button', '', i === 0 ? ['filter-btn', 'active'] : ['filter-btn']);
  b.setAttribute('data-dex-filter', f);
  dexFilterBtns.push(b);
});

[10, 15, 20, 30, 45, 60, 0].forEach(m => {
  const b = new MockElement('button', '', ['admin-choice-btn']);
  b.setAttribute('data-time-limit', String(m));
  timeLimitBtns.push(b);
});

[5, 10, 15, 20, 30, 0].forEach(h => {
  const b = new MockElement('button', '', ['admin-choice-btn']);
  b.setAttribute('data-heart-limit', String(h));
  heartLimitBtns.push(b);
});

['red', 'pikachu', 'misty', 'crown', 'goggle', 'photo'].forEach((av, i) => {
  const c = new MockElement('button', '', i === 0 ? ['avatar-card', 'active'] : ['avatar-card']);
  c.setAttribute('data-avatar', av);
  avatarCards.push(c);
});

['cap', 'pika', 'crown', 'goggle', 'none'].forEach((hat, i) => {
  const h = new MockElement('button', '', i === 0 ? ['hat-chip-btn', 'active'] : ['hat-chip-btn']);
  h.setAttribute('data-hat', hat);
  hatChipBtns.push(h);
});

[1, 2, 3].forEach((stepNum, i) => {
  const t = new MockElement('button', '', i === 0 ? ['wizard-tab-btn', 'active'] : ['wizard-tab-btn']);
  t.setAttribute('data-profile-step', String(stepNum));
  profileStepTabs.push(t);
});

['⚡ 번개 탐험대', '🌟 별빛 탐험대', '🔥 불꽃 탐험대', '🌈 무지개 탐험대'].forEach(preset => {
  const b = new MockElement('button', '', ['team-preset-btn']);
  b.setAttribute('data-team-preset', preset);
  teamPresetBtns.push(b);
});

[
  'modal-pokedex', 'modal-daily-limit', 'modal-admin', 'modal-profile'
].forEach(id => {
  elementsById[id].classList.add('modal-overlay', 'hidden');
  modalOverlays.push(elementsById[id]);
});

const windowListeners = {};
globalThis.addEventListener = function (type, fn) {
  if (!windowListeners[type]) windowListeners[type] = [];
  windowListeners[type].push(fn);
};

globalThis.document = {
  hidden: false,
  activeElement: null,
  getElementById(id) { return elementsById[id] || null; },
  createElement(tag) { return new MockElement(tag); },
  createDocumentFragment() { return { isFragment: true, children: [], appendChild(c) { this.children.push(c); } }; },
  querySelector(sel) {
    if (sel === '[data-avatar].active') {
      return avatarCards.find(c => c.classList.contains('active')) || null;
    }
    if (sel === '[data-hat].active') {
      return hatChipBtns.find(h => h.classList.contains('active')) || null;
    }
    return null;
  },
  querySelectorAll(sel) {
    if (sel === '.screen') return allScreens;
    if (sel === '.region-card') return regionCards;
    if (sel === '[data-dex-filter]') return dexFilterBtns;
    if (sel === '.modal-overlay') return modalOverlays;
    if (sel === '#quiz-options-grid .quiz-option-btn') return elementsById['quiz-options-grid'].children;
    if (sel === '[data-time-limit]') return timeLimitBtns;
    if (sel === '[data-heart-limit]') return heartLimitBtns;
    if (sel === '[data-avatar]') return avatarCards;
    if (sel === '[data-hat]') return hatChipBtns;
    if (sel === '[data-profile-step]') return profileStepTabs;
    if (sel === '[data-team-preset]') return teamPresetBtns;
    return [];
  }
};

load('data/pokemon.js');
load('data/questions.js');
load('js/sound.js');
load('js/storage.js');
load('js/game.js');

(windowListeners['DOMContentLoaded'] || []).forEach(fn => fn());

function assert(cond, msg) {
  if (!cond) {
    print('[FAIL] ' + msg);
    quit(1);
  }
  print('[PASS] ' + msg);
}

const app = window.PokemonGame;
assert(Boolean(app), 'PokemonQuizGame instance created on DOMContentLoaded');

// 1. Check Attendance Stamps Removed
assert(window.GameStorage.getStamps === undefined, 'Attendance stamp logic removed from GameStorage');

// 2. Check Initial 3-Step Tutorial & Moving Face Avatar Setup Wizard + Editing Profile via #btn-edit-profile
assert(app.currentScreen === 'title', 'Initial screen is Title (#screen-title)');
assert(!elementsById['modal-profile'].classList.contains('hidden'), 'First visit automatically opens 3-Step Tutorial & Character Setup modal (#modal-profile)');
assert(app.profileStep === 1, 'Wizard starts at Step 1 (얼굴 · 캐릭터 꾸미기)');
assert(elementsById['profile-step-1'].classList.contains('active'), 'Step 1 pane (#profile-step-1) is active');

// Test stepping through Wizard: Step 1 -> Step 2 -> Step 3
elementsById['btn-profile-next-step'].click();
assert(app.profileStep === 2, 'Clicking Next advances wizard to Step 2 (이름 · 탐험대 등록)');
assert(elementsById['profile-step-2'].classList.contains('active'), 'Step 2 pane (#profile-step-2) is active');

elementsById['profile-player-name'].value = '민준';
elementsById['profile-team-name'].value = '🌟 별빛 탐험대';

elementsById['btn-profile-next-step'].click();
assert(app.profileStep === 3, 'Clicking Next advances wizard to Step 3 (모험 방법 튜토리얼)');
assert(elementsById['profile-step-3'].classList.contains('active'), 'Step 3 pane (#profile-step-3) is active');

elementsById['btn-save-profile'].click();
assert(elementsById['modal-profile'].classList.contains('hidden'), 'Saving profile closes #modal-profile');
assert(elementsById['title-greeting-msg'].textContent.indexOf('민준아 안녕?') !== -1, 'Title greeting uses natural Korean particle ("민준아 안녕?")');
assert(elementsById['title-team-badge'].textContent === '🌟 별빛 탐험대', 'Title badge shows custom team name ("🌟 별빛 탐험대")');

// Test Bug #1 Fix + Photo Face & Hat Customization: Clicking #btn-edit-profile reopens #modal-profile and saves custom photo + hat!
elementsById['btn-edit-profile'].click();
assert(!elementsById['modal-profile'].classList.contains('hidden'), 'Clicking #btn-edit-profile opens #modal-profile immediately');
elementsById['profile-player-name'].value = '시우';
avatarCards[5].click(); // 'photo' (내 얼굴 사진 대장)
hatChipBtns[2].click(); // 'crown' (👑 황금 왕관)
app.draftPhotoDataUrl = 'data:image/jpeg;base64,FAKE_CHILD_FACE_PHOTO_BASE64';
app.updateProfilePreviewText();
assert(!elementsById['profile-live-photo'].classList.contains('hidden'), 'Uploading child face photo displays live moving face photo in modal preview');
teamPresetBtns[2].click(); // 🔥 불꽃 탐험대
elementsById['btn-save-profile'].click();
assert(elementsById['modal-profile'].classList.contains('hidden'), 'Saving updated profile closes #modal-profile');
assert(elementsById['title-greeting-msg'].textContent.indexOf('시우야 안녕?') !== -1, 'Updated name reflected on Title screen ("시우야 안녕?")');
assert(elementsById['title-team-badge'].textContent === '🔥 불꽃 탐험대', 'Updated team reflected on Title screen ("🔥 불꽃 탐험대")');
assert(window.GameStorage.getProfile().hatStyle === 'crown', 'Selected hat style ("crown") is persisted in GameStorage');
assert(window.GameStorage.getProfile().photoDataUrl === 'data:image/jpeg;base64,FAKE_CHILD_FACE_PHOTO_BASE64', 'Uploaded child face photo data URL is persisted in GameStorage');
assert(!elementsById['title-avatar-photo'].classList.contains('hidden'), 'Title screen moving avatar displays child face photo');

// 3. Test Timer Start Behavior: Does NOT count on Title screen before clicking Start, DOES count after clicking Start!
assert(window.GameStorage.getDailyStatus().isJourneyStarted === false, 'Before clicking Start, isJourneyStarted is false');
assert(elementsById['btn-start-game'].textContent.indexOf('오늘 여행 시작하기') !== -1, 'Start button shows "🚀 오늘 여행 시작하기!" before starting');
app.tickDailyTimer();
app.tickDailyTimer();
app.tickDailyTimer();
assert(window.GameStorage.getDailyStatus().usedSeconds === 0, 'Timer does NOT count down while waiting on Title screen before clicking Start');
assert(elementsById['header-time-text'].textContent.indexOf('대기중') !== -1, 'Header time pill indicates waiting state ("30:00 (대기중)")');

// Now click "🚀 오늘 여행 시작하기!"
elementsById['btn-start-game'].click();
assert(app.currentScreen === 'region', 'Clicking #btn-start-game transitions to Region Select screen');
assert(window.GameStorage.getDailyStatus().isJourneyStarted === true, 'Clicking #btn-start-game marks today journey as started in localStorage');
app.tickDailyTimer();
app.tickDailyTimer();
assert(window.GameStorage.getDailyStatus().usedSeconds === 2, 'After clicking #btn-start-game, timer counts down normally (2s elapsed)');

// 4. Navigate Region -> Field -> Normal Battle -> Catch
regionCards[0].click(); // forest
const normalBall = app.balls.find(b => !b.isGold);
normalBall.vx = 0; normalBall.vy = 0; normalBall.x = 220; normalBall.y = 220;
app.balls.forEach(b => { if (b !== normalBall) { b.x = 820; b.y = 500; b.vx = 0; b.vy = 0; } });
elementsById['field-canvas'].dispatchEvent('pointerdown', { clientX: 220, clientY: 220 });
for (let step = 0; step < 120 && app.currentScreen === 'field'; step++) {
  app.updateField(0.03);
}
assert(app.currentScreen === 'battle', 'Walking into rolling Pokéball starts Battle screen');

const silAnswer = app.battle.pokemon.name;
elementsById['quiz-options-grid'].children.find(b => b.getAttribute('data-option') === silAnswer).click();
flushTimers();

// Force Question 1 to be an English question ("TWO") to test the English TTS speaker button, letter-by-letter spelling, AND the new Caillou-style Bilingual Story Sentence Card!
app.battle.questions[0] = {
  category: 'english',
  q: "2️⃣ 숫자 '2(둘)'를 영어로 무엇이라고 할까요?",
  options: ['ONE', 'TWO', 'THREE', 'FOUR'],
  answer: 'TWO'
};
app.renderCurrentBattleQuestion();

const twoOptionBtn = elementsById['quiz-options-grid'].children.find(
  b => b.getAttribute('data-option') === 'TWO'
);
const twoSpeakBtn = twoOptionBtn.children.find(
  c => c.classList && c.classList.contains('eng-speak-btn')
);
assert(Boolean(twoSpeakBtn), 'English option button renders 🔊 발음 button (.eng-speak-btn)');
assert(
  window.EnglishTTS.getKoreanLetterGuide('BLACK') === 'B(비) · L(엘) · A(에이) · C(씨) · K(케이)',
  'EnglishTTS Korean letter guide for BLACK is "B(비) · L(엘) · A(에이) · C(씨) · K(케이)"'
);

const heartsBeforeSpeak = app.battle.hearts;
twoSpeakBtn.click();
flushTimers();
assert(app.battle.hearts === heartsBeforeSpeak, 'Clicking 🔊 발음 button does NOT submit answer or consume hearts');
assert(
  elementsById['quiz-feedback-banner'].textContent.indexOf('TWO') !== -1,
  'After spelling T-W-O, feedback banner shows full word pronunciation guide for TWO'
);

// Now answer Question 1 ("TWO") -> Verify Caillou-style Bilingual Story Sentence Card appears!
const q1Ans = app.battle.questions[0].answer;
elementsById['quiz-options-grid'].children.find(b => b.getAttribute('data-option') === q1Ans).click();
flushTimers();

assert(!elementsById['english-story-card'].classList.contains('hidden'), 'Answering English word ("TWO") reveals Caillou-style Story Sentence Card (#english-story-card)');
assert(
  elementsById['story-sentence-en'].innerHTML.indexOf('two') !== -1 &&
  elementsById['story-sentence-en'].innerHTML.indexOf('apples') !== -1,
  'Story card shows English example sentence ("There are two red apples.") with highlighted word'
);
assert(
  elementsById['story-sentence-ko'].textContent.indexOf('사과가 두 개 있어요') !== -1,
  'Story card shows Korean meaning ("빨간 사과가 두 개 있어요.")'
);
assert(
  elementsById['story-scene-emojis'].textContent.indexOf('🍎') !== -1,
  'Story card displays visual illustration scene emojis ("🍎 🍎 ✌️")'
);

// Click "다음 문제로 넘어가기 ▶" (#btn-story-next) to proceed to Question 2
elementsById['btn-story-next'].click();
flushTimers();
assert(elementsById['english-story-card'].classList.contains('hidden'), 'Clicking #btn-story-next hides story card and advances to next question');

// Make sure Question 2 is non-english (e.g. math) so answering it triggers capture directly
app.battle.questions[1] = {
  category: 'math',
  q: '🔢 3 + 4 = ?',
  options: ['6', '7', '8', '9'],
  answer: '7'
};
app.renderCurrentBattleQuestion();
const caughtPokemonId = app.battle.pokemon.id;
const q2Ans = app.battle.questions[1].answer;
elementsById['quiz-options-grid'].children.find(b => b.getAttribute('data-option') === q2Ans).click();
flushTimers();

assert(window.GameStorage.isCaught(caughtPokemonId), 'Caught Pokémon is registered in storage');

// 5. Test Daily Heart Limit & Consequence of Losing Hearts
window.GameStorage.setDailyLimits({ dailyHeartLimit: 5 });
assert(window.GameStorage.getDailyStatus().remainingHearts === 5, 'Daily heart limit set to 5');

elementsById['btn-back-to-field'].click();
app.startBattle(false);

const wrongBtns = elementsById['quiz-options-grid'].children.filter(
  b => b.getAttribute('data-option') !== app.battle.pokemon.name
);
wrongBtns[0].click();
assert(window.GameStorage.getDailyStatus().remainingHearts === 4, '1st mistake decrements Daily Total Hearts from 5 to 4');
wrongBtns[1].click();
assert(window.GameStorage.getDailyStatus().remainingHearts === 3, '2nd mistake decrements Daily Total Hearts from 4 to 3');
wrongBtns[2].click();
assert(window.GameStorage.getDailyStatus().remainingHearts === 2, '3rd mistake decrements Daily Total Hearts from 3 to 2 and Pokémon flees');

elementsById['btn-back-to-field'].click();
app.startBattle(false);
assert(app.battle.hearts === 2, 'When only 2 Daily Hearts remain, new battle starts with 2 hearts');

const wrongBtns2 = elementsById['quiz-options-grid'].children.filter(
  b => b.getAttribute('data-option') !== app.battle.pokemon.name
);
wrongBtns2[0].click();
wrongBtns2[1].click();
flushTimers();
assert(window.GameStorage.getDailyStatus().remainingHearts === 0, 'Daily Total Hearts reached 0');
assert(window.GameStorage.getDailyStatus().isHeartsUp === true, 'isHeartsUp is true when all daily hearts are consumed');
assert(!elementsById['modal-daily-limit'].classList.contains('hidden'), 'Daily Limit Lock Modal pops up when Daily Hearts reach 0');

// 6. Test Parent Admin Mode (One-time Password Set -> Verify Password -> Refill Hearts & Time -> Full Reset)
assert(!window.GameStorage.hasAdminPassword(), 'Initially no admin password is set');
elementsById['btn-open-admin'].click();
assert(!elementsById['modal-admin'].classList.contains('hidden'), 'Admin modal opens');

elementsById['admin-password-input'].value = '7788';
elementsById['btn-admin-password-submit'].click();
assert(window.GameStorage.hasAdminPassword(), 'Admin password is now saved in localStorage');
assert(!elementsById['admin-panel-view'].classList.contains('hidden'), 'Setting initial password unlocks Admin Panel immediately');

elementsById['btn-admin-refill-hearts'].click();
assert(window.GameStorage.getDailyStatus().remainingHearts === 5, 'Admin Refill Hearts restores daily hearts to full (5/5)');
assert(elementsById['modal-daily-limit'].classList.contains('hidden'), 'Daily Limit Lock Modal closes after heart refill');

assert(window.GameStorage.getUniqueCaughtTotal() === 1, 'Before reset, 1 Pokémon is caught');
elementsById['btn-admin-reset-all'].click();
elementsById['btn-admin-confirm-reset-yes'].click();
assert(window.GameStorage.getUniqueCaughtTotal() === 0, 'Confirming Reset All clears all caught Pokémon back to 0');
assert(app.currentScreen === 'title', 'After full reset, game returns to Title screen');
elementsById['btn-close-admin'].click();

// 7. Test Pokedex Uncaught Hint Peek ("👁️ 힌트" button & "👁️ 전체 힌트 보기" toggle)
elementsById['btn-open-pokedex'].click();
const firstCardBefore = elementsById['pokedex-grid'].children[0];
const firstNameBefore = firstCardBefore.children.find(c => c.classList && c.classList.contains('dex-name'));
assert(firstNameBefore.textContent === '???', 'Uncaught Pokémon card initially shows "???" for name');

// Click the 👁️ 힌트 button on the first card (No.001 이상해씨)
const firstTopRow = firstCardBefore.children.find(c => c.classList && c.classList.contains('dex-card-top'));
const firstHintBtn = firstTopRow.children.find(c => c.classList && c.classList.contains('dex-hint-eye-btn'));
assert(Boolean(firstHintBtn), 'Uncaught Pokémon card renders password-peek style "👁️ 힌트" button');
firstHintBtn.click();

const firstCardAfter = elementsById['pokedex-grid'].children[0];
const firstNameAfter = firstCardAfter.children.find(c => c.classList && c.classList.contains('dex-name'));
const firstTypesAfter = firstCardAfter.children.find(c => c.classList && c.classList.contains('dex-types'));
assert(firstCardAfter.classList.contains('peek-hint'), 'Clicking "👁️ 힌트" adds .peek-hint class to reveal color image');
assert(firstNameAfter.textContent === window.POKEMON_DATA[0].name, 'Clicking "👁️ 힌트" reveals true Pokémon name ("이상해씨")');
assert(firstTypesAfter.innerHTML.indexOf(window.POKEMON_DATA[0].types[0]) !== -1, 'Clicking "👁️ 힌트" reveals Pokémon types and habitat');

// Test "👁️ 전체 힌트 보기" button
elementsById['btn-dex-peek-all'].click();
const secondCardAfterAll = elementsById['pokedex-grid'].children[1];
const secondNameAfterAll = secondCardAfterAll.children.find(c => c.classList && c.classList.contains('dex-name'));
assert(secondNameAfterAll.textContent === window.POKEMON_DATA[1].name, 'Clicking "👁️ 전체 힌트 보기" reveals all uncaught Pokémon names & images');
elementsById['btn-close-pokedex'].click();

// 8. Test Daily Time-Up -> Open Pokedex stays open -> Admin Refill Time resumes field & home/continue buttons
elementsById['btn-start-game'].click();
regionCards[0].click();
assert(app.currentScreen === 'field' && app.fieldActive === true, 'Entered field screen for time-up test');

// Simulate daily time limit (10 mins = 600s) reached
window.GameStorage.setDailyLimits({ dailyTimeLimitMinutes: 10 });
window.GameStorage.addPlayTime(600);
app.tickDailyTimer();
assert(!elementsById['modal-daily-limit'].classList.contains('hidden'), 'Daily time-up lock modal pops up');
assert(app.fieldActive === false, 'Field pauses when daily time-up modal pops up');

// Click "📖 잡은 포켓몬 도감 구경하기" -> Pokedex must stay open even when timer ticks
elementsById['btn-limit-open-pokedex'].click();
assert(elementsById['modal-daily-limit'].classList.contains('hidden'), 'Daily limit modal hides when opening Pokedex');
assert(!elementsById['modal-pokedex'].classList.contains('hidden'), 'Pokedex modal opens from Daily limit modal');
app.tickDailyTimer();
app.tickDailyTimer();
assert(!elementsById['modal-pokedex'].classList.contains('hidden'), 'Pokedex stays open after timer ticks');
assert(elementsById['modal-daily-limit'].classList.contains('hidden'), 'Daily limit modal does NOT pop back over Pokedex');

// Close Pokedex -> lock modal returns on field -> open Admin -> refill time -> close Admin -> field resumes
elementsById['btn-close-pokedex'].click();
assert(!elementsById['modal-daily-limit'].classList.contains('hidden'), 'Lock modal returns if closing Pokedex while still locked on field');

elementsById['btn-limit-open-admin'].click();
elementsById['admin-password-input'].value = '7788';
elementsById['btn-admin-password-submit'].click();
elementsById['btn-admin-refill-time'].click();
assert(elementsById['modal-daily-limit'].classList.contains('hidden'), 'Daily limit modal hides after admin refills time');
elementsById['btn-close-admin'].click();
assert(app.currentScreen === 'field' && app.fieldActive === true, 'Field resumes immediately after closing Admin modal');

// Home button -> Title -> Continue button -> Region screen works cleanly
elementsById['btn-home'].click();
assert(app.currentScreen === 'title', 'Home button navigates to Title screen cleanly');
elementsById['btn-start-game'].click();
assert(app.currentScreen === 'region', 'Continue journey button navigates to Region screen after refill');

print('\n=== ALL FEATURES & E2E SCENARIOS PASSED 100% ✅ ===');
