// 포켓몬 퀴즈 대모험 - 메인 게임 엔진 (타이틀 / 프로필 / 지역 / 캔버스 필드 / 배틀 퀴즈 / 도감 / 부모님 설정)
(function () {
  const REGION_META = {
    forest: {
      id: 'forest',
      name: '🌲 속닥속닥 숲',
      bgTop: '#9be15d',
      bgBottom: '#00e3ae',
      pathColor: '#e9d8a6',
      decoEmojis: ['🌲', '🌳', '🍄', '🌿', '🌼', '🦋'],
    },
    city: {
      id: 'city',
      name: '🏙️ 반짝반짝 도시',
      bgTop: '#a1c4fd',
      bgBottom: '#c2e9fb',
      pathColor: '#cbd5e1',
      decoEmojis: ['🏢', '🚦', '⚡', '🏪', '⛲', '🚌'],
    },
    desert: {
      id: 'desert',
      name: '🏜️ 모래모래 사막',
      bgTop: '#f6d365',
      bgBottom: '#fda085',
      pathColor: '#fde68a',
      decoEmojis: ['🌵', '🪨', '🏜️', '☀️', '🐪', '🔥'],
    },
    sea: {
      id: 'sea',
      name: '🌊 첨벙첨벙 바다',
      bgTop: '#4facfe',
      bgBottom: '#00f2fe',
      pathColor: '#90e0ef',
      decoEmojis: ['🌊', '🐚', '🪸', '🏝️', '⛵', '❄️'],
    },
  };

  const CATEGORY_LABELS = {
    math: '🔢 덧셈·뺄셈',
    korean: '🇰🇷 한글 낱말',
    english: '🔤 영어 단어',
    creativity: '💡 창의·수수께끼',
  };

  const AVATAR_THEMES = {
    red: {
      emoji: '🧢',
      name: '열혈 트레이너 지우',
      hatColor: '#ef476f',
      shirtColor: '#3a86ff',
      skinColor: '#ffe5d9',
      hairColor: '#1e272e',
      defaultHat: 'cap',
    },
    pikachu: {
      emoji: '⚡',
      name: '피카츄 노랑 대장',
      hatColor: '#ffb703',
      shirtColor: '#fb8500',
      skinColor: '#fff3b0',
      hairColor: '#d97706',
      defaultHat: 'pika',
    },
    misty: {
      emoji: '🌟',
      name: '스타 트레이너 이슬',
      hatColor: '#ff70a6',
      shirtColor: '#ffd166',
      skinColor: '#ffe5d9',
      hairColor: '#f77f00',
      defaultHat: 'none',
    },
    crown: {
      emoji: '👑',
      name: '황금 왕관 단델',
      hatColor: '#ffd166',
      shirtColor: '#8338ec',
      skinColor: '#ffe5d9',
      hairColor: '#5a189a',
      defaultHat: 'crown',
    },
    goggle: {
      emoji: '🥽',
      name: '슈퍼 고글 박사',
      hatColor: '#06d6a0',
      shirtColor: '#118ab2',
      skinColor: '#ffe5d9',
      hairColor: '#073b4c',
      defaultHat: 'goggle',
    },
    photo: {
      emoji: '📸',
      name: '내 얼굴 사진 대장',
      hatColor: '#ef476f',
      shirtColor: '#ff5e57',
      skinColor: '#ffe5d9',
      hairColor: '#1e272e',
      defaultHat: 'none',
    },
  };

  const HAT_THEMES = {
    cap: { emoji: '🧢', label: '지우 모자' },
    pika: { emoji: '⚡', label: '피카츄 귀' },
    crown: { emoji: '👑', label: '황금 왕관' },
    goggle: { emoji: '🥽', label: '탐험 고글' },
    none: { emoji: '', label: '모자 없음' },
  };

  // 한국어 이름 받침 유무에 따라 '야' / '아' 자동 선택 (예: 지우 -> 지우야, 민준 -> 민준아)
  function getKoreanVocative(name) {
    const clean = String(name || '').trim() || '지우';
    const lastCode = clean.charCodeAt(clean.length - 1);
    if (lastCode >= 0xac00 && lastCode <= 0xd7a3) {
      const jongseong = (lastCode - 0xac00) % 28;
      return jongseong > 0 ? `${clean}아` : `${clean}야`;
    }
    return `${clean}야`;
  }

  function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function formatSecondsMMSS(totalSeconds) {
    if (!Number.isFinite(totalSeconds)) return '무제한';
    const sec = Math.max(0, Math.floor(totalSeconds));
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  // 코드로 무제한 생성 가능한 덧셈·뺄셈 문제 생성기 (6~10세 맞춤 100 이하 연산)
  function generateDynamicMathQuestion() {
    const isAdd = Math.random() < 0.55;
    let a, b, ans, qText;

    if (isAdd) {
      if (Math.random() < 0.6) {
        a = Math.floor(Math.random() * 18) + 2;
        b = Math.floor(Math.random() * 15) + 1;
      } else {
        a = (Math.floor(Math.random() * 6) + 1) * 10 + Math.floor(Math.random() * 6);
        b = Math.floor(Math.random() * 25) + 5;
      }
      ans = a + b;
      qText = `🔢 ${a} + ${b} = ? 빈칸에 알맞은 수는 무엇일까요?`;
    } else {
      a = Math.floor(Math.random() * 55) + 12;
      b = Math.floor(Math.random() * (a - 3)) + 2;
      ans = a - b;
      qText = `🔢 ${a} - ${b} = ? 빈칸에 알맞은 수는 무엇일까요?`;
    }

    const wrongSet = new Set();
    const offsets = [-10, -3, -2, -1, 1, 2, 3, 5, 10];
    while (wrongSet.size < 3) {
      const delta = offsets[Math.floor(Math.random() * offsets.length)];
      const cand = ans + delta;
      if (cand >= 0 && cand <= 120 && cand !== ans) {
        wrongSet.add(String(cand));
      }
    }

    const options = shuffleArray([String(ans), ...Array.from(wrongSet)]);
    return {
      category: 'math',
      q: qText,
      options,
      answer: String(ans),
    };
  }

  class PokemonQuizGame {
    constructor() {
      this.currentScreen = 'title';
      this.currentRegion = 'forest';
      this.dexFilter = 'all';
      this.dexPeekAll = false;
      this.dexPeekIds = new Set();

      // 이번 접속에서 '오늘 여행 시작하기' 버튼을 눌러 모험을 시작했는지 여부
      this.sessionJourneyStarted = false;

      // 프로필 모달 위저드 & 아이 얼굴 사진 상태
      this.profileStep = 1;
      this.draftPhotoDataUrl = '';
      this.draftRawImage = null;
      this.draftPhotoZoom = 1.2;
      this.draftPhotoOffsetY = 0;
      this.playerFaceImg = null;
      this.playerFaceImgSrc = '';

      // 필드 캔버스 상태
      this.canvas = document.getElementById('field-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.fieldWidth = 960;
      this.fieldHeight = 540;
      this.player = {
        x: 480,
        y: 270,
        radius: 26,
        targetX: null,
        targetY: null,
        speed: 270, // px per sec
        facing: 1,
        walkFrame: 0,
      };
      this.keys = { up: false, down: false, left: false, right: false };
      this.balls = [];
      this.decorations = [];
      this.lastFrameTime = performance.now();
      this.fieldActive = false;

      // 배틀 상태
      this.battle = null;
      this.inputLocked = false;
      this.usedQuestionKeys = new Set(
        window.GameStorage && typeof window.GameStorage.getRecentQuestionKeys === 'function'
          ? window.GameStorage.getRecentQuestionKeys()
          : []
      );

      // 하루 이용 시간 타이머
      this.playTimerId = null;

      this.init();
    }

    init() {
      // 저장된 사운드 설정 반영
      const soundOn = window.GameStorage.getSoundEnabled();
      window.SoundFX.setEnabled(soundOn);
      this.updateSoundUI(soundOn);

      this.bindEvents();
      this.bindAdminEvents();
      this.bindProfileModalEvents();
      this.updateProfileUI();
      this.updateGlobalCounters();
      this.updateDailyLimitBadges();
      this.startDailyPlayTimer();

      // BGM: 첫 화면 클릭/터치 시 타이틀 BGM 자동 시작
      window.SoundFX.playBGM('title');

      // 처음 방문해 프로필(아이 이름)이 아직 없으면 캐릭터·탐험대 설정 모달 자동 오픈
      if (!window.GameStorage.hasProfile()) {
        this.openProfileModal(true);
      }

      // 캔버스 루프 시작
      window.addEventListener('resize', () => this.resizeCanvas());
      requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    // 하루 이용 시간 1초 카운트다운 타이머
    // 주의: 접속하자마자 카운트하지 않고, '🚀 오늘 여행 시작하기!' 버튼을 눌러 모험을 시작한 뒤에만 카운트합니다!
    startDailyPlayTimer() {
      if (this.playTimerId) clearInterval(this.playTimerId);
      this.playTimerId = setInterval(() => {
        this.tickDailyTimer();
      }, 1000);
    }

    tickDailyTimer() {
      // 아직 '오늘 여행 시작하기' 버튼을 누르지 않았거나 타이틀 화면에 머물러 있으면 시간 차감 안 함
      if (!this.sessionJourneyStarted || this.currentScreen === 'title') {
        this.updateDailyLimitBadges();
        return;
      }

      // 도감, 관리자 설정, 프로필 설정, 일일 제한 등 어떤 모달이라도 열려 있으면 시간 차감 및 잠금 모달 재표시 안 함
      if (this.isAnyModalOpen()) {
        this.updateDailyLimitBadges();
        return;
      }

      const status = window.GameStorage.addPlayTime(1);
      this.updateDailyLimitBadges(status);

      if (status.isTimeUp) {
        this.showDailyLimitModal('time');
      }
    }

    updateDailyLimitBadges(statusObj) {
      const status = statusObj || window.GameStorage.getDailyStatus();
      const timeEl = document.getElementById('header-time-text');
      const heartEl = document.getElementById('header-daily-heart-text');
      const timeBtn = document.getElementById('btn-header-limit-info');
      const heartBtn = document.getElementById('btn-header-heart-info');
      const battleDailyHeartBadge = document.getElementById('battle-daily-heart-badge');
      const startBtn = document.getElementById('btn-start-game');

      if (timeEl) {
        if (status.timeLimitMinutes <= 0) {
          timeEl.textContent = '시간 무제한';
        } else if (!status.isJourneyStarted && !this.sessionJourneyStarted && status.usedSeconds === 0) {
          timeEl.textContent = `${formatSecondsMMSS(status.remainingSeconds)} (대기중)`;
        } else {
          timeEl.textContent = formatSecondsMMSS(status.remainingSeconds);
        }
      }

      // 타이틀 화면 시작 버튼 문구 업데이트
      if (startBtn) {
        if (status.isJourneyStarted || status.usedSeconds > 0) {
          startBtn.textContent = '🚀 오늘 여행 이어하기!';
        } else {
          startBtn.textContent = '🚀 오늘 여행 시작하기!';
        }
      }

      if (timeBtn) {
        timeBtn.classList.toggle(
          'danger-blink',
          status.timeLimitMinutes > 0 && status.remainingSeconds <= 180
        );
      }

      if (heartEl) {
        heartEl.textContent =
          status.heartLimit > 0 ? `하트 ${status.remainingHearts}개` : '하트 무제한';
      }
      if (heartBtn) {
        heartBtn.classList.toggle(
          'danger-blink',
          status.heartLimit > 0 && status.remainingHearts <= 2
        );
      }

      if (battleDailyHeartBadge) {
        battleDailyHeartBadge.textContent =
          status.heartLimit > 0
            ? `오늘 남은 총 하트: ${status.remainingHearts}개`
            : '오늘 남은 총 하트: 무제한';
      }
    }

    // 하루 시간 또는 하루 총 하트 소진 시 잠금 모달 표시
    showDailyLimitModal(reason = 'time') {
      this.fieldActive = false;
      this.player.targetX = null;
      this.player.targetY = null;

      const modal = document.getElementById('modal-daily-limit');
      const iconEl = document.getElementById('limit-modal-icon');
      const titleEl = document.getElementById('limit-modal-title');
      const descEl = document.getElementById('limit-modal-desc');

      const status = window.GameStorage.getDailyStatus();
      if (reason === 'heart' || status.isHeartsUp) {
        if (iconEl) iconEl.textContent = '💔';
        if (titleEl) titleEl.textContent = '오늘 사용할 수 있는 하트를 모두 썼어요!';
        if (descEl) {
          descEl.textContent = `오늘의 하트(${status.heartLimit}개)를 모두 사용했어요! 잡은 포켓몬 도감을 구경하거나 내일 다시 도전해 볼까요?`;
        }
      } else {
        if (iconEl) iconEl.textContent = '⏰';
        if (titleEl) titleEl.textContent = '오늘 약속한 게임 시간이 끝났어요!';
        if (descEl) {
          descEl.textContent = `오늘 약속한 ${status.timeLimitMinutes}분이 모두 지났어요! 포켓몬 친구들도 이제 푹 쉬고 내일 다시 만나요!`;
        }
      }

      if (modal) modal.classList.remove('hidden');
    }

    checkCanPlayOrShowLock() {
      const status = window.GameStorage.getDailyStatus();
      if (status.isTimeUp) {
        this.showDailyLimitModal('time');
        return false;
      }
      if (status.isHeartsUp) {
        this.showDailyLimitModal('heart');
        return false;
      }
      return true;
    }

    bindEvents() {
      // 상단바 버튼
      document.getElementById('btn-home').addEventListener('click', () => {
        window.SoundFX.click();
        this.closeModals();
        document.getElementById('modal-daily-limit').classList.add('hidden');
        this.showScreen('title');
      });

      document.getElementById('btn-change-region').addEventListener('click', () => {
        window.SoundFX.click();
        if (!this.checkCanPlayOrShowLock()) return;
        this.showScreen('region');
      });

      document.getElementById('btn-open-pokedex').addEventListener('click', () => {
        window.SoundFX.click();
        this.openPokedexModal();
      });

      document.getElementById('btn-sound-toggle').addEventListener('click', () => {
        const next = !window.SoundFX.enabled;
        window.SoundFX.setEnabled(next);
        window.GameStorage.setSoundEnabled(next);
        this.updateSoundUI(next);
        if (next) window.SoundFX.click();
      });

      // 타이틀 화면 버튼 - '🚀 오늘 여행 시작하기!' 클릭 시 오늘의 타이머 작동 시작!
      document.getElementById('btn-start-game').addEventListener('click', () => {
        window.SoundFX.click();
        if (!this.checkCanPlayOrShowLock()) return;
        this.sessionJourneyStarted = true;
        const status = window.GameStorage.startTodayJourney();
        this.updateDailyLimitBadges(status);
        this.showScreen('region');
      });

      document.getElementById('btn-title-pokedex').addEventListener('click', () => {
        window.SoundFX.click();
        this.openPokedexModal();
      });

      // 지역 선택 카드
      document.querySelectorAll('.region-card').forEach((card) => {
        card.addEventListener('click', () => {
          window.SoundFX.click();
          if (!this.checkCanPlayOrShowLock()) return;
          this.sessionJourneyStarted = true;
          window.GameStorage.startTodayJourney();
          const region = card.getAttribute('data-region');
          this.enterField(region);
        });
      });

      // 필드 몬스터볼 새로 부르기
      document.getElementById('btn-respawn-balls').addEventListener('click', () => {
        window.SoundFX.click();
        if (!this.checkCanPlayOrShowLock()) return;
        this.spawnFieldBalls();
      });

      // 배틀 종료 후 버튼
      document.getElementById('btn-back-to-field').addEventListener('click', () => {
        window.SoundFX.click();
        if (!this.checkCanPlayOrShowLock()) return;
        this.showScreen('field');
      });

      document.getElementById('btn-battle-open-pokedex').addEventListener('click', () => {
        window.SoundFX.click();
        this.openPokedexModal('caught');
      });

      // 영어 단어 정답 후 까이유 스타일 그림 + 영어/한글 예시 문장 카드 버튼
      const storyReplayBtn = document.getElementById('btn-story-replay');
      const storyNextBtn = document.getElementById('btn-story-next');
      if (storyReplayBtn) {
        storyReplayBtn.addEventListener('click', () => {
          if (this.currentStoryWord) {
            this.playCurrentStoryAudio(this.currentStoryWord);
          }
        });
      }
      if (storyNextBtn) {
        storyNextBtn.addEventListener('click', () => {
          window.SoundFX.click();
          this.advanceFromEnglishStoryCard();
        });
      }

      // 모달 닫기
      document.getElementById('btn-close-pokedex').addEventListener('click', () => {
        window.SoundFX.click();
        document.getElementById('modal-pokedex').classList.add('hidden');
        this.handlePokedexClosed();
      });

      document.querySelectorAll('.modal-overlay').forEach((overlay) => {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay && overlay.id !== 'modal-daily-limit') {
            overlay.classList.add('hidden');
            if (overlay.id === 'modal-pokedex') {
              this.handlePokedexClosed();
            } else if (overlay.id === 'modal-admin') {
              this.resumePlayIfUnlocked();
            }
          }
        });
      });

      // 도감 필터 탭
      document.querySelectorAll('[data-dex-filter]').forEach((btn) => {
        btn.addEventListener('click', () => {
          window.SoundFX.click();
          const filter = btn.getAttribute('data-dex-filter');
          this.dexFilter = filter;
          document.querySelectorAll('[data-dex-filter]').forEach((b) =>
            b.classList.toggle('active', b === btn)
          );
          this.renderPokedexGrid();
        });
      });

      // 도감 미발견(???) 전체 힌트 보기/숨기기 토글 버튼
      const peekAllBtn = document.getElementById('btn-dex-peek-all');
      if (peekAllBtn) {
        peekAllBtn.addEventListener('click', () => {
          window.SoundFX.click();
          this.dexPeekAll = !this.dexPeekAll;
          if (!this.dexPeekAll) {
            this.dexPeekIds.clear();
          }
          this.updateDexPeekAllButtonUI();
          this.renderPokedexGrid();
        });
      }

      // 필드 캔버스 클릭 / 터치 이동
      this.canvas.addEventListener('pointerdown', (e) => {
        if (this.currentScreen !== 'field' || !this.fieldActive) return;
        if (!this.checkCanPlayOrShowLock()) return;
        const rect = this.canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const scaleX = this.fieldWidth / rect.width;
        const scaleY = this.fieldHeight / rect.height;
        const clickX = (e.clientX - rect.left) * scaleX;
        const clickY = (e.clientY - rect.top) * scaleY;

        this.player.targetX = Math.max(40, Math.min(this.fieldWidth - 40, clickX));
        this.player.targetY = Math.max(55, Math.min(this.fieldHeight - 40, clickY));
        if (this.player.targetX < this.player.x) this.player.facing = -1;
        if (this.player.targetX > this.player.x) this.player.facing = 1;
      });

      // 키보드 조작 (필드 이동: 방향키/WASD, 배틀 정답: 1~4, ESC: 모달 닫기)
      window.addEventListener('keydown', (e) => {
        const activeTag = document.activeElement ? document.activeElement.tagName : '';
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
          return;
        }

        if (e.key === 'Escape') {
          this.closeModals();
          return;
        }

        // 모달이 열려 있으면 게임 키 입력 무시
        if (this.isAnyModalOpen()) return;

        if (this.currentScreen === 'battle') {
          if (['1', '2', '3', '4'].includes(e.key)) {
            const idx = parseInt(e.key, 10) - 1;
            const btns = document.querySelectorAll('#quiz-options-grid .quiz-option-btn');
            if (btns[idx] && !btns[idx].disabled) {
              btns[idx].click();
            }
          }
          return;
        }

        if (this.currentScreen === 'field') {
          const code = e.code;
          if (code === 'ArrowUp' || code === 'KeyW') {
            this.keys.up = true;
            this.player.targetX = null;
            this.player.targetY = null;
          } else if (code === 'ArrowDown' || code === 'KeyS') {
            this.keys.down = true;
            this.player.targetX = null;
            this.player.targetY = null;
          } else if (code === 'ArrowLeft' || code === 'KeyA') {
            this.keys.left = true;
            this.player.facing = -1;
            this.player.targetX = null;
            this.player.targetY = null;
          } else if (code === 'ArrowRight' || code === 'KeyD') {
            this.keys.right = true;
            this.player.facing = 1;
            this.player.targetX = null;
            this.player.targetY = null;
          }
        }
      });

      window.addEventListener('keyup', (e) => {
        const code = e.code;
        if (code === 'ArrowUp' || code === 'KeyW') this.keys.up = false;
        if (code === 'ArrowDown' || code === 'KeyS') this.keys.down = false;
        if (code === 'ArrowLeft' || code === 'KeyA') this.keys.left = false;
        if (code === 'ArrowRight' || code === 'KeyD') this.keys.right = false;
      });
    }

    // 캐릭터 & 탐험대 3단계 튜토리얼 셋업 모달 이벤트 바인딩
    bindProfileModalEvents() {
      const openBtn = document.getElementById('btn-edit-profile');
      const titleAvatarFig = document.getElementById('title-moving-avatar');
      const closeBtn = document.getElementById('btn-close-profile');
      const saveBtn = document.getElementById('btn-save-profile');
      const prevStepBtn = document.getElementById('btn-profile-prev-step');
      const nextStepBtn = document.getElementById('btn-profile-next-step');
      const nameInput = document.getElementById('profile-player-name');
      const teamInput = document.getElementById('profile-team-name');

      const takeCameraBtn = document.getElementById('btn-take-camera');
      const cameraFileInput = document.getElementById('profile-camera-input');
      const webcamSnapBtn = document.getElementById('btn-webcam-snap');
      const webcamCancelBtn = document.getElementById('btn-webcam-cancel');
      const uploadPhotoBtn = document.getElementById('btn-upload-photo');
      const clearPhotoBtn = document.getElementById('btn-clear-photo');
      const photoFileInput = document.getElementById('profile-photo-input');
      const zoomRange = document.getElementById('photo-zoom-range');
      const offsetRange = document.getElementById('photo-offset-range');

      if (openBtn) {
        openBtn.addEventListener('click', () => {
          window.SoundFX.click();
          this.openProfileModal(false);
        });
      }

      if (titleAvatarFig) {
        titleAvatarFig.addEventListener('click', () => {
          window.SoundFX.click();
          this.openProfileModal(false);
        });
      }

      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          window.SoundFX.click();
          this.stopWebcamCapture();
          document.getElementById('modal-profile').classList.add('hidden');
        });
      }

      // 상단 1단계 / 2단계 / 3단계 탭 클릭
      document.querySelectorAll('[data-profile-step]').forEach((tabBtn) => {
        tabBtn.addEventListener('click', () => {
          window.SoundFX.click();
          const stepNum = Number(tabBtn.getAttribute('data-profile-step')) || 1;
          this.setProfileWizardStep(stepNum);
        });
      });

      if (prevStepBtn) {
        prevStepBtn.addEventListener('click', () => {
          window.SoundFX.click();
          this.setProfileWizardStep(Math.max(1, this.profileStep - 1));
        });
      }

      if (nextStepBtn) {
        nextStepBtn.addEventListener('click', () => {
          window.SoundFX.click();
          this.setProfileWizardStep(Math.min(3, this.profileStep + 1));
        });
      }

      // 1) 📸 지금 카메라로 얼굴 찍기 버튼 (브라우저 실시간 셀카 카메라 우선 실행 -> 미지원 시 모바일 전면 카메라 input 실행)
      if (takeCameraBtn) {
        takeCameraBtn.addEventListener('click', () => {
          window.SoundFX.click();
          this.startWebcamCapture();
        });
      }

      if (cameraFileInput) {
        cameraFileInput.addEventListener('change', (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          this.handlePhotoFileSelected(file);
          cameraFileInput.value = '';
        });
      }

      if (webcamSnapBtn) {
        webcamSnapBtn.addEventListener('click', () => {
          window.SoundFX.click();
          this.snapWebcamPhoto();
        });
      }

      if (webcamCancelBtn) {
        webcamCancelBtn.addEventListener('click', () => {
          window.SoundFX.click();
          this.stopWebcamCapture();
        });
      }

      // 2) 🖼️ 사진첩(앨범)에서 고르기 버튼 -> 파일 선택창 열기
      if (uploadPhotoBtn && photoFileInput) {
        uploadPhotoBtn.addEventListener('click', () => {
          window.SoundFX.click();
          this.stopWebcamCapture();
          photoFileInput.click();
        });

        photoFileInput.addEventListener('change', (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          this.handlePhotoFileSelected(file);
          photoFileInput.value = '';
        });
      }

      // 사진 지우기 버튼
      if (clearPhotoBtn) {
        clearPhotoBtn.addEventListener('click', () => {
          window.SoundFX.click();
          this.stopWebcamCapture();
          this.draftPhotoDataUrl = '';
          this.draftRawImage = null;
          const activeCard = document.querySelector('[data-avatar].active');
          if (activeCard && activeCard.getAttribute('data-avatar') === 'photo') {
            document.querySelectorAll('[data-avatar]').forEach((c) =>
              c.classList.toggle('active', c.getAttribute('data-avatar') === 'red')
            );
          }
          this.updatePhotoAdjustControlsUI();
          this.updateProfilePreviewText();
        });
      }

      // 사진 확대/위아래 위치 슬라이더 조절
      if (zoomRange) {
        zoomRange.addEventListener('input', () => {
          this.draftPhotoZoom = (Number(zoomRange.value) || 120) / 100;
          this.rebuildCroppedPhotoFromRaw();
        });
      }

      if (offsetRange) {
        offsetRange.addEventListener('input', () => {
          this.draftPhotoOffsetY = Number(offsetRange.value) || 0;
          this.rebuildCroppedPhotoFromRaw();
        });
      }

      // 아바타(캐릭터) 카드 선택
      document.querySelectorAll('[data-avatar]').forEach((card) => {
        card.addEventListener('click', () => {
          window.SoundFX.click();
          const avatarId = card.getAttribute('data-avatar');
          document.querySelectorAll('[data-avatar]').forEach((c) =>
            c.classList.toggle('active', c === card)
          );

          // 사진 캐릭터 카드를 눌렀는데 아직 사진이 없으면 파일 선택창 안내
          if (avatarId === 'photo' && !this.draftPhotoDataUrl && photoFileInput) {
            photoFileInput.click();
          }

          // 캐릭터에 어울리는 기본 모자로 자동 추천 (원하면 아래 모자 버튼으로 자유 변경 가능)
          const meta = AVATAR_THEMES[avatarId];
          if (meta && meta.defaultHat) {
            document.querySelectorAll('[data-hat]').forEach((h) =>
              h.classList.toggle('active', h.getAttribute('data-hat') === meta.defaultHat)
            );
          }

          this.updateProfilePreviewText();
        });
      });

      // 머리 위 모자·장식 선택
      document.querySelectorAll('[data-hat]').forEach((hatBtn) => {
        hatBtn.addEventListener('click', () => {
          window.SoundFX.click();
          document.querySelectorAll('[data-hat]').forEach((h) =>
            h.classList.toggle('active', h === hatBtn)
          );
          this.updateProfilePreviewText();
        });
      });

      // 추천 탐험대 이름 프리셋 버튼
      document.querySelectorAll('[data-team-preset]').forEach((btn) => {
        btn.addEventListener('click', () => {
          window.SoundFX.click();
          const preset = btn.getAttribute('data-team-preset');
          if (teamInput) teamInput.value = preset;
          this.updateProfilePreviewText();
        });
      });

      if (nameInput) {
        nameInput.addEventListener('input', () => this.updateProfilePreviewText());
        nameInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && saveBtn) saveBtn.click();
        });
      }
      if (teamInput) {
        teamInput.addEventListener('input', () => this.updateProfilePreviewText());
        teamInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && saveBtn) saveBtn.click();
        });
      }

      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          this.stopWebcamCapture();
          const activeCard = document.querySelector('[data-avatar].active');
          const activeHat = document.querySelector('[data-hat].active');
          let avatarId = activeCard ? activeCard.getAttribute('data-avatar') : 'red';
          const hatStyle = activeHat ? activeHat.getAttribute('data-hat') : 'cap';
          const playerName = (nameInput ? nameInput.value.trim() : '') || '지우';
          const teamName = (teamInput ? teamInput.value.trim() : '') || '⚡ 번개 탐험대';

          if (avatarId === 'photo' && !this.draftPhotoDataUrl) {
            avatarId = 'red';
          }

          window.GameStorage.setProfile({
            playerName,
            teamName,
            avatarId,
            hatStyle,
            photoDataUrl: this.draftPhotoDataUrl || '',
            photoZoom: this.draftPhotoZoom || 1.0,
            photoOffsetY: this.draftPhotoOffsetY || 0,
          });
          window.SoundFX.correct();
          this.updateProfileUI();
          document.getElementById('modal-profile').classList.add('hidden');
        });
      }
    }

    startWebcamCapture() {
      const webcamBox = document.getElementById('webcam-capture-box');
      const videoEl = document.getElementById('webcam-video');
      const cameraFileInput = document.getElementById('profile-camera-input');

      // 브라우저 실시간 카메라(getUserMedia) 지원 시 화면 안에 셀카 프리뷰 즉시 오픈
      if (
        typeof navigator !== 'undefined' &&
        navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === 'function' &&
        videoEl &&
        webcamBox
      ) {
        this.stopWebcamCapture();
        navigator.mediaDevices
          .getUserMedia({
            video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } },
            audio: false,
          })
          .then((stream) => {
            this.webcamStream = stream;
            videoEl.srcObject = stream;
            webcamBox.classList.remove('hidden');
            if (typeof videoEl.play === 'function') {
              videoEl.play().catch(() => {});
            }
          })
          .catch(() => {
            // 카메라 권한 거부 또는 기기 미지원 시 모바일 전면 카메라 input(capture="user")으로 폴백
            if (cameraFileInput) cameraFileInput.click();
          });
      } else if (cameraFileInput) {
        cameraFileInput.click();
      }
    }

    stopWebcamCapture() {
      if (this.webcamStream) {
        try {
          this.webcamStream.getTracks().forEach((track) => track.stop());
        } catch (e) {}
        this.webcamStream = null;
      }
      const videoEl = document.getElementById('webcam-video');
      if (videoEl) {
        videoEl.srcObject = null;
      }
      const webcamBox = document.getElementById('webcam-capture-box');
      if (webcamBox) {
        webcamBox.classList.add('hidden');
      }
    }

    snapWebcamPhoto() {
      const videoEl = document.getElementById('webcam-video');
      if (!videoEl) return;

      try {
        const vw = videoEl.videoWidth || 360;
        const vh = videoEl.videoHeight || 360;
        const side = Math.min(vw, vh);
        const sx = (vw - side) / 2;
        const sy = (vh - side) / 2;

        const snapCanvas = document.createElement('canvas');
        snapCanvas.width = 240;
        snapCanvas.height = 240;
        const sctx = snapCanvas.getContext('2d');
        if (sctx) {
          // 거울 모드(좌우 반전) 그대로 자연스럽게 캡처
          sctx.translate(240, 0);
          sctx.scale(-1, 1);
          sctx.drawImage(videoEl, sx, sy, side, side, 0, 0, 240, 240);
          const snappedUrl = snapCanvas.toDataURL('image/jpeg', 0.88);
          this.applyRawPhotoDataUrl(snappedUrl);
        }
      } catch (e) {}

      this.stopWebcamCapture();
    }

    setProfileWizardStep(stepNum) {
      this.profileStep = Math.max(1, Math.min(3, Number(stepNum) || 1));

      document.querySelectorAll('[data-profile-step]').forEach((btn) => {
        const s = Number(btn.getAttribute('data-profile-step'));
        btn.classList.toggle('active', s === this.profileStep);
      });

      [1, 2, 3].forEach((s) => {
        const pane = document.getElementById(`profile-step-${s}`);
        if (pane) pane.classList.toggle('active', s === this.profileStep);
      });

      const prevBtn = document.getElementById('btn-profile-prev-step');
      const nextBtn = document.getElementById('btn-profile-next-step');

      if (prevBtn) {
        prevBtn.classList.toggle('hidden', this.profileStep <= 1);
      }

      if (nextBtn) {
        if (this.profileStep === 1) {
          nextBtn.classList.remove('hidden');
          nextBtn.textContent = '다음 단계 (이름·탐험대) ▶';
        } else if (this.profileStep === 2) {
          nextBtn.classList.remove('hidden');
          nextBtn.textContent = '다음 단계 (튜토리얼) ▶';
        } else {
          nextBtn.classList.add('hidden');
        }
      }

      if (this.profileStep === 2) {
        const nameInput = document.getElementById('profile-player-name');
        if (nameInput && !nameInput.value.trim()) {
          setTimeout(() => nameInput.focus(), 50);
        }
      }
    }

    applyRawPhotoDataUrl(rawDataUrl) {
      if (typeof rawDataUrl !== 'string' || !rawDataUrl) return;
      const img = new Image();
      img.onload = () => {
        this.draftRawImage = img;
        this.draftPhotoZoom = 1.0;
        this.draftPhotoOffsetY = 0;

        const zoomRange = document.getElementById('photo-zoom-range');
        const offsetRange = document.getElementById('photo-offset-range');
        if (zoomRange) zoomRange.value = '100';
        if (offsetRange) offsetRange.value = '0';

        this.rebuildCroppedPhotoFromRaw();

        // 사진을 올리면 자동으로 '📸 내 얼굴 사진 대장' 아바타 활성화 & 사진이 가려지지 않도록 기본 '모자 없음(none)' 선택
        document.querySelectorAll('[data-avatar]').forEach((c) =>
          c.classList.toggle('active', c.getAttribute('data-avatar') === 'photo')
        );
        document.querySelectorAll('[data-hat]').forEach((h) =>
          h.classList.toggle('active', h.getAttribute('data-hat') === 'none')
        );

        this.updatePhotoAdjustControlsUI();
        this.updateProfilePreviewText();
        window.SoundFX.correct();
      };
      img.src = rawDataUrl;
    }

    handlePhotoFileSelected(file) {
      if (typeof FileReader === 'undefined') return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const rawDataUrl = ev.target && ev.target.result;
        if (typeof rawDataUrl !== 'string') return;
        this.applyRawPhotoDataUrl(rawDataUrl);
      };
      reader.readAsDataURL(file);
    }

    rebuildCroppedPhotoFromRaw() {
      if (!this.draftRawImage) {
        this.updateProfilePreviewText();
        return;
      }

      try {
        const size = 180;
        const offCanvas = document.createElement('canvas');
        offCanvas.width = size;
        offCanvas.height = size;
        const octx = offCanvas.getContext('2d');

        if (octx) {
          octx.fillStyle = '#ffe5d9';
          octx.fillRect(0, 0, size, size);

          const iw = this.draftRawImage.width || size;
          const ih = this.draftRawImage.height || size;
          const baseScale = Math.max(size / iw, size / ih);
          const zoom = this.draftPhotoZoom || 1.0;
          const drawW = iw * baseScale * zoom;
          const drawH = ih * baseScale * zoom;
          const dx = (size - drawW) / 2;
          const dy = (size - drawH) / 2 + (this.draftPhotoOffsetY || 0) * 1.4;

          octx.drawImage(this.draftRawImage, dx, dy, drawW, drawH);
          this.draftPhotoDataUrl = offCanvas.toDataURL('image/jpeg', 0.82);
        }
      } catch (e) {
        // 캔버스 인코딩 실패 시 원본 유지
      }

      this.updateProfilePreviewText();
    }

    updatePhotoAdjustControlsUI() {
      const hasPhoto = Boolean(this.draftPhotoDataUrl);
      const clearBtn = document.getElementById('btn-clear-photo');
      const adjustBox = document.getElementById('photo-adjust-box');
      const uploadBtn = document.getElementById('btn-upload-photo');
      const takeCameraBtn = document.getElementById('btn-take-camera');

      if (clearBtn) clearBtn.classList.toggle('hidden', !hasPhoto);
      if (adjustBox) adjustBox.classList.toggle('hidden', !hasPhoto);
      if (takeCameraBtn) {
        takeCameraBtn.textContent = hasPhoto
          ? '📸 카메라로 다시 찍기'
          : '📸 지금 카메라로 얼굴 찍기';
      }
      if (uploadBtn) {
        uploadBtn.textContent = hasPhoto
          ? '🖼️ 사진첩에서 다른 사진 고르기'
          : '🖼️ 사진첩(앨범)에서 고르기';
      }
    }

    openProfileModal(isFirstVisit = false) {
      const modal = document.getElementById('modal-profile');
      const closeBtn = document.getElementById('btn-close-profile');
      const nameInput = document.getElementById('profile-player-name');
      const teamInput = document.getElementById('profile-team-name');
      const zoomRange = document.getElementById('photo-zoom-range');
      const offsetRange = document.getElementById('photo-offset-range');

      const profile = window.GameStorage.getProfile();
      const hasSaved = window.GameStorage.hasProfile();

      this.draftPhotoDataUrl = profile.photoDataUrl || '';
      this.draftPhotoZoom = profile.photoZoom || 1.2;
      this.draftPhotoOffsetY = profile.photoOffsetY || 0;
      this.draftRawImage = null;

      if (this.draftPhotoDataUrl && typeof Image !== 'undefined') {
        const savedImg = new Image();
        savedImg.onload = () => {
          this.draftRawImage = savedImg;
        };
        savedImg.src = this.draftPhotoDataUrl;
      }

      if (zoomRange) zoomRange.value = String(Math.round((this.draftPhotoZoom || 1.2) * 100));
      if (offsetRange) offsetRange.value = String(Math.round(this.draftPhotoOffsetY || 0));

      if (nameInput) nameInput.value = hasSaved ? profile.playerName : '';
      if (teamInput) teamInput.value = hasSaved ? profile.teamName : '⚡ 번개 탐험대';

      document.querySelectorAll('[data-avatar]').forEach((card) => {
        card.classList.toggle('active', card.getAttribute('data-avatar') === profile.avatarId);
      });

      const currentHat = profile.hatStyle || 'cap';
      document.querySelectorAll('[data-hat]').forEach((hatBtn) => {
        hatBtn.classList.toggle('active', hatBtn.getAttribute('data-hat') === currentHat);
      });

      if (closeBtn) {
        closeBtn.classList.toggle('hidden', isFirstVisit && !hasSaved);
      }

      this.updatePhotoAdjustControlsUI();
      this.setProfileWizardStep(1);
      this.updateProfilePreviewText();
      if (modal) modal.classList.remove('hidden');
    }

    renderMovingAvatarWidget(prefix, config) {
      const avatarMeta = AVATAR_THEMES[config.avatarId] || AVATAR_THEMES.red;
      const hatMeta = HAT_THEMES[config.hatStyle] || HAT_THEMES.cap;
      const hasPhoto = Boolean(config.photoDataUrl);

      const hatEl = document.getElementById(`${prefix}-hat`);
      const photoEl = document.getElementById(`${prefix}-photo`);
      const emojiEl = document.getElementById(`${prefix}-emoji`) || document.getElementById(`${prefix}-icon`);
      const bodyEl = document.getElementById(`${prefix}-body`);

      if (hatEl) {
        hatEl.textContent = hatMeta.emoji;
        hatEl.classList.toggle('hidden', !hatMeta.emoji);
      }

      if (photoEl) {
        if (hasPhoto) {
          if (photoEl.getAttribute('src') !== config.photoDataUrl) {
            photoEl.setAttribute('src', config.photoDataUrl);
          }
          photoEl.classList.remove('hidden');
        } else {
          photoEl.classList.add('hidden');
        }
      }

      if (emojiEl) {
        emojiEl.textContent = avatarMeta.emoji;
        emojiEl.classList.toggle('hidden', hasPhoto);
      }

      if (bodyEl && bodyEl.style) {
        bodyEl.style.backgroundColor = avatarMeta.shirtColor;
      }
    }

    updateProfilePreviewText() {
      const nameInput = document.getElementById('profile-player-name');
      const teamInput = document.getElementById('profile-team-name');
      const previewEl = document.getElementById('profile-preview-greeting');
      const activeCard = document.querySelector('[data-avatar].active');
      const activeHat = document.querySelector('[data-hat].active');

      const avatarId = activeCard ? activeCard.getAttribute('data-avatar') : 'red';
      const hatStyle = activeHat ? activeHat.getAttribute('data-hat') : 'cap';
      const rawName = (nameInput ? nameInput.value.trim() : '') || '지우';
      const rawTeam = (teamInput ? teamInput.value.trim() : '') || '⚡ 번개 탐험대';
      const vocative = getKoreanVocative(rawName);

      if (previewEl) {
        previewEl.textContent = `👋 "${vocative} 안녕? [${rawTeam}] 대장님이 된 걸 환영해!"`;
      }

      this.renderMovingAvatarWidget('profile-live', {
        avatarId,
        hatStyle,
        photoDataUrl: this.draftPhotoDataUrl,
      });
    }

    updateProfileUI() {
      const profile = window.GameStorage.getProfile();
      const vocative = getKoreanVocative(profile.playerName);

      const teamBadgeEl = document.getElementById('title-team-badge');
      const greetingMsgEl = document.getElementById('title-greeting-msg');
      const regionTitleEl = document.getElementById('region-section-title');

      this.renderMovingAvatarWidget('title-avatar', {
        avatarId: profile.avatarId,
        hatStyle: profile.hatStyle || 'cap',
        photoDataUrl: profile.photoDataUrl || '',
      });

      // 필드 캔버스용 아이 얼굴 이미지 객체 캐싱
      if (profile.photoDataUrl) {
        if (this.playerFaceImgSrc !== profile.photoDataUrl && typeof Image !== 'undefined') {
          this.playerFaceImgSrc = profile.photoDataUrl;
          const img = new Image();
          img.src = profile.photoDataUrl;
          this.playerFaceImg = img;
        }
      } else {
        this.playerFaceImg = null;
        this.playerFaceImgSrc = '';
      }

      if (teamBadgeEl) teamBadgeEl.textContent = profile.teamName;
      if (greetingMsgEl) {
        greetingMsgEl.textContent = `${vocative} 안녕? 오늘도 포켓몬 친구들을 만나 볼까!`;
      }
      if (regionTitleEl) {
        regionTitleEl.textContent = `${vocative}, 어느 지역으로 모험을 떠날까?`;
      }
    }

    // 부모님 설정 (관리자 모드) 이벤트 바인딩
    bindAdminEvents() {
      const openAdminBtns = [
        document.getElementById('btn-open-admin'),
        document.getElementById('btn-header-limit-info'),
        document.getElementById('btn-header-heart-info'),
        document.getElementById('btn-limit-open-admin'),
      ];

      openAdminBtns.forEach((btn) => {
        if (!btn) return;
        btn.addEventListener('click', () => {
          window.SoundFX.click();
          this.openAdminModal();
        });
      });

      const limitDexBtn = document.getElementById('btn-limit-open-pokedex');
      if (limitDexBtn) {
        limitDexBtn.addEventListener('click', () => {
          window.SoundFX.click();
          document.getElementById('modal-daily-limit').classList.add('hidden');
          this.openPokedexModal('caught');
        });
      }

      document.getElementById('btn-close-admin').addEventListener('click', () => {
        window.SoundFX.click();
        document.getElementById('modal-admin').classList.add('hidden');
        this.resumePlayIfUnlocked();
      });

      const pwInput = document.getElementById('admin-password-input');
      const pwSubmitBtn = document.getElementById('btn-admin-password-submit');

      if (pwSubmitBtn) {
        pwSubmitBtn.addEventListener('click', () => this.handleAdminPasswordSubmit());
      }
      if (pwInput) {
        pwInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') this.handleAdminPasswordSubmit();
        });
      }

      // 새 비밀번호 변경
      const newPwInput = document.getElementById('admin-new-password-input');
      const changePwBtn = document.getElementById('btn-admin-change-password');
      if (changePwBtn && newPwInput) {
        changePwBtn.addEventListener('click', () => {
          const nextPw = newPwInput.value.trim();
          if (!nextPw) {
            this.showAdminToast('⚠️ 변경할 새 비밀번호를 입력해 주세요.');
            return;
          }
          window.GameStorage.setAdminPassword(nextPw);
          newPwInput.value = '';
          window.SoundFX.correct();
          this.showAdminToast('🔑 관리자 비밀번호가 변경되었습니다!');
        });
      }

      // 시간 제한 선택 버튼들
      document.querySelectorAll('[data-time-limit]').forEach((btn) => {
        btn.addEventListener('click', () => {
          window.SoundFX.click();
          const mins = Number(btn.getAttribute('data-time-limit'));
          const status = window.GameStorage.setDailyLimits({ dailyTimeLimitMinutes: mins });
          this.refreshAdminPanelUI(status);
          this.updateDailyLimitBadges(status);
          if (!status.isLocked) {
            document.getElementById('modal-daily-limit').classList.add('hidden');
            this.resumePlayIfUnlocked();
          }
          this.showAdminToast(
            mins > 0 ? `하루 게임 시간이 ${mins}분으로 설정되었습니다.` : '하루 게임 시간이 무제한으로 설정되었습니다.'
          );
        });
      });

      // 하트 제한 선택 버튼들
      document.querySelectorAll('[data-heart-limit]').forEach((btn) => {
        btn.addEventListener('click', () => {
          window.SoundFX.click();
          const hearts = Number(btn.getAttribute('data-heart-limit'));
          const status = window.GameStorage.setDailyLimits({ dailyHeartLimit: hearts });
          this.refreshAdminPanelUI(status);
          this.updateDailyLimitBadges(status);
          if (!status.isLocked) {
            document.getElementById('modal-daily-limit').classList.add('hidden');
            this.resumePlayIfUnlocked();
          }
          this.showAdminToast(
            hearts > 0 ? `하루 총 하트가 ${hearts}개로 설정되었습니다.` : '하루 총 하트가 무제한으로 설정되었습니다.'
          );
        });
      });

      // 오늘 사용한 시간 리셋(충전)
      document.getElementById('btn-admin-refill-time').addEventListener('click', () => {
        window.SoundFX.correct();
        const status = window.GameStorage.refillTodayTime();
        this.refreshAdminPanelUI(status);
        this.updateDailyLimitBadges(status);
        if (!status.isLocked) {
          document.getElementById('modal-daily-limit').classList.add('hidden');
          this.resumePlayIfUnlocked();
          this.showAdminToast('⚡ 오늘 사용한 게임 시간이 0분으로 초기화되었습니다! 창을 닫으면 바로 이어집니다.');
        } else if (status.isHeartsUp) {
          this.showAdminToast('⚡ 시간은 초기화되었지만 오늘 하트가 0개입니다! 아래에서 하트도 충전해 주세요.');
        }
      });

      // 오늘 사용한 하트 리셋(충전)
      document.getElementById('btn-admin-refill-hearts').addEventListener('click', () => {
        window.SoundFX.correct();
        const status = window.GameStorage.refillTodayHearts();
        this.refreshAdminPanelUI(status);
        this.updateDailyLimitBadges(status);
        if (this.battle) {
          this.battle.hearts = 3;
          this.renderBattleHearts();
        }
        if (!status.isLocked) {
          document.getElementById('modal-daily-limit').classList.add('hidden');
          this.resumePlayIfUnlocked();
          this.showAdminToast('💖 오늘의 하트가 가득 충전되었습니다! 창을 닫으면 바로 이어집니다.');
        } else if (status.isTimeUp) {
          this.showAdminToast('💖 하트는 충전되었지만 오늘 게임 시간이 끝났습니다! 위에서 시간도 리셋해 주세요.');
        }
      });

      // 전체 초기화 버튼 및 확인창
      document.getElementById('btn-admin-reset-all').addEventListener('click', () => {
        window.SoundFX.click();
        document.getElementById('admin-reset-confirm-box').classList.remove('hidden');
      });

      document.getElementById('btn-admin-confirm-reset-no').addEventListener('click', () => {
        window.SoundFX.click();
        document.getElementById('admin-reset-confirm-box').classList.add('hidden');
      });

      document.getElementById('btn-admin-confirm-reset-yes').addEventListener('click', () => {
        window.SoundFX.reset();
        window.GameStorage.resetAllData();
        this.sessionJourneyStarted = false;
        document.getElementById('admin-reset-confirm-box').classList.add('hidden');
        document.getElementById('modal-daily-limit').classList.add('hidden');
        const status = window.GameStorage.getDailyStatus();
        this.refreshAdminPanelUI(status);
        this.updateDailyLimitBadges(status);
        this.updateGlobalCounters();
        this.showScreen('title');
        this.showAdminToast('🗑️ 도감과 모든 기록이 초기 상태로 리셋되었습니다!');
      });
    }

    openAdminModal() {
      const modal = document.getElementById('modal-admin');
      const gateView = document.getElementById('admin-gate-view');
      const panelView = document.getElementById('admin-panel-view');
      const badgeEl = document.getElementById('admin-gate-badge');
      const descEl = document.getElementById('admin-gate-desc');
      const pwInput = document.getElementById('admin-password-input');
      const submitBtn = document.getElementById('btn-admin-password-submit');
      const errEl = document.getElementById('admin-gate-error');

      const hasPw = window.GameStorage.hasAdminPassword();
      if (!hasPw) {
        if (badgeEl) badgeEl.textContent = '🔒 관리자 비밀번호 최초 설정';
        if (descEl) {
          descEl.textContent =
            '처음 한 번 사용할 부모님 비밀번호를 입력해 주세요. (다음부터는 이 비밀번호로 열립니다)';
        }
        if (submitBtn) submitBtn.textContent = '비밀번호 저장 및 열기';
      } else {
        if (badgeEl) badgeEl.textContent = '🔒 부모님 확인';
        if (descEl) {
          descEl.textContent = '설정해 두신 부모님 비밀번호를 입력해 주세요.';
        }
        if (submitBtn) submitBtn.textContent = '확인';
      }

      if (pwInput) pwInput.value = '';
      if (errEl) errEl.classList.add('hidden');
      document.getElementById('admin-reset-confirm-box').classList.add('hidden');
      document.getElementById('admin-toast').classList.add('hidden');

      gateView.classList.remove('hidden');
      panelView.classList.add('hidden');
      modal.classList.remove('hidden');

      setTimeout(() => {
        if (pwInput) pwInput.focus();
      }, 60);
    }

    handleAdminPasswordSubmit() {
      const pwInput = document.getElementById('admin-password-input');
      const errEl = document.getElementById('admin-gate-error');
      const gateView = document.getElementById('admin-gate-view');
      const panelView = document.getElementById('admin-panel-view');
      const val = pwInput ? pwInput.value.trim() : '';

      if (!window.GameStorage.hasAdminPassword()) {
        if (!val) {
          if (errEl) {
            errEl.textContent = '사용하실 비밀번호를 1글자 이상 입력해 주세요.';
            errEl.classList.remove('hidden');
          }
          window.SoundFX.wrong();
          return;
        }
        window.GameStorage.setAdminPassword(val);
        window.SoundFX.correct();
        gateView.classList.add('hidden');
        panelView.classList.remove('hidden');
        this.refreshAdminPanelUI();
        this.showAdminToast('🔒 부모님 비밀번호가 설정되었습니다!');
        return;
      }

      if (window.GameStorage.verifyAdminPassword(val)) {
        window.SoundFX.correct();
        gateView.classList.add('hidden');
        panelView.classList.remove('hidden');
        this.refreshAdminPanelUI();
      } else {
        window.SoundFX.wrong();
        if (errEl) {
          errEl.textContent = '비밀번호가 일치하지 않습니다. 다시 입력해 주세요.';
          errEl.classList.remove('hidden');
        }
      }
    }

    refreshAdminPanelUI(statusObj) {
      const status = statusObj || window.GameStorage.getDailyStatus();
      const timeStatusEl = document.getElementById('admin-time-status');
      const heartStatusEl = document.getElementById('admin-heart-status');

      if (timeStatusEl) {
        const usedMin = Math.floor(status.usedSeconds / 60);
        const remText =
          status.timeLimitMinutes > 0
            ? `${formatSecondsMMSS(status.remainingSeconds)}`
            : '무제한';
        timeStatusEl.textContent = `오늘 사용: ${usedMin}분 / 남은 시간: ${remText}`;
      }

      if (heartStatusEl) {
        const remHearts = status.heartLimit > 0 ? `${status.remainingHearts}개` : '무제한';
        heartStatusEl.textContent = `오늘 소모: ${status.usedHearts}개 / 남은 하트: ${remHearts}`;
      }

      document.querySelectorAll('[data-time-limit]').forEach((btn) => {
        const mins = Number(btn.getAttribute('data-time-limit'));
        btn.classList.toggle('active', mins === status.timeLimitMinutes);
      });

      document.querySelectorAll('[data-heart-limit]').forEach((btn) => {
        const hearts = Number(btn.getAttribute('data-heart-limit'));
        btn.classList.toggle('active', hearts === status.heartLimit);
      });
    }

    showAdminToast(msg) {
      const toast = document.getElementById('admin-toast');
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.remove('hidden');
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => {
        toast.classList.add('hidden');
      }, 3000);
    }

    isAnyModalOpen() {
      return Array.from(document.querySelectorAll('.modal-overlay')).some(
        (el) => !el.classList.contains('hidden')
      );
    }

    resumePlayIfUnlocked() {
      const status = window.GameStorage.getDailyStatus();
      if (status.isLocked) return;

      const limitModal = document.getElementById('modal-daily-limit');
      if (limitModal) limitModal.classList.add('hidden');

      if (this.currentScreen === 'field') {
        this.fieldActive = true;
        this.lastFrameTime = performance.now();
      } else if (this.currentScreen === 'battle' && this.battle) {
        const resultActions = document.getElementById('battle-result-actions');
        const isResultVisible = resultActions && !resultActions.classList.contains('hidden');
        if (this.battle.phase === 'done' && !isResultVisible) {
          this.battle.phase = 'quiz';
          this.battle.hearts = 3;
          this.inputLocked = false;
          this.renderBattleHearts();
          this.renderCurrentBattleQuestion();
        }
      }
    }

    handlePokedexClosed() {
      const status = window.GameStorage.getDailyStatus();
      if (status.isLocked && (this.currentScreen === 'field' || this.currentScreen === 'battle')) {
        this.showDailyLimitModal(status.isHeartsUp ? 'heart' : 'time');
      } else {
        this.resumePlayIfUnlocked();
      }
    }

    closeModals() {
      const wasPokedexOpen = !document.getElementById('modal-pokedex').classList.contains('hidden');
      const wasAdminOpen = !document.getElementById('modal-admin').classList.contains('hidden');
      document.getElementById('modal-pokedex').classList.add('hidden');
      document.getElementById('modal-admin').classList.add('hidden');
      if (window.GameStorage.hasProfile()) {
        this.stopWebcamCapture();
        document.getElementById('modal-profile').classList.add('hidden');
      }
      if (wasPokedexOpen) {
        this.handlePokedexClosed();
      } else if (wasAdminOpen) {
        this.resumePlayIfUnlocked();
      }
    }

    updateSoundUI(enabled) {
      const icon = document.getElementById('sound-icon');
      const text = document.getElementById('sound-text');
      icon.textContent = enabled ? '🔊' : '🔇';
      text.textContent = enabled ? '소리 켜짐' : '소리 꺼짐';
    }

    showScreen(screenName) {
      if (window.EnglishTTS) {
        window.EnglishTTS.stop();
      }
      this.currentScreen = screenName;
      document.querySelectorAll('.screen').forEach((sec) => {
        sec.classList.toggle('active', sec.id === `screen-${screenName}`);
      });

      const changeRegionBtn = document.getElementById('btn-change-region');
      const placeBadge = document.getElementById('current-place-badge');

      if (screenName === 'title') {
        changeRegionBtn.classList.add('hidden');
        placeBadge.textContent = '🌟 포켓몬 퀴즈 대모험';
        this.fieldActive = false;
        window.SoundFX.playBGM('title');
      } else if (screenName === 'region') {
        changeRegionBtn.classList.add('hidden');
        placeBadge.textContent = '🗺️ 모험할 지역 고르기';
        this.fieldActive = false;
        this.updateRegionProgress();
        window.SoundFX.playBGM('title');
      } else if (screenName === 'field') {
        changeRegionBtn.classList.remove('hidden');
        placeBadge.textContent = REGION_META[this.currentRegion].name;
        this.fieldActive = true;
        this.resizeCanvas();
        if (this.balls.length === 0) {
          this.spawnFieldBalls();
        }
        window.SoundFX.playBGM('field');
      } else if (screenName === 'battle') {
        changeRegionBtn.classList.remove('hidden');
        placeBadge.textContent = '⚔️ 신나는 포켓몬 퀴즈 배틀!';
        this.fieldActive = false;
        window.SoundFX.playBGM(this.battle && this.battle.isGold ? 'legendary' : 'battle');
      }

      this.updateGlobalCounters();
      this.updateDailyLimitBadges();
    }

    updateGlobalCounters() {
      const totalPokemon = window.POKEMON_DATA.length;
      const caughtCount = window.GameStorage.getUniqueCaughtTotal();

      document.getElementById('header-pokedex-count').textContent = `도감 ${caughtCount} / ${totalPokemon}`;
      document.getElementById('title-pokedex-ratio').textContent = `${caughtCount} / ${totalPokemon}`;

      this.updateRegionProgress();
    }

    updateRegionProgress() {
      ['forest', 'city', 'desert', 'sea'].forEach((reg) => {
        const list = window.POKEMON_DATA.filter((p) => p.region === reg);
        const caught = list.filter((p) => window.GameStorage.isCaught(p.id)).length;
        const el = document.getElementById(`region-stat-${reg}`);
        if (el) {
          el.textContent = `잡은 포켓몬: ${caught} / ${list.length}`;
        }
      });
    }

    // ==================== 필드 탐험 로직 ====================
    enterField(region) {
      this.currentRegion = region || 'forest';
      this.player.x = this.fieldWidth / 2;
      this.player.y = this.fieldHeight / 2;
      this.player.targetX = null;
      this.player.targetY = null;
      this.generateDecorations();
      this.spawnFieldBalls();
      this.showScreen('field');
    }

    resizeCanvas() {
      const wrap = document.getElementById('canvas-wrap');
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        this.canvas.width = this.fieldWidth;
        this.canvas.height = this.fieldHeight;
      }
    }

    generateDecorations() {
      const meta = REGION_META[this.currentRegion];
      this.decorations = [];
      for (let i = 0; i < 18; i++) {
        this.decorations.push({
          x: 50 + Math.random() * (this.fieldWidth - 100),
          y: 65 + Math.random() * (this.fieldHeight - 120),
          emoji: meta.decoEmojis[i % meta.decoEmojis.length],
          size: 26 + Math.floor(Math.random() * 14),
        });
      }
    }

    spawnFieldBalls() {
      this.balls = [];
      const totalBalls = 6;
      // 최소 1개는 금색 볼이거나 25% 확률로 추가 금색 볼 등장
      const goldIndex = Math.floor(Math.random() * totalBalls);

      for (let i = 0; i < totalBalls; i++) {
        const isGold = i === goldIndex || Math.random() < 0.22;
        let x, y;
        let tries = 0;
        do {
          x = 80 + Math.random() * (this.fieldWidth - 160);
          y = 90 + Math.random() * (this.fieldHeight - 160);
          tries++;
        } while (
          Math.hypot(x - this.player.x, y - this.player.y) < 180 &&
          tries < 20
        );

        const angle = Math.random() * Math.PI * 2;
        // 아이가 충분히 보고 다가갈 수 있도록 포켓볼이 아주 느리게 움직이도록 설정
        const speed = (isGold ? 20 : 14) + Math.random() * 10;
        this.balls.push({
          id: `ball_${Date.now()}_${i}`,
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: isGold ? 26 : 23,
          rotation: Math.random() * Math.PI * 2,
          isGold,
        });
      }
    }

    gameLoop(timestamp) {
      const dt = Math.min(0.05, (timestamp - this.lastFrameTime) / 1000);
      this.lastFrameTime = timestamp;

      if (this.currentScreen === 'field' && this.fieldActive) {
        this.updateField(dt);
        this.renderField();
      }

      requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    updateField(dt) {
      // 1. 플레이어 이동 (키보드 or 클릭/터치 목표 지점)
      let moveX = 0;
      let moveY = 0;
      if (this.keys.left) moveX -= 1;
      if (this.keys.right) moveX += 1;
      if (this.keys.up) moveY -= 1;
      if (this.keys.down) moveY += 1;

      if (moveX !== 0 || moveY !== 0) {
        const len = Math.hypot(moveX, moveY);
        this.player.x += (moveX / len) * this.player.speed * dt;
        this.player.y += (moveY / len) * this.player.speed * dt;
        this.player.walkFrame += dt * 10;
      } else if (this.player.targetX !== null && this.player.targetY !== null) {
        const dx = this.player.targetX - this.player.x;
        const dy = this.player.targetY - this.player.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 6) {
          this.player.x = this.player.targetX;
          this.player.y = this.player.targetY;
          this.player.targetX = null;
          this.player.targetY = null;
        } else {
          this.player.x += (dx / dist) * this.player.speed * dt;
          this.player.y += (dy / dist) * this.player.speed * dt;
          this.player.walkFrame += dt * 10;
        }
      }

      // 경계 제한
      this.player.x = Math.max(40, Math.min(this.fieldWidth - 40, this.player.x));
      this.player.y = Math.max(55, Math.min(this.fieldHeight - 40, this.player.y));

      // 2. 몬스터볼 굴러다니기 & 충돌 검사
      for (let i = 0; i < this.balls.length; i++) {
        const b = this.balls[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.rotation += (b.vx * dt) / 22;

        if (b.x < b.radius + 24) {
          b.x = b.radius + 24;
          b.vx *= -1;
        } else if (b.x > this.fieldWidth - b.radius - 24) {
          b.x = this.fieldWidth - b.radius - 24;
          b.vx *= -1;
        }

        if (b.y < b.radius + 36) {
          b.y = b.radius + 36;
          b.vy *= -1;
        } else if (b.y > this.fieldHeight - b.radius - 24) {
          b.y = this.fieldHeight - b.radius - 24;
          b.vy *= -1;
        }

        // 플레이어와 몬스터볼 충돌 체크
        const dist = Math.hypot(this.player.x - b.x, this.player.y - b.y);
        if (dist < this.player.radius + b.radius + 4) {
          const hitBall = b;
          this.balls.splice(i, 1);
          this.startBattle(hitBall.isGold);
          return;
        }
      }

      if (this.balls.length === 0) {
        this.spawnFieldBalls();
      }
    }

    renderField() {
      const ctx = this.ctx;
      const meta = REGION_META[this.currentRegion];

      // 배경 그라데이션
      const grad = ctx.createLinearGradient(0, 0, 0, this.fieldHeight);
      grad.addColorStop(0, meta.bgTop);
      grad.addColorStop(1, meta.bgBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.fieldWidth, this.fieldHeight);

      // 산책로 트랙
      ctx.save();
      ctx.strokeStyle = meta.pathColor;
      ctx.lineWidth = 52;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(this.fieldWidth / 2, this.fieldHeight / 2, 175, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 배경 장식 이모지
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const d of this.decorations) {
        ctx.font = `${d.size}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
        ctx.fillText(d.emoji, d.x, d.y);
      }
      ctx.restore();

      // 클릭 이동 목표 마커 표시
      if (this.player.targetX !== null && this.player.targetY !== null) {
        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(this.player.targetX, this.player.targetY, 20, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 209, 102, 0.55)';
        ctx.beginPath();
        ctx.arc(this.player.targetX, this.player.targetY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 굴러다니는 몬스터볼 그리기
      for (const b of this.balls) {
        this.drawRollingBall(ctx, b);
      }

      // 주인공 트레이너 그리기
      this.drawPlayer(ctx);
    }

    drawRollingBall(ctx, b) {
      ctx.save();
      ctx.translate(b.x, b.y);

      // 금색 볼 후광 효과
      if (b.isGold) {
        const pulse = 1 + Math.sin(performance.now() / 160) * 0.14;
        ctx.fillStyle = 'rgba(255, 215, 0, 0.35)';
        ctx.beginPath();
        ctx.arc(0, 0, b.radius * 1.45 * pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      // 바닥 그림자
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.beginPath();
      ctx.ellipse(0, b.radius + 5, b.radius * 0.85, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.rotate(b.rotation);

      // 위쪽 반원 (빨강 or 황금)
      ctx.beginPath();
      ctx.arc(0, 0, b.radius, Math.PI, 0, false);
      ctx.fillStyle = b.isGold ? '#ffd166' : '#ff4d6d';
      ctx.fill();

      // 아래쪽 반원 (하양 or 연노랑)
      ctx.beginPath();
      ctx.arc(0, 0, b.radius, 0, Math.PI, false);
      ctx.fillStyle = b.isGold ? '#fff3b0' : '#ffffff';
      ctx.fill();

      // 테두리 및 가운데 줄
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#1d3557';
      ctx.beginPath();
      ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-b.radius, 0);
      ctx.lineTo(b.radius, 0);
      ctx.stroke();

      // 중앙 버튼
      ctx.beginPath();
      ctx.arc(0, 0, b.radius * 0.32, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.stroke();

      ctx.restore();

      if (b.isGold) {
        ctx.save();
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#1d3557';
        ctx.fillText('✨전설볼', b.x, b.y - b.radius - 10);
        ctx.restore();
      }
    }

    drawPlayer(ctx) {
      const p = this.player;
      // 가만히 있을 때도 얼굴과 몸이 숨쉬듯 까딱까딱 움직이고, 걸어다닐 때는 더 신나게 흔들림!
      const idlePhase = performance.now() / 240;
      const isMoving =
        this.keys.left ||
        this.keys.right ||
        this.keys.up ||
        this.keys.down ||
        (p.targetX !== null && p.targetY !== null);
      const motionPhase = isMoving ? p.walkFrame * 1.35 : idlePhase;
      const bounce = isMoving ? Math.sin(p.walkFrame * 1.4) * 4.2 : Math.sin(idlePhase) * 2.2;
      const headTilt = isMoving
        ? Math.sin(p.walkFrame * 1.1) * 0.19
        : Math.sin(idlePhase * 0.85) * 0.11;

      const profile = window.GameStorage.getProfile();
      const avatarMeta = AVATAR_THEMES[profile.avatarId] || AVATAR_THEMES.red;
      const hatStyle = profile.hatStyle || avatarMeta.defaultHat || 'cap';
      const hasPhotoFace =
        Boolean(profile.photoDataUrl) &&
        this.playerFaceImg &&
        this.playerFaceImg.complete &&
        (this.playerFaceImg.naturalWidth > 0 || this.playerFaceImg.width > 0);

      ctx.save();
      ctx.translate(p.x, p.y + bounce);

      // 바닥 그림자
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 28 - bounce, 24, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // 다리/발 흔들림
      const legSwing = Math.sin(motionPhase) * 5;
      ctx.fillStyle = '#1d3557';
      ctx.beginPath();
      ctx.roundRect(-13, 16 + legSwing * 0.5, 10, 10, 5);
      ctx.roundRect(3, 16 - legSwing * 0.5, 10, 10, 5);
      ctx.fill();

      // 양팔 흔들림
      const armSwing = Math.sin(motionPhase) * 0.35;
      ctx.fillStyle = avatarMeta.shirtColor;
      ctx.strokeStyle = '#1d3557';
      ctx.lineWidth = 3.5;

      ctx.save();
      ctx.translate(-19, 2);
      ctx.rotate(armSwing);
      ctx.beginPath();
      ctx.roundRect(-5, -2, 10, 18, 5);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(19, 2);
      ctx.rotate(-armSwing);
      ctx.beginPath();
      ctx.roundRect(-5, -2, 10, 18, 5);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 몸통
      ctx.fillStyle = avatarMeta.shirtColor;
      ctx.strokeStyle = '#1d3557';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(-18, -5, 36, 26, 12);
      ctx.fill();
      ctx.stroke();

      // ==================== 까딱까딱 움직이는 얼굴 & 모자 그룹 ====================
      ctx.save();
      ctx.translate(0, -19);
      ctx.rotate(headTilt);

      const headRadius = 21;

      if (hasPhotoFace) {
        // 1) 아이 얼굴 사진이 등록된 경우: 원형 클리핑으로 아이 얼굴을 꽉 차게 그리고 까딱까딱 흔들림!
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, headRadius, 0, Math.PI * 2);
        ctx.clip();
        try {
          ctx.drawImage(
            this.playerFaceImg,
            -headRadius,
            -headRadius,
            headRadius * 2,
            headRadius * 2
          );
        } catch (e) {
          ctx.fillStyle = '#ffe5d9';
          ctx.fill();
        }
        ctx.restore();

        // 얼굴 사진 외곽 만화풍 테두리
        ctx.strokeStyle = '#1d3557';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, headRadius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // 2) 캐릭터 프리셋 얼굴 (지우, 피카츄, 이슬이, 단델, 고글 박사)
        if (profile.avatarId === 'misty') {
          // 이슬이 옆꽁지 머리
          ctx.fillStyle = '#f77f00';
          ctx.strokeStyle = '#1d3557';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.ellipse(19, -6, 9, 6, -0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        ctx.fillStyle = avatarMeta.skinColor || '#ffe5d9';
        ctx.strokeStyle = '#1d3557';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, headRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 눈 & 볼터치 & 미소
        const eyeOffset = p.facing * 4;
        ctx.fillStyle = '#1d3557';
        ctx.beginPath();
        ctx.arc(-6 + eyeOffset, 1, 2.8, 0, Math.PI * 2);
        ctx.arc(6 + eyeOffset, 1, 2.8, 0, Math.PI * 2);
        ctx.fill();

        // 반짝이는 눈동자 하이라이트
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-7 + eyeOffset, 0, 1.1, 0, Math.PI * 2);
        ctx.arc(5 + eyeOffset, 0, 1.1, 0, Math.PI * 2);
        ctx.fill();

        // 볼터치 (피카츄는 빨간 전기 볼, 나머지는 분홍 볼)
        ctx.fillStyle = profile.avatarId === 'pikachu' ? '#ff4757' : '#ff8fab';
        ctx.beginPath();
        ctx.arc(-11 + eyeOffset, 5, 3.6, 0, Math.PI * 2);
        ctx.arc(11 + eyeOffset, 5, 3.6, 0, Math.PI * 2);
        ctx.fill();

        // 활짝 웃는 입
        ctx.strokeStyle = '#1d3557';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(eyeOffset, 5, 4.5, 0.15 * Math.PI, 0.85 * Math.PI, false);
        ctx.stroke();
      }

      // 3) 머리 꼭대기 위 모자·장식 그리기 (아이 얼굴 사진을 절대 가리지 않도록 정수리 위쪽에 얹음!)
      if (hatStyle === 'cap') {
        const capBaseY = -headRadius + 3; // y = -18 (얼굴 원 y = -21..+21 중 맨 위 테두리에만 살짝 걸침)
        ctx.fillStyle = avatarMeta.hatColor || '#ef476f';
        ctx.strokeStyle = '#1d3557';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.arc(0, capBaseY, 15.5, Math.PI, 0, false);
        ctx.fill();
        ctx.stroke();

        // 모자 앞 흰색 반원 마크
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, capBaseY - 1, 5.5, Math.PI, 0, false);
        ctx.fill();

        // 모자 챙 (이마 위쪽 정수리 라인에 위치하여 얼굴 사진을 가리지 않음)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(p.facing > 0 ? -2 : -20, capBaseY - 3, 22, 5.5, 3);
        ctx.fill();
        ctx.stroke();
      } else if (hatStyle === 'pika') {
        // 쫑긋쫑긋 흔들리는 피카츄 귀 (정수리 위로 솟음)
        const earWiggle = Math.sin(motionPhase * 1.4) * 0.12;
        [-1, 1].forEach((dir) => {
          ctx.save();
          ctx.translate(dir * 12, -headRadius + 1);
          ctx.rotate(dir * 0.38 + earWiggle * dir);
          ctx.fillStyle = '#ffb703';
          ctx.strokeStyle = '#1d3557';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(0, -10, 5.5, 13, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // 귀 끝 검은 포인트
          ctx.fillStyle = '#1d3557';
          ctx.beginPath();
          ctx.arc(0, -19, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      } else if (hatStyle === 'crown') {
        // 반짝이는 황금 왕관 (정수리 위)
        ctx.fillStyle = '#ffd166';
        ctx.strokeStyle = '#1d3557';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-13, -headRadius + 2);
        ctx.lineTo(-15, -headRadius - 12);
        ctx.lineTo(-6, -headRadius - 4);
        ctx.lineTo(0, -headRadius - 15);
        ctx.lineTo(6, -headRadius - 4);
        ctx.lineTo(15, -headRadius - 12);
        ctx.lineTo(13, -headRadius + 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (hatStyle === 'goggle') {
        // 탐험가 고글 (얼굴을 가리지 않도록 머리 꼭대기/이마 맨 위에 착용)
        const goggleY = -headRadius + 2;
        ctx.fillStyle = '#1d3557';
        ctx.fillRect(-15, goggleY - 2, 30, 4);
        ctx.fillStyle = '#00f5d4';
        ctx.strokeStyle = '#1d3557';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(-6.5, goggleY, 5.5, 0, Math.PI * 2);
        ctx.arc(6.5, goggleY, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore(); // 얼굴 & 모자 회전 그룹 종료

      // 머리 위 내 이름표 배지 (모자 위쪽에 겹치지 않게 배치)
      const badgeEmoji =
        (HAT_THEMES[hatStyle] && HAT_THEMES[hatStyle].emoji) || avatarMeta.emoji;
      const labelText = `${badgeEmoji} ${profile.playerName}`;
      ctx.font = 'bold 14px "Pretendard", sans-serif';
      const textWidth = ctx.measureText(labelText).width;
      const pillW = Math.max(68, textWidth + 18);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
      ctx.strokeStyle = '#1d3557';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-pillW / 2, -76, pillW, 22, 11);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1d3557';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, 0, -65);

      ctx.restore();
    }

    // ==================== 배틀 & 퀴즈 시스템 ====================
    pickPokemonForBattle(isGold) {
      let pool;
      if (isGold) {
        pool = window.POKEMON_DATA.filter(
          (p) => p.isLegendary && p.region === this.currentRegion
        );
        if (pool.length === 0) {
          pool = window.POKEMON_DATA.filter((p) => p.isLegendary);
        }
      } else {
        pool = window.POKEMON_DATA.filter(
          (p) => !p.isLegendary && p.region === this.currentRegion
        );
      }

      // 아직 안 잡은 포켓몬을 70% 우선 확률로 선택
      const uncaught = pool.filter((p) => !window.GameStorage.isCaught(p.id));
      const targetPool = uncaught.length > 0 && Math.random() < 0.7 ? uncaught : pool;
      return targetPool[Math.floor(Math.random() * targetPool.length)];
    }

    buildSilhouetteOptions(correctPokemon) {
      const others = window.POKEMON_DATA.filter((p) => p.id !== correctPokemon.id);
      const picked = shuffleArray(others).slice(0, 3).map((p) => p.name);
      return shuffleArray([correctPokemon.name, ...picked]);
    }

    pickLearningQuestions(count) {
      const categories = ['math', 'korean', 'english', 'creativity'];
      const selected = [];
      const selectedKeys = new Set();

      for (let i = 0; i < count; i++) {
        const cat = categories[i % categories.length];
        if (cat === 'math' && Math.random() < 0.35 && typeof window.generateDynamicMathQuestion === 'function') {
          let dynQ = null;
          let dynKey = '';
          for (let attempt = 0; attempt < 12; attempt++) {
            const candidate = window.generateDynamicMathQuestion();
            const cText = candidate.question || candidate.q;
            const cKey = `math:${cText}`;
            if (!this.usedQuestionKeys.has(cKey) && !selectedKeys.has(cKey)) {
              dynQ = candidate;
              dynKey = cKey;
              break;
            }
            if (!dynQ) {
              dynQ = candidate;
              dynKey = cKey;
            }
          }
          if (dynQ) {
            this.usedQuestionKeys.add(dynKey);
            selectedKeys.add(dynKey);
            selected.push(dynQ);
            continue;
          }
        }

        const bank = window.QUESTION_BANK[cat] || [];
        let unused = bank.filter((q) => {
          const key = `${cat}:${q.question || q.q}`;
          return !this.usedQuestionKeys.has(key) && !selectedKeys.has(key);
        });
        if (unused.length === 0) {
          // 해당 카테고리의 문제만 순환 초기화 (다른 카테고리 기록은 유지)
          for (const key of Array.from(this.usedQuestionKeys)) {
            if (key.startsWith(`${cat}:`)) {
              this.usedQuestionKeys.delete(key);
            }
          }
          unused = bank.filter((q) => !selectedKeys.has(`${cat}:${q.question || q.q}`));
          if (unused.length === 0) unused = bank;
        }
        const item = unused[Math.floor(Math.random() * unused.length)];
        const questionText = item.question || item.q;
        const pickedKey = `${cat}:${questionText}`;
        this.usedQuestionKeys.add(pickedKey);
        selectedKeys.add(pickedKey);

        selected.push({
          category: cat,
          q: questionText,
          options: shuffleArray(item.options),
          answer: item.answer,
        });
      }

      if (window.GameStorage && typeof window.GameStorage.saveRecentQuestionKeys === 'function') {
        window.GameStorage.saveRecentQuestionKeys(Array.from(this.usedQuestionKeys));
      }

      return shuffleArray(selected);
    }

    startBattle(isGold = false) {
      if (!this.checkCanPlayOrShowLock()) return;

      const dailyStatus = window.GameStorage.getDailyStatus();
      const initialHearts =
        dailyStatus.heartLimit > 0 ? Math.min(3, dailyStatus.remainingHearts) : 3;

      const pokemon = this.pickPokemonForBattle(isGold);
      const totalQuizCount = isGold ? 4 : 2;
      const questions = this.pickLearningQuestions(totalQuizCount);

      this.battle = {
        pokemon,
        isGold,
        hearts: initialHearts,
        phase: 'silhouette', // 'silhouette' | 'quiz' | 'done'
        silhouetteOptions: this.buildSilhouetteOptions(pokemon),
        questions,
        currentQuestionIndex: 0,
        disabledOptions: new Set(),
      };

      window.GameStorage.recordEncounter();
      window.SoundFX.battleStart(isGold);

      this.prepareBattleStageUI();
      this.showScreen('battle');
      this.renderCurrentBattleQuestion();
    }

    prepareBattleStageUI() {
      const { pokemon, isGold } = this.battle;
      const stage = document.getElementById('battle-stage');
      const aura = document.getElementById('stage-aura');
      const img = document.getElementById('battle-pokemon-img');
      const fallback = document.getElementById('battle-pokemon-fallback');
      const revealBanner = document.getElementById('pokemon-reveal-banner');
      const mysteryMarks = document.getElementById('mystery-marks');
      const captureBall = document.getElementById('capture-ball');
      const captureStars = document.getElementById('capture-stars');
      const ballBadge = document.getElementById('battle-ball-type-badge');
      const resultActions = document.getElementById('battle-result-actions');
      const optionsGrid = document.getElementById('quiz-options-grid');

      stage.classList.toggle('gold-stage', isGold);
      aura.classList.toggle('gold', isGold);

      ballBadge.classList.toggle('gold', isGold);
      ballBadge.textContent = isGold
        ? '🌟 황금 몬스터볼 (전설·환상 / 문제 4개)'
        : '🔴 일반 몬스터볼 (문제 2개)';

      // 포켓몬 이미지 및 오프라인 대비 이모지 폴백
      img.className = 'battle-pokemon-img silhouette';
      fallback.classList.add('hidden');
      img.onerror = () => {
        img.classList.add('hidden');
        fallback.classList.remove('hidden');
        fallback.textContent = isGold ? '🌟❓' : '🐾❓';
      };
      img.src = pokemon.image;

      revealBanner.classList.add('hidden');
      mysteryMarks.classList.remove('hidden');
      captureBall.className = 'capture-ball hidden';
      captureStars.classList.add('hidden');
      resultActions.classList.add('hidden');
      optionsGrid.classList.remove('hidden');
      const storyCard = document.getElementById('english-story-card');
      if (storyCard) storyCard.classList.add('hidden');

      this.renderBattleHearts();
    }

    renderBattleHearts() {
      const box = document.getElementById('battle-hearts');
      box.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const span = document.createElement('span');
        span.className = `heart-icon ${i < this.battle.hearts ? 'active' : 'lost'}`;
        span.textContent = '❤️';
        box.appendChild(span);
      }
    }

    renderCurrentBattleQuestion() {
      this.inputLocked = false;
      this.battle.disabledOptions.clear();
      if (window.EnglishTTS) {
        window.EnglishTTS.stop();
      }

      const stepInd = document.getElementById('battle-step-indicator');
      const catBadge = document.getElementById('quiz-category-badge');
      const progText = document.getElementById('quiz-progress-text');
      const qBox = document.getElementById('quiz-question-box');
      const feedback = document.getElementById('quiz-feedback-banner');
      const grid = document.getElementById('quiz-options-grid');
      const storyCard = document.getElementById('english-story-card');

      if (storyCard) storyCard.classList.add('hidden');
      grid.classList.remove('hidden');
      feedback.className = 'quiz-feedback-banner hidden';
      grid.innerHTML = '';

      let options = [];
      let answer = '';
      let isEnglishQuiz = false;

      if (this.battle.phase === 'silhouette') {
        stepInd.textContent = '1단계: 누구일까?';
        catBadge.textContent = '❓ 포켓몬 실루엣 퀴즈';
        progText.textContent = '이름 맞히기';
        qBox.textContent = '검은 그림자 속 포켓몬의 이름은 무엇일까요?';
        options = this.battle.silhouetteOptions;
        answer = this.battle.pokemon.name;
      } else {
        const idx = this.battle.currentQuestionIndex;
        const total = this.battle.questions.length;
        const qObj = this.battle.questions[idx];
        isEnglishQuiz = qObj.category === 'english';
        stepInd.textContent = `학습 문제 (${idx + 1} / ${total})`;
        catBadge.textContent = CATEGORY_LABELS[qObj.category] || '📚 신나는 퀴즈';
        progText.textContent = `${this.battle.pokemon.name}의 문제 ${idx + 1} / ${total}`;
        qBox.textContent = qObj.q || qObj.question;
        options = qObj.options;
        answer = qObj.answer;

        if (isEnglishQuiz && window.EnglishTTS) {
          window.EnglishTTS.prefetchWords(options);
          feedback.className = 'quiz-feedback-banner phonics';
          feedback.textContent =
            '🔊 단어 옆 [발음] 버튼을 누르면 알파벳을 하나씩 읽고 단어 발음을 들려줘요!';
        }
      }

      options.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = isEnglishQuiz ? 'quiz-option-btn english-option-btn' : 'quiz-option-btn';
        btn.setAttribute('data-option', optText);

        if (isEnglishQuiz) {
          const numBadge = document.createElement('span');
          numBadge.className = 'option-num-badge';
          numBadge.textContent = String(idx + 1);

          const labelWrap = document.createElement('span');
          labelWrap.className = 'option-label-text eng-word-wrap';
          String(optText)
            .split('')
            .forEach((ch, cIdx) => {
              const charSpan = document.createElement('span');
              charSpan.className = 'eng-char';
              charSpan.setAttribute('data-char-idx', String(cIdx));
              charSpan.textContent = ch;
              labelWrap.appendChild(charSpan);
            });

          const speakBtn = document.createElement('span');
          speakBtn.className = 'eng-speak-btn';
          speakBtn.setAttribute('role', 'button');
          speakBtn.setAttribute('tabindex', '0');
          speakBtn.setAttribute('data-speak-word', optText);
          speakBtn.setAttribute('title', `${optText} 알파벳과 발음 듣기`);
          speakBtn.textContent = '🔊 발음';

          speakBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.playEnglishOptionPronunciation(btn, speakBtn, optText);
          });

          btn.appendChild(numBadge);
          btn.appendChild(labelWrap);
          btn.appendChild(speakBtn);
        } else {
          btn.innerHTML = `
            <span class="option-num-badge">${idx + 1}</span>
            <span class="option-label-text">${optText}</span>
          `;
        }

        btn.addEventListener('click', () => this.handleAnswerClick(btn, optText, answer));
        grid.appendChild(btn);
      });
    }

    clearEnglishHighlightStates() {
      const grid = document.getElementById('quiz-options-grid');
      if (!grid || !grid.children) return;
      Array.from(grid.children).forEach((optBtn) => {
        if (!optBtn.children) return;
        Array.from(optBtn.children).forEach((child) => {
          if (child.classList && child.classList.contains('eng-speak-btn')) {
            child.classList.remove('speaking-active');
            child.textContent = '🔊 발음';
          }
          if (child.classList && child.classList.contains('eng-word-wrap') && child.children) {
            Array.from(child.children).forEach((c) => {
              if (c.classList) {
                c.classList.remove('char-active', 'word-whole-active');
              }
            });
          }
        });
      });
    }

    playEnglishOptionPronunciation(optionBtn, speakBtn, word) {
      if (!window.EnglishTTS) return;
      this.clearEnglishHighlightStates();

      speakBtn.classList.add('speaking-active');
      speakBtn.textContent = '🔊 읽는중';

      const feedback = document.getElementById('quiz-feedback-banner');
      const wordWrap =
        optionBtn.children &&
        Array.from(optionBtn.children).find(
          (c) => c.classList && c.classList.contains('eng-word-wrap')
        );
      const charSpans = wordWrap && wordWrap.children ? Array.from(wordWrap.children) : [];
      const letters = String(word).toUpperCase().split('');

      window.EnglishTTS.speakWordWithSpelling(word, {
        onLetter: (charIdx, ch, korName) => {
          charSpans.forEach((sp, i) => {
            if (sp.classList) {
              sp.classList.toggle('char-active', i === charIdx);
              sp.classList.remove('word-whole-active');
            }
          });
          if (feedback) {
            const parts = letters.map((l, i) =>
              i === charIdx ? `【 ${l}(${korName}) 】` : l
            );
            feedback.className = 'quiz-feedback-banner phonics';
            feedback.textContent = `🗣️ 알파벳 읽기: ${parts.join(' - ')}`;
          }
        },
        onWord: (fullWord) => {
          charSpans.forEach((sp) => {
            if (sp.classList) {
              sp.classList.remove('char-active');
              sp.classList.add('word-whole-active');
            }
          });
          if (feedback) {
            const guide = window.EnglishTTS.getKoreanLetterGuide(fullWord);
            feedback.className = 'quiz-feedback-banner phonics';
            feedback.textContent = `🌟 단어 발음: 【 ${fullWord} 】 (${guide})`;
          }
        },
        onEnd: () => {
          setTimeout(() => {
            this.clearEnglishHighlightStates();
          }, 300);
        },
      });
    }

    handleAnswerClick(btn, selectedText, correctAnswer) {
      if (this.inputLocked || this.battle.phase === 'done') return;
      if (this.battle.disabledOptions.has(selectedText)) return;

      if (window.EnglishTTS) {
        window.EnglishTTS.stop();
        this.clearEnglishHighlightStates();
      }

      const feedback = document.getElementById('quiz-feedback-banner');

      if (selectedText === correctAnswer) {
        // 정답!
        this.inputLocked = true;
        btn.classList.add('correct-choice');
        window.SoundFX.correct();
        window.GameStorage.recordQuestionSolved();

        if (this.battle.phase === 'silhouette') {
          this.revealPokemonIdentity();
          feedback.className = 'quiz-feedback-banner good';
          feedback.textContent = `🎉 정답! 정체는 "${this.battle.pokemon.name}"였어요! 이제 문제를 풀어 볼까요?`;

          setTimeout(() => {
            this.battle.phase = 'quiz';
            this.battle.currentQuestionIndex = 0;
            this.renderCurrentBattleQuestion();
          }, 1200);
        } else {
          const currentQ = this.battle.questions[this.battle.currentQuestionIndex];
          const nextIdx = this.battle.currentQuestionIndex + 1;
          const total = this.battle.questions.length;

          // 영어 단어 문제를 맞혔을 때는 까이유 스타일 그림 + 영어/한글 예시 문장 스토리 카드를 보여주고 읽어줌!
          if (currentQ && currentQ.category === 'english' && window.EnglishTTS) {
            this.showEnglishStoryCard(correctAnswer, nextIdx, total);
            return;
          }

          if (nextIdx < total) {
            feedback.className = 'quiz-feedback-banner good';
            feedback.textContent = `⭕ 맞았어요! 다음 문제(${nextIdx + 1}/${total})로 넘어갑니다!`;
            setTimeout(() => {
              this.battle.currentQuestionIndex = nextIdx;
              this.renderCurrentBattleQuestion();
            }, 950);
          } else {
            // 모든 학습 문제 정답 -> 몬스터볼 포획 연출!
            this.runCaptureSequence();
          }
        }
      } else {
        // 오답! (이번 배틀 하트 1 감소 + 오늘 총 하트 1 차감 + 이미 고른 오답 회색 비활성화)
        this.battle.hearts -= 1;
        this.battle.disabledOptions.add(selectedText);
        btn.disabled = true;
        btn.classList.add('wrong-disabled');
        this.renderBattleHearts();
        window.SoundFX.wrong();

        const dailyStatus = window.GameStorage.consumeDailyHeart(1);
        this.updateDailyLimitBadges(dailyStatus);

        // 오늘 총 하트를 모두 소진한 경우
        if (dailyStatus.isHeartsUp) {
          this.inputLocked = true;
          this.battle.phase = 'done';
          feedback.className = 'quiz-feedback-banner bad';
          feedback.textContent = '💔 오늘의 총 하트를 모두 사용했어요!';
          setTimeout(() => {
            this.showDailyLimitModal('heart');
          }, 900);
          return;
        }

        if (this.battle.hearts <= 0) {
          // 이번 배틀에서 3번 틀림 -> 포켓몬 도망!
          this.inputLocked = true;
          this.battle.phase = 'done';
          this.runFleeSequence();
        } else {
          feedback.className = 'quiz-feedback-banner bad';
          feedback.textContent = `💦 아까워요! 다시 골라 볼까요? (이번 배틀 하트 ${this.battle.hearts}개 남음)`;
        }
      }
    }

    // 영어 단어 정답 후 까이유 스타일 그림(이모지 장면) + 영어 예시 문장 + 한글 뜻 설명 카드 표시 및 음성 재생
    showEnglishStoryCard(word, nextIdx, total) {
      this.currentStoryWord = String(word || '').trim().toUpperCase();
      this.pendingStoryNextIdx = nextIdx;
      this.pendingStoryTotal = total;

      const story = window.EnglishTTS.getStorySentence(this.currentStoryWord);
      const feedback = document.getElementById('quiz-feedback-banner');
      const grid = document.getElementById('quiz-options-grid');
      const storyCard = document.getElementById('english-story-card');
      const sceneEl = document.getElementById('story-scene-emojis');
      const enEl = document.getElementById('story-sentence-en');
      const koEl = document.getElementById('story-sentence-ko');
      const nextBtn = document.getElementById('btn-story-next');

      if (feedback) {
        feedback.className = 'quiz-feedback-banner good';
        feedback.textContent = `🎉 정답! 【 ${this.currentStoryWord} 】 단어가 들어간 재미있는 문장을 들어 볼까요?`;
      }

      if (grid) grid.classList.add('hidden');

      if (sceneEl) sceneEl.textContent = story.scene;
      if (enEl) {
        // 예시 문장 속 정답 단어(단수/복수 포함)를 노란 형광펜으로 하이라이트
        const escaped = this.currentStoryWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(\\b${escaped}(?:s|es)?\\b)`, 'ig');
        enEl.innerHTML = story.en.replace(
          regex,
          '<mark class="story-word-highlight">$1</mark>'
        );
        enEl.classList.remove('speaking-now');
      }
      if (koEl) {
        koEl.textContent = story.ko;
        koEl.classList.remove('speaking-now');
      }

      if (nextBtn) {
        nextBtn.textContent =
          nextIdx < total
            ? `다음 문제로 넘어가기 (${nextIdx + 1}/${total}) ▶`
            : '🎯 몬스터볼 던져서 잡기! ▶';
      }

      if (storyCard) storyCard.classList.remove('hidden');

      // 영어 문장 -> 한글 뜻 순서로 자동 낭독!
      this.playCurrentStoryAudio(this.currentStoryWord);
    }

    playCurrentStoryAudio(word) {
      if (!window.EnglishTTS) return;
      const enEl = document.getElementById('story-sentence-en');
      const koEl = document.getElementById('story-sentence-ko');
      const replayBtn = document.getElementById('btn-story-replay');

      if (replayBtn) replayBtn.textContent = '🔊 문장 읽어주는 중...';

      window.EnglishTTS.speakStorySentence(word, {
        onEnglishStart: () => {
          if (enEl) enEl.classList.add('speaking-now');
          if (koEl) koEl.classList.remove('speaking-now');
        },
        onKoreanStart: () => {
          if (enEl) enEl.classList.remove('speaking-now');
          if (koEl) koEl.classList.add('speaking-now');
        },
        onEnd: () => {
          if (enEl) enEl.classList.remove('speaking-now');
          if (koEl) koEl.classList.remove('speaking-now');
          if (replayBtn) replayBtn.textContent = '🔊 영어·한글 문장 다시 듣기';
        },
      });
    }

    advanceFromEnglishStoryCard() {
      if (!this.battle || this.battle.phase === 'done') return;
      if (window.EnglishTTS) {
        window.EnglishTTS.stop();
      }

      const storyCard = document.getElementById('english-story-card');
      if (storyCard) storyCard.classList.add('hidden');

      const nextIdx = this.pendingStoryNextIdx;
      const total = this.pendingStoryTotal;
      this.currentStoryWord = null;

      if (nextIdx < total) {
        this.battle.currentQuestionIndex = nextIdx;
        this.renderCurrentBattleQuestion();
      } else {
        this.runCaptureSequence();
      }
    }

    revealPokemonIdentity() {
      const { pokemon } = this.battle;
      const img = document.getElementById('battle-pokemon-img');
      const mysteryMarks = document.getElementById('mystery-marks');
      const revealBanner = document.getElementById('pokemon-reveal-banner');
      const dexNo = document.getElementById('reveal-dex-no');
      const nameEl = document.getElementById('reveal-pokemon-name');
      const legTag = document.getElementById('reveal-legendary-tag');
      const typesWrap = document.getElementById('reveal-pokemon-types');

      img.classList.remove('silhouette');
      img.classList.add('revealed');
      mysteryMarks.classList.add('hidden');

      dexNo.textContent = `No.${String(pokemon.id).padStart(3, '0')}`;
      nameEl.textContent = pokemon.name;
      legTag.classList.toggle('hidden', !pokemon.isLegendary);

      typesWrap.innerHTML = '';
      pokemon.types.forEach((t) => {
        const span = document.createElement('span');
        span.className = 'type-pill';
        span.style.backgroundColor = (window.TYPE_COLORS && window.TYPE_COLORS[t]) || '#5c677d';
        span.textContent = `${t} 타입`;
        typesWrap.appendChild(span);
      });

      revealBanner.classList.remove('hidden');
      window.SoundFX.reveal();
    }

    runCaptureSequence() {
      this.battle.phase = 'done';
      this.inputLocked = true;

      const { pokemon, isGold } = this.battle;
      const profile = window.GameStorage.getProfile();
      const vocative = getKoreanVocative(profile.playerName);
      const qBox = document.getElementById('quiz-question-box');
      const feedback = document.getElementById('quiz-feedback-banner');
      const grid = document.getElementById('quiz-options-grid');
      const resultActions = document.getElementById('battle-result-actions');
      const img = document.getElementById('battle-pokemon-img');
      const captureBall = document.getElementById('capture-ball');
      const captureStars = document.getElementById('capture-stars');
      const stepInd = document.getElementById('battle-step-indicator');

      stepInd.textContent = '🎯 몬스터볼 포획 중!';
      qBox.textContent = `가랏! ${isGold ? '황금 몬스터볼' : '몬스터볼'}!!`;
      feedback.className = 'quiz-feedback-banner good';
      feedback.textContent = '문제를 모두 맞혀서 몬스터볼을 던졌어요!';
      grid.classList.add('hidden');

      captureBall.className = `capture-ball ${isGold ? 'gold-ball' : ''} throwing`;
      img.classList.add('capturing');
      window.SoundFX.captureThrow();

      setTimeout(() => {
        const res = window.GameStorage.recordCatch(pokemon.id);
        this.updateGlobalCounters();

        captureStars.classList.remove('hidden');
        window.SoundFX.captureSuccess();

        stepInd.textContent = '✨ 포획 대성공!';
        qBox.textContent = `🎊 신난다! [${pokemon.name}]을(를) 잡았다! (${profile.teamName})`;
        feedback.className = 'quiz-feedback-banner good';
        feedback.textContent = res.isFirstTime
          ? `📖 ${vocative}! 도감에 새로운 포켓몬 [${pokemon.name}]이(가) 등록되었어요!`
          : `📖 [${pokemon.name}] 친구를 벌써 ${res.count}번째 만났어요!`;

        resultActions.classList.remove('hidden');
      }, 950);
    }

    runFleeSequence() {
      const { pokemon } = this.battle;
      const img = document.getElementById('battle-pokemon-img');
      const qBox = document.getElementById('quiz-question-box');
      const feedback = document.getElementById('quiz-feedback-banner');
      const grid = document.getElementById('quiz-options-grid');
      const resultActions = document.getElementById('battle-result-actions');
      const stepInd = document.getElementById('battle-step-indicator');

      this.revealPokemonIdentity();
      img.classList.add('fleeing');
      window.SoundFX.flee();

      stepInd.textContent = '💨 포켓몬이 도망갔어요';
      qBox.textContent = `앗! 하트 3개를 모두 써서 [${pokemon.name}]이(가) 풀숲으로 도망갔어요!`;
      feedback.className = 'quiz-feedback-banner bad';
      feedback.textContent = '괜찮아요! 필드에서 다른 몬스터볼을 찾아 다시 도전해 봐요!';
      grid.classList.add('hidden');
      resultActions.classList.remove('hidden');
    }

    // ==================== 포켓몬 도감 모달 ====================
    openPokedexModal(defaultFilter) {
      const limitModal = document.getElementById('modal-daily-limit');
      if (limitModal) limitModal.classList.add('hidden');

      if (defaultFilter) {
        this.dexFilter = defaultFilter;
        document.querySelectorAll('[data-dex-filter]').forEach((b) =>
          b.classList.toggle('active', b.getAttribute('data-dex-filter') === defaultFilter)
        );
      }
      this.updateDexPeekAllButtonUI();
      this.renderPokedexGrid();
      document.getElementById('modal-pokedex').classList.remove('hidden');
    }

    updateDexPeekAllButtonUI() {
      const peekAllBtn = document.getElementById('btn-dex-peek-all');
      if (!peekAllBtn) return;
      peekAllBtn.classList.toggle('active', this.dexPeekAll);
      peekAllBtn.textContent = this.dexPeekAll
        ? '🙈 전체 힌트 숨기기'
        : '👁️ 전체 힌트 보기';
    }

    toggleSingleDexHint(pokemonId) {
      window.SoundFX.click();
      if (this.dexPeekAll) {
        // 전체 힌트가 켜져 있을 때 개별 카드를 누르면 전체 힌트 모드를 풀고 다른 카드들은 유지하거나 해당 카드만 숨김
        this.dexPeekAll = false;
        window.POKEMON_DATA.forEach((p) => {
          if (!window.GameStorage.isCaught(p.id) && p.id !== pokemonId) {
            this.dexPeekIds.add(p.id);
          }
        });
        this.dexPeekIds.delete(pokemonId);
        this.updateDexPeekAllButtonUI();
      } else if (this.dexPeekIds.has(pokemonId)) {
        this.dexPeekIds.delete(pokemonId);
      } else {
        this.dexPeekIds.add(pokemonId);
      }
      this.renderPokedexGrid();
    }

    renderPokedexGrid() {
      const all = window.POKEMON_DATA;
      const caughtTotal = window.GameStorage.getUniqueCaughtTotal();
      const legTotal = all.filter((p) => p.isLegendary).length;

      document.getElementById('pokedex-summary-text').textContent =
        `잡은 포켓몬: ${caughtTotal} / ${all.length}마리 (💡 ??? 카드는 [👁️ 힌트]를 누르면 정체를 볼 수 있어요!)`;
      document.getElementById('dex-count-all').textContent = all.length;
      document.getElementById('dex-count-caught').textContent = caughtTotal;
      document.getElementById('dex-count-legendary').textContent = legTotal;

      let filtered = all;
      if (this.dexFilter === 'caught') {
        filtered = all.filter((p) => window.GameStorage.isCaught(p.id));
      } else if (this.dexFilter === 'legendary') {
        filtered = all.filter((p) => p.isLegendary);
      }

      const grid = document.getElementById('pokedex-grid');
      grid.innerHTML = '';

      if (filtered.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'dex-empty-message';
        empty.textContent = '아직 잡은 포켓몬이 없어요! 모험을 떠나 몬스터볼을 잡아 보세요 🚀';
        grid.appendChild(empty);
        return;
      }

      const SHORT_REGION_LABEL = {
        forest: '🌲숲',
        city: '🏙️도시',
        desert: '🏜️사막',
        sea: '🌊바다',
      };

      const frag = document.createDocumentFragment();
      filtered.forEach((p) => {
        const caught = window.GameStorage.isCaught(p.id);
        const isPeeking = !caught && (this.dexPeekAll || this.dexPeekIds.has(p.id));
        const showInfo = caught || isPeeking;

        const card = document.createElement('div');
        card.className = [
          'dex-card',
          caught ? 'caught' : 'uncaught',
          isPeeking ? 'peek-hint' : '',
          p.isLegendary ? 'legendary' : '',
        ]
          .filter(Boolean)
          .join(' ');
        card.setAttribute('data-pokemon-id', String(p.id));

        const numStr = `No.${String(p.id).padStart(3, '0')}`;

        // 상단 줄 (도감 번호 + 미포획 시 👁️ 힌트 보기 버튼)
        const topRow = document.createElement('div');
        topRow.className = 'dex-card-top';

        const numSpan = document.createElement('span');
        numSpan.className = 'dex-num';
        numSpan.textContent = `${numStr}${p.isLegendary ? ' 🌟' : ''}`;
        topRow.appendChild(numSpan);

        if (!caught) {
          const hintBtn = document.createElement('button');
          hintBtn.type = 'button';
          hintBtn.className = `dex-hint-eye-btn ${isPeeking ? 'active' : ''}`;
          hintBtn.setAttribute('data-dex-hint-id', String(p.id));
          hintBtn.setAttribute(
            'title',
            isPeeking ? '힌트 다시 가리기' : '누구인지 이미지와 이름·특성 힌트 보기'
          );
          hintBtn.textContent = isPeeking ? '🙈 가리기' : '👁️ 힌트';
          hintBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleSingleDexHint(p.id);
          });
          topRow.appendChild(hintBtn);

          // 미포획 카드는 카드 자체를 클릭해도 힌트가 토글되도록 편의성 제공
          card.addEventListener('click', () => {
            this.toggleSingleDexHint(p.id);
          });
        } else {
          const caughtBadge = document.createElement('span');
          caughtBadge.className = 'dex-caught-badge';
          caughtBadge.textContent = '포획✓';
          topRow.appendChild(caughtBadge);
        }

        // 포켓몬 이미지
        const img = document.createElement('img');
        img.className = 'dex-img';
        img.loading = 'lazy';
        img.src = p.image;
        img.alt = showInfo ? p.name : '미발견 포켓몬';

        // 포켓몬 이름 (잡았거나 힌트 켜짐 시 실제 이름, 아니면 ???)
        const nameDiv = document.createElement('div');
        nameDiv.className = 'dex-name';
        nameDiv.textContent = showInfo ? p.name : '???';

        // 포켓몬 특성(타입 + 힌트 시 출현 지역 표시)
        const typesDiv = document.createElement('div');
        typesDiv.className = 'dex-types';
        if (showInfo) {
          const typeSpans = p.types
            .map(
              (t) =>
                `<span class="dex-type-dot" style="background:${
                  (window.TYPE_COLORS && window.TYPE_COLORS[t]) || '#6c757d'
                }">${t}</span>`
            )
            .join('');
          const regionBadge = isPeeking
            ? `<span class="dex-region-hint">${SHORT_REGION_LABEL[p.region] || ''}</span>`
            : '';
          typesDiv.innerHTML = `${typeSpans}${regionBadge}`;
        } else {
          typesDiv.innerHTML = `<span class="dex-type-dot" style="background:#adb5bd">???</span>`;
        }

        card.appendChild(topRow);
        card.appendChild(img);
        card.appendChild(nameDiv);
        card.appendChild(typesDiv);
        frag.appendChild(card);
      });

      grid.appendChild(frag);
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.PokemonGame = new PokemonQuizGame();
    window.GameApp = window.PokemonGame;
  });
})();
