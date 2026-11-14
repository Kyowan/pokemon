// 포켓몬 퀴즈 대모험! - 메인 게임 엔진 (타이틀, 지역 선택, 필드 캔버스, 배틀/퀴즈, 도감, 출석판, 일일 시간/하트 제한 & 부모님 관리자 모드)
(function () {
  const REGION_META = {
    forest: {
      id: 'forest',
      name: '🌲 속닥속닥 숲',
      shortName: '숲',
      bgTop: '#a8e063',
      bgBottom: '#56ab2f',
      pathColor: '#e6c280',
    },
    city: {
      id: 'city',
      name: '🏙️ 반짝반짝 도시',
      shortName: '도시',
      bgTop: '#dfe4ea',
      bgBottom: '#ced6e0',
      pathColor: '#a4b0be',
    },
    desert: {
      id: 'desert',
      name: '🏜️ 모래모래 사막',
      shortName: '사막',
      bgTop: '#ffeaa7',
      bgBottom: '#fab1a0',
      pathColor: '#f6b93b',
    },
    sea: {
      id: 'sea',
      name: '🌊 첨벙첨벙 바다',
      shortName: '바다',
      bgTop: '#74b9ff',
      bgBottom: '#0984e3',
      pathColor: '#ffeaa7',
    },
  };

  const CATEGORY_META = {
    math: { label: '➕ 덧셈·뺄셈', color: '#ffbe76' },
    korean: { label: '🇰🇷 한글 놀이', color: '#ff7979' },
    english: { label: '🔤 영어 단어', color: '#7ed6df' },
    creativity: { label: '💡 창의력 퀴즈', color: '#badc58' },
  };

  const TYPE_COLORS = {
    풀: '#78e08f',
    독: '#b867d9',
    불꽃: '#ff6b6b',
    물: '#4bcffa',
    벌레: '#badc58',
    노말: '#dfe4ea',
    비행: '#82ccdd',
    전기: '#ffd32a',
    땅: '#e58e26',
    페어리: '#f8a5c2',
    격투: '#e15f41',
    에스퍼: '#FDA7DF',
    바위: '#c4a46d',
    강철: '#95afc0',
    얼음: '#7ed6df',
    고스트: '#9980FA',
    드래곤: '#706fd3',
    악: '#57606f',
  };

  const STAMP_ICONS = ['⚡', '🌱', '🔥', '💧', '🌟', '👑', '🌈', '🦋', '🍀', '💎'];

  const AVATAR_META = {
    red: { icon: '🧢', hatColor: '#ff4757', brimColor: '#ffffff', bodyColor: '#1e90ff' },
    pikachu: { icon: '⚡', hatColor: '#ffd32a', brimColor: '#ffa801', bodyColor: '#2ed573' },
    crown: { icon: '👑', hatColor: '#ffd32a', brimColor: '#ff4757', bodyColor: '#9b59b6' },
    goggle: { icon: '🥽', hatColor: '#0fbcf9', brimColor: '#2f3542', bodyColor: '#ff7f50' },
  };

  // 한글 마지막 글자 받침 유무 판별하여 자연스러운 호격('민준아' / '지우야') 및 주격('민준이가' / '지우가') 생성
  function hasFinalConsonant(str) {
    const s = String(str || '').trim();
    if (!s) return false;
    const code = s.charCodeAt(s.length - 1);
    if (code < 0xac00 || code > 0xd7a3) return false;
    return (code - 0xac00) % 28 !== 0;
  }

  function callChildName(name) {
    const clean = String(name || '지우').trim() || '지우';
    return clean + (hasFinalConsonant(clean) ? '아' : '야');
  }

  function subjectChildName(name) {
    const clean = String(name || '지우').trim() || '지우';
    return clean + (hasFinalConsonant(clean) ? '이가' : '가');
  }

  function formatMMSS(totalSeconds) {
    if (!Number.isFinite(totalSeconds)) return '무제한';
    const sec = Math.max(0, Math.floor(totalSeconds));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  class PokemonQuizGame {
    constructor() {
      this.pokemonList = window.POKEMON_DATA || [];
      this.questionBank = window.QUESTION_BANK || {};
      this.currentScreen = 'title';
      this.currentRegion = 'forest';
      this.pokedexFilter = 'all';

      // 필드 상태
      this.canvas = document.getElementById('field-canvas');
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.fieldWidth = 900;
      this.fieldHeight = 560;
      this.player = {
        x: 450,
        y: 280,
        radius: 26,
        speed: 250,
        targetX: null,
        targetY: null,
        facing: 1,
        walkCycle: 0,
      };
      this.keysPressed = {};
      this.balls = [];
      this.scenery = [];
      this.targetRipple = null;
      this.lastFrameTime = performance.now();

      // 배틀 상태
      this.battle = null;
      this.recentQuestionTexts = new Set();

      // 관리자 모달 상태
      this.adminUnlocked = false;
      this.toastTimer = null;
      this.selectedAvatarId = window.GameStorage.getProfile().avatarId || 'red';

      this.init();
    }

    init() {
      const soundOn = window.GameStorage.getSoundEnabled();
      window.Sound.setEnabled(soundOn);
      this.updateSoundButtonUI(soundOn);

      this.todayStampResult = window.GameStorage.checkAndMarkTodayStamp();

      this.bindEvents();
      this.updateProfileUI();
      this.updateGlobalCounters();
      this.renderTitleStamps();
      this.updateRegionProgressUI();
      this.updateDailyLimitUI();

      // 1초마다 플레이 시간 누적 및 제한 체크 타이머
      this.playTimerId = setInterval(() => this.tickDailyTimer(), 1000);

      // 초기 접속 시 이미 오늘 제한(시간/하트)이 다 찼는지 확인
      this.checkAndShowDailyLimitLock();
      const locked = this.checkAndShowDailyLimitLock();

      // 처음 접속해 아직 이름/탐험대 프로필이 없으면 캐릭터·탐험대 설정 창 자동 오픈
      if (!locked && !window.GameStorage.hasProfile()) {
        this.openProfileModal();
      }

      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());
      requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    // 1초 주기 플레이 타이머
    tickDailyTimer() {
      if (document.hidden) return;
      const adminModal = document.getElementById('modal-admin');
      const isAdminOpen = adminModal && !adminModal.classList.contains('hidden');
      if (isAdminOpen) return;

      const status = window.GameStorage.getDailyStatus();
      if (!status.isLocked) {
        window.GameStorage.addPlayTime(1);
      }
      this.updateDailyLimitUI();
      this.checkAndShowDailyLimitLock();
    }

    updateDailyLimitUI() {
      const status = window.GameStorage.getDailyStatus();

      const timeTextEl = document.getElementById('header-time-text');
      const timePillBtn = document.getElementById('btn-header-limit-info');
      if (timeTextEl) {
        timeTextEl.textContent =
          status.timeLimitMinutes > 0 ? formatMMSS(status.remainingSeconds) : '시간 무제한';
      }
      if (timePillBtn) {
        timePillBtn.classList.toggle(
          'warning',
          status.timeLimitMinutes > 0 && status.remainingSeconds <= 180
        );
      }

      const heartTextEl = document.getElementById('header-daily-heart-text');
      if (heartTextEl) {
        heartTextEl.textContent =
          status.heartLimit > 0
            ? `오늘 하트 ${status.remainingHearts}/${status.heartLimit}`
            : '하트 무제한';
      }

      const battleDailyHeartBadge = document.getElementById('battle-daily-heart-badge');
      if (battleDailyHeartBadge) {
        battleDailyHeartBadge.textContent =
          status.heartLimit > 0
            ? `오늘 남은 하트: ${status.remainingHearts} / ${status.heartLimit}`
            : '오늘 하트: 무제한';
      }
    }

    checkAndShowDailyLimitLock() {
      const status = window.GameStorage.getDailyStatus();
      const limitModal = document.getElementById('modal-daily-limit');
      if (!limitModal) return false;

      if (!status.isLocked) {
        limitModal.classList.add('hidden');
        return false;
      }

      // 제한 도달 시 필드 이동 정지 및 잠금 모달 표시
      this.player.targetX = null;
      this.player.targetY = null;

      const iconEl = document.getElementById('limit-modal-icon');
      const titleEl = document.getElementById('limit-modal-title');
      const descEl = document.getElementById('limit-modal-desc');

      if (status.isTimeUp) {
        iconEl.textContent = '⏰';
        titleEl.textContent = '오늘 약속한 게임 시간이 모두 끝났어요!';
        descEl.textContent = `오늘 하루 제한 시간(${status.timeLimitMinutes}분) 동안 신나게 모험했어요! 포켓몬 친구들도 이제 푹 쉴 시간이에요. 내일 또 만나요!`;
      } else if (status.isHeartsUp) {
        iconEl.textContent = '💔';
        titleEl.textContent = '오늘 사용할 수 있는 하트를 모두 썼어요!';
        descEl.textContent = `오늘 주어진 하트 ${status.heartLimit}개를 모두 사용했어요. 내일 하트가 다시 가득 충전되면 포켓몬을 잡으러 가요!`;
      }

      limitModal.classList.remove('hidden');
      return true;
    }

    bindEvents() {
      // 상단 바 버튼
      document.getElementById('btn-home').addEventListener('click', () => {
        window.Sound.click();
        this.showScreen('title');
      });

      document.getElementById('btn-change-region').addEventListener('click', () => {
        window.Sound.click();
        if (this.checkAndShowDailyLimitLock()) return;
        this.showScreen('region');
      });

      document.getElementById('btn-open-pokedex').addEventListener('click', () => {
        window.Sound.click();
        this.openPokedexModal();
      });

      document.getElementById('btn-open-stamp').addEventListener('click', () => {
        window.Sound.click();
        this.openStampModal();
      });

      document.getElementById('btn-sound-toggle').addEventListener('click', () => {
        const next = !window.GameStorage.getSoundEnabled();
        window.GameStorage.setSoundEnabled(next);
        window.Sound.setEnabled(next);
        this.updateSoundButtonUI(next);
        if (next) window.Sound.click();
      });

      // 부모님 설정 (관리자 모드) 열기 버튼들
      ['btn-open-admin', 'btn-header-limit-info', 'btn-header-heart-info', 'btn-limit-open-admin'].forEach(
        (btnId) => {
          const el = document.getElementById(btnId);
          if (el) {
            el.addEventListener('click', () => {
              window.Sound.click();
              this.openAdminModal();
            });
          }
        }
      );

      document.getElementById('btn-limit-open-pokedex').addEventListener('click', () => {
        window.Sound.click();
        this.openPokedexModal();
      });

      // 타이틀 화면 버튼
      document.getElementById('btn-start-game').addEventListener('click', () => {
        window.Sound.click();
        if (this.checkAndShowDailyLimitLock()) return;
        this.showScreen('region');
      });

      document.getElementById('btn-title-pokedex').addEventListener('click', () => {
        window.Sound.click();
        this.openPokedexModal();
      });

      document.getElementById('btn-title-stamps').addEventListener('click', () => {
        window.Sound.click();
        this.openStampModal();
      });

      // 지역 카드 선택
      document.querySelectorAll('.region-card').forEach((card) => {
        card.addEventListener('click', () => {
          const region = card.getAttribute('data-region') || 'forest';
          window.Sound.click();
          if (this.checkAndShowDailyLimitLock()) return;
          this.enterField(region);
        });
      });

      // 필드 몬스터볼 새로 부르기
      document.getElementById('btn-respawn-balls').addEventListener('click', () => {
        window.Sound.click();
        if (this.checkAndShowDailyLimitLock()) return;
        this.spawnFieldBalls();
      });

      // 필드 캔버스 클릭 & 터치 이동
      if (this.canvas) {
        this.canvas.addEventListener('pointerdown', (e) => {
          if (this.currentScreen !== 'field') return;
          if (this.checkAndShowDailyLimitLock()) return;

          const rect = this.canvas.getBoundingClientRect();
          const scaleX = this.fieldWidth / rect.width;
          const scaleY = this.fieldHeight / rect.height;
          const tx = Math.max(36, Math.min(this.fieldWidth - 36, (e.clientX - rect.left) * scaleX));
          const ty = Math.max(56, Math.min(this.fieldHeight - 36, (e.clientY - rect.top) * scaleY));

          this.player.targetX = tx;
          this.player.targetY = ty;
          if (tx < this.player.x - 2) this.player.facing = -1;
          if (tx > this.player.x + 2) this.player.facing = 1;

          this.targetRipple = { x: tx, y: ty, radius: 6, alpha: 1.0 };
          window.Sound.moveTarget();
        });
      }

      // 키보드 조작
      window.addEventListener('keydown', (e) => {
        if (e.target && e.target.tagName === 'INPUT') {
          if (e.key === 'Escape') this.closeModals();
          return;
        }
        const key = e.key.toLowerCase();

        if (e.key === 'Escape') {
          this.closeModals();
          return;
        }

        if (this.currentScreen === 'battle' && ['1', '2', '3', '4'].includes(e.key)) {
          if (window.GameStorage.getDailyStatus().isLocked) return;
          const idx = parseInt(e.key, 10) - 1;
          const buttons = document.querySelectorAll('#quiz-options-grid .quiz-option-btn');
          if (buttons[idx] && !buttons[idx].disabled) {
            buttons[idx].click();
          }
          return;
        }

        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
          this.keysPressed[key] = true;
          if (this.currentScreen === 'field') {
            this.player.targetX = null;
            this.player.targetY = null;
          }
        }
      });

      window.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        delete this.keysPressed[key];
      });

      // 배틀 종료 후 버튼
      document.getElementById('btn-back-to-field').addEventListener('click', () => {
        window.Sound.click();
        if (this.checkAndShowDailyLimitLock()) return;
        this.returnToFieldFromBattle();
      });

      document.getElementById('btn-battle-open-pokedex').addEventListener('click', () => {
        window.Sound.click();
        this.openPokedexModal();
      });

      // 도감 모달 닫기 및 필터
      document.getElementById('btn-close-pokedex').addEventListener('click', () => {
        window.Sound.click();
        document.getElementById('modal-pokedex').classList.add('hidden');
      });

      document.querySelectorAll('[data-dex-filter]').forEach((btn) => {
        btn.addEventListener('click', () => {
          window.Sound.click();
          document.querySelectorAll('[data-dex-filter]').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.pokedexFilter = btn.getAttribute('data-dex-filter') || 'all';
          this.renderPokedexGrid();
        });
      });

      // 출석판 모달 닫기
      document.getElementById('btn-close-stamp').addEventListener('click', () => {
        window.Sound.click();
        document.getElementById('modal-stamp').classList.add('hidden');
      });

      // 관리자 모달 이벤트 바인딩
      this.bindAdminModalEvents();
      this.bindProfileModalEvents();

      // 모달 바깥 배경 클릭 시 닫기 (단, 일일 제한 잠금 모달은 바깥 클릭으로 닫히지 않음)
      document.querySelectorAll('.modal-overlay').forEach((overlay) => {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay && overlay.id !== 'modal-daily-limit') {
            window.Sound.click();
            overlay.classList.add('hidden');
          }
        });
      });
    }

    bindAdminModalEvents() {
      document.getElementById('btn-close-admin').addEventListener('click', () => {
        window.Sound.click();
        document.getElementById('modal-admin').classList.add('hidden');
      });

      const pwdInput = document.getElementById('admin-password-input');
      const pwdSubmitBtn = document.getElementById('btn-admin-password-submit');
      if (pwdSubmitBtn) {
        pwdSubmitBtn.addEventListener('click', () => this.handleAdminPasswordSubmit());
      }
      if (pwdInput) {
        pwdInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.handleAdminPasswordSubmit();
          }
        });
      }

      const changePwdBtn = document.getElementById('btn-admin-change-password');
      if (changePwdBtn) {
        changePwdBtn.addEventListener('click', () => {
          const newInput = document.getElementById('admin-new-password-input');
          const val = newInput ? String(newInput.value || '').trim() : '';
          if (!val) {
            window.Sound.wrong();
            this.showAdminToast('⚠️ 변경할 새 비밀번호를 입력해 주세요.');
            return;
          }
          window.GameStorage.setAdminPassword(val);
          if (newInput) newInput.value = '';
          window.Sound.correct();
          this.showAdminToast('🔑 관리자 비밀번호가 변경되었습니다!');
        });
      }

      // 하루 제한 시간 선택 버튼
      document.querySelectorAll('[data-time-limit]').forEach((btn) => {
        btn.addEventListener('click', () => {
          window.Sound.click();
          const minutes = Number(btn.getAttribute('data-time-limit'));
          window.GameStorage.setDailyLimits({ dailyTimeLimitMinutes: minutes });
          this.refreshAdminPanelUI();
          this.updateDailyLimitUI();
          this.checkAndShowDailyLimitLock();
          this.showAdminToast(
            minutes > 0 ? `하루 게임 시간이 ${minutes}분으로 설정되었습니다.` : '하루 게임 시간이 무제한으로 설정되었습니다.'
          );
        });
      });

      // 오늘 사용 시간 0분으로 리셋 (시간 충전)
      document.getElementById('btn-admin-refill-time').addEventListener('click', () => {
        window.Sound.correct();
        window.GameStorage.refillTodayTime();
        this.refreshAdminPanelUI();
        this.updateDailyLimitUI();
        this.checkAndShowDailyLimitLock();
        this.showAdminToast('⚡ 오늘 사용한 시간이 0분으로 초기화되어 다시 플레이할 수 있습니다!');
      });

      // 하루 총 하트 개수 선택 버튼
      document.querySelectorAll('[data-heart-limit]').forEach((btn) => {
        btn.addEventListener('click', () => {
          window.Sound.click();
          const hearts = Number(btn.getAttribute('data-heart-limit'));
          window.GameStorage.setDailyLimits({ dailyHeartLimit: hearts });
          this.refreshAdminPanelUI();
          this.updateDailyLimitUI();
          this.checkAndShowDailyLimitLock();
          this.showAdminToast(
            hearts > 0 ? `하루 총 하트가 ${hearts}개로 설정되었습니다.` : '하루 총 하트가 무제한으로 설정되었습니다.'
          );
        });
      });

      // 오늘 하트 가득 채우기
      document.getElementById('btn-admin-refill-hearts').addEventListener('click', () => {
        window.Sound.correct();
        window.GameStorage.refillTodayHearts();
        if (this.battle && !this.battle.finished) {
          this.battle.hearts = this.battle.maxHearts;
          this.renderBattleHearts();
        }
        this.refreshAdminPanelUI();
        this.updateDailyLimitUI();
        this.checkAndShowDailyLimitLock();
        this.showAdminToast('💖 오늘의 하트가 가득 충전되었습니다!');
      });

      // 전체 초기화 1단계 버튼
      document.getElementById('btn-admin-reset-all').addEventListener('click', () => {
        window.Sound.click();
        document.getElementById('admin-reset-confirm-box').classList.remove('hidden');
      });

      // 전체 초기화 취소
      document.getElementById('btn-admin-confirm-reset-no').addEventListener('click', () => {
        window.Sound.click();
        document.getElementById('admin-reset-confirm-box').classList.add('hidden');
      });

      // 전체 초기화 확정 실행
      document.getElementById('btn-admin-confirm-reset-yes').addEventListener('click', () => {
        window.Sound.stamp();
        window.GameStorage.resetAllData();
        document.getElementById('admin-reset-confirm-box').classList.add('hidden');
        this.updateProfileUI();
        this.updateGlobalCounters();
        this.renderTitleStamps();
        this.updateRegionProgressUI();
        this.updateDailyLimitUI();
        this.refreshAdminPanelUI();
        this.checkAndShowDailyLimitLock();
        this.showScreen('title');
        this.showAdminToast('🗑️ 도감과 출석 도장, 기록이 모두 처음 상태로 초기화되었습니다!');
      });
    }

    bindProfileModalEvents() {
      const editBtn = document.getElementById('btn-edit-profile');
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          window.Sound.click();
          this.openProfileModal();
        });
      }

      const closeBtn = document.getElementById('btn-close-profile');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          window.Sound.click();
          document.getElementById('modal-profile').classList.add('hidden');
        });
      }

      // 아바타 카드 선택
      document.querySelectorAll('[data-avatar]').forEach((card) => {
        card.addEventListener('click', () => {
          window.Sound.click();
          this.selectedAvatarId = card.getAttribute('data-avatar') || 'red';
          document.querySelectorAll('[data-avatar]').forEach((c) => c.classList.remove('active'));
          card.classList.add('active');
          this.updateProfilePreviewGreeting();
        });
      });

      // 탐험대 추천 프리셋 버튼 클릭
      document.querySelectorAll('[data-team-preset]').forEach((btn) => {
        btn.addEventListener('click', () => {
          window.Sound.click();
          const preset = btn.getAttribute('data-team-preset') || '⚡ 번개 탐험대';
          const teamInput = document.getElementById('profile-team-name');
          if (teamInput) teamInput.value = preset;
          this.updateProfilePreviewGreeting();
        });
      });

      // 이름/탐험대 입력 시 실시간 인사말 미리보기 갱신
      ['profile-player-name', 'profile-team-name'].forEach((id) => {
        const inputEl = document.getElementById(id);
        if (inputEl) {
          inputEl.addEventListener('input', () => this.updateProfilePreviewGreeting());
          inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              this.saveProfileFromModal();
            }
          });
        }
      });

      // 저장 완료 버튼
      const saveBtn = document.getElementById('btn-save-profile');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => this.saveProfileFromModal());
      }
    }

    openProfileModal() {
      const profile = window.GameStorage.getProfile();
      this.selectedAvatarId = profile.avatarId || 'red';

      const nameInput = document.getElementById('profile-player-name');
      const teamInput = document.getElementById('profile-team-name');

      if (nameInput) {
        nameInput.value = window.GameStorage.hasProfile() ? profile.playerName : '';
      }
      if (teamInput) {
        teamInput.value = profile.teamName || '⚡ 번개 탐험대';
      }

      document.querySelectorAll('[data-avatar]').forEach((c) => {
        c.classList.toggle('active', c.getAttribute('data-avatar') === this.selectedAvatarId);
      });

      this.updateProfilePreviewGreeting();
      document.getElementById('modal-profile').classList.remove('hidden');
    }

    updateProfilePreviewGreeting() {
      const nameInput = document.getElementById('profile-player-name');
      const teamInput = document.getElementById('profile-team-name');
      const previewEl = document.getElementById('profile-preview-greeting');
      if (!previewEl) return;

      const rawName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : '지우';
      const rawTeam = teamInput && teamInput.value.trim() ? teamInput.value.trim() : '⚡ 번개 탐험대';
      const avatar = AVATAR_META[this.selectedAvatarId] || AVATAR_META.red;

      previewEl.textContent = `${avatar.icon} "${callChildName(rawName)} 안녕? [${rawTeam}] 대장님이 된 걸 환영해!"`;
    }

    saveProfileFromModal() {
      const nameInput = document.getElementById('profile-player-name');
      const teamInput = document.getElementById('profile-team-name');

      const playerName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : '지우';
      const teamName = teamInput && teamInput.value.trim() ? teamInput.value.trim() : '⚡ 번개 탐험대';

      window.GameStorage.setProfile({
        playerName,
        teamName,
        avatarId: this.selectedAvatarId || 'red',
      });

      window.Sound.correct();
      this.updateProfileUI();
      document.getElementById('modal-profile').classList.add('hidden');
    }

    updateProfileUI() {
      const profile = window.GameStorage.getProfile();
      const avatar = AVATAR_META[profile.avatarId] || AVATAR_META.red;

      const avatarIconEl = document.getElementById('title-avatar-icon');
      const teamBadgeEl = document.getElementById('title-team-badge');
      const greetingMsgEl = document.getElementById('title-greeting-msg');
      const regionTitleEl = document.getElementById('region-section-title');

      if (avatarIconEl) avatarIconEl.textContent = avatar.icon;
      if (teamBadgeEl) teamBadgeEl.textContent = profile.teamName;
      if (greetingMsgEl) {
        greetingMsgEl.textContent = `${callChildName(profile.playerName)} 안녕? 오늘도 포켓몬 친구들을 만나러 가 볼까!`;
      }
      if (regionTitleEl) {
        regionTitleEl.textContent = `${profile.playerName} 대장님! [${profile.teamName}]는 어느 지역으로 떠날까요?`;
      }
    }

    openAdminModal() {
      const modal = document.getElementById('modal-admin');
      const gateView = document.getElementById('admin-gate-view');
      const panelView = document.getElementById('admin-panel-view');
      const gateBadge = document.getElementById('admin-gate-badge');
      const gateDesc = document.getElementById('admin-gate-desc');
      const pwdInput = document.getElementById('admin-password-input');
      const pwdSubmitBtn = document.getElementById('btn-admin-password-submit');
      const gateError = document.getElementById('admin-gate-error');
      const confirmBox = document.getElementById('admin-reset-confirm-box');

      confirmBox.classList.add('hidden');
      gateError.classList.add('hidden');
      if (pwdInput) pwdInput.value = '';

      if (!window.GameStorage.hasAdminPassword()) {
        // 최초 1회 비밀번호 설정 화면
        gateBadge.textContent = '🔒 관리자 비밀번호 최초 설정';
        gateDesc.textContent = '처음 한 번 사용할 부모님 비밀번호를 입력해 설정해 주세요.';
        pwdSubmitBtn.textContent = '비밀번호 저장 및 열기';
      } else {
        // 설정된 비밀번호 확인 화면
        gateBadge.textContent = '🔒 관리자 비밀번호 입력';
        gateDesc.textContent = '설정하신 부모님 비밀번호를 입력해 주세요.';
        pwdSubmitBtn.textContent = '확인';
      }

      gateView.classList.remove('hidden');
      panelView.classList.add('hidden');
      modal.classList.remove('hidden');

      setTimeout(() => {
        if (pwdInput && typeof pwdInput.focus === 'function') pwdInput.focus();
      }, 30);
    }

    handleAdminPasswordSubmit() {
      const pwdInput = document.getElementById('admin-password-input');
      const gateError = document.getElementById('admin-gate-error');
      const val = pwdInput ? String(pwdInput.value || '').trim() : '';

      if (!window.GameStorage.hasAdminPassword()) {
        if (!val) {
          window.Sound.wrong();
          gateError.textContent = '사용할 비밀번호를 1글자 이상 입력해 주세요.';
          gateError.classList.remove('hidden');
          return;
        }
        window.GameStorage.setAdminPassword(val);
        window.Sound.correct();
        this.unlockAdminPanel();
        this.showAdminToast('🔑 관리자 비밀번호가 설정되었습니다!');
      } else {
        if (window.GameStorage.verifyAdminPassword(val)) {
          window.Sound.correct();
          this.unlockAdminPanel();
        } else {
          window.Sound.wrong();
          gateError.textContent = '비밀번호가 일치하지 않습니다. 다시 입력해 주세요.';
          gateError.classList.remove('hidden');
        }
      }
    }

    unlockAdminPanel() {
      this.adminUnlocked = true;
      document.getElementById('admin-gate-view').classList.add('hidden');
      document.getElementById('admin-panel-view').classList.remove('hidden');
      this.refreshAdminPanelUI();
    }

    refreshAdminPanelUI() {
      const status = window.GameStorage.getDailyStatus();

      // 시간 상태 업데이트
      const usedMin = Math.floor(status.usedSeconds / 60);
      const usedSec = status.usedSeconds % 60;
      const timeStatusEl = document.getElementById('admin-time-status');
      if (timeStatusEl) {
        timeStatusEl.textContent =
          status.timeLimitMinutes > 0
            ? `오늘 사용: ${usedMin}분 ${usedSec}초 / 남은 시간: ${formatMMSS(status.remainingSeconds)}`
            : `오늘 사용: ${usedMin}분 ${usedSec}초 (무제한 설정 중)`;
      }

      document.querySelectorAll('[data-time-limit]').forEach((btn) => {
        const val = Number(btn.getAttribute('data-time-limit'));
        btn.classList.toggle('active', val === status.timeLimitMinutes);
      });

      // 하트 상태 업데이트
      const heartStatusEl = document.getElementById('admin-heart-status');
      if (heartStatusEl) {
        heartStatusEl.textContent =
          status.heartLimit > 0
            ? `오늘 소모: ${status.usedHearts}개 / 남은 하트: ${status.remainingHearts}개`
            : `오늘 소모: ${status.usedHearts}개 (무제한 설정 중)`;
      }

      document.querySelectorAll('[data-heart-limit]').forEach((btn) => {
        const val = Number(btn.getAttribute('data-heart-limit'));
        btn.classList.toggle('active', val === status.heartLimit);
      });
    }

    showAdminToast(msg) {
      const toast = document.getElementById('admin-toast');
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.remove('hidden');
      if (this.toastTimer) clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        toast.classList.add('hidden');
      }, 2800);
    }

    updateSoundButtonUI(enabled) {
      const iconEl = document.getElementById('sound-icon');
      const textEl = document.getElementById('sound-text');
      if (iconEl) iconEl.textContent = enabled ? '🔊' : '🔇';
      if (textEl) textEl.textContent = enabled ? '소리 켜짐' : '소리 꺼짐';
    }

    updateGlobalCounters() {
      const caughtCount = window.GameStorage.getUniqueCaughtTotal();
      const totalPokemon = this.pokemonList.length;
      const stamps = window.GameStorage.getStamps();

      const headerDex = document.getElementById('header-pokedex-count');
      if (headerDex) headerDex.textContent = `도감 ${caughtCount} / ${totalPokemon}`;

      const titleDex = document.getElementById('title-pokedex-ratio');
      if (titleDex) titleDex.textContent = `${caughtCount} / ${totalPokemon}`;

      const headerStamp = document.getElementById('header-stamp-count');
      if (headerStamp) headerStamp.textContent = `출석 ${stamps.length}일`;

      const titleStampTotal = document.getElementById('title-stamp-total');
      if (titleStampTotal) titleStampTotal.textContent = String(stamps.length);

      const titleStampDesc = document.getElementById('title-stamp-desc');
      if (titleStampDesc) {
        titleStampDesc.textContent = `지금까지 총 ${stamps.length}개의 출석 도장을 모았어요!`;
      }
    }

    renderTitleStamps() {
      const container = document.getElementById('title-mini-stamps');
      if (!container) return;
      const stamps = window.GameStorage.getStamps();
      container.innerHTML = '';

      const maxDots = 7;
      for (let i = 0; i < maxDots; i++) {
        const dot = document.createElement('div');
        if (i < stamps.length) {
          dot.className = 'mini-stamp-dot stamped';
          dot.textContent = STAMP_ICONS[i % STAMP_ICONS.length];
          dot.title = `${i + 1}일차 출석 (${stamps[i]})`;
        } else {
          dot.className = 'mini-stamp-dot';
          dot.textContent = '·';
        }
        container.appendChild(dot);
      }
    }

    updateRegionProgressUI() {
      ['forest', 'city', 'desert', 'sea'].forEach((reg) => {
        const regionalList = this.pokemonList.filter((p) => p.region === reg);
        const caughtRegional = regionalList.filter((p) => window.GameStorage.isCaught(p.id)).length;
        const el = document.getElementById(`region-stat-${reg}`);
        if (el) {
          el.textContent = `잡은 포켓몬: ${caughtRegional} / ${regionalList.length}`;
        }
      });
    }

    showScreen(screenName) {
      this.currentScreen = screenName;
      document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
      const target = document.getElementById(`screen-${screenName}`);
      if (target) target.classList.add('active');

      const changeRegionBtn = document.getElementById('btn-change-region');
      const placeBadge = document.getElementById('current-place-badge');

      if (screenName === 'title') {
        changeRegionBtn.classList.add('hidden');
        placeBadge.textContent = '🌟 포켓몬 퀴즈 대모험';
        this.updateGlobalCounters();
        this.renderTitleStamps();
        window.Sound.playBGM('title');
      } else if (screenName === 'region') {
        changeRegionBtn.classList.add('hidden');
        placeBadge.textContent = '🗺️ 모험할 지역 고르기';
        this.updateRegionProgressUI();
        window.Sound.playBGM('title');
      } else if (screenName === 'field') {
        changeRegionBtn.classList.remove('hidden');
        const meta = REGION_META[this.currentRegion];
        placeBadge.textContent = `${meta.name} 탐험 중`;
        window.Sound.playBGM('field');
        setTimeout(() => this.resizeCanvas(), 20);
      } else if (screenName === 'battle') {
        changeRegionBtn.classList.remove('hidden');
        placeBadge.textContent = '⚔️ 신나는 포켓몬 퀴즈 배틀!';
        window.Sound.playBGM(this.battle && this.battle.isGold ? 'legendary' : 'battle');
      }
    }

    // ========================================================================
    // 필드 탐험 & 캔버스 렌더링
    // ========================================================================
    enterField(region) {
      if (this.checkAndShowDailyLimitLock()) return;
      this.currentRegion = region;
      this.showScreen('field');
      this.resizeCanvas();

      this.player.x = this.fieldWidth / 2;
      this.player.y = this.fieldHeight / 2;
      this.player.targetX = null;
      this.player.targetY = null;

      this.generateScenery(region);
      this.spawnFieldBalls();
    }

    resizeCanvas() {
      if (!this.canvas) return;
      const wrap = document.getElementById('canvas-wrap');
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 10) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.fieldWidth = rect.width;
      this.fieldHeight = rect.height;
      this.canvas.width = Math.floor(rect.width * dpr);
      this.canvas.height = Math.floor(rect.height * dpr);
      if (this.ctx) {
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      this.player.x = Math.max(40, Math.min(this.fieldWidth - 40, this.player.x));
      this.player.y = Math.max(60, Math.min(this.fieldHeight - 40, this.player.y));
    }

    generateScenery(region) {
      this.scenery = [];
      const count = 14;
      for (let i = 0; i < count; i++) {
        const x = 60 + ((i * 137) % Math.max(200, this.fieldWidth - 120));
        const y = 80 + ((i * 97) % Math.max(180, this.fieldHeight - 130));
        this.scenery.push({
          x,
          y,
          scale: 0.85 + (i % 3) * 0.18,
          variant: i % 3,
          region,
        });
      }
    }

    spawnFieldBalls() {
      this.balls = [];
      const totalBalls = 6;
      const goldIndex = Math.floor(Math.random() * totalBalls);

      for (let i = 0; i < totalBalls; i++) {
        const isGold = i === goldIndex || Math.random() < 0.2;
        let bx, by;
        let attempts = 0;
        do {
          bx = 70 + Math.random() * Math.max(150, this.fieldWidth - 140);
          by = 85 + Math.random() * Math.max(150, this.fieldHeight - 150);
          attempts++;
        } while (
          Math.hypot(bx - this.player.x, by - this.player.y) < 130 &&
          attempts < 25
        );

        const speed = isGold ? 95 + Math.random() * 45 : 65 + Math.random() * 45;
        const dir = Math.random() * Math.PI * 2;
        this.balls.push({
          id: `ball-${Date.now()}-${i}`,
          x: bx,
          y: by,
          vx: Math.cos(dir) * speed,
          vy: Math.sin(dir) * speed,
          radius: isGold ? 25 : 22,
          isGold,
          rotation: Math.random() * Math.PI * 2,
          bouncePhase: Math.random() * Math.PI * 2,
        });
      }
    }

    gameLoop(timestamp) {
      const dt = Math.min(0.05, (timestamp - this.lastFrameTime) / 1000);
      this.lastFrameTime = timestamp;

      if (this.currentScreen === 'field') {
        if (!window.GameStorage.getDailyStatus().isLocked) {
          this.updateField(dt);
        }
        this.renderField(timestamp / 1000);
      }

      requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    updateField(dt) {
      let dx = 0;
      let dy = 0;
      if (this.keysPressed['arrowleft'] || this.keysPressed['a']) dx -= 1;
      if (this.keysPressed['arrowright'] || this.keysPressed['d']) dx += 1;
      if (this.keysPressed['arrowup'] || this.keysPressed['w']) dy -= 1;
      if (this.keysPressed['arrowdown'] || this.keysPressed['s']) dy += 1;

      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        this.player.x += (dx / len) * this.player.speed * dt;
        this.player.y += (dy / len) * this.player.speed * dt;
        if (dx < 0) this.player.facing = -1;
        if (dx > 0) this.player.facing = 1;
        this.player.walkCycle += dt * 12;
      } else if (this.player.targetX !== null && this.player.targetY !== null) {
        const distX = this.player.targetX - this.player.x;
        const distY = this.player.targetY - this.player.y;
        const dist = Math.hypot(distX, distY);
        if (dist <= 6) {
          this.player.x = this.player.targetX;
          this.player.y = this.player.targetY;
          this.player.targetX = null;
          this.player.targetY = null;
        } else {
          const step = Math.min(dist, this.player.speed * dt);
          this.player.x += (distX / dist) * step;
          this.player.y += (distY / dist) * step;
          this.player.walkCycle += dt * 12;
        }
      }

      this.player.x = Math.max(36, Math.min(this.fieldWidth - 36, this.player.x));
      this.player.y = Math.max(64, Math.min(this.fieldHeight - 36, this.player.y));

      if (this.targetRipple) {
        this.targetRipple.radius += dt * 65;
        this.targetRipple.alpha -= dt * 1.8;
        if (this.targetRipple.alpha <= 0) {
          this.targetRipple = null;
        }
      }

      for (let i = 0; i < this.balls.length; i++) {
        const b = this.balls[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.rotation += (b.vx * dt) / 18;
        b.bouncePhase += dt * 6;

        const minX = 36;
        const maxX = this.fieldWidth - 36;
        const minY = 68;
        const maxY = this.fieldHeight - 36;

        if (b.x < minX) { b.x = minX; b.vx = Math.abs(b.vx); }
        if (b.x > maxX) { b.x = maxX; b.vx = -Math.abs(b.vx); }
        if (b.y < minY) { b.y = minY; b.vy = Math.abs(b.vy); }
        if (b.y > maxY) { b.y = maxY; b.vy = -Math.abs(b.vy); }

        const dist = Math.hypot(this.player.x - b.x, this.player.y - b.y);
        if (dist < this.player.radius + b.radius) {
          if (this.checkAndShowDailyLimitLock()) break;
          const hitBall = this.balls.splice(i, 1)[0];
          this.player.targetX = null;
          this.player.targetY = null;
          this.startBattle(hitBall);
          break;
        }
      }

      if (this.balls.length === 0) {
        this.spawnFieldBalls();
      }
    }

    renderField(timeSec) {
      if (!this.ctx) return;
      const ctx = this.ctx;
      const w = this.fieldWidth;
      const h = this.fieldHeight;
      const meta = REGION_META[this.currentRegion] || REGION_META.forest;

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, meta.bgTop);
      grad.addColorStop(1, meta.bgBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      if (this.currentRegion === 'forest') {
        ctx.strokeStyle = 'rgba(230, 194, 128, 0.7)';
        ctx.lineWidth = 48;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(60, h * 0.55);
        ctx.bezierCurveTo(w * 0.35, h * 0.25, w * 0.65, h * 0.85, w - 60, h * 0.45);
        ctx.stroke();
      } else if (this.currentRegion === 'city') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 4;
        for (let gx = 80; gx < w; gx += 110) {
          ctx.beginPath();
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, h);
          ctx.stroke();
        }
        for (let gy = 80; gy < h; gy += 110) {
          ctx.beginPath();
          ctx.moveTo(0, gy);
          ctx.lineTo(w, gy);
          ctx.stroke();
        }
      } else if (this.currentRegion === 'desert') {
        ctx.fillStyle = '#4bcffa';
        ctx.beginPath();
        ctx.ellipse(w * 0.76, h * 0.68, 85, 48, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ffeaa7';
        ctx.stroke();
      } else if (this.currentRegion === 'sea') {
        ctx.fillStyle = '#ffeaa7';
        ctx.beginPath();
        ctx.ellipse(w * 0.5, h * 0.92, w * 0.65, h * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 4;
        for (let wy = 110; wy < h * 0.68; wy += 75) {
          ctx.beginPath();
          const waveOffset = Math.sin(timeSec * 2 + wy) * 12;
          ctx.moveTo(40 + waveOffset, wy);
          ctx.quadraticCurveTo(w * 0.5, wy - 14, w - 40 + waveOffset, wy);
          ctx.stroke();
        }
      }
      ctx.restore();

      this.scenery.forEach((item) => {
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.scale(item.scale, item.scale);
        if (this.currentRegion === 'forest') {
          ctx.fillStyle = '#8d5524';
          ctx.fillRect(-7, 4, 14, 22);
          ctx.fillStyle = item.variant === 0 ? '#2ed573' : '#26de81';
          ctx.beginPath();
          ctx.arc(0, -6, 24, 0, Math.PI * 2);
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#2f3542';
          ctx.stroke();
        } else if (this.currentRegion === 'city') {
          ctx.fillStyle = item.variant === 0 ? '#70a1ff' : '#ff7f50';
          ctx.strokeStyle = '#2f3542';
          ctx.lineWidth = 3;
          ctx.fillRect(-20, -32, 40, 52);
          ctx.strokeRect(-20, -32, 40, 52);
          ctx.fillStyle = '#fff9db';
          ctx.fillRect(-12, -24, 9, 9);
          ctx.fillRect(3, -24, 9, 9);
          ctx.fillRect(-12, -8, 9, 9);
          ctx.fillRect(3, -8, 9, 9);
        } else if (this.currentRegion === 'desert') {
          if (item.variant === 0) {
            ctx.fillStyle = '#f0932b';
            ctx.beginPath();
            ctx.moveTo(0, -28);
            ctx.lineTo(30, 20);
            ctx.lineTo(-30, 20);
            ctx.closePath();
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#2f3542';
            ctx.stroke();
          } else {
            ctx.fillStyle = '#2ed573';
            ctx.strokeStyle = '#2f3542';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(-8, -24, 16, 42, 8);
            ctx.fill();
            ctx.stroke();
          }
        } else if (this.currentRegion === 'sea') {
          ctx.fillStyle = item.variant === 0 ? '#ff6b81' : '#ffd32a';
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#2f3542';
          ctx.stroke();
        }
        ctx.restore();
      });

      if (this.player.targetX !== null && this.player.targetY !== null) {
        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(this.player.x, this.player.y);
        ctx.lineTo(this.player.targetX, this.player.targetY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(255, 211, 42, 0.45)';
        ctx.strokeStyle = '#2f3542';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.player.targetX, this.player.targetY, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      if (this.targetRipple) {
        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.targetRipple.alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.targetRipple.x, this.targetRipple.y, this.targetRipple.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      this.balls.forEach((b) => {
        const bounceOffset = Math.abs(Math.sin(b.bouncePhase)) * 8;
        ctx.save();
        ctx.translate(b.x, b.y);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.beginPath();
        ctx.ellipse(0, b.radius + 3, b.radius * 0.85, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        if (b.isGold) {
          const glowRadius = b.radius + 10 + Math.sin(timeSec * 6) * 4;
          const aura = ctx.createRadialGradient(0, -bounceOffset, 4, 0, -bounceOffset, glowRadius);
          aura.addColorStop(0, 'rgba(255, 211, 42, 0.9)');
          aura.addColorStop(1, 'rgba(255, 211, 42, 0)');
          ctx.fillStyle = aura;
          ctx.beginPath();
          ctx.arc(0, -bounceOffset, glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.translate(0, -bounceOffset);
        ctx.rotate(b.rotation);

        ctx.beginPath();
        ctx.arc(0, 0, b.radius, Math.PI, 0, false);
        ctx.fillStyle = b.isGold ? '#ffd32a' : '#ff4757';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, b.radius, 0, Math.PI, false);
        ctx.fillStyle = b.isGold ? '#fff9db' : '#ffffff';
        ctx.fill();

        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#2f3542';
        ctx.beginPath();
        ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-b.radius, 0);
        ctx.lineTo(b.radius, 0);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fillStyle = b.isGold ? '#ffa801' : '#ffffff';
        ctx.fill();
        ctx.stroke();

        ctx.restore();

        if (b.isGold) {
          ctx.save();
          ctx.font = '900 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#2f3542';
          ctx.fillText('✨황금볼✨', b.x, b.y - b.radius - bounceOffset - 8);
          ctx.restore();
        }
      });

      this.drawPlayer(ctx);
    }

    drawPlayer(ctx) {
      const p = this.player;
      const profile = window.GameStorage.getProfile();
      const avatar = AVATAR_META[profile.avatarId] || AVATAR_META.red;
      const walkBob =
        p.targetX !== null || Object.keys(this.keysPressed).length > 0
          ? Math.sin(p.walkCycle) * 4
          : 0;

      ctx.save();
      ctx.translate(p.x, p.y);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 26, 20, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.translate(0, walkBob);
      ctx.scale(p.facing, 1);

      ctx.fillStyle = '#1e90ff';
      // 선택한 아바타의 조끼 색상
      ctx.fillStyle = avatar.bodyColor;
      ctx.strokeStyle = '#2f3542';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(-14, 0, 28, 22, 8);
      ctx.fill();
      ctx.stroke();

      // 얼굴
      ctx.fillStyle = '#ffeaa7';
      ctx.beginPath();
      ctx.arc(0, -10, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ff4757';
      // 선택한 아바타의 모자/왕관 색상
      ctx.fillStyle = avatar.hatColor;
      ctx.beginPath();
      ctx.arc(0, -14, 16.5, Math.PI, 0, false);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillStyle = avatar.brimColor;
      ctx.beginPath();
      ctx.roundRect(2, -16, 19, 6, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#2f3542';
      ctx.beginPath();
      ctx.arc(6, -8, 2.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff7675';
      ctx.beginPath();
      ctx.arc(10, -4, 3.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 머리 위 탐험대 이름 + 주인공 이름표 표시
      const labelText = `[${profile.teamName}] ${profile.playerName}`;
      ctx.save();
      ctx.font = '900 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#2f3542';
      ctx.lineWidth = 4;
      ctx.strokeText('나(주인공)', p.x, p.y - 36);
      ctx.fillText('나(주인공)', p.x, p.y - 36);
      ctx.strokeText(labelText, p.x, p.y - 36);
      ctx.fillText(labelText, p.x, p.y - 36);
      ctx.restore();
    }

    // ========================================================================
    // 배틀 및 퀴즈 로직
    // ========================================================================
    pickBattlePokemon(isGold) {
      if (isGold) {
        const allLegendaries = this.pokemonList.filter((p) => p.isLegendary);
        const regionalUncaught = allLegendaries.filter(
          (p) => p.region === this.currentRegion && !window.GameStorage.isCaught(p.id)
        );
        const anyUncaught = allLegendaries.filter((p) => !window.GameStorage.isCaught(p.id));
        const pool =
          regionalUncaught.length > 0
            ? regionalUncaught
            : anyUncaught.length > 0
            ? anyUncaught
            : allLegendaries;
        return pool[Math.floor(Math.random() * pool.length)];
      } else {
        const regionalNormals = this.pokemonList.filter(
          (p) => p.region === this.currentRegion && !p.isLegendary
        );
        const uncaughtNormals = regionalNormals.filter((p) => !window.GameStorage.isCaught(p.id));
        const pool =
          uncaughtNormals.length > 0 && Math.random() < 0.8 ? uncaughtNormals : regionalNormals;
        return pool[Math.floor(Math.random() * pool.length)];
      }
    }

    pickLearningQuestions(count) {
      const categories = ['math', 'korean', 'english', 'creativity'];
      const shuffledCats = [...categories].sort(() => Math.random() - 0.5);
      const selected = [];

      for (let i = 0; i < count; i++) {
        const cat = shuffledCats[i % shuffledCats.length];
        const bank = this.questionBank[cat] || [];
        let candidates = bank.filter((q) => !this.recentQuestionTexts.has(q.question));
        if (candidates.length === 0) {
          this.recentQuestionTexts.clear();
          candidates = bank;
        }
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        this.recentQuestionTexts.add(chosen.question);

        const shuffledOptions = [...chosen.options].sort(() => Math.random() - 0.5);
        selected.push({
          category: cat,
          question: chosen.question,
          options: shuffledOptions,
          answer: chosen.answer,
        });
      }
      return selected;
    }

    buildSilhouetteQuestion(targetPokemon) {
      const others = this.pokemonList
        .filter((p) => p.id !== targetPokemon.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((p) => p.name);

      const options = [targetPokemon.name, ...others].sort(() => Math.random() - 0.5);
      return {
        category: 'silhouette',
        question: '검은 그림자로 나타난 이 포켓몬의 이름은 누구일까요?',
        options,
        answer: targetPokemon.name,
      };
    }

    startBattle(ball) {
      if (this.checkAndShowDailyLimitLock()) return;

      const status = window.GameStorage.getDailyStatus();
      const isGold = Boolean(ball && ball.isGold);
      const pokemon = this.pickBattlePokemon(isGold);
      const learningCount = isGold ? 4 : 2;
      const learningQuestions = this.pickLearningQuestions(learningCount);

      // 이번 배틀 하트는 기본 3개이되, 오늘 남은 총 하트가 3개 미만이면 남은 하트만큼만 부여
      const availableBattleHearts =
        status.heartLimit > 0 ? Math.min(3, status.remainingHearts) : 3;

      this.battle = {
        isGold,
        pokemon,
        hearts: availableBattleHearts,
        maxHearts: 3,
        stepIndex: 0,
        learningCount,
        silhouetteQuestion: this.buildSilhouetteQuestion(pokemon),
        learningQuestions,
        locked: false,
        finished: false,
      };

      window.GameStorage.recordEncounter();
      window.Sound.battleStart(isGold);

      this.showScreen('battle');
      this.setupBattleStageUI();
      this.renderCurrentBattleQuestion();
      this.updateDailyLimitUI();
    }

    setupBattleStageUI() {
      const b = this.battle;
      const stageEl = document.getElementById('battle-stage');
      const badgeEl = document.getElementById('battle-ball-type-badge');
      const imgEl = document.getElementById('battle-pokemon-img');
      const fallbackEl = document.getElementById('battle-pokemon-fallback');
      const mysteryEl = document.getElementById('mystery-marks');
      const revealBanner = document.getElementById('pokemon-reveal-banner');
      const captureBall = document.getElementById('capture-ball');
      const captureStars = document.getElementById('capture-stars');
      const resultActions = document.getElementById('battle-result-actions');
      const optionsGrid = document.getElementById('quiz-options-grid');

      stageEl.classList.toggle('gold-stage', b.isGold);
      badgeEl.classList.toggle('gold', b.isGold);
      badgeEl.textContent = b.isGold
        ? '🌟 황금 몬스터볼 (전설·환상 · 문제 4개)'
        : '🔴 일반 몬스터볼 (문제 2개)';

      imgEl.className = 'battle-pokemon-img silhouette';
      imgEl.classList.remove('hidden');
      fallbackEl.classList.add('hidden');
      imgEl.onerror = () => {
        imgEl.classList.add('hidden');
        fallbackEl.classList.remove('hidden');
        fallbackEl.textContent = '❓';
      };
      imgEl.src = b.pokemon.image;

      mysteryEl.classList.remove('hidden');
      revealBanner.classList.add('hidden');
      captureBall.className = b.isGold ? 'capture-ball gold-ball hidden' : 'capture-ball hidden';
      captureStars.classList.add('hidden');
      resultActions.classList.add('hidden');
      optionsGrid.classList.remove('hidden');

      this.renderBattleHearts();
    }

    renderBattleHearts() {
      const heartsContainer = document.getElementById('battle-hearts');
      if (!heartsContainer || !this.battle) return;
      heartsContainer.innerHTML = '';
      for (let i = 0; i < this.battle.maxHearts; i++) {
        const span = document.createElement('span');
        const alive = i < this.battle.hearts;
        span.className = alive ? 'heart-icon active' : 'heart-icon lost';
        span.textContent = alive ? '❤️' : '🖤';
        heartsContainer.appendChild(span);
      }
    }

    renderCurrentBattleQuestion() {
      const b = this.battle;
      if (!b) return;

      const stepIndicator = document.getElementById('battle-step-indicator');
      const catBadge = document.getElementById('quiz-category-badge');
      const progressText = document.getElementById('quiz-progress-text');
      const questionBox = document.getElementById('quiz-question-box');
      const feedbackBanner = document.getElementById('quiz-feedback-banner');
      const optionsGrid = document.getElementById('quiz-options-grid');

      feedbackBanner.classList.add('hidden');
      optionsGrid.innerHTML = '';

      let currentQ;
      if (b.stepIndex === 0) {
        currentQ = b.silhouetteQuestion;
        stepIndicator.textContent = '1단계: 누구일까?';
        catBadge.textContent = '❓ 포켓몬 이름 맞히기';
        catBadge.style.background = '#ffd32a';
        progressText.textContent = `맞히면 학습 문제 ${b.learningCount}개가 나와요!`;
      } else {
        const qIdx = b.stepIndex - 1;
        currentQ = b.learningQuestions[qIdx];
        const meta = CATEGORY_META[currentQ.category] || { label: '📚 학습 퀴즈', color: '#ffd32a' };
        stepIndicator.textContent = `학습 문제 (${b.stepIndex} / ${b.learningCount})`;
        catBadge.textContent = meta.label;
        catBadge.style.background = meta.color;
        progressText.textContent = `${b.pokemon.name}의 문제 ${b.stepIndex} / ${b.learningCount}`;
      }

      questionBox.textContent = currentQ.question;

      currentQ.options.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-option-btn';
        btn.setAttribute('data-option-value', optText);
        btn.innerHTML = `
          <span class="option-num-badge">${idx + 1}</span>
          <span class="option-label-text">${optText}</span>
        `;
        btn.addEventListener('click', () => this.handleAnswerClick(btn, optText, currentQ.answer));
        optionsGrid.appendChild(btn);
      });

      b.locked = false;
    }

    handleAnswerClick(btnElement, chosenValue, correctAnswer) {
      const b = this.battle;
      if (!b || b.locked || b.finished || btnElement.disabled) return;
      if (this.checkAndShowDailyLimitLock()) return;

      const feedbackBanner = document.getElementById('quiz-feedback-banner');

      if (chosenValue === correctAnswer) {
        b.locked = true;
        btnElement.classList.add('correct-selected');

        if (b.stepIndex === 0) {
          window.Sound.silhouetteReveal();
          this.revealPokemonIdentity();

          feedbackBanner.className = 'quiz-feedback-banner good';
          feedbackBanner.textContent = `🎉 정답! 진짜 모습은 [${b.pokemon.name}] (${b.pokemon.types.join('·')} 타입) 이었어요!`;
          feedbackBanner.classList.remove('hidden');

          setTimeout(() => {
            if (!this.battle || this.battle.finished) return;
            this.battle.stepIndex = 1;
            this.renderCurrentBattleQuestion();
          }, 1250);
        } else {
          window.Sound.correct();
          window.GameStorage.recordQuestionSolved();

          if (b.stepIndex < b.learningCount) {
            const prof = window.GameStorage.getProfile();
            feedbackBanner.className = 'quiz-feedback-banner good';
            feedbackBanner.textContent = '⭕ 맞았어요! 정말 잘했어요! 다음 문제로 넘어갈게요!';
            feedbackBanner.textContent = `⭕ 맞았어요! 역시 [${prof.teamName}] ${prof.playerName} 대장님! 다음 문제로 갈게요!`;
            feedbackBanner.classList.remove('hidden');

            setTimeout(() => {
              if (!this.battle || this.battle.finished) return;
              this.battle.stepIndex += 1;
              this.renderCurrentBattleQuestion();
            }, 800);
          } else {
            const prof = window.GameStorage.getProfile();
            feedbackBanner.className = 'quiz-feedback-banner good';
            feedbackBanner.textContent = `🎊 문제를 모두 맞혔어요! 몬스터볼을 던져 ${b.pokemon.name}을(를) 잡아요!`;
            feedbackBanner.textContent = `🎊 ${callChildName(prof.playerName)} 대단해! 문제를 모두 맞혔어! 몬스터볼을 던지자!`;
            feedbackBanner.classList.remove('hidden');
            this.runCaptureSequence();
          }
        }
      } else {
        // 오답 시: 이번 배틀 하트 1개 차감 + 오늘의 총 하트도 1개 실제 소모!
        window.Sound.wrong();
        b.hearts = Math.max(0, b.hearts - 1);
        const dailyStatus = window.GameStorage.consumeDailyHeart(1);
        this.renderBattleHearts();
        this.updateDailyLimitUI();

        btnElement.disabled = true;
        btnElement.classList.add('wrong-disabled');

        if (b.hearts <= 0 || dailyStatus.isHeartsUp) {
          this.handlePokemonFlee();
          if (dailyStatus.isHeartsUp) {
            setTimeout(() => this.checkAndShowDailyLimitLock(), 600);
          }
        } else {
          const dailyRemainStr =
            dailyStatus.heartLimit > 0 ? `, 오늘 남은 총 하트 ${dailyStatus.remainingHearts}개` : '';
          feedbackBanner.className = 'quiz-feedback-banner bad';
          feedbackBanner.textContent = `앗, 아쉬워요! 다시 골라 볼까요? (배틀 하트 ❤️ ${b.hearts}개${dailyRemainStr})`;
          feedbackBanner.classList.remove('hidden');
        }
      }
    }

    revealPokemonIdentity() {
      const b = this.battle;
      if (!b) return;

      const imgEl = document.getElementById('battle-pokemon-img');
      const mysteryEl = document.getElementById('mystery-marks');
      const revealBanner = document.getElementById('pokemon-reveal-banner');
      const dexNoEl = document.getElementById('reveal-dex-no');
      const nameEl = document.getElementById('reveal-pokemon-name');
      const legTag = document.getElementById('reveal-legendary-tag');
      const typesEl = document.getElementById('reveal-pokemon-types');

      imgEl.classList.remove('silhouette');
      imgEl.classList.add('revealed');
      mysteryEl.classList.add('hidden');

      dexNoEl.textContent = `No.${String(b.pokemon.id).padStart(3, '0')}`;
      nameEl.textContent = b.pokemon.name;
      legTag.classList.toggle('hidden', !b.pokemon.isLegendary);

      typesEl.innerHTML = '';
      b.pokemon.types.forEach((t) => {
        const badge = document.createElement('span');
        badge.className = 'type-badge';
        badge.style.background = TYPE_COLORS[t] || '#dfe4ea';
        badge.textContent = `${t} 타입`;
        typesEl.appendChild(badge);
      });

      revealBanner.classList.remove('hidden');
    }

    runCaptureSequence() {
      const b = this.battle;
      if (!b) return;
      b.locked = true;
      b.finished = true;

      const imgEl = document.getElementById('battle-pokemon-img');
      const captureBall = document.getElementById('capture-ball');
      const captureStars = document.getElementById('capture-stars');
      const optionsGrid = document.getElementById('quiz-options-grid');
      const questionBox = document.getElementById('quiz-question-box');
      const feedbackBanner = document.getElementById('quiz-feedback-banner');
      const resultActions = document.getElementById('battle-result-actions');
      const stepIndicator = document.getElementById('battle-step-indicator');

      optionsGrid.classList.add('hidden');
      stepIndicator.textContent = '몬스터볼 포획 중!';
      questionBox.textContent = `가라! 몬스터볼! 💨`;

      captureBall.classList.remove('hidden');
      captureBall.classList.add('throwing');
      window.Sound.throwBall();

      setTimeout(() => {
        imgEl.classList.add('captured-into-ball');
        captureBall.classList.remove('throwing');
        captureBall.classList.add('wobbling');
        window.Sound.ballWobble();
      }, 520);

      setTimeout(() => {
        window.Sound.ballWobble();
      }, 1080);

      setTimeout(() => {
        captureBall.classList.remove('wobbling');
        captureStars.classList.remove('hidden');
        imgEl.classList.remove('captured-into-ball');
        captureBall.classList.add('hidden');

        const catchInfo = window.GameStorage.recordCatch(b.pokemon.id);
        const prof = window.GameStorage.getProfile();
        this.updateGlobalCounters();
        this.updateRegionProgressUI();
        window.Sound.catchSuccess();

        stepIndicator.textContent = '🎉 포획 성공!';
        questionBox.textContent = `신난다! [${b.pokemon.name}]을(를) 잡았다!`;
        questionBox.textContent = `신난다! [${prof.teamName}] ${subjectChildName(prof.playerName)} [${b.pokemon.name}]을(를) 잡았다!`;
        feedbackBanner.className = 'quiz-feedback-banner good';
        feedbackBanner.textContent = catchInfo.isFirstTime
          ? `✨ 도감에 [${b.pokemon.name}]이(가) 새로 등록되었어요!`
          : `📖 도감에 등록된 [${b.pokemon.name}]! (지금까지 ${catchInfo.count}번 잡았어요)`;
        feedbackBanner.classList.remove('hidden');
        resultActions.classList.remove('hidden');
      }, 1620);
    }

    handlePokemonFlee() {
      const b = this.battle;
      if (!b) return;
      b.locked = true;
      b.finished = true;

      window.Sound.flee();

      const imgEl = document.getElementById('battle-pokemon-img');
      const optionsGrid = document.getElementById('quiz-options-grid');
      const questionBox = document.getElementById('quiz-question-box');
      const feedbackBanner = document.getElementById('quiz-feedback-banner');
      const resultActions = document.getElementById('battle-result-actions');
      const stepIndicator = document.getElementById('battle-step-indicator');

      imgEl.classList.add('fleeing');
      optionsGrid.classList.add('hidden');
      stepIndicator.textContent = '💨 포켓몬이 도망갔어요';
      questionBox.textContent = '하트를 모두 써서 포켓몬이 수풀 속으로 도망갔어요! 💨';
      feedbackBanner.className = 'quiz-feedback-banner bad';
      feedbackBanner.textContent = '괜찮아요! 남은 오늘의 하트를 확인하고 다시 도전해 봐요!';
      feedbackBanner.classList.remove('hidden');
      resultActions.classList.remove('hidden');
    }

    returnToFieldFromBattle() {
      if (this.checkAndShowDailyLimitLock()) return;
      this.showScreen('field');
      if (this.balls.length < 3 || !this.balls.some((b) => b.isGold)) {
        this.spawnFieldBalls();
      }
    }

    // ========================================================================
    // 포켓몬 도감 모달 & 출석 도장판 모달
    // ========================================================================
    openPokedexModal() {
      this.renderPokedexGrid();
      document.getElementById('modal-pokedex').classList.remove('hidden');
    }

    renderPokedexGrid() {
      const grid = document.getElementById('pokedex-grid');
      if (!grid) return;

      const caughtCount = window.GameStorage.getUniqueCaughtTotal();
      const totalCount = this.pokemonList.length;

      document.getElementById('pokedex-summary-text').textContent =
        `잡은 포켓몬: ${caughtCount} / ${totalCount}마리 (${Math.round((caughtCount / totalCount) * 100)}%)`;
      document.getElementById('dex-count-all').textContent = String(totalCount);
      document.getElementById('dex-count-caught').textContent = String(caughtCount);
      document.getElementById('dex-count-legendary').textContent = String(
        this.pokemonList.filter((p) => p.isLegendary).length
      );

      let filtered = this.pokemonList;
      if (this.pokedexFilter === 'caught') {
        filtered = this.pokemonList.filter((p) => window.GameStorage.isCaught(p.id));
      } else if (this.pokedexFilter === 'legendary') {
        filtered = this.pokemonList.filter((p) => p.isLegendary);
      }

      grid.innerHTML = '';

      if (filtered.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.style.gridColumn = '1 / -1';
        emptyMsg.style.padding = '36px 16px';
        emptyMsg.style.textAlign = 'center';
        emptyMsg.style.fontWeight = '900';
        emptyMsg.style.fontSize = '1.2rem';
        emptyMsg.textContent = '아직 잡은 포켓몬이 없어요! 필드로 나가 몬스터볼을 잡아 볼까요? 🚀';
        grid.appendChild(emptyMsg);
        return;
      }

      filtered.forEach((p) => {
        const caught = window.GameStorage.isCaught(p.id);
        const card = document.createElement('div');
        card.className = `dex-card ${caught ? 'caught' : 'uncaught'} ${p.isLegendary ? 'legendary' : ''}`;
        card.setAttribute('data-pokemon-id', String(p.id));

        const numStr = `No.${String(p.id).padStart(3, '0')}${p.isLegendary ? ' 🌟' : ''}`;
        const displayName = caught ? p.name : '???';
        const typesHtml = caught
          ? p.types
              .map(
                (t) =>
                  `<span class="dex-type-pill" style="background:${TYPE_COLORS[t] || '#dfe4ea'}">${t}</span>`
              )
              .join('')
          : '<span class="dex-type-pill">???</span>';

        card.innerHTML = `
          <div class="dex-number">${numStr}</div>
          <img class="dex-img" loading="lazy" src="${p.image}" alt="${displayName}" />
          <div class="dex-name">${displayName}</div>
          <div class="dex-types">${typesHtml}</div>
        `;
        grid.appendChild(card);
      });
    }

    openStampModal() {
      const grid = document.getElementById('stamp-board-grid');
      const banner = document.getElementById('stamp-new-celebration');
      if (!grid) return;

      const stamps = window.GameStorage.getStamps();
      if (this.todayStampResult && this.todayStampResult.isNewToday) {
        banner.classList.remove('hidden');
        window.Sound.stamp();
      } else {
        banner.classList.add('hidden');
      }

      grid.innerHTML = '';
      const totalSlots = Math.max(14, Math.ceil((stamps.length + 1) / 7) * 7);

      for (let i = 0; i < totalSlots; i++) {
        const slot = document.createElement('div');
        const dateStr = stamps[i];
        if (dateStr) {
          slot.className = 'stamp-slot filled';
          slot.innerHTML = `
            <div class="stamp-day-label">${i + 1}일차 출석</div>
            <div class="stamp-seal">${STAMP_ICONS[i % STAMP_ICONS.length]}</div>
            <div class="stamp-date-text">${dateStr}</div>
          `;
        } else {
          slot.className = 'stamp-slot';
          slot.innerHTML = `
            <div class="stamp-day-label">${i + 1}일차</div>
            <div class="stamp-seal" style="opacity:0.25">💮</div>
            <div class="stamp-date-text" style="color:#a4b0be">미출석</div>
          `;
        }
        grid.appendChild(slot);
      }

      document.getElementById('modal-stamp').classList.remove('hidden');
    }

    closeModals() {
      document.getElementById('modal-pokedex').classList.add('hidden');
      document.getElementById('modal-stamp').classList.add('hidden');
      document.getElementById('modal-admin').classList.add('hidden');
      document.getElementById('modal-profile').classList.add('hidden');
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.GameApp = new PokemonQuizGame();
  });
})();
