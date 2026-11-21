// Every sound is synthesised with Web Audio at run time (no sound files): a bell chime for a find
// that climbs with the streak, a soft thud for a miss, a shimmer for a hint, a clock tick in the
// last ten seconds, fanfares, and a slow pentatonic music box that plays under each scene.

const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];

export function createAudio() {
  let ctx = null;
  let master = null;
  let musicGain = null;
  let muted = false;
  let musicTimer = 0;
  let musicStep = 0;
  let musicOn = false;

  function ensure() {
    if (ctx) return true;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return false;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.6;
    master.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.18;
    musicGain.connect(master);
    return true;
  }

  function note(freq, start, length, { type = 'sine', gain = 0.3, to = master, bend = 0 } = {}) {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (bend) osc.frequency.exponentialRampToValueAtTime(freq * bend, start + length);
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(gain, start + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + length);
    osc.connect(amp).connect(to);
    osc.start(start);
    osc.stop(start + length + 0.05);
  }

  const midi = (n) => 440 * 2 ** ((n - 69) / 12);

  return {
    unlock() {
      if (ensure() && ctx.state === 'suspended') ctx.resume();
    },
    get muted() { return muted; },
    toggleMute() {
      muted = !muted;
      if (master) master.gain.setTargetAtTime(muted ? 0 : 0.6, ctx.currentTime, 0.05);
      return muted;
    },
    find(streak) {
      if (!ensure()) return;
      const t = ctx.currentTime;
      const root = 72 + Math.min(streak, 4) * 2;
      note(midi(root), t, 0.5, { type: 'triangle', gain: 0.32 });
      note(midi(root + 7), t + 0.07, 0.6, { type: 'sine', gain: 0.24 });
      note(midi(root + 12), t + 0.14, 0.8, { type: 'sine', gain: 0.16 });
    },
    miss() {
      if (!ensure()) return;
      const t = ctx.currentTime;
      note(180, t, 0.25, { type: 'square', gain: 0.08, bend: 0.5 });
      note(120, t, 0.3, { type: 'sine', gain: 0.25, bend: 0.6 });
    },
    hint() {
      if (!ensure()) return;
      const t = ctx.currentTime;
      [79, 83, 86, 91].forEach((n, i) => note(midi(n), t + i * 0.06, 0.4, { gain: 0.12 }));
    },
    tick(urgent) {
      if (!ensure()) return;
      note(urgent ? 1400 : 1000, ctx.currentTime, 0.05, { type: 'square', gain: 0.05 });
    },
    clear() {
      if (!ensure()) return;
      const t = ctx.currentTime;
      [72, 76, 79, 84, 88].forEach((n, i) => note(midi(n), t + i * 0.11, 0.9, { type: 'triangle', gain: 0.22 }));
    },
    fail() {
      if (!ensure()) return;
      const t = ctx.currentTime;
      [67, 63, 60].forEach((n, i) => note(midi(n), t + i * 0.18, 0.6, { type: 'triangle', gain: 0.2 }));
    },
    click() {
      if (!ensure()) return;
      note(midi(84), ctx.currentTime, 0.08, { gain: 0.1 });
    },
    startMusic() { musicOn = true; },
    stopMusic() { musicOn = false; },
    /** Called every frame: schedules the next music-box note when one is due. */
    update(dt) {
      if (!musicOn || !ctx || ctx.state !== 'running') return;
      musicTimer -= dt;
      if (musicTimer > 0) return;
      musicTimer = 0.42;
      const bar = Math.floor(musicStep / 8) % 4;
      const roots = [57, 53, 60, 55];
      const step = musicStep % 8;
      const t = ctx.currentTime + 0.02;
      if (step === 0) note(midi(roots[bar] - 12), t, 3.2, { type: 'sine', gain: 0.22, to: musicGain });
      const pattern = [0, 4, 2, 5, 3, 6, 4, 2];
      if (step !== 7 || bar % 2) note(midi(roots[bar] + 12 + PENTA[pattern[step]]), t, 1.2, { type: 'triangle', gain: 0.16, to: musicGain });
      musicStep += 1;
    },
  };
}
