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
  // 알파벳 1글자를 TTS가 줄임말이나 스펠링('ee' -> "E E")으로 오독하지 않고 정확히 알파벳 이름으로 한 번만 읽게 하는 맵
  const LETTER_SPEECH_MAP = {
    A: 'A.',
    B: 'bee',
    C: 'see',
    D: 'dee',
    E: 'E.',
    F: 'F.',
    G: 'gee',
    H: 'H.',
    I: 'I.',
    J: 'jay',
    K: 'kay',
    L: 'L.',
    M: 'M.',
    N: 'N.',
    O: 'oh',
    P: 'pee',
    Q: 'Q.',
    R: 'R.',
    S: 'S.',
    T: 'tee',
    U: 'you',
    V: 'vee',
    W: 'W.',
    X: 'X.',
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

  // 88개 영어 학습 단어 전체에 대한 까이유(Caillou) 스타일 쉬운 예시 문장 + 한글 뜻 + 그림(이모지 장면) 사전
  const ENGLISH_STORY_SENTENCES = {
    APPLE: { scene: '🍎 😋', en: 'I like red apples.', ko: '나는 빨간 사과를 좋아해요.' },
    BANANA: { scene: '🐵 🍌', en: 'The monkey eats a banana.', ko: '원숭이가 바나나를 먹어요.' },
    GRAPE: { scene: '🍇 💜', en: 'These purple grapes are sweet!', ko: '이 보라색 포도는 정말 달콤해요!' },
    ORANGE: { scene: '🍊 🧃', en: 'Would you like an orange?', ko: '새콤달콤한 오렌지 먹을래요?' },
    PEACH: { scene: '🍑 😊', en: 'This pink peach is so soft.', ko: '이 분홍빛 복숭아는 아주 말랑해요.' },
    WATERMELON: { scene: '🍉 ☀️', en: 'We eat cold watermelon in summer.', ko: '우리는 여름에 시원한 수박을 먹어요.' },
    STRAWBERRY: { scene: '🍓 🍰', en: 'There is a strawberry on the cake.', ko: '케이크 위에 딸기가 하나 있어요.' },
    LEMON: { scene: '🍋 😝', en: 'The yellow lemon is very sour!', ko: '노란 레몬은 아이셔, 아주 시어요!' },
    DOG: { scene: '🐶 🎾', en: 'The cute dog runs fast.', ko: '귀여운 강아지가 빠르게 달려요.' },
    CAT: { scene: '🐱 🧶', en: 'The little cat is sleeping.', ko: '작은 고양이가 쿨쿨 자고 있어요.' },
    PIG: { scene: '🐷 🌸', en: 'Look at the pink pig!', ko: '저기 분홍색 아기 돼지를 봐요!' },
    COW: { scene: '🐮 🥛', en: 'The cow gives us fresh milk.', ko: '소는 우리에게 맛있는 우유를 줘요.' },
    LION: { scene: '🦁 👑', en: 'The lion is the king of animals.', ko: '사자는 동물들의 멋진 왕이에요.' },
    TIGER: { scene: '🐯 🌲', en: 'The tiger has black stripes.', ko: '호랑이는 멋진 검은 줄무늬가 있어요.' },
    BEAR: { scene: '🐻 🍯', en: 'The big bear loves sweet honey.', ko: '커다란 곰은 달콤한 꿀을 좋아해요.' },
    RABBIT: { scene: '🐰 🥕', en: 'The white rabbit hops, hop, hop!', ko: '하얀 토끼가 깡충깡충 뛰어가요!' },
    MONKEY: { scene: '🐵 🌴', en: 'The monkey climbs up the tree.', ko: '원숭이가 나무 위로 쏙쏙 올라가요.' },
    ELEPHANT: { scene: '🐘 🚿', en: 'The elephant has a long nose.', ko: '코끼리는 코가 아주 길어요.' },
    GIRAFFE: { scene: '🦒 🌿', en: 'The giraffe has a very long neck.', ko: '기린은 목이 아주아주 길어요.' },
    PENGUIN: { scene: '🐧 ❄️', en: 'The penguin walks on the ice.', ko: '펭귄이 얼음 위를 뒤뚱뒤뚱 걸어요.' },
    DOLPHIN: { scene: '🐬 🌊', en: 'The dolphin jumps in the blue sea.', ko: '돌고래가 푸른 바다에서 점프해요.' },
    TURTLE: { scene: '🐢 🏖️', en: 'The turtle walks slowly.', ko: '거북이가 엉금엉금 천천히 걸어가요.' },
    FROG: { scene: '🐸 🪷', en: 'The green frog can jump high!', ko: '초록 개구리는 높이 점프할 수 있어요!' },
    DUCK: { scene: '🦆 🐤', en: 'The yellow duck swims in the pond.', ko: '노란 오리가 연못에서 헤엄쳐요.' },
    BIRD: { scene: '🐦 🎵', en: 'A little bird sings in the tree.', ko: '작은 새가 나무에서 즐겁게 노래해요.' },
    FISH: { scene: '🐟 🫧', en: 'The fish swims in the water.', ko: '물고기가 물속에서 신나게 헤엄쳐요.' },
    BEE: { scene: '🐝 🌻', en: 'The busy bee likes yellow flowers.', ko: '부지런한 꿀벌은 노란 꽃을 좋아해요.' },
    ANT: { scene: '🐜 🐜 🍃', en: 'The little ants work together.', ko: '작은 개미들이 힘을 모아 일해요.' },
    BUTTERFLY: { scene: '🦋 🌸', en: 'A pretty butterfly flies in the sky.', ko: '예쁜 나비가 하늘을 훨훨 날아요.' },
    SPIDER: { scene: '🕷️ 🕸️', en: 'The spider makes a big web.', ko: '거미가 커다란 거미줄을 만들어요.' },
    SNAKE: { scene: '🐍 🌿', en: 'The long snake moves in the grass.', ko: '긴 뱀이 풀숲을 스르르 지나가요.' },
    SHEEP: { scene: '🐑 ☁️', en: 'The white sheep is soft like a cloud.', ko: '하얀 양은 구름처럼 포근해요.' },
    HORSE: { scene: '🐴 🌾', en: 'The brown horse runs across the field.', ko: '갈색 말이 들판을 멋지게 달려요.' },
    MOUSE: { scene: '🐭 🧀', en: 'The tiny mouse likes yellow cheese.', ko: '작은 생쥐는 노란 치즈를 좋아해요.' },
    PANDA: { scene: '🐼 🎋', en: 'The cute panda eats green bamboo.', ko: '귀여운 판다가 초록 대나무를 먹어요.' },
    RED: { scene: '🍎 🚒 ❤️', en: 'The fire truck is bright red.', ko: '소방차는 반짝이는 빨간색이에요.' },
    BLUE: { scene: '🌤️ 🌊 💙', en: 'The sky is so clear and blue.', ko: '오늘 하늘이 정말 맑고 파래요.' },
    YELLOW: { scene: '🌻 🍌 💛', en: 'Pikachu is bright yellow!', ko: '피카츄는 반짝이는 노란색이에요!' },
    GREEN: { scene: '🌳 🐸 💚', en: 'The leaves on the tree are green.', ko: '나무에 달린 잎사귀들이 초록색이에요.' },
    PURPLE: { scene: '🍇 🔮 💜', en: 'I drew a flower with purple crayon.', ko: '보라색 크레파스로 예쁜 꽃을 그렸어요.' },
    PINK: { scene: '🌸 🎀 🩷', en: 'Look at the pretty pink flowers!', ko: '저기 예쁜 분홍색 꽃들을 봐요!' },
    BLACK: { scene: '🐈‍⬛ 🎩 ⬛', en: 'My cat has shiny black fur.', ko: '우리 고양이는 반짝이는 검은 털을 가졌어요.' },
    WHITE: { scene: '⛄ ☁️ ⬜', en: 'Let us make a big white snowman!', ko: '우리 커다랗고 하얀 눈사람을 만들어요!' },
    BROWN: { scene: '🧸 🍫 🟫', en: 'I have a soft brown teddy bear.', ko: '나에게는 폭신한 갈색 곰인형이 있어요.' },
    ONE: { scene: '☀️ ☝️', en: 'There is one bright sun in the sky.', ko: '하늘에 밝은 해님이 하나 떠 있어요.' },
    TWO: { scene: '🍎 🍎 ✌️', en: 'There are two red apples.', ko: '빨간 사과가 두 개 있어요.' },
    THREE: { scene: '🐷 🐷 🐷', en: 'Here are three little pigs.', ko: '여기 아기 돼지 삼형제(세 마리)가 있어요.' },
    FOUR: { scene: '🚗 🛞 🛞', en: 'A car has four round wheels.', ko: '자동차는 동그란 바퀴가 네 개 있어요.' },
    FIVE: { scene: '✋ ⭐', en: 'I have five fingers on my hand.', ko: '내 손에는 손가락이 다섯 개 있어요.' },
    SIX: { scene: '🎂 🕯️ 6️⃣', en: 'I am six years old today!', ko: '나는 오늘 여섯 살이에요!' },
    SEVEN: { scene: '🌈 🎨', en: 'A rainbow has seven pretty colors.', ko: '무지개는 일곱 가지 예쁜 색깔이 있어요.' },
    EIGHT: { scene: '🐙 🌊', en: 'An octopus has eight long legs.', ko: '문어는 긴 다리가 여덟 개 있어요.' },
    NINE: { scene: '🎈 🎈 9️⃣', en: 'I see nine balloons in the sky.', ko: '하늘에 풍선이 아홉 개 떠 있어요.' },
    TEN: { scene: '👐 🌟 🔟', en: 'Let us count from one to ten!', ko: '우리 하나부터 열까지 함께 세어 볼까요!' },
    SUN: { scene: '☀️ 😊', en: 'The warm sun shines in the morning.', ko: '아침에 따뜻한 해님이 반짝 빛나요.' },
    MOON: { scene: '🌙 🌌', en: 'Good night, bright yellow moon!', ko: '밝고 노란 달님, 안녕히 주무세요!' },
    STAR: { scene: '⭐ 🌠 ✨', en: 'Twinkle, twinkle, little star!', ko: '반짝반짝 작은 별이 아름답게 비치네!' },
    CLOUD: { scene: '☁️ 🌤️', en: 'White clouds float in the blue sky.', ko: '하얀 구름이 파란 하늘에 둥실 떠 있어요.' },
    RAIN: { scene: '🌧️ ☔', en: 'Rain is falling! Take your umbrella.', ko: '비가 내려요! 우산을 챙겨요.' },
    SNOW: { scene: '❄️ ⛄', en: 'White snow is falling from the sky.', ko: '하늘에서 하얀 눈이 소복소복 내려요.' },
    RAINBOW: { scene: '🌈 ☀️', en: 'Look! There is a big rainbow!', ko: '우와 봐요! 하늘에 커다란 무지개가 떴어요!' },
    TREE: { scene: '🌳 🐿️', en: 'A big green tree stands in the park.', ko: '공원에 커다란 초록 나무가 서 있어요.' },
    FLOWER: { scene: '🌸 🐝', en: 'This pretty flower smells so good.', ko: '이 예쁜 꽃은 향기가 정말 좋아요.' },
    CAR: { scene: '🚗 🛣️', en: 'Daddy drives our family car.', ko: '아빠가 우리 가족 자동차를 운전해요.' },
    BUS: { scene: '🚌 🧒', en: 'We ride the yellow bus together.', ko: '우리는 노란 버스를 함께 타요.' },
    TRAIN: { scene: '🚂 🛤️', en: 'Choo-choo! Here comes the fast train.', ko: '칙칙폭폭! 빠른 기차가 달려와요.' },
    AIRPLANE: { scene: '✈️ ☁️', en: 'The airplane flies high in the clouds.', ko: '비행기가 구름 위로 높이 날아가요.' },
    BICYCLE: { scene: '🚲 ヘルメット', en: 'I can ride my bicycle in the park.', ko: '나는 공원에서 신나게 자전거를 탈 수 있어요.' },
    SHIP: { scene: '🚢 🌊', en: 'A big ship sails across the sea.', ko: '커다란 배가 바다 위를 멋지게 나아가요.' },
    BOOK: { scene: '📖 👨‍👩‍👦', en: 'Mommy reads a fun story book to me.', ko: '엄마가 나에게 재미있는 동화책을 읽어 줘요.' },
    PENCIL: { scene: '✏️ 📝', en: 'I write my name with a pencil.', ko: '나는 연필로 내 이름을 멋지게 써요.' },
    BAG: { scene: '🎒 😊', en: 'I put my favorite toys in my bag.', ko: '가방 속에 내가 좋아하는 장난감을 넣었어요.' },
    HAT: { scene: '🧢 ☀️', en: 'Put on your hat before going out!', ko: '밖에 나가기 전에 멋진 모자를 써요!' },
    SHOES: { scene: '👟 🏃', en: 'I put on my shoes and run outside.', ko: '나는 신발을 신고 밖으로 신나게 달려가요.' },
    MILK: { scene: '🥛 💪', en: 'I drink a cup of warm milk.', ko: '나는 따뜻한 우유 한 잔을 꿀꺽 마셔요.' },
    WATER: { scene: '💧 🥤', en: 'Please give me a cup of cold water.', ko: '시원한 물 한 컵만 주세요.' },
    BREAD: { scene: '🍞 🧈', en: 'Warm bread smells so delicious!', ko: '따뜻하게 구운 빵 냄새가 정말 맛있어요!' },
    CAKE: { scene: '🎂 🎉', en: 'Happy birthday! Let us eat sweet cake.', ko: '생일 축하해요! 달콤한 케이크를 함께 먹어요.' },
    EGG: { scene: '🥚 🍳', en: 'I had a yummy egg for breakfast.', ko: '오늘 아침으로 맛있는 달걀 요리를 먹었어요.' },
    HOUSE: { scene: '🏠 🌷', en: 'Welcome to our warm and happy house!', ko: '따뜻하고 행복한 우리 집에 온 걸 환영해요!' },
    SCHOOL: { scene: '🏫 👫', en: 'I play with my friends at school.', ko: '나는 학교에서 친구들과 재미있게 놀아요.' },
    CROWN: { scene: '👑 ✨', en: 'The prince wears a shiny gold crown.', ko: '왕자님이 반짝이는 황금 왕관을 썼어요.' },
    BALL: { scene: '⚽ 🐕', en: 'Let us play catch with this round ball!', ko: '우리 이 동그란 공으로 공놀이를 해요!' },
    EYE: { scene: '👀 ✨', en: 'Close your eyes and make a wish!', ko: '두 눈을 꼭 감고 소원을 빌어 보세요!' },
    NOSE: { scene: '👃 🌸', en: 'I smell pretty flowers with my nose.', ko: '나는 코로 예쁜 꽃향기를 맡아요.' },
    HAND: { scene: '🧼 🤲', en: 'Wash your hands clean with soap!', ko: '비누로 두 손을 깨끗하게 씻어요!' },
    KING: { scene: '👑 🏰', en: 'The kind king lives in a big castle.', ko: '친절한 임금님이 커다란 성에 살고 있어요.' },
  };
  const BICYCLE_FIX = { scene: '🚲 🌳', en: 'I can ride my bicycle in the park.', ko: '나는 공원에서 신나게 자전거를 탈 수 있어요.' };
  ENGLISH_STORY_SENTENCES.BICYCLE = BICYCLE_FIX;
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
      this.bestKoreanVoice = null;
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
        this.bestKoreanVoice = this.pickBestKoreanVoice();
      };
      updateVoices();
      if (typeof window.speechSynthesis.addEventListener === 'function') {
        window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
      } else {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }

    pickBestKoreanVoice() {
      if (typeof window === 'undefined' || !window.speechSynthesis) return null;
      const voices = window.speechSynthesis.getVoices() || [];
      const koVoices = voices.filter((v) =>
        String(v.lang || '').toLowerCase().startsWith('ko')
      );
      if (koVoices.length === 0) return null;

      const scoreKo = (v) => {
        let s = 100;
        const name = String(v.name || '').toLowerCase();
        if (name.includes('google')) s += 400;
        if (name.includes('natural') || name.includes('sunhi') || name.includes('injoon')) s += 420;
        if (name.includes('premium') || name.includes('enhanced') || name.includes('siri')) s += 380;
        if (name.includes('yuna') || name.includes('sora')) s += 300;
        return s;
      };

      koVoices.sort((a, b) => scoreKo(b) - scoreKo(a));
      return koVoices[0];
    }

    getStorySentence(word) {
      const clean = String(word || '').trim().toUpperCase().replace(/[^A-Z]/g, '');
      if (ENGLISH_STORY_SENTENCES[clean]) {
        return ENGLISH_STORY_SENTENCES[clean];
      }
      return {
        scene: '🌟 📖',
        en: `This is a nice ${clean.toLowerCase()}.`,
        ko: `참 멋진 ${clean} 단어를 배웠어요!`,
      };
    }

    // 까이유(Caillou)처럼 쉬운 영어 예시 문장을 읽어준 뒤 -> 한글 문장으로 뜻을 말해주는 함수
    speakStorySentence(word, callbacks = {}) {
      const story = this.getStorySentence(word);
      this.stop();
      const sessionId = this.activeSessionId;
      soundInstance.setSpeechActive(true);

      const { onEnglishStart, onKoreanStart, onEnd } = callbacks;

      const finishStory = () => {
        if (this.activeSessionId !== sessionId) return;
        soundInstance.setSpeechActive(false);
        if (typeof onEnd === 'function') onEnd();
      };

      const schedule = (fn, delayMs) => {
        const tid = setTimeout(() => {
          if (this.activeSessionId !== sessionId) return;
          fn();
        }, delayMs);
        this.stepTimers.push(tid);
      };

      const speakKoreanMeaning = () => {
        if (this.activeSessionId !== sessionId) return;
        if (typeof onKoreanStart === 'function') onKoreanStart(story.ko);

        if (
          typeof window !== 'undefined' &&
          window.speechSynthesis &&
          typeof SpeechSynthesisUtterance !== 'undefined'
        ) {
          try {
            const koUtter = new SpeechSynthesisUtterance(story.ko);
            koUtter.lang = 'ko-KR';
            if (!this.bestKoreanVoice) {
              this.bestKoreanVoice = this.pickBestKoreanVoice();
            }
            if (this.bestKoreanVoice) {
              koUtter.voice = this.bestKoreanVoice;
              koUtter.lang = this.bestKoreanVoice.lang || 'ko-KR';
            }
            koUtter.rate = 0.96;
            koUtter.pitch = 1.06;
            koUtter.volume = 1.0;

            let settled = false;
            const doneOnce = () => {
              if (settled) return;
              settled = true;
              finishStory();
            };
            koUtter.onend = doneOnce;
            koUtter.onerror = doneOnce;
            const safetyId = setTimeout(doneOnce, 2800);
            this.stepTimers.push(safetyId);
            window.speechSynthesis.speak(koUtter);
            return;
          } catch (e) {}
        }

        schedule(finishStory, 900);
      };

      const speakEnglishLine = () => {
        if (this.activeSessionId !== sessionId) return;
        if (typeof onEnglishStart === 'function') onEnglishStart(story.en);

        if (
          typeof window !== 'undefined' &&
          window.speechSynthesis &&
          typeof SpeechSynthesisUtterance !== 'undefined'
        ) {
          try {
            const enUtter = new SpeechSynthesisUtterance(story.en);
            enUtter.lang = 'en-US';
            if (!this.bestVoice) {
              this.bestVoice = this.pickBestEnglishVoice();
            }
            if (this.bestVoice) {
              enUtter.voice = this.bestVoice;
              enUtter.lang = this.bestVoice.lang || 'en-US';
            }
            // 6세 아이가 잘 알아들을 수 있도록 또렷하고 부드러운 애니메이션 속도
            enUtter.rate = 0.84;
            enUtter.pitch = 1.05;
            enUtter.volume = 1.0;

            let settled = false;
            const doneOnce = () => {
              if (settled) return;
              settled = true;
              schedule(speakKoreanMeaning, 280);
            };
            enUtter.onend = doneOnce;
            enUtter.onerror = doneOnce;
            const safetyId = setTimeout(doneOnce, 3200);
            this.stepTimers.push(safetyId);
            window.speechSynthesis.speak(enUtter);
            return;
          } catch (e) {}
        }

        // 클라우드 영어 문장 오디오 폴백
        if (this.sharedAudio) {
          try {
            let fallbackSettled = false;
            const onFallbackDone = () => {
              if (fallbackSettled || this.activeSessionId !== sessionId) return;
              fallbackSettled = true;
              this.sharedAudio.onended = null;
              this.sharedAudio.onerror = null;
              schedule(speakKoreanMeaning, 250);
            };
            this.sharedAudio.src = `https://dict.youdao.com/dictvoice?type=2&audio=${encodeURIComponent(story.en)}`;
            this.sharedAudio.onended = onFallbackDone;
            this.sharedAudio.onerror = onFallbackDone;
            const p = this.sharedAudio.play();
            if (p && typeof p.catch === 'function') {
              p.catch(onFallbackDone);
            }
            return;
          } catch (e) {}
        }

        schedule(speakKoreanMeaning, 400);
      };

      schedule(speakEnglishLine, 60);
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
          this.sharedAudio.onended = null;
          this.sharedAudio.onerror = null;
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
          let settled = false;
          const cleanupHandlers = () => {
            if (this.sharedAudio) {
              this.sharedAudio.onended = null;
              this.sharedAudio.onerror = null;
            }
          };
          const finishMp3 = () => {
            if (settled || this.activeSessionId !== sessionId) return;
            settled = true;
            cleanupHandlers();
            finishAll();
          };
          const fallbackToTTS = () => {
            if (settled || this.activeSessionId !== sessionId) return;
            settled = true;
            cleanupHandlers();
            this.speakSingleToken(cleanWord.toLowerCase(), true, sessionId, finishAll);
          };

          try {
            if (this.sharedAudio.src !== entry.audioUrl) {
              this.sharedAudio.src = entry.audioUrl;
            }
            this.sharedAudio.currentTime = 0;
            this.sharedAudio.onended = finishMp3;
            this.sharedAudio.onerror = fallbackToTTS;
            const playPromise = this.sharedAudio.play();
            if (playPromise && typeof playPromise.then === 'function') {
              playPromise.catch(fallbackToTTS);
              return;
            }
            // playPromise가 없는 환경에서는 onended가 오지 않을 수 있으므로 fallback 대신 그대로 대기
            return;
          } catch (e) {
            fallbackToTTS();
            return;
          }
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
