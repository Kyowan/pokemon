// localStorage Persistence Manager (Pokedex, Daily Time/Heart Limits, Profile, Admin Reset)
(function () {
  const STORAGE_KEY = 'POKEMON_QUIZ_SAVE_V1';

  function getTodayKey() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  class StorageManager {
    constructor() {
      this.memoryFallback = null;
      this.state = this.load();
      this.ensureTodayUsage();
    }

    getDefaultState() {
      const today = getTodayKey();
      return {
        caught: {}, // { [id]: { count: 1, firstCaughtDate: 'YYYY-MM-DD' } }
        profile: {
          playerName: '',
          teamName: '',
          avatarId: 'red', // 'red' (지우) | 'pikachu' | 'misty' (이슬이) | 'crown' (단델) | 'goggle' | 'photo'
          hatStyle: 'cap', // 'cap' | 'pika' | 'crown' | 'goggle' | 'none'
          photoDataUrl: '', // 아이 얼굴 사진 (크롭 압축된 Data URL)
          photoZoom: 1.0,
          photoOffsetY: 0,
        },
        settings: {
          soundEnabled: true,
          dailyTimeLimitMinutes: 30, // 기본 하루 30분 제한 (0이면 무제한)
          dailyHeartLimit: 10,       // 기본 하루 총 하트 10개 제한 (0이면 무제한)
          adminPassword: '',         // 최초 1회 부모님이 직접 설정하는 비밀번호
        },
        dailyUsage: {
          date: today,
          usedSeconds: 0,
          usedHearts: 0,
          journeyStarted: false,     // 오늘 '오늘 여행 시작하기' 버튼을 눌러 시작했는지 여부
        },
        stats: {
          encounters: 0,
          totalCaught: 0,
          questionsSolved: 0,
        },
        recentQuestionKeys: [],
      };
    }

    load() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return this.getDefaultState();
        const parsed = JSON.parse(raw);
        const def = this.getDefaultState();
        return {
          ...def,
          ...parsed,
          caught: parsed.caught || {},
          profile: {
            ...def.profile,
            ...(parsed.profile || {}),
          },
          settings: {
            ...def.settings,
            ...(parsed.settings || {}),
          },
          dailyUsage: {
            ...def.dailyUsage,
            ...(parsed.dailyUsage || {}),
          },
          stats: {
            ...def.stats,
            ...(parsed.stats || {}),
          },
          recentQuestionKeys: Array.isArray(parsed.recentQuestionKeys)
            ? parsed.recentQuestionKeys
            : [],
        };
      } catch (e) {
        return this.memoryFallback || this.getDefaultState();
      }
    }

    save() {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        this.memoryFallback = this.state;
      }
    }

    // 기기 달력 기준 오늘 날짜(YYYY-MM-DD)와 저장된 날짜를 비교하여 날짜가 바뀌었으면 오늘 사용량 자동 초기화
    ensureTodayUsage() {
      const today = getTodayKey();
      if (!this.state.dailyUsage || this.state.dailyUsage.date !== today) {
        this.state.dailyUsage = {
          date: today,
          usedSeconds: 0,
          usedHearts: 0,
          journeyStarted: false,
        };
        this.save();
      }
    }

    // 오늘 여행 시작하기 버튼을 눌렀을 때 호출 (이 시점부터 시간 카운트 시작)
    startTodayJourney() {
      this.ensureTodayUsage();
      this.state.dailyUsage.journeyStarted = true;
      this.save();
      return this.getDailyStatus();
    }

    // 하루 시간 제한 & 하루 총 하트 제한 상태 조회
    getDailyStatus() {
      this.ensureTodayUsage();
      const timeLimitMin = Number(this.state.settings.dailyTimeLimitMinutes ?? 30);
      const heartLimit = Number(this.state.settings.dailyHeartLimit ?? 10);

      const usedSeconds = Math.max(0, Math.floor(this.state.dailyUsage.usedSeconds || 0));
      const usedHearts = Math.max(0, Math.floor(this.state.dailyUsage.usedHearts || 0));
      const isJourneyStarted = Boolean(this.state.dailyUsage.journeyStarted);

      const timeLimitSeconds = timeLimitMin > 0 ? timeLimitMin * 60 : 0;
      const remainingSeconds =
        timeLimitSeconds > 0 ? Math.max(0, timeLimitSeconds - usedSeconds) : Infinity;
      const remainingHearts =
        heartLimit > 0 ? Math.max(0, heartLimit - usedHearts) : Infinity;

      const isTimeUp = timeLimitSeconds > 0 && remainingSeconds <= 0;
      const isHeartsUp = heartLimit > 0 && remainingHearts <= 0;

      return {
        date: this.state.dailyUsage.date,
        isJourneyStarted,
        timeLimitMinutes: timeLimitMin,
        timeLimitSeconds,
        usedSeconds,
        remainingSeconds,
        heartLimit,
        usedHearts,
        remainingHearts,
        isTimeUp,
        isHeartsUp,
        isLocked: isTimeUp || isHeartsUp,
      };
    }

    addPlayTime(seconds = 1) {
      this.ensureTodayUsage();
      this.state.dailyUsage.usedSeconds = Math.max(
        0,
        (this.state.dailyUsage.usedSeconds || 0) + seconds
      );
      this.save();
      return this.getDailyStatus();
    }

    consumeDailyHeart(amount = 1) {
      this.ensureTodayUsage();
      this.state.dailyUsage.usedHearts = Math.max(
        0,
        (this.state.dailyUsage.usedHearts || 0) + amount
      );
      this.save();
      return this.getDailyStatus();
    }

    refillTodayHearts() {
      this.ensureTodayUsage();
      this.state.dailyUsage.usedHearts = 0;
      this.save();
      return this.getDailyStatus();
    }

    refillTodayTime() {
      this.ensureTodayUsage();
      this.state.dailyUsage.usedSeconds = 0;
      this.save();
      return this.getDailyStatus();
    }

    setDailyLimits({ dailyTimeLimitMinutes, dailyHeartLimit }) {
      if (dailyTimeLimitMinutes !== undefined) {
        this.state.settings.dailyTimeLimitMinutes = Number(dailyTimeLimitMinutes);
      }
      if (dailyHeartLimit !== undefined) {
        this.state.settings.dailyHeartLimit = Number(dailyHeartLimit);
      }
      this.save();
      return this.getDailyStatus();
    }

    // 전체 데이터 초기화 (도감, 통계, 오늘 사용량 모두 리셋 - 부모님 설정값 및 프로필은 유지)
    resetAllData() {
      const keepSettings = { ...this.state.settings };
      const keepProfile = { ...this.state.profile };
      this.state = this.getDefaultState();
      this.state.settings = keepSettings;
      this.state.profile = keepProfile;
      this.save();
      return this.state;
    }

    isCaught(pokemonId) {
      return Boolean(this.state.caught[pokemonId] && this.state.caught[pokemonId].count > 0);
    }

    getCaughtCount(pokemonId) {
      return this.state.caught[pokemonId] ? this.state.caught[pokemonId].count : 0;
    }

    getUniqueCaughtTotal() {
      return Object.keys(this.state.caught).filter((id) => this.state.caught[id].count > 0).length;
    }

    recordCatch(pokemonId) {
      const today = getTodayKey();
      const isFirstTime = !this.isCaught(pokemonId);
      if (!this.state.caught[pokemonId]) {
        this.state.caught[pokemonId] = {
          count: 1,
          firstCaughtDate: today,
        };
      } else {
        this.state.caught[pokemonId].count += 1;
      }
      this.state.stats.totalCaught += 1;
      this.save();
      return { isFirstTime, count: this.state.caught[pokemonId].count };
    }

    recordEncounter() {
      this.state.stats.encounters += 1;
      this.save();
    }

    recordQuestionSolved() {
      this.state.stats.questionsSolved += 1;
      this.save();
    }

    getSoundEnabled() {
      return this.state.settings.soundEnabled !== false;
    }

    setSoundEnabled(enabled) {
      this.state.settings.soundEnabled = Boolean(enabled);
      this.save();
    }

    hasAdminPassword() {
      return Boolean(
        this.state.settings.adminPassword &&
          String(this.state.settings.adminPassword).trim().length > 0
      );
    }

    verifyAdminPassword(input) {
      return String(input || '').trim() === String(this.state.settings.adminPassword || '').trim();
    }

    setAdminPassword(newPassword) {
      this.state.settings.adminPassword = String(newPassword || '').trim();
      this.save();
    }

    hasProfile() {
      return Boolean(
        this.state.profile &&
          String(this.state.profile.playerName || '').trim().length > 0
      );
    }

    getProfile() {
      const p = this.state.profile || {};
      return {
        playerName: String(p.playerName || '').trim() || '지우',
        teamName: String(p.teamName || '').trim() || '⚡ 번개 탐험대',
        avatarId: p.avatarId || 'red',
        hatStyle: p.hatStyle || 'cap',
        photoDataUrl: String(p.photoDataUrl || ''),
        photoZoom: Number(p.photoZoom || 1.0),
        photoOffsetY: Number(p.photoOffsetY || 0),
      };
    }

    setProfile({ playerName, teamName, avatarId, hatStyle, photoDataUrl, photoZoom, photoOffsetY }) {
      if (!this.state.profile) {
        this.state.profile = {
          playerName: '',
          teamName: '',
          avatarId: 'red',
          hatStyle: 'cap',
          photoDataUrl: '',
          photoZoom: 1.0,
          photoOffsetY: 0,
        };
      }
      if (playerName !== undefined) {
        this.state.profile.playerName = String(playerName).trim();
      }
      if (teamName !== undefined) {
        this.state.profile.teamName = String(teamName).trim() || '⚡ 번개 탐험대';
      }
      if (avatarId !== undefined) {
        this.state.profile.avatarId = avatarId;
      }
      if (hatStyle !== undefined) {
        this.state.profile.hatStyle = hatStyle;
      }
      if (photoDataUrl !== undefined) {
        this.state.profile.photoDataUrl = String(photoDataUrl || '');
      }
      if (photoZoom !== undefined) {
        this.state.profile.photoZoom = Number(photoZoom) || 1.0;
      }
      if (photoOffsetY !== undefined) {
        this.state.profile.photoOffsetY = Number(photoOffsetY) || 0;
      }
      this.save();
      return this.getProfile();
    }

    getRecentQuestionKeys() {
      return Array.isArray(this.state.recentQuestionKeys)
        ? this.state.recentQuestionKeys
        : [];
    }

    saveRecentQuestionKeys(keys) {
      const list = Array.isArray(keys) ? keys : Array.from(keys || []);
      // 최근 최대 1000문항까지 기억해 새로고침·다음 날에도 중복 출제를 최소화
      this.state.recentQuestionKeys = list.slice(-1000);
      this.save();
    }
  }

  window.GameStorage = new StorageManager();
})();
