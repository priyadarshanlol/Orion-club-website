import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

/*
 * "Orion's Belt": an original score for the site, synthesised live with the
 * Web Audio API (no audio files, nothing licensed).
 *
 * 16 bar loop at 72 bpm in D minor, with a Lydian #11 shimmer on the Bb chord:
 *  - a deep drone and a slow pad moving Dm9, Bbmaj7#11, Fadd9, Csus2
 *  - the belt motif: three bell tones rising in a line, one for each belt star
 *    (Alnitak, Alnilam, Mintaka), rung at the start of every phrase
 *  - a twinkling arpeggio through a ping-pong echo, like distant stars
 *  - a slow, singing lead melody in the second half of the loop
 *  - now and then a "shooting star": a falling sweep of filtered air
 * Audio can only start from a user gesture, so the welcome prompt or the
 * navbar toggle always starts it.
 */

const SoundContext = createContext(null);

export const useSound = () => {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error('useSound must be used within a SoundProvider');
  return ctx;
};

export const TRACK_NAME = "Orion's Belt";

const BPM = 72;
const STEP = 60 / BPM / 2; // one eighth note
const STEPS_PER_BAR = 8;
const LOOP_BARS = 16;
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

// One chord every two bars
const CHORDS = [
  { bass: 38, pad: [57, 60, 64, 65] }, // Dm9
  { bass: 34, pad: [57, 62, 64, 65] }, // Bbmaj7#11
  { bass: 41, pad: [57, 60, 65, 67] }, // Fadd9
  { bass: 36, pad: [55, 60, 62, 64] }, // Csus2
];
const ARP_ORDER = [0, 2, 1, 3, 2, 0, 3, 1];
const BELT = [69, 74, 76]; // Alnitak, Alnilam, Mintaka
// [step within the 8 bar melody, midi note, length in steps]
const MELODY = [
  [0, 74, 3], [3, 72, 1], [4, 69, 4],
  [8, 76, 2], [10, 77, 2], [12, 76, 4],
  [16, 74, 3], [19, 76, 1], [20, 69, 4],
  [24, 65, 4], [28, 67, 4],
  [32, 69, 3], [35, 72, 1], [36, 77, 4],
  [40, 76, 2], [42, 74, 2], [44, 72, 4],
  [48, 74, 6], [54, 72, 2],
  [56, 74, 8],
];

const readChoice = () => {
  try {
    return localStorage.getItem('orion_sound_choice');
  } catch {
    return null;
  }
};
const writeChoice = (value) => {
  try {
    localStorage.setItem('orion_sound_choice', value);
  } catch {
    // ignore blocked storage
  }
};

function makeImpulse(ctx, seconds = 5, decay = 2.6) {
  const rate = ctx.sampleRate;
  const length = rate * seconds;
  const impulse = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
}

