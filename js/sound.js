// Web Audio API Chiptune BGM & Rich Multi-Voice Sound Effects Synthesizer
// (외부 음원 파일 없이 멜로디 + 화음 + 베이스라인으로 구성된 배경음악 및 입체 효과음 제공)
(function () {
  // 음계 주파수 매핑 (Hz)
  const NOTE = {
    REST: 0,
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.00, Gs4: 415.30, A4: 440.00, Bb4: 466.16, B4: 493.88,
    C5: 523.25, Cs5: 554.37, D5: 587.33, Ds5: 622.25, E5: 659.25, F5: 698.46, Fs5: 739.99, G5: 783.99, Gs5: 830.61, A5: 880.00, Bb5: 932.33, B5: 987.77,
    C6: 1046.50, D6: 1174.66, E6: 1318.51, G6: 1567.98,
  };

  // 화면별 배경음악(BGM) 시퀀스 (멜로디 + 베이스 2성부 루프)
  const BGM_TRACKS = {
    // 1. 타이틀 & 지역 선택 화면: 밝고 설레는 마을/출발 테마
    title: {
      stepMs: 190,
      melody: [
        NOTE.C5, NOTE.E5, NOTE.G5, NOTE.E5, NOTE.F5, NOTE.A5, NOTE.G5, NOTE.REST,
        NOTE.E5, NOTE.G5, NOTE.C6, NOTE.G5, NOTE.A5, NOTE.F5, NOTE.D5, NOTE.REST,
        NOTE.C5, NOTE.E5, NOTE.G5, NOTE.E5, NOTE.F5, NOTE.A5, NOTE.B5, NOTE.G5,
        NOTE.C6, NOTE.B5, NOTE.A5, NOTE.G5, NOTE.F5, NOTE.E5, NOTE.C5, NOTE.REST,
      ],
      bass: [
        NOTE.C3, NOTE.G3, NOTE.C4, NOTE.G3, NOTE.F3, NOTE.C4, NOTE.G3, NOTE.D3,
        NOTE.C3, NOTE.G3, NOTE.E3, NOTE.C4, NOTE.F3, NOTE.A3, NOTE.G3, NOTE.B3,
        NOTE.C3, NOTE.G3, NOTE.C4, NOTE.G3, NOTE.F3, NOTE.C4, NOTE.G3, NOTE.B3,
        NOTE.A3, NOTE.E3, NOTE.F3, NOTE.G3, NOTE.C3, NOTE.G3, NOTE.C3, NOTE.REST,
      ],
      melodyWave: 'triangle',
      bassWave: 'sine',
      melodyVol: 0.065,
      bassVol: 0.055,
    },

    // 2. 필드 탐험 화면: 통통 튀는 산책·모험 테마
    field: {
      stepMs: 170,
      melody: [
        NOTE.G5, NOTE.E5, NOTE.C5, NOTE.E5, NOTE.G5, NOTE.A5, NOTE.G5, NOTE.REST,
        NOTE.F5, NOTE.D5, NOTE.B4, NOTE.D5, NOTE.F5, NOTE.G5, NOTE.E5, NOTE.REST,
        NOTE.A5, NOTE.F5, NOTE.C5, NOTE.F5, NOTE.G5, NOTE.E5, NOTE.C5, NOTE.E5,
        NOTE.D5, NOTE.E5, NOTE.F5, NOTE.G5, NOTE.A5, NOTE.B5, NOTE.C6, NOTE.REST,
      ],
      bass: [
        NOTE.C3, NOTE.REST, NOTE.G3, NOTE.REST, NOTE.C3, NOTE.REST, NOTE.G3, NOTE.REST,
        NOTE.G3, NOTE.REST, NOTE.D3, NOTE.REST, NOTE.C3, NOTE.REST, NOTE.G3, NOTE.REST,
        NOTE.F3, NOTE.REST, NOTE.C4, NOTE.REST, NOTE.E3, NOTE.REST, NOTE.G3, NOTE.REST,
        NOTE.D3, NOTE.F3, NOTE.G3, NOTE.A3, NOTE.G3, NOTE.F3, NOTE.C3, NOTE.REST,
      ],
      melodyWave: 'triangle',
      bassWave: 'triangle',
      melodyVol: 0.06,
      bassVol: 0.05,
    },

    // 3. 일반 배틀 화면: 긴장감 있고 신나는 포켓몬 퀴즈 배틀 테마
    battle: {
      stepMs: 145,
      melody: [
        NOTE.E5, NOTE.G5, NOTE.A5, NOTE.A5, NOTE.REST, NOTE.A5, NOTE.B5, NOTE.C6,
        NOTE.B5, NOTE.A5, NOTE.G5, NOTE.E5, NOTE.D5, NOTE.E5, NOTE.G5, NOTE.REST,
        NOTE.E5, NOTE.G5, NOTE.A5, NOTE.A5, NOTE.REST, NOTE.C6, NOTE.D6, NOTE.E6,
        NOTE.D6, NOTE.C6, NOTE.B5, NOTE.G5, NOTE.A5, NOTE.REST, NOTE.A5, NOTE.REST,
      ],
      bass: [
        NOTE.A3, NOTE.E3, NOTE.A3, NOTE.E3, NOTE.A3, NOTE.E3, NOTE.A3, NOTE.E3,
        NOTE.G3, NOTE.D3, NOTE.G3, NOTE.D3, NOTE.E3, NOTE.B3, NOTE.E3, NOTE.G3,
        NOTE.A3, NOTE.E3, NOTE.A3, NOTE.E3, NOTE.F3, NOTE.C4, NOTE.F3, NOTE.C4,
        NOTE.G3, NOTE.D3, NOTE.E3, NOTE.G3, NOTE.A3, NOTE.E3, NOTE.A3, NOTE.REST,
      ],
      melodyWave: 'square',
      bassWave: 'triangle',
      melodyVol: 0.042,
      bassVol: 0.06,
    },

    // 4. 황금 몬스터볼 (전설·환상) 배틀 화면: 웅장하고 빠른 전설 배틀 테마
    legendary: {
      stepMs: 130,
      melody: [
        NOTE.A5, NOTE.E5, NOTE.A5, NOTE.C6, NOTE.B5, NOTE.E5, NOTE.B5, NOTE.D6,
        NOTE.C6, NOTE.A5, NOTE.E6, NOTE.C6, NOTE.B5, NOTE.Gs5, NOTE.E5, NOTE.REST,
        NOTE.F5, NOTE.A5, NOTE.C6, NOTE.F5, NOTE.G5, NOTE.B5, NOTE.D6, NOTE.G5,
        NOTE.E6, NOTE.D6, NOTE.C6, NOTE.B5, NOTE.A5, NOTE.REST, NOTE.A5, NOTE.REST,
      ],
      bass: [
        NOTE.A3, NOTE.A3, NOTE.E3, NOTE.A3, NOTE.G3, NOTE.G3, NOTE.E3, NOTE.G3,
        NOTE.F3, NOTE.F3, NOTE.C3, NOTE.F3, NOTE.E3, NOTE.E3, NOTE.B3, NOTE.E3,
        NOTE.F3, NOTE.C4, NOTE.F3, NOTE.C4, NOTE.G3, NOTE.D4, NOTE.G3, NOTE.D4,
        NOTE.A3, NOTE.E3, NOTE.F3, NOTE.G3, NOTE.A3, NOTE.E3, NOTE.A3, NOTE.REST,
      ],
      melodyWave: 'square',
      bassWave: 'sawtooth',
      melodyVol: 0.045,
      bassVol: 0.045,
    },
  };

  class SoundManager {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.currentTrackName = 'title';
      this.bgmStep = 0;
      this.bgmTimer = null;
      this.bgmUnlocked = false;
      this.bindUnlockListeners();
    }

    bindUnlockListeners() {
      if (typeof window === 'undefined' || !window.addEventListener) return;
      const unlock = () => {
        this.init();
        if (!this.bgmUnlocked) {
          this.bgmUnlocked = true;
          if (this.enabled) {
            this.startBGMLoop();
          }
        }
      };
      window.addEventListener('pointerdown', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    setEnabled(val) {
      this.enabled = Boolean(val);
      if (!this.enabled) {
        this.stopBGMLoop();
      } else {
        this.init();
        this.startBGMLoop();
      }
    }

    // 화면 전환 시 해당 화면에 어울리는 BGM 트랙으로 전환
    playBGM(trackName) {
      const nextTrack = BGM_TRACKS[trackName] ? trackName : 'title';
      if (this.currentTrackName !== nextTrack) {
        this.currentTrackName = nextTrack;
        this.bgmStep = 0;
        if (this.enabled && this.bgmUnlocked) {
          this.startBGMLoop();
        }
      } else if (this.enabled && this.bgmUnlocked && !this.bgmTimer) {
        this.startBGMLoop();
      }
    }

    startBGMLoop() {
      this.stopBGMLoop();
      if (!this.enabled || typeof setInterval !== 'function') return;
      const track = BGM_TRACKS[this.currentTrackName] || BGM_TRACKS.title;

      this.bgmTimer = setInterval(() => {
        if (
          !this.enabled ||
          this.speechActive ||
          (typeof document !== 'undefined' && document.hidden)
        ) {
          return;
        }
        this.playBGMStep(track);
      }, track.stepMs);
    }

    setSpeechActive(active) {
      this.speechActive = Boolean(active);
    }

    stopBGMLoop() {
      if (this.bgmTimer && typeof clearInterval === 'function') {
        clearInterval(this.bgmTimer);
      }
      this.bgmTimer = null;
    }

    playBGMStep(track) {
      if (!this.ctx || this.ctx.state !== 'running') return;
      const idx = this.bgmStep % track.melody.length;
      const mFreq = track.melody[idx];
      const bFreq = track.bass[idx % track.bass.length];
      const dur = (track.stepMs / 1000) * 0.88;

      if (mFreq > 0) {
        this.playTone(mFreq, track.melodyWave, dur, 0, track.melodyVol);
      }
      if (bFreq > 0) {
        this.playTone(bFreq, track.bassWave, dur * 0.95, 0, track.bassVol);
      }
      this.bgmStep += 1;
    }

    // 단일 음/슬라이드 합성
    playTone(freq, type, duration, startTime = 0, volume = 0.18, endFreq = null) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime + startTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (endFreq !== null) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
      }

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(volume, now + Math.min(0.018, duration * 0.2));
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.02);
    }

    // 화음(코드) 동시 발음 보조
    playChord(freqs, type, duration, startTime = 0, volume = 0.12) {
      freqs.forEach((f) => this.playTone(f, type, duration, startTime, volume));
    }

    // ========================================================================
    // 입체적인 게임 효과음 (멜로디 + 화음 + 타격감 레이어링)
    // ========================================================================
    click() {
      // 경쾌한 닌텐도 스타일 2중 방울 팝 사운드
      this.playTone(NOTE.E5, 'triangle', 0.055, 0, 0.15, NOTE.G5);
      this.playTone(NOTE.C6, 'sine', 0.075, 0.03, 0.14);
    }

    moveTarget() {
      // 필드 터치 시 귀여운 마림바 총총 소리
      this.playTone(NOTE.C5, 'sine', 0.06, 0, 0.11);
      this.playTone(NOTE.G5, 'triangle', 0.08, 0.045, 0.12);
    }

    battleStart(isGold = false) {
      if (isGold) {
        // 황금볼 전설 조우: 반짝이는 글리산도 + 웅장한 화음 팡파레!
        const arp = [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.B5, NOTE.C6, NOTE.E6, NOTE.G6];
        arp.forEach((n, i) => {
          this.playTone(n, 'triangle', 0.11, i * 0.055, 0.2);
          this.playTone(n * 0.5, 'square', 0.09, i * 0.055, 0.08);
        });
        this.playChord([NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6], 'triangle', 0.45, 0.42, 0.14);
      } else {
        // 일반 배틀 조우: 포켓몬 특유의 빠른 경보 아르페지오 + 배틀 코드
        const seq = [NOTE.G4, NOTE.C5, NOTE.E5, NOTE.G5, NOTE.E5, NOTE.G5, NOTE.C6];
        seq.forEach((n, i) => {
          this.playTone(n, 'square', 0.08, i * 0.05, 0.11);
        });
        this.playChord([NOTE.C5, NOTE.E5, NOTE.G5], 'triangle', 0.3, 0.36, 0.14);
      }
    }

    silhouetteReveal() {
      // "누구일까?" 정답 시 짜잔~! 하프 아르페지오 + 화음
      const harp = [NOTE.C5, NOTE.D5, NOTE.E5, NOTE.G5, NOTE.A5, NOTE.C6, NOTE.E6];
      harp.forEach((n, idx) => {
        this.playTone(n, 'triangle', 0.18, idx * 0.045, 0.18);
      });
      this.playChord([NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6], 'sine', 0.45, 0.32, 0.13);
    }

    reveal() {
      this.silhouetteReveal();
    }

    correct() {
      // 정답: 풍부한 3화음 딩-동-댕-동! + 고음 반짝임
      this.playChord([NOTE.C5, NOTE.E5], 'triangle', 0.12, 0.0, 0.16);
      this.playChord([NOTE.E5, NOTE.G5], 'triangle', 0.12, 0.1, 0.16);
      this.playChord([NOTE.G5, NOTE.C6], 'triangle', 0.14, 0.2, 0.18);
      this.playChord([NOTE.C5, NOTE.E5, NOTE.G5, NOTE.E6], 'sine', 0.38, 0.32, 0.15);
    }

    wrong() {
      // 오답: 코믹한 스프링 바운스 + 더블 버저
      this.playTone(340, 'sawtooth', 0.13, 0.0, 0.11, 220);
      this.playTone(170, 'triangle', 0.13, 0.0, 0.14, 110);
      this.playTone(250, 'sawtooth', 0.24, 0.14, 0.11, 140);
      this.playTone(125, 'triangle', 0.24, 0.14, 0.14, 70);
    }

    throwBall() {
      // 몬스터볼 투척: 슈우웅~ 휘파람 + 통! 캡슐 열리는 소리
      this.playTone(280, 'sine', 0.26, 0.0, 0.16, 980);
      this.playTone(NOTE.G5, 'triangle', 0.08, 0.27, 0.18, NOTE.C6);
    }

    captureThrow() {
      this.throwBall();
    }

    ballWobble() {
      // 볼이 좌우로 까딱거리는 입체 사운드
      this.playTone(260, 'sine', 0.08, 0.0, 0.16, 460);
      this.playTone(520, 'triangle', 0.08, 0.08, 0.14, 320);
    }

    catchSuccess() {
      // 포켓몬 포획 성공: 멜로디 + 베이스 2성부 팡파레!
      const melody = [
        { f: NOTE.C5, b: NOTE.C3, d: 0.12, t: 0.0 },
        { f: NOTE.C5, b: NOTE.G3, d: 0.12, t: 0.13 },
        { f: NOTE.C5, b: NOTE.C4, d: 0.12, t: 0.26 },
        { f: NOTE.C5, b: NOTE.E3, d: 0.30, t: 0.39 },
        { f: NOTE.Gs4, b: NOTE.F3, d: 0.22, t: 0.72 },
        { f: NOTE.Bb4, b: NOTE.G3, d: 0.22, t: 0.96 },
        { f: NOTE.C5, b: NOTE.A3, d: 0.16, t: 1.20 },
        { f: NOTE.Bb4, b: NOTE.G3, d: 0.11, t: 1.38 },
        { f: NOTE.C5, b: NOTE.C4, d: 0.55, t: 1.52 },
      ];
      melody.forEach((m) => {
        this.playTone(m.f, 'triangle', m.d, m.t, 0.22);
        this.playTone(m.f * 2, 'sine', m.d, m.t, 0.07);
        this.playTone(m.b, 'triangle', m.d, m.t, 0.14);
      });
      this.playChord([NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6], 'triangle', 0.6, 1.52, 0.14);
    }

    captureSuccess() {
      this.catchSuccess();
    }

    flee() {
      // 도망갈 때 휘리릭~ 구름 연기 효과음
      const notes = [NOTE.G5, NOTE.E5, NOTE.C5, NOTE.G4, NOTE.C4];
      notes.forEach((n, idx) => {
        this.playTone(n, 'sine', 0.09, idx * 0.06, 0.15, n * 0.75);
      });
    }

    reset() {
      // 초기화 효과음
      const notes = [NOTE.C6, NOTE.G5, NOTE.E5, NOTE.C5];
      notes.forEach((n, idx) => {
        this.playTone(n, 'triangle', 0.08, idx * 0.05, 0.16);
      });
    }
  }

  const soundInstance = new SoundManager();
  window.SoundFX = soundInstance;
  window.Sound = soundInstance;

  // ==========================================================================
  // 영어 철자(알파벳 하나씩) + 단어 원어민 발음 엔진 (EnglishTTS)
  // - 1단계: 알파벳 철자 하나씩 명확한 미국 원어민 발음으로 읽기 (예: B -> L -> A -> C -> K)
  // - 2단계: 전체 영어 단어를 Free Dictionary API(Oxford/Wikimedia 스튜디오 원어민 녹음 MP3)
  //          또는 Google/Apple/Microsoft 고품질 Neural en-US 음성으로 또렷하게 발음 (예: "Black!")
  // ==========================================================================
  const LETTER_SPEECH_MAP = {
    A: 'ay',
    B: 'bee',
    C: 'see',
    D: 'dee',
    E: 'ee',
    F: 'eff',
    G: 'gee',
    H: 'aitch',
    I: 'eye',
    J: 'jay',
    K: 'kay',
    L: 'ell',
    M: 'em',
    N: 'en',
    O: 'oh',
    P: 'pee',
    Q: 'cue',
    R: 'are',
    S: 'ess',
    T: 'tee',
    U: 'you',
    V: 'vee',
    W: 'double u',
    X: 'ex',
    Y: 'why',
    Z: 'zee',
  };

  const LETTER_KOREAN_NAME = {
    A: '에이',
    B: '비',
    C: '씨',
    D: '디',
    E: '이',
    F: '에프',
    G: '쥐',
    H: '에이치',
    I: '아이',
    J: '제이',
    K: '케이',
    L: '엘',
    M: '엠',
    N: '엔',
    O: '오',
    P: '피',
    Q: '큐',
    R: '알',
    S: '에스',
    T: '티',
    U: '유',
    V: '브이',
    W: '더블유',
    X: '엑스',
    Y: '와이',
    Z: '지',
  };

  // macOS/iOS 내장 장난감/특수효과 음성 블랙리스트 (절대 선택되지 않도록 차단)
  const NOVELTY_VOICE_BLACKLIST = [
    'albert',
    'bad news',
    'bahh',
    'bells',
    'boing',
    'bubbles',
    'cellos',
    'wobble',
    'fred',
    'good news',
    'jester',
    'junior',
    'organ',
    'superstar',
    'ralph',
    'trinoids',
    'whisper',
    'zarvox',
    'deranged',
    'hysterical',
  ];

  class EnglishPronunciationManager {
    constructor() {
      this.wordCache = {}; // { [WORD]: { audioUrl: 'https://...', phonetic: '/blæk/' } }
      this.activeSessionId = 0;
      this.stepTimers = [];
      this.bestVoice = null;
      this.sharedAudio = typeof Audio !== 'undefined' ? new Audio() : null;
      if (this.sharedAudio) {
        this.sharedAudio.preload = 'auto';
      }
      this.initVoices();
    }

    initVoices() {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      const updateVoices = () => {
        this.bestVoice = this.pickBestEnglishVoice();
      };
      updateVoices();
      if (typeof window.speechSynthesis.addEventListener === 'function') {
        window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
      } else {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }

    // 기기에 설치된 음성 중 가장 자연스럽고 원어민다운 미국 영어(en-US) Neural/Premium 음성 선택
    pickBestEnglishVoice() {
      if (typeof window === 'undefined' || !window.speechSynthesis) return null;
      const voices = window.speechSynthesis.getVoices() || [];
      if (voices.length === 0) return null;

      const enVoices = voices.filter((v) => {
        const lang = String(v.lang || '').toLowerCase();
        const name = String(v.name || '').toLowerCase();
        if (!lang.startsWith('en')) return false;
        if (NOVELTY_VOICE_BLACKLIST.some((bad) => name.includes(bad))) return false;
        return true;
      });

      if (enVoices.length === 0) return null;

      const scoreVoice = (v) => {
        let score = 0;
        const lang = String(v.lang || '').toLowerCase();
        const name = String(v.name || '').toLowerCase();

        // 미국 영어(en-US) 최우선
        if (lang === 'en-us' || lang === 'en_us') score += 1000;
        else if (lang.startsWith('en-')) score += 400;

        // Chrome Google US English (클라우드 Neural 음성)
        if (name.includes('google us english')) score += 600;
        else if (name.includes('google')) score += 350;

        // Microsoft Edge Natural Online 음성 (Aria, Jenny, Ana, Guy)
        if (name.includes('natural')) score += 580;
        if (name.includes('aria') || name.includes('jenny') || name.includes('ana')) score += 200;

        // Apple iPad/Mac 고품질 여성 원어민 음성 (Ava, Samantha, Allison, Nicky, Siri)
        if (name.includes('premium') || name.includes('enhanced')) score += 520;
        if (name.includes('siri')) score += 480;
        if (name.includes('samantha') || name.includes('ava')) score += 450;
        if (name.includes('allison') || name.includes('nicky') || name.includes('victoria') || name.includes('alex')) {
          score += 380;
        }

        return score;
      };

      enVoices.sort((a, b) => scoreVoice(b) - scoreVoice(a));
      return enVoices[0];
    }

    getKoreanLetterGuide(word) {
      const clean = String(word || '').toUpperCase().replace(/[^A-Z]/g, '');
      return clean
        .split('')
        .map((ch) => `${ch}(${LETTER_KOREAN_NAME[ch] || ch})`)
        .join(' · ');
    }

    // 영어 문제가 화면에 나올 때 4개 보기 단어의 원어민 스튜디오 발음 MP3(Free Dictionary API)를 미리 캐싱
    prefetchWords(words = []) {
      if (typeof fetch !== 'function') return;
      words.forEach((rawWord) => {
        const key = String(rawWord || '').trim().toUpperCase();
        if (!key || this.wordCache[key]) return;
        this.wordCache[key] = { loading: true, audioUrl: null };

        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(key.toLowerCase())}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (!Array.isArray(data)) return;
            let bestUrl = null;
            let phoneticText = '';
            for (const entry of data) {
              if (!phoneticText && entry.phonetic) phoneticText = entry.phonetic;
              const phonetics = Array.isArray(entry.phonetics) ? entry.phonetics : [];
              for (const p of phonetics) {
                if (!phoneticText && p.text) phoneticText = p.text;
                if (p.audio && typeof p.audio === 'string' && p.audio.endsWith('.mp3')) {
                  // 미국식 발음(-us.mp3) 최우선 선택
                  if (p.audio.includes('-us.mp3')) {
                    bestUrl = p.audio;
                    break;
                  }
                  if (!bestUrl) {
                    bestUrl = p.audio;
                  }
                }
              }
              if (bestUrl && bestUrl.includes('-us.mp3')) break;
            }
            this.wordCache[key] = {
              loading: false,
              audioUrl: bestUrl,
              phonetic: phoneticText,
            };
          })
          .catch(() => {
            this.wordCache[key] = { loading: false, audioUrl: null };
          });
      });
    }

    stop() {
      this.activeSessionId += 1;
      this.stepTimers.forEach((id) => clearTimeout(id));
      this.stepTimers = [];

      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
      }
      if (this.sharedAudio) {
        try {
          this.sharedAudio.pause();
          this.sharedAudio.onended = null;
          this.sharedAudio.onerror = null;
        } catch (e) {}
      }
      soundInstance.setSpeechActive(false);
    }

    // 철자 하나씩 읽고 -> 전체 단어 발음하기 (예: B -> L -> A -> C -> K -> "Black!")
    speakWordWithSpelling(word, callbacks = {}) {
      const cleanWord = String(word || '').trim().toUpperCase().replace(/[^A-Z]/g, '');
      if (!cleanWord) return;

      this.stop();
      const sessionId = this.activeSessionId;
      soundInstance.setSpeechActive(true);

      const letters = cleanWord.split('');
      const { onLetter, onWord, onEnd } = callbacks;

      if (!this.bestVoice) {
        this.bestVoice = this.pickBestEnglishVoice();
      }

      // iOS/iPadOS Safari 오디오 잠금 해제를 위해 사용자 클릭 시점에 오디오 객체 준비
      const cached = this.wordCache[cleanWord];
      if (this.sharedAudio && cached && cached.audioUrl) {
        try {
          this.sharedAudio.src = cached.audioUrl;
          this.sharedAudio.load();
        } catch (e) {}
      }

      const schedule = (fn, delayMs) => {
        const tid = setTimeout(() => {
          if (this.activeSessionId !== sessionId) return;
          fn();
        }, delayMs);
        this.stepTimers.push(tid);
      };

      const finishAll = () => {
        if (this.activeSessionId !== sessionId) return;
        soundInstance.setSpeechActive(false);
        if (typeof onEnd === 'function') onEnd();
      };

      const speakFinalWord = () => {
        if (this.activeSessionId !== sessionId) return;
        if (typeof onWord === 'function') onWord(cleanWord);

        const entry = this.wordCache[cleanWord];
        // 1순위: Free Dictionary API의 스튜디오 원어민 녹음 MP3 재생 시도
        if (this.sharedAudio && entry && entry.audioUrl) {
          try {
            if (this.sharedAudio.src !== entry.audioUrl) {
              this.sharedAudio.src = entry.audioUrl;
            }
            this.sharedAudio.currentTime = 0;
            this.sharedAudio.onended = () => finishAll();
            this.sharedAudio.onerror = () => this.speakSingleToken(cleanWord.toLowerCase(), true, sessionId, finishAll);
            const playPromise = this.sharedAudio.play();
            if (playPromise && typeof playPromise.then === 'function') {
              playPromise.catch(() => {
                this.speakSingleToken(cleanWord.toLowerCase(), true, sessionId, finishAll);
              });
              return;
            }
          } catch (e) {}
        }

        // 2순위: 원어민 Neural en-US 음성(Google US English / Samantha / Aria)으로 단어 발음
        this.speakSingleToken(cleanWord.toLowerCase(), true, sessionId, finishAll);
      };

      const speakLetterAt = (idx) => {
        if (this.activeSessionId !== sessionId) return;
        if (idx >= letters.length) {
          // 마지막 알파벳을 읽은 뒤 살짝 쉬고 전체 단어 발음!
          schedule(() => speakFinalWord(), 300);
          return;
        }

        const ch = letters[idx];
        const korName = LETTER_KOREAN_NAME[ch] || ch;
        const phoneticToken = LETTER_SPEECH_MAP[ch] || ch.toLowerCase();

        if (typeof onLetter === 'function') {
          onLetter(idx, ch, korName);
        }

        this.speakSingleToken(phoneticToken, false, sessionId, () => {
          schedule(() => speakLetterAt(idx + 1), 140);
        });
      };

      // Chrome에서 cancel() 직후 첫 발음이 씹히지 않도록 45ms 후 첫 글자 시작
      schedule(() => speakLetterAt(0), 45);
    }

    speakSingleToken(text, isFullWord, sessionId, onDone) {
      if (this.activeSessionId !== sessionId) return;

      // 브라우저 SpeechSynthesis 지원 및 영어 음성이 있는 경우
      if (
        typeof window !== 'undefined' &&
        window.speechSynthesis &&
        typeof SpeechSynthesisUtterance !== 'undefined'
      ) {
        try {
          const utter = new SpeechSynthesisUtterance(text);
          utter.lang = 'en-US';
          if (!this.bestVoice) {
            this.bestVoice = this.pickBestEnglishVoice();
          }
          if (this.bestVoice) {
            utter.voice = this.bestVoice;
            utter.lang = this.bestVoice.lang || 'en-US';
          }
          // 아이가 듣기 좋도록 또렷하고 경쾌한 속도·톤 설정
          utter.rate = isFullWord ? 0.88 : 0.92;
          utter.pitch = isFullWord ? 1.04 : 1.06;
          utter.volume = 1.0;

          let settled = false;
          const doneOnce = () => {
            if (settled) return;
            settled = true;
            if (this.activeSessionId === sessionId && typeof onDone === 'function') {
              onDone();
            }
          };

          utter.onend = doneOnce;
          utter.onerror = doneOnce;

          // 혹시라도 브라우저가 onend 이벤트를 누락할 경우를 대비한 안전 타이머
          const fallbackMs = isFullWord ? 1100 : 620;
          const safetyId = setTimeout(doneOnce, fallbackMs);
          this.stepTimers.push(safetyId);

          window.speechSynthesis.speak(utter);
          return;
        } catch (e) {}
      }

      // SpeechSynthesis가 없는 환경을 위한 클라우드 미국 영어 오디오 폴백 (Youdao DictVoice type=2 US)
      if (this.sharedAudio) {
        try {
          this.sharedAudio.src = `https://dict.youdao.com/dictvoice?type=2&audio=${encodeURIComponent(text)}`;
          this.sharedAudio.onended = () => {
            if (this.activeSessionId === sessionId && typeof onDone === 'function') onDone();
          };
          this.sharedAudio.onerror = () => {
            if (this.activeSessionId === sessionId && typeof onDone === 'function') onDone();
          };
          const p = this.sharedAudio.play();
          if (p && typeof p.catch === 'function') {
            p.catch(() => {
              if (this.activeSessionId === sessionId && typeof onDone === 'function') onDone();
            });
          }
          return;
        } catch (e) {}
      }

      if (typeof onDone === 'function') onDone();
    }
  }

  window.EnglishTTS = new EnglishPronunciationManager();
})();