export function createEngine(initialVolume) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  const ctx = new AudioCtx();

  const master = ctx.createGain();
  master.gain.value = 0;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 3;
  master.connect(comp).connect(ctx.destination);

  const reverb = ctx.createConvolver();
  reverb.buffer = makeImpulse(ctx, 6, 2.4);
  const wet = ctx.createGain();
  wet.gain.value = 0.6;
  reverb.connect(wet).connect(master);

  const dry = ctx.createGain();
  dry.gain.value = 0.5;
  dry.connect(master);

  // Ping-pong echo, three eighths long, darkened on each repeat
  const echoIn = ctx.createGain();
  const merger = ctx.createChannelMerger(2);
  const dl = ctx.createDelay(2);
  const dr = ctx.createDelay(2);
  dl.delayTime.value = STEP * 3;
  dr.delayTime.value = STEP * 3;
  const fb = ctx.createGain();
  fb.gain.value = 0.42;
  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = 2600;
  echoIn.connect(dl);
  dl.connect(merger, 0, 0);
  dl.connect(dr);
  dr.connect(merger, 0, 1);
  dr.connect(tone).connect(fb).connect(dl);
  const echoOut = ctx.createGain();
  echoOut.gain.value = 0.5;
  merger.connect(echoOut);
  echoOut.connect(master);
  echoOut.connect(reverb);

  const bus = (gain, { toEcho = false, wetOnly = false } = {}) => {
    const g = ctx.createGain();
    g.gain.value = gain;
    if (!wetOnly) g.connect(dry);
    g.connect(reverb);
    if (toEcho) g.connect(echoIn);
    return g;
  };

  // ---- Continuous layers: drone and pad ----
  const droneBus = bus(0.2);
  const droneFilter = ctx.createBiquadFilter();
  droneFilter.type = 'lowpass';
  droneFilter.frequency.value = 320;
  droneFilter.connect(droneBus);
  const drone = [38 - 12, 38 - 5].map((m, i) => {
    const o = ctx.createOscillator();
    o.type = i ? 'triangle' : 'sine';
    o.frequency.value = hz(m);
    const g = ctx.createGain();
    g.gain.value = i ? 0.25 : 0.6;
    o.connect(g).connect(droneFilter);
    o.start();
    return o;
  });

  const padFilter = ctx.createBiquadFilter();
  padFilter.type = 'lowpass';
  padFilter.frequency.value = 1100;
  padFilter.Q.value = 0.7;
  const padLfo = ctx.createOscillator();
  const padLfoGain = ctx.createGain();
  padLfo.frequency.value = 0.07;
  padLfoGain.gain.value = 500;
  padLfo.connect(padLfoGain).connect(padFilter.frequency);
  padLfo.start();
  const padBus = bus(0.12);
  padFilter.connect(padBus);
  const padVoices = CHORDS[0].pad.map((m) => {
    const g = ctx.createGain();
    g.gain.value = 0.2;
    const oscs = [-7, 7].map((detune, i) => {
      const o = ctx.createOscillator();
      o.type = i ? 'sawtooth' : 'triangle';
      o.frequency.value = hz(m);
      o.detune.value = detune;
      const og = ctx.createGain();
      og.gain.value = i ? 0.18 : 1;
      o.connect(og).connect(g);
      o.start();
      return o;
    });
    g.connect(padFilter);
    return oscs;
  });

  // ---- Notes ----
  const bassBus = bus(0.26);
  const bellBus = bus(0.12, { toEcho: true });
  const arpBus = bus(0.05, { toEcho: true });
  const leadBus = bus(0.1, { toEcho: true });

  // Bell: a simple FM tone with a glassy, inharmonic overtone
  const bell = (t, midi, dest, peak = 0.6, len = 4) => {
    const f = hz(midi);
    const car = ctx.createOscillator();
    const mod = ctx.createOscillator();
    const modGain = ctx.createGain();
    const g = ctx.createGain();
    car.frequency.value = f;
    mod.frequency.value = f * 3.5;
    modGain.gain.setValueAtTime(f * 1.6, t);
    modGain.gain.exponentialRampToValueAtTime(f * 0.05, t + len * 0.6);
    mod.connect(modGain).connect(car.frequency);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    car.connect(g).connect(dest);
    car.start(t);
    mod.start(t);
    car.stop(t + len + 0.1);
    mod.stop(t + len + 0.1);
  };

  const pluck = (t, midi, peak = 0.5) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = hz(midi);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
    o.connect(g).connect(arpBus);
    o.start(t);
    o.stop(t + 1.3);
  };

  const bass = (t, midi, len) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = hz(midi);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.7, t + 0.6);
    g.gain.setTargetAtTime(0.0001, t + len - 1.2, 0.5);
    o.connect(g).connect(bassBus);
    o.start(t);
    o.stop(t + len + 1.5);
  };

  const lead = (t, midi, len) => {
    const g = ctx.createGain();
    const vib = ctx.createOscillator();
    const vibGain = ctx.createGain();
    vib.frequency.value = 5;
    vibGain.gain.setValueAtTime(0, t);
    vibGain.gain.linearRampToValueAtTime(6, t + Math.min(len, 0.9));
    vib.connect(vibGain);
    [[0, 'sine', 1], [12, 'sine', 0.18], [0, 'triangle', 0.3]].forEach(([oct, type, amp]) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = hz(midi + oct);
      vibGain.connect(o.detune);
      const og = ctx.createGain();
      og.gain.value = amp;
      o.connect(og).connect(g);
      o.start(t);
      o.stop(t + len + 2);
    });
    vib.start(t);
    vib.stop(t + len + 2);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.12);
    g.gain.setTargetAtTime(0.35, t + 0.2, 0.4);
    g.gain.setTargetAtTime(0.0001, t + len, 0.35);
    g.connect(leadBus);
  };

  // Shooting star: filtered noise that falls in pitch and pans across
  const noiseBuffer = (() => {
    const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  })();
  const shootingStar = (t) => {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 9;
    f.frequency.setValueAtTime(5200, t);
    f.frequency.exponentialRampToValueAtTime(700, t + 1.8);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.3, t + 0.15);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.9);
    let out = g;
    if (ctx.createStereoPanner) {
      const pan = ctx.createStereoPanner();
      const dir = Math.random() < 0.5 ? -1 : 1;
      pan.pan.setValueAtTime(-0.8 * dir, t);
      pan.pan.linearRampToValueAtTime(0.8 * dir, t + 1.8);
      g.connect(pan);
      out = pan;
    }
    src.connect(f).connect(g);
    out.connect(reverb);
    out.connect(echoIn);
    src.start(t);
    src.stop(t + 2);
  };

  // ---- Scheduler: looks ahead 0.4 s and books every note on the audio clock ----
  let step = 0;
  let nextTime = ctx.currentTime + 0.1;
  let nextStar = 18;
  let timer = null;

  const scheduleStep = (s, t) => {
    const bar = Math.floor(s / STEPS_PER_BAR) % LOOP_BARS;
    const inBar = s % STEPS_PER_BAR;
    const chord = CHORDS[Math.floor(bar / 2) % CHORDS.length];

    if (inBar === 0 && bar % 2 === 0) {
      padVoices.forEach((oscs, i) => oscs.forEach((o) => o.frequency.setTargetAtTime(hz(chord.pad[i]), t, 0.5)));
      drone[0].frequency.setTargetAtTime(hz(chord.bass - 12), t, 1.2);
      bass(t, chord.bass, STEP * STEPS_PER_BAR * 2);
    }
    // Belt motif at the start of every four bar phrase
    if (bar % 4 === 0 && (inBar === 0 || inBar === 2 || inBar === 4)) {
      bell(t, BELT[inBar / 2], bellBus, 0.55, 5);
    }
    // Arpeggio: sparse in the first half, fuller under the melody
    const melodyHalf = bar >= 8;
    const play = melodyHalf ? inBar % 2 === 0 : Math.random() < 0.55;
    if (play) {
      const idx = ARP_ORDER[(s + bar) % ARP_ORDER.length];
      pluck(t, chord.pad[idx] + 12 + (inBar === 7 ? 12 : 0), 0.3 + Math.random() * 0.2);
    }
    if (melodyHalf) {
      const local = (bar - 8) * STEPS_PER_BAR + inBar;
      MELODY.forEach(([at, midi, len]) => {
        if (at === local) lead(t, midi, len * STEP);
      });
    }
  };

  const tick = () => {
    while (nextTime < ctx.currentTime + 0.4) {
      scheduleStep(step, nextTime);
      nextStar -= STEP;
      if (nextStar <= 0) {
        shootingStar(nextTime);
        nextStar = 20 + Math.random() * 25;
      }
      step += 1;
      nextTime += STEP;
    }
  };
  const run = () => {
    clearInterval(timer);
    nextTime = Math.max(nextTime, ctx.currentTime + 0.05);
    timer = setInterval(tick, 100);
    tick();
  };
  run();

  const setVolume = (v) => {
    master.gain.setTargetAtTime(Math.max(0, Math.min(1, v)) * 0.9, ctx.currentTime, 0.4);
  };
  setVolume(initialVolume);

  return {
    ctx,
    setVolume,
    async pause() {
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
      clearInterval(timer);
      setTimeout(() => ctx.state === 'running' && ctx.suspend(), 900);
    },
    async resume(v) {
      if (ctx.state !== 'running') await ctx.resume();
      run();
      setVolume(v);
    },
    close() {
      clearInterval(timer);
      ctx.close();
    },
  };
}

export function SoundProvider({ children }) {
  const engineRef = useRef(null);
  const [enabled, setEnabled] = useState(false);
  const [volume, setVolumeState] = useState(0.35);
  // The welcome prompt shows once per browser until the visitor chooses
  const [promptOpen, setPromptOpen] = useState(() => readChoice() === null);
  const supported = typeof window !== 'undefined' && Boolean(window.AudioContext || window.webkitAudioContext);

  const enable = useCallback(async () => {
    if (!supported) return;
    if (!engineRef.current) {
      engineRef.current = createEngine(volume);
      if (engineRef.current?.ctx.state !== 'running') await engineRef.current?.ctx.resume();
    } else {
      await engineRef.current.resume(volume);
    }
    setEnabled(true);
    writeChoice('on');
  }, [supported, volume]);

  const disable = useCallback(() => {
    engineRef.current?.pause();
    setEnabled(false);
    writeChoice('off');
  }, []);

  const toggle = useCallback(() => (enabled ? disable() : enable()), [enabled, enable, disable]);

  const setVolume = useCallback((v) => {
    setVolumeState(v);
    if (enabled) engineRef.current?.setVolume(v);
  }, [enabled]);

  const choose = useCallback((on) => {
    setPromptOpen(false);
    if (on) enable();
    else writeChoice('off');
  }, [enable]);

  useEffect(() => () => engineRef.current?.close(), []);

  return (
    <SoundContext.Provider value={{ supported, enabled, volume, toggle, enable, disable, setVolume, promptOpen, choose }}>
      {children}
    </SoundContext.Provider>
  );
}
