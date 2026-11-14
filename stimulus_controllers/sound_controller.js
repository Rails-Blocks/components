import { Controller } from "@hotwired/stimulus";

// Interface sounds for Rails apps, synthesized live with the Web Audio API.
// No audio files, no dependencies.
//
//   <body data-controller="sound">
//     <button type="button" data-sound="tap">Publish</button>
//     <button type="button" data-action="sound#play" data-sound-name-param="success">Save</button>
//   </body>
//
// Put the controller on <body> for app-wide sounds, or on any wrapper. The mute and volume
// preferences are global: they are shared by every instance and remembered in localStorage.
//
// The voice is adapted from the "Press" theme of Cuelume (https://github.com/danielwh2/cuelume).
// Its recipes, layer shapes and output stage are reused here under the MIT License:
//
//   Copyright (c) 2026 Daniel Belyi
//
//   Permission is hereby granted, free of charge, to any person obtaining a copy of this software
//   and associated documentation files (the "Software"), to deal in the Software without
//   restriction, including without limitation the rights to use, copy, modify, merge, publish,
//   distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
//   Software is furnished to do so, subject to the following conditions:
//
//   The above copyright notice and this permission notice shall be included in all copies or
//   substantial portions of the Software.
//
//   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
//   BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
//   NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
//   DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// Every cue is a few sine tones and bursts of
// filtered noise, each swelling in straight and then ringing out exponentially (reaching -60 dB at
// its `decay`, so nothing ever stops abruptly), mixed into a faint small room and soft-clipped.
// Notes are struck bars with the overtones real bars have. Each play varies a little in pitch,
// level and ring, and rapid repeats play lighter, so it never feels machine-made.
//
// A switch has two halves: a press when the pointer goes down and a lighter release when it comes
// up, both pitched two semitones up for on and down for off (see sound#togglePress).

// A layer is one sound source, ringing out over `decay` seconds (60 dB down):
//   tone:      a sine. `glideTo` slides its pitch there, exponentially, over `glideTime`.
//   bandpass / lowpass: filtered noise. For bandpass `q` is linear, for lowpass it is in dB.
// `attack` is the straight swell in, `peak` the level, `offset` the start (seconds).
const tone = (frequency, decay, peak, extra = {}) => ({ kind: "tone", frequency, attack: 0.003, decay, peak, offset: 0, ...extra });
const noise = (kind, frequency, decay, peak, extra = {}) => ({ kind, frequency, q: 1, attack: 0.001, decay, peak, offset: 0, ...extra });

// The building blocks.
const Part = {
  // A short knock: a sine that falls into its pitch.
  knock: (f, decay, peak, at = 0) => tone(f * 1.6, decay, peak, { glideTo: f, glideTime: 0.018, attack: 0.001, offset: at }),
  // A tight ring of noise.
  ring: (f, peak, q = 8, at = 0) => noise("bandpass", f, 0.0055, peak, { q, offset: at }),
  // A switch click: a tight ring over a softer, wider body below it.
  click: (f, peak, at = 0) => [Part.ring(f, peak, 8, at), Part.ring(f * 0.675, peak * 0.5, 2, at)],
  // A breath of air sliding from one band to another.
  air: (from, to, decay, peak, attack = 0.008, at = 0, q = 1.5) =>
    noise("bandpass", from, decay, peak, { q, attack, glideTo: to, glideTime: attack + decay, offset: at }),
  // A low thump.
  thud: (f, decay, peak, attack = 0.001, at = 0) => noise("lowpass", f, decay, peak, { q: 0.7, attack, offset: at }),
  // The mallet meeting the bar: 3 ms of noise, low-passed at the mallet's hardness (felt ~1 kHz, hard ~3 kHz).
  contact: (hardness, peak, at = 0) => noise("lowpass", hardness, 0.0035, peak, { q: -3, offset: at }),
  // Struck bars. Each mode is one sine, and higher modes die sooner, as on any real bar.
  glass: [[1, 1], [2, 0.2], [3, 0.06]], // A round, in-tune bar: only whole-number overtones (octave and twelfth), nothing metallic
  mallet: [[1, 1], [4, 0.2]], // A marimba bar: a clean double octave on top, warm and in tune
  struck: (f, decay, peak, modes, at = 0) =>
    modes.filter(([ratio]) => f * ratio <= 5000).map(([ratio, level]) =>
      tone(f * ratio, Math.max(0.028, decay / ratio ** 0.75), peak * level, { attack: 0.006, offset: at })),
  // A deep note that swells in under a click and rings on, with its octave and faint upper partials.
  note: (f, decay, peak, at = 0) => {
    const attack = Math.min(0.11, decay / 2);
    return [[1, 1, 1], [2, 0.9, 0.5], [3, 1, 0.04], [4, 0.73, 0.056]].map(([m, length, level]) =>
      tone(f * m * 1.09, decay * length, peak * level, { glideTo: f * m, glideTime: 0.015, attack, offset: at }));
  },
};

const PRESS_HZ = 4000;
const RELEASE_HZ = 4800;
const RELEASE_GAP = 0.09; // Seconds between the press and the release of a combined cue

// gain: level of the whole cue. release: layers played a moment later (the pointer coming up).
// room: how much of it reaches the small room. vary: how much each play drifts (null: not at all).
const cue = (gain, layers, { release = [], room = 1, vary = { pitch: 0, level: 0.08 } } = {}) => ({ gain, layers, release, room, vary });

// A variation of a cue, for re-voicing a sound without rebuilding it. Each option answers one
// complaint you might have after listening:
//   pitch:      "too high / too low". Semitones for the tones, so notes stay in tune with each other.
//   brightness: "too harsh / too muffled". Multiplies the noise filter frequencies (1.2 is sharper).
//   length:     "too long / too short". Multiplies every ring. The rhythm of the notes stays the same.
//   room:       "too dry / too distant". Multiplies how much reaches the small room.
//   level:      "too loud / too quiet" next to the other sounds. Multiplies the cue's gain.
//   RECIPES.soft_tap = tune(RECIPES.tap, { length: 0.8, brightness: 0.85 }); // after RECIPES, plus a LEVELS entry
export const tune = (recipe, { pitch = 0, brightness = 1, length = 1, room = 1, level = 1 } = {}) => {
  const shift = 2 ** (pitch / 12);
  const retune = (layer) => {
    const factor = layer.kind === "tone" ? shift : brightness;
    return { ...layer, frequency: layer.frequency * factor, glideTo: layer.glideTo && layer.glideTo * factor, decay: layer.decay * length };
  };
  return { ...recipe, gain: recipe.gain * level, room: recipe.room * room, layers: recipe.layers.map(retune), release: recipe.release.map(retune) };
};

// A switch thrown: the click and a firm knock, letting go with a lighter click. On sits two
// semitones higher, off two lower. `press` and `release` choose which halves are played.
const toggleCue = (on, press, release) => {
  const factor = 2 ** ((on ? 2 : -2) / 12);
  const pitched = (layers) => layers.map((layer) => ({ ...layer, frequency: layer.frequency * factor, glideTo: layer.glideTo && layer.glideTo * factor }));
  const down = pitched([...Part.click(PRESS_HZ, 0.245), Part.knock(330, 0.0389, 0.05)]);
  const up = pitched(Part.click(RELEASE_HZ, 0.1));
  return cue(0.0571, press ? down : up, { release: press && release ? up : [] });
};

const [C2, G3, A3, A2, C4, E4, G4, A4, Cs5, C5, E5, A5, E6] = [65.41, 196, 220, 110, 261.63, 329.63, 392, 440, 554.37, 523.25, 659.25, 880, 1318.51];

// Cues with two halves: the part that belongs to the pointer going down and the part that belongs to
// it coming back up. Played together they are the combined cue; played apart (`name_down` on
// pointerdown, `name_up` on pointerup) each half lands exactly when the finger does.
const TAP = { gain: 0.0431, down: [...Part.click(PRESS_HZ, 0.53), Part.knock(131, 0.07, 0.12), Part.thud(110, 0.045, 0.12)], up: Part.click(RELEASE_HZ, 0.28) };
const CLICK = { gain: 0.0571, down: [...Part.click(PRESS_HZ, 0.245), Part.knock(330, 0.0389, 0.05)], up: Part.click(RELEASE_HZ, 0.1) };

// Recipes. Edit these to re-voice your whole app in one place.
export const RECIPES = {
  // A tap: a firmer, brighter click over a short low thump, and a clear release. Like the tap cue
  // it is modelled on, but with no long note ringing after it: it is over when the finger lifts.
  tap: cue(TAP.gain, TAP.down, { release: TAP.up }),
  tap_down: cue(TAP.gain, TAP.down),
  tap_up: cue(TAP.gain, TAP.up),
  // A plain button: a softer, lighter press and release.
  click: cue(CLICK.gain, CLICK.down, { release: CLICK.up }),
  click_down: cue(CLICK.gain, CLICK.down),
  click_up: cue(CLICK.gain, CLICK.up),
  // The two halves of a button, for pointerdown and pointerup.
  press: cue(0.0571, [...Part.click(PRESS_HZ, 0.245), Part.knock(330, 0.0389, 0.05)]),
  release: cue(0.0571, Part.click(RELEASE_HZ, 0.1)),
  // A detent: one light click over a small, high knock. A single tick, with no release.
  tick: cue(0.442, [...Part.click(RELEASE_HZ, 0.12), Part.knock(700, 0.0196, 0.02)], { vary: { pitch: 0.02, level: 0.1 } }),
  // A soft detent, a little lower: something opening.
  hover: cue(0.165, [...Part.click(4200, 0.1), Part.knock(520, 0.02, 0.02)], { vary: { pitch: 0.02, level: 0.1 } }),
  // One round bubble: a single sine whose pitch rises quickly as it closes, with a hint of body under it.
  pop: cue(0.085, [
    tone(420, 0.13, 0.55, { glideTo: 900, glideTime: 0.06, attack: 0.007 }),
    Part.thud(250, 0.035, 0.07),
  ], { vary: { pitch: 0.05, level: 0.1 } }),
  // Switches. toggle_* are both halves; the press and release halves are used by sound#togglePress.
  toggle_on: toggleCue(true, true, true),
  toggle_off: toggleCue(false, true, true),
  toggle_press_on: toggleCue(true, true, false),
  toggle_press_off: toggleCue(false, true, false),
  toggle_release_on: toggleCue(true, false, true),
  toggle_release_off: toggleCue(false, false, true),
  // Take saved: three warm marimba notes roll upward and land on the home note with its octave under it.
  success: cue(0.07, [
    ...Part.click(3600, 0.12), Part.contact(1400, 0.16), ...Part.struck(Cs5, 0.95, 0.08, Part.mallet),
    Part.contact(1500, 0.16, 0.07), ...Part.struck(E5, 0.95, 0.075, Part.mallet, 0.07),
    Part.contact(1600, 0.18, 0.14), ...Part.struck(A5, 1.4, 0.08, Part.mallet, 0.14), ...Part.struck(A4, 1.5, 0.05, Part.mallet, 0.14),
  ], { room: 2, vary: null }),
  // A low A with C an octave and a third above, over a soft thump.
  error: cue(0.0708, [...Part.note(A2, 0.487, 0.12), ...Part.note(C5, 0.461, 0.04), Part.thud(200, 0.0545, 0.2, 0.01)], { vary: null }),
  // A new message: two round glass notes, low enough to stay soft at any volume.
  notification: cue(0.07, [
    Part.contact(1200, 0.1), ...Part.struck(A4, 0.8, 0.09, Part.glass),
    Part.contact(1200, 0.1, 0.1), ...Part.struck(E5, 1, 0.08, Part.glass, 0.1),
  ], { room: 2, vary: null }),
  // Finished: C, G and E struck at once, ringing long.
  done: cue(0.102, [...Part.note(C4, 1.47, 0.072), ...Part.note(G4, 1.51, 0.06), ...Part.note(E5, 1.36, 0.045)], { room: 2, vary: null }),
  // Connected: one long, warm G ringing into the room.
  ready: cue(0.0983, Part.note(G3, 1.78, 0.108), { room: 2, vary: null }),
  // On air: three notes swell in and open into a wide, bright chord.
  bloom: cue(0.045, [...Part.note(A3, 1.6, 0.1), ...Part.note(E4, 1.5, 0.08, 0.06), ...Part.note(A4, 1.4, 0.065, 0.12)], { room: 2, vary: null }),
  // Sparkle: a quick run of six round notes up a pentatonic scale, ringing together, with a soft
  // celeste chord swelling in underneath so the run has something to sit on. In tune throughout:
  // whole-number overtones only and no pitch drift.
  sparkle: cue(0.09, [
    ...[523.25, 587.33, 659.25, 783.99, 880, 1046.5].flatMap((f, i) => Part.struck(f, 0.7, 0.06, Part.glass, i * 0.05)),
    tone(523.25, 1.2, 0.035, { attack: 0.07 }), tone(783.99, 1.1, 0.025, { attack: 0.09, offset: 0.03 }),
  ], { room: 2, vary: { pitch: 0, level: 0.06 } }),
  // Glint: a round bell with its octave underneath for body, and its fifth struck a breath later.
  glint: cue(0.09, [
    ...Part.struck(783.99, 0.9, 0.07, Part.glass), ...Part.struck(1174.7, 0.9, 0.06, Part.glass, 0.02),
    tone(392, 0.9, 0.05, { attack: 0.01 }),
  ], { room: 2, vary: { pitch: 0, level: 0.06 } }),
  // Careful: two soft, equal knocks on one note. Attention without alarm, between a notification and an error.
  warning: cue(0.07, [
    Part.contact(1400, 0.12), ...Part.struck(E5, 0.35, 0.09, Part.mallet),
    Part.contact(1400, 0.1, 0.13), ...Part.struck(E5, 0.45, 0.075, Part.mallet, 0.13),
  ], { room: 1.5, vary: { pitch: 0, level: 0.06 } }),
  // Copied: two tiny notes climbing. Short, bright, and it ends up.
  copy: cue(0.08, [...Part.struck(783.99, 0.2, 0.07, Part.mallet), ...Part.struck(1046.5, 0.3, 0.06, Part.mallet, 0.05)], { room: 1, vary: { pitch: 0, level: 0.06 } }),
  // A soft whoosh: air that swells in, sweeps upward and fades away, with a little low body under it.
  page: cue(0.1, [
    Part.air(450, 1900, 0.34, 0.2, 0.13, 0, 0.8),
    Part.air(900, 3400, 0.26, 0.05, 0.15, 0.04, 0.8),
    Part.thud(220, 0.3, 0.05, 0.12),
  ], { room: 1.5 }),
  // A soft whoosh closing: the page sound in reverse, sweeping down and settling with a little thump.
  close: cue(0.1, [
    Part.air(1900, 450, 0.22, 0.18, 0.04, 0, 0.8),
    Part.air(3400, 900, 0.16, 0.045, 0.05, 0.02, 0.8),
    Part.thud(200, 0.08, 0.06, 0.004, 0.14),
  ]),
  // Set down in place: a dull click over a knock and a low thump. Heavier than a tap, with no release.
  drop: cue(0.06, [...Part.click(2600, 0.2), Part.knock(196, 0.06, 0.1), Part.thud(140, 0.06, 0.16)], { vary: { pitch: 0.03, level: 0.1 } }),
  // Swept away: a brush of air falling, with a low knock that drops in pitch under it.
  delete: cue(0.08, [
    Part.air(2400, 600, 0.12, 0.1, 0.008, 0, 1.2),
    Part.knock(160, 0.08, 0.1, 0.015),
    Part.thud(120, 0.05, 0.08, 0.001, 0.015),
  ]),
  // One struck note. `sound#step` raises its pitch along a slider.
  step: cue(0.07, [Part.contact(1500, 0.14), ...Part.struck(A4, 0.18, 0.09, Part.mallet)]),
};

// Loudness trim per sound, in dB. Measured so that presses and clicks peak around -20 dBFS (releases
// a little lighter) and notes around -16, which is what makes a click feel as present as a chime.
// Some sit off target on purpose: hover is quieter, tap firmer. After adding or changing a recipe,
// call suggestLevel("name") from the browser console (or use the Sound lab on the docs page) for a
// suggested trim, then listen.
export const LEVELS = {
  tap: 9.5, click: 13, press: 12, release: 18, tick: -1, hover: 2, pop: -4,
  toggle_on: 8, toggle_off: 14, toggle_press_on: 12, toggle_press_off: 13, toggle_release_on: 13, toggle_release_off: 13.5,
  success: 6, error: 5.7, notification: 8, done: 3.8, ready: 5, bloom: 6, sparkle: 4.5, glint: 4.5, warning: 11.4, copy: 12, page: 5, step: 7,
  close: 2.5, drop: 9, delete: 6.5, // close sits with page, a little under the click target
};

// Other names that resolve to a recipe.
const ALIASES = { toggle: "toggle_on", chime: "notification", droplet: "pop", button: "tap", dismiss: "close", remove: "delete" };

const VARIATION_RING = 0.1; // ± how much each layer's ring length drifts per play
const OUTPUT_GAIN = 5.8 * 2 * 0.5; // Cues are mixed quietly and boosted at the output; the 0.5 sets a medium overall level
const ROOM_SEND = 0.08;
const LEVEL_TARGETS = { click: -20, note: -16 }; // Peak dBFS each kind of sound is trimmed to (see LEVELS)
const LONG_RING = 0.1; // Seconds: a sound with a tone ringing this long or longer is trimmed as a note

const STORAGE_KEY = "sound"; // → localStorage "sound:muted" and "sound:volume"
const CHANGE_EVENT = "sound:change"; // fired on window when mute or volume changes
const HOVER_THROTTLE = 120; // ms between hover sounds, so sweeping a menu stays calm
const TOUCH_SETTLE = 70; // ms a touch waits before its press plays, so a scroll that starts on a button stays silent
const STEP_INTERVAL = 35; // ms between slider notes, so fast drags stay a flutter, not a buzz
const PREVIEW_INTERVAL = 90; // ms between volume previews while dragging
const STALE_AFTER = 300; // ms: a sound still waiting for the audio to wake up after this is dropped
const PLAY_EVENT = "sound:play"; // dispatch on an element or on window to play a sound from anywhere
const DELEGATED_EVENTS = ["pointerdown", "pointerup", "click", "change", "input", "keydown"]; // for data-sound="…" and keyboard presses
const KEY_ROLES = /^(button|switch|checkbox|radio|menuitem|menuitemcheckbox|menuitemradio|tab|option)$/; // roles Space and Enter press
const handledPlayEvents = new WeakSet(); // so one sound:play event plays once, however many controllers hear it

let lastHoverAt = 0;

export default class extends Controller {
  static targets = ["mute", "volume", "indicator"];

  static values = {
    name: { type: String, default: "tap" }, // Sound used when an action has no name param
    volume: { type: Number, default: 1 }, // 0–1, multiplied with the global volume
    respectMotion: { type: Boolean, default: true }, // Start muted for prefers-reduced-motion users
    playOnConnect: { type: String, default: "" }, // Sound played once when the element appears (Turbo Streams, flash)
  };

  connect() {
    this.sync = this.sync.bind(this);
    window.addEventListener(CHANGE_EVENT, this.sync);
    window.addEventListener("storage", this.sync); // Other tabs
    // Follow the system setting while the page is open (it decides the default mute).
    this.motionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    this.motionQuery?.addEventListener?.("change", this.sync);

    // data-sound="name" on any element inside, and sound:play events from anywhere.
    this.delegate = this.delegate.bind(this);
    this.onPlayEvent = this.onPlayEvent.bind(this);
    DELEGATED_EVENTS.forEach((type) => this.element.addEventListener(type, this.delegate));
    this.element.addEventListener(PLAY_EVENT, this.onPlayEvent);
    window.addEventListener(PLAY_EVENT, this.onPlayEvent);

    this.sync();
    this.playOnConnect();
  }

  disconnect() {
    window.removeEventListener(CHANGE_EVENT, this.sync);
    window.removeEventListener("storage", this.sync);
    this.motionQuery?.removeEventListener?.("change", this.sync);
    DELEGATED_EVENTS.forEach((type) => this.element.removeEventListener(type, this.delegate));
    this.element.removeEventListener(PLAY_EVENT, this.onPlayEvent);
    window.removeEventListener(PLAY_EVENT, this.onPlayEvent);
    Object.values(this.throttles || {}).forEach(({ timer }) => clearTimeout(timer));
    this.pressed = null;
    this.unwatchPress();
    this.letGoOfKey?.();
    this.settling?.();
    clearTimeout(this.thrownTimer);
    this.thrownAbort?.abort();
  }

  // ---- Actions ---------------------------------------------------------------------------

  // data-action="sound#play" data-sound-name-param="success"
  // Optional: data-sound-volume-param="0.5" (0–1), data-sound-pitch-param="1.25" (1 = unchanged)
  // Also callable from other controllers: this.soundOutlet.play("success", { volume: 0.5, pitch: 1.25 })
  // or with a recipe instead of a name, and its loudness trim in dB: play(tune(…), { trim: 9 })
  play(event, options = {}) {
    if (typeof event === "string" || event?.layers) return this.emit(event, options);
    if (event?.repeat || this.isDisabled(event?.currentTarget)) return; // Holding a key down plays once

    const params = { volume: event?.params?.volume, pitch: event?.params?.pitch, source: event?.currentTarget };
    this.whenTouchSettles(event, () => this.emit(event?.params?.name, params));
  }

  // On touch, a pointerdown is often the start of a scroll. Wait a moment before playing: if the
  // browser takes the pointer over for scrolling it sends pointercancel and the sound never plays.
  // A quick tap lifts before the wait is over, and then the sound plays at once, just before the
  // release. Mouse and pen play immediately.
  whenTouchSettles(event, play) {
    if (event?.type !== "pointerdown" || event.pointerType !== "touch") return play();

    this.settling?.();
    const { pointerId } = event;
    const abort = new AbortController();
    const finish = (played) => {
      abort.abort();
      clearTimeout(timer);
      if (this.settling === cancel) this.settling = null;
      if (played) {
        this.releaseAfter = performance.now() + RELEASE_GAP * 1000;
        play();
      }
    };
    const cancel = () => finish(false);
    const timer = setTimeout(() => finish(true), TOUCH_SETTLE);
    const listen = (type, played) =>
      window.addEventListener(type, (other) => other.pointerId === pointerId && finish(played), { capture: true, signal: abort.signal });

    // Capture on window runs before the element's own pointerup, so the press always comes first.
    listen("pointerup", true);
    listen("pointercancel", false);
    this.settling = cancel;
  }

  // A release right after a press that waited for its touch to settle is held back a moment,
  // so the two halves do not land on top of each other.
  emitRelease(name, options) {
    const wait = (this.releaseAfter || 0) - performance.now();
    this.releaseAfter = 0;
    if (wait <= 0) return this.emit(name, options);
    setTimeout(() => this.emit(name, options), wait);
  }

  // data-action="pointerdown->sound#press pointerup->sound#release click->sound#release"
  // A low knock going down and a brighter tick coming back up, like a real key.
  press(event) {
    if (event.button > 0 || this.isDisabled(event.currentTarget)) return;
    // Optional: only count presses that land inside a part of the element, e.g. the field of a
    // Select that has its dropdown inside the same wrapper: data-sound-within-param=".ts-control"
    if (event.params.within && !event.target.closest?.(event.params.within)) return;

    this.startPress(event.currentTarget, event, event.params.press || "press");
  }

  // The press half of a pressable element. The release comes from endPress.
  startPress(element, event, press) {
    if (event.button > 0) return;

    this.pressed = element;
    this.watchPress();
    this.whenTouchSettles(event, () => this.emit(press, { source: element }));
  }

  // The release half: on pointerup for a press that started on the same element, or both halves
  // on a click with no pointer or key going down first (a screen reader, element.click()).
  endPress(element, event, { press, release }) {
    if (event.type === "click") {
      if (event.detail > 0) return; // A pointer click: both halves already played
      if (this.keyPress?.element === element) return; // Space or Enter: the keys play both halves

      this.emit(press, { source: element });
      setTimeout(() => this.emit(release, { source: element }), RELEASE_GAP * 1000);
      return;
    }

    const started = this.pressed === element;
    this.pressed = null;
    if (started) this.emitRelease(release, { source: element });
  }

  // A press that ends somewhere else (dragged off, scrolled away, cancelled) must not leave
  // stale state behind that a later pointerup would mistake for its own press.
  watchPress() {
    this.unwatchPress();
    this.clearPress = () => {
      // Let the element's own pointerup run first: window listeners fire last when bubbling.
      this.pressed = null;
      this.unwatchPress();
    };
    window.addEventListener("pointerup", this.clearPress);
    window.addEventListener("pointercancel", this.clearPress);
  }

  unwatchPress() {
    if (!this.clearPress) return;
    window.removeEventListener("pointerup", this.clearPress);
    window.removeEventListener("pointercancel", this.clearPress);
    this.clearPress = null;
  }

  release(event) {
    if (this.isDisabled(event.currentTarget)) return;

    this.endPress(event.currentTarget, event, {
      press: event.params.press || "press",
      release: event.params.release || "release",
    });
  }

  // data-action="pointerenter->sound#hover" — mouse only, quiet, and throttled.
  hover(event) {
    if (event.pointerType && event.pointerType !== "mouse") return;
    if (this.isDisabled(event.currentTarget)) return;

    const now = performance.now();
    if (now - lastHoverAt < HOVER_THROTTLE) return;
    lastHoverAt = now;

    this.emit(event.params.name || "hover", { source: event.currentTarget });
  }

  // data-action="input->sound#step" on <input type="range">, or on the hidden input of the
  // Slider component. One short note per step that climbs an octave from the lowest value to
  // the highest. Override the note with data-sound-name-param. The input event only fires
  // when the value changes, so holding still is silent.
  step(event) {
    if (this.isDisabled(event.currentTarget)) return;
    this.stepOn(event.currentTarget, event.params.name || "step");
  }

  stepOn(input, name) {
    const { min, max } = rangeOf(input);
    const position = max > min ? clamp((Number(input.value) - min) / (max - min)) : 0;

    this.throttle("step", STEP_INTERVAL, () => this.emit(name, { pitch: 2 ** position, source: input }));
  }

  // Switches have two halves, like the real thing: a press when the pointer goes down and a lighter
  // release when it comes back up. Put the three actions on the switch's <label> (or on the checkbox,
  // or on a toggle button with aria-pressed / aria-checked, using click instead of change):
  //
  //   data-action="pointerdown->sound#togglePress pointerup->sound#toggleRelease change->sound#toggle"
  //
  // The press plays for the state you are switching to: on sits two semitones higher, off two lower.
  // Space plays the halves on keydown and keyup (see keyDown); `toggle` covers changes with neither.
  togglePress(event) {
    this.pressSwitch(this.switchOf(event.currentTarget), event);
  }

  pressSwitch(input, event) {
    if (!input || this.isDisabled(input) || event.button > 0) return;

    // One object per gesture. Every timer below checks that it is still looking at its own gesture, so
    // a quick second press can never be undone by the cleanup of the first one.
    this.thrownAbort?.abort();
    clearTimeout(this.thrownTimer);

    const gesture = { input, on: !isOn(input) }; // The state it is about to take
    const abort = new AbortController();
    this.thrown = gesture;
    this.thrownAbort = abort;

    // However the press ends (released on the switch, dragged away, cancelled), forget it shortly after.
    // The click and change of a real toggle arrive right after the pointerup, inside that window.
    const forget = () => {
      abort.abort(); // Drops both listeners, so a stray pointercancel later cannot run this again
      clearTimeout(this.thrownTimer);
      this.thrownTimer = setTimeout(() => {
        if (this.thrown === gesture) this.thrown = null;
      }, 400);
    };
    const ends = event.type === "keydown" ? ["keyup", "blur"] : ["pointerup", "pointercancel"];
    ends.forEach((type) => window.addEventListener(type, forget, { signal: abort.signal }));

    this.whenTouchSettles(event, () => this.emit(gesture.on ? "toggle_press_on" : "toggle_press_off", { source: input }));
  }

  toggleRelease(event) {
    this.releaseSwitch(this.switchOf(event.currentTarget));
  }

  releaseSwitch(input) {
    if (!input || this.thrown?.input !== input) return;

    const { on } = this.thrown;
    this.emitRelease(on ? "toggle_release_on" : "toggle_release_off", { source: input });
  }

  // The control a switch gesture is about: a toggle button with aria-pressed / aria-checked itself,
  // or the checkbox (or radio) of a label.
  switchOf(element) {
    if (isAriaToggle(element)) return element;
    return element instanceof HTMLInputElement ? element : element.querySelector('input[type="checkbox"], input[type="radio"]');
  }

  // data-action="change->sound#toggle" on a checkbox, or "click->sound#toggle" on a button
  // with aria-checked / aria-pressed. Plays toggle_on or toggle_off to match the new state.
  toggle(event) {
    this.toggleState(event.currentTarget, event.params);
  }

  toggleState(element, { on = "toggle_on", off = "toggle_off" } = {}) {
    if (this.isDisabled(element)) return;

    // A pointer or a key already played both halves of this one.
    if (this.thrown && this.switchOf(element) === this.thrown.input) return;

    // Checkboxes already hold their new state. Buttons are read after a microtask so the
    // controller that flips aria-checked gets to run first. Stay in the same task to keep
    // the user gesture that browsers require for audio.
    if ("checked" in element) return this.emit(isOn(element) ? on : off, { source: element });
    queueMicrotask(() => this.emit(isOn(element) ? on : off, { source: element }));
  }

  // ---- data-sound="name": one attribute instead of actions --------------------------------------
  //
  //   <button data-sound="tap">            press and release halves (any sound with _down/_up halves,
  //                                        or "press"); other sounds play on click
  //   <input type="checkbox" data-sound>   a switch: halves from the pointer or Space
  //   <button aria-pressed data-sound="toggle">  switch halves from the pointer or keys, read from aria-pressed / aria-checked
  //   <input type="range" data-sound>      a rising note per step (also on a Slider's hidden input)
  //   <select data-sound="tick">, radios   plays on change
  //
  // An empty data-sound uses the controller's name value (tap) for buttons, the switch cue for
  // checkboxes and the step note for ranges. The nearest sound controller handles each element.
  delegate(event) {
    if (event.type === "keydown") return this.keyDown(event);

    const element = this.soundElementFor(event.target);
    if (!element || this.isDisabled(element)) return;

    const name = element.dataset.sound.trim();
    const { type } = event;

    // A native range, or the hidden input of the Slider component: a rising note per step.
    if (element.type === "range" || element.matches('[data-slider-target~="input"]')) {
      if (type === "input") this.stepOn(element, name || "step");
    } else if (element.type === "checkbox" && (!name || name === "toggle")) {
      if (type === "pointerdown") this.pressSwitch(element, event);
      else if (type === "pointerup") this.releaseSwitch(element);
      else if (type === "change") this.toggleState(element);
    } else if (element.matches("input, select, textarea")) {
      if (type === "change") this.emit(name || this.nameValue, { source: element });
    } else if (name === "toggle") {
      if (type === "pointerdown" && isAriaToggle(element)) this.pressSwitch(element, event);
      else if (type === "pointerup") this.releaseSwitch(element);
      else if (type === "click") this.toggleState(element);
    } else {
      const halves = this.halvesOf(name || this.nameValue);
      if (!halves) {
        if (type === "click" && !event.repeat) this.emit(name, { source: element });
      } else if (type === "pointerdown") {
        this.startPress(element, event, halves.press);
      } else if (type === "pointerup" || type === "click") {
        this.endPress(element, event, halves);
      }
    }
  }

  // The data-sound element an event belongs to, when this controller is the nearest one to it.
  // A press on a label belongs to its control: <label><input type="checkbox" data-sound> …</label>
  soundElementFor(target) {
    if (!(target instanceof Element)) return null;

    let element = target.closest("[data-sound]");
    if (!element) {
      const control = target.closest("label")?.control;
      if (control?.hasAttribute("data-sound")) element = control;
    }
    if (!element || !this.element.contains(element)) return null;

    return element.closest('[data-controller~="sound"]') === this.element ? element : null;
  }

  // ---- Keyboard presses ------------------------------------------------------------------------
  //
  // Space and Enter press a button like a finger does: the press half plays when the key goes down
  // and the release half when it comes back up. This works for data-sound elements and for elements
  // bound to sound#press or sound#togglePress (on the switch's label), with no extra actions.
  // Native buttons click on Enter's keydown and on Space's keyup; those clicks are skipped, since the
  // keys already played both halves. Clicks with no key behind them (screen readers) still play both.
  keyDown(event) {
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
    const { target, key } = event;
    if (!(target instanceof Element) || !activatesWith(target, key) || this.isDisabled(target)) return;

    const input = this.keyboardSwitchOf(target);
    if (input) {
      this.pressSwitch(input, event);
      return this.holdKey(key, input, () => this.releaseSwitch(input));
    }

    const press = this.keyboardPressOf(target);
    if (!press) return;

    this.emit(press.press, { source: press.element });
    this.holdKey(key, press.element, () => this.emit(press.release, { source: press.element }));
  }

  // Waits for the key to come up, then plays the release. Until just after that, clicks on the
  // element belong to this key press (Enter can repeat clicks while it is held).
  holdKey(key, element, release) {
    this.letGoOfKey?.();

    const abort = new AbortController();
    const keyPress = { element };
    const finish = (played) => {
      abort.abort();
      if (this.letGoOfKey === cancel) this.letGoOfKey = null;
      if (played) release();
      // Space clicks right after its keyup, in the same task: keep the marker until then.
      setTimeout(() => {
        if (this.keyPress === keyPress) this.keyPress = null;
      });
    };
    const cancel = () => finish(false);

    this.keyPress = keyPress;
    this.letGoOfKey = cancel;
    // Capture on window: the release plays before the keyup's own click and change.
    window.addEventListener("keyup", (other) => other.key === key && finish(true), { capture: true, signal: abort.signal });
    window.addEventListener("blur", cancel, { signal: abort.signal }); // The keyup will never come
  }

  // A switch that plays its two halves: a checkbox with data-sound (empty or "toggle"), or bound to
  // sound#togglePress on itself or one of its labels; or a toggle button with aria-pressed /
  // aria-checked and data-sound="toggle", sound#toggle or sound#togglePress.
  keyboardSwitchOf(target) {
    if (isAriaToggle(target)) {
      if (this.soundElementFor(target) === target) return target.dataset.sound.trim() === "toggle" ? target : null;
      return this.boundTo(target, "toggle") || this.boundTo(target, "togglePress") ? target : null;
    }
    if (!(target instanceof HTMLInputElement) || !["checkbox", "radio"].includes(target.type)) return null;

    if (this.soundElementFor(target) === target) {
      const name = target.dataset.sound.trim();
      return target.type === "checkbox" && (!name || name === "toggle") ? target : null;
    }
    return [target, ...(target.labels || [])].some((element) => this.boundTo(element, "togglePress")) ? target : null;
  }

  // The element and halves a key press on target plays: a data-sound element with two halves, or an
  // element bound to sound#press.
  keyboardPressOf(target) {
    const element = this.soundElementFor(target);
    if (element) {
      if (element.matches("input, select, textarea")) return null;
      const name = element.dataset.sound.trim();
      const halves = name === "toggle" ? null : this.halvesOf(name || this.nameValue);
      return halves && { element, ...halves };
    }

    if (!this.boundTo(target, "press")) return null;
    const { soundWithinParam: within, soundPressParam: press, soundReleaseParam: release } = target.dataset;
    if (within && !target.closest(within)) return null;
    return { element: target, press: press || "press", release: release || "release" };
  }

  // Whether element has a data-action for this controller's method, e.g. "pointerdown->sound#press".
  boundTo(element, method) {
    const actions = element.getAttribute("data-action")?.split(/\s+/) || [];
    const bound = actions.some((action) => new RegExp(`(^|->)sound#${method}(:|$)`).test(action));
    return bound && element.closest('[data-controller~="sound"]') === this.element;
  }

  // The two halves of a sound, or null when it has none: "tap" → tap_down / tap_up.
  halvesOf(name) {
    const key = resolve(name);
    if (key === "press" || key === "release") return { press: "press", release: "release" };
    if (RECIPES[`${key}_down`] && RECIPES[`${key}_up`]) return { press: `${key}_down`, release: `${key}_up` };
    return null;
  }

  // ---- Playing from JavaScript and from the server --------------------------------------------

  // element.dispatchEvent(new CustomEvent("sound:play", { bubbles: true, detail: { name: "notification" } }))
  // The nearest sound controller plays it. Dispatched on window, one controller plays it.
  onPlayEvent(event) {
    if (handledPlayEvents.has(event)) return;
    handledPlayEvents.add(event);

    const { name, volume, pitch } = event.detail || {};
    this.emit(name, { volume, pitch, source: event.target instanceof Element ? event.target : null });
  }

  // <div data-controller="sound" data-sound-play-on-connect-value="notification"> in a Turbo Stream or
  // a flash message plays once when it appears. The attribute is removed straight away, so a Turbo
  // cache restore or a reconnect never plays it again. Before the first click or key press on the
  // page, the browser blocks it and nothing plays.
  playOnConnect() {
    const name = this.playOnConnectValue;
    if (!name) return;

    this.element.removeAttribute(`data-${this.identifier}-play-on-connect-value`);
    this.emit(name, { source: this.element });
  }

  // data-action="turbo:submit-end->sound#result" on a form: success or error from the response.
  result(event) {
    this.emit(event.detail?.success ? "success" : "error", { source: event.currentTarget });
  }

  // data-action="sound#toggleMute" on a button with data-sound-target="mute"
  toggleMute() {
    this.setMuted(!this.muted);
    this.emit("toggle_on"); // Confirms sound is back; silent when we just muted
  }

  mute() {
    this.setMuted(true);
  }

  unmute() {
    this.setMuted(false);
  }

  // data-action="input->sound#setVolume" on <input type="range" min="0" max="100">, or on the
  // hidden input of a Slider component (data-sound-target="volume" data-slider-target="input").
  setVolume(event) {
    if (this.syncing) return; // The slider is just catching up with a saved value

    const input = event.currentTarget;
    const { min, max } = rangeOf(input);
    const volume = clamp(max > min ? (Number(input.value) - min) / (max - min) : 1);

    this.store("volume", volume);

    // Preview the level while dragging, but not on every pixel. The last preview always plays, at the final level.
    this.throttle("preview", PREVIEW_INTERVAL, () => this.emit("tick", { source: input }));
  }

  // Runs `play` at most once per `interval` ms. A call that lands inside the interval waits for its end
  // and replaces any call already waiting, so the end of a fast drag is always heard.
  throttle(key, interval, play) {
    this.throttles ||= {};
    const entry = (this.throttles[key] ||= { at: -Infinity, timer: null });
    clearTimeout(entry.timer);

    const run = () => {
      entry.at = performance.now();
      play();
    };
    const wait = entry.at + interval - performance.now();
    if (wait <= 0) return run();
    entry.timer = setTimeout(run, wait);
  }

  // ---- Preferences -----------------------------------------------------------------------

  get muted() {
    const stored = this.read("muted");
    if (stored !== null) return stored === "true";

    // No explicit choice yet: people who ask for less motion also get less noise.
    return this.respectMotionValue && this.prefersReducedMotion;
  }

  get globalVolume() {
    const stored = parseFloat(this.read("volume"));
    return Number.isFinite(stored) ? clamp(stored) : 1;
  }

  get prefersReducedMotion() {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  }

  setMuted(muted) {
    this.store("muted", muted);
  }

  // localStorage can throw (private mode, blocked cookies). Fall back to in-memory values.
  read(key) {
    try {
      return window.localStorage.getItem(`${STORAGE_KEY}:${key}`);
    } catch {
      return memory.has(key) ? memory.get(key) : null;
    }
  }

  store(key, value) {
    memory.set(key, String(value));
    try {
      window.localStorage.setItem(`${STORAGE_KEY}:${key}`, String(value));
    } catch {
      // Ignored: the in-memory copy keeps this page working.
    }
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  }

  // Reflect the preferences in the DOM so mute buttons and sliders never drift out of date.
  // Style with data-[sound-muted=true]:… on the controller element or group-data-[…] inside it.
  sync() {
    const muted = this.muted;
    const percent = Math.round(this.globalVolume * 100);

    this.element.dataset.soundMuted = muted;
    this.muteTargets.forEach((button) => button.setAttribute("aria-pressed", muted));
    this.volumeTargets.forEach((input) => {
      const { min, max } = rangeOf(input);
      const value = Math.round(min + (percent / 100) * (max - min));
      if (Number(input.value) !== value) input.value = value;
      input.style.setProperty("--sound-volume", `${percent}%`);

      // A Slider component keeps its own value, so tell it about changes made elsewhere
      // (another tab, a second slider). Slider connects after its input is read, so a
      // slider that is not ready yet picks the value up from the input instead.
      const host = input.closest('[data-controller~="slider"]');
      // setValue(index, value) is the Slider's way to move a thumb from outside; it does nothing when
      // the thumb is already there. Without it (an older Slider) the input value above still applies.
      const slider = host && this.application.getControllerForElementAndIdentifier(host, "slider");
      if (typeof slider?.setValue === "function") {
        this.syncing = true;
        try {
          slider.setValue(0, value);
        } finally {
          this.syncing = false;
        }
      }
    });
  }

  // ---- Playback --------------------------------------------------------------------------

  emit(name, { volume, pitch, source, trim } = {}) {
    if (this.muted) return;

    const custom = name?.layers ? name : null; // A recipe passed in directly (the Sound lab)
    const key = custom
      ? "custom"
      : String(name || this.nameValue)
          .trim()
          .replaceAll("-", "_");
    const resolved = resolve(key);
    const recipe = custom || RECIPES[resolved];
    if (!recipe) return; // Unknown names are ignored quietly

    // The same cue twice within 35 ms is never intentional (two listeners reacting to one gesture),
    // and it would sound like a doubled click. Drop the second one.
    const now = performance.now();
    if (now - (lastEmittedAt[resolved] ?? -Infinity) < 35) return;
    lastEmittedAt[resolved] = now;
    const gain = Number.isFinite(parseFloat(volume)) ? parseFloat(volume) : 1; // 0 means silent, not "unset"
    const decibels = Number.isFinite(parseFloat(trim)) ? parseFloat(trim) : trimOf(resolved);
    const level = clamp(this.globalVolume * this.volumeValue * gain) * 10 ** (decibels / 20) * lightness(resolved);
    if (level === 0) return;

    // Autoplay rules: no sound before the first click or key press. The sound is dropped,
    // not queued, so a late page-load cue never surprises anyone.
    if (!synth.play(recipe, level, parseFloat(pitch))) return;

    this.echo(source);
    this.dispatch("played", { detail: { name: key } });
  }

  // Optional visual echo: bars inside a data-sound-target="indicator" dance when a sound
  // plays. An indicator inside the triggering element belongs to that trigger; indicators
  // outside of any trigger react to every sound in the controller.
  echo(source) {
    if (!this.hasIndicatorTarget) return;

    const own = source ? this.indicatorTargets.filter((indicator) => source.contains(indicator)) : [];
    const shared = this.indicatorTargets.filter((indicator) => {
      const trigger = indicator.closest('[data-action*="sound#"]');
      return !trigger || trigger === this.element;
    });
    const indicators = own.length && source !== this.element ? own : shared;
    const reduced = this.prefersReducedMotion;

    indicators.forEach((indicator) => {
      Array.from(indicator.children).forEach((bar, index) => {
        bar.getAnimations().forEach((animation) => animation.cancel());

        // Bars rest as dim dots (give them a height and an opacity class) and light up while they
        // move. The first and last keyframes are left implicit so each bar returns to its own resting style.
        if (reduced) {
          bar.animate(
            [
              { opacity: 1, offset: 0.3 },
              { opacity: 1, offset: 0.7 },
            ],
            { duration: 400, easing: "ease" },
          );
          return;
        }

        // Grow the bar's height, never scale it: scaling squashes the rounded ends into points.
        // The bar keeps its width, so its ends stay perfectly round at every height.
        const room = indicator.clientHeight || 16;
        const peak = Math.round(room * [0.62, 1, 0.5, 0.82][index % 4]);
        bar.animate(
          [
            { height: `${peak}px`, opacity: 1, offset: 0.3, easing: "cubic-bezier(0.33, 1, 0.68, 1)" },
            { height: `${Math.round(peak * 0.45)}px`, opacity: 1, offset: 0.62, easing: "cubic-bezier(0.33, 1, 0.68, 1)" },
          ],
          { duration: 620, delay: index * 45, easing: "cubic-bezier(0.33, 1, 0.68, 1)" },
        );
      });
    });
  }

  // Disabled controls (including those inside a disabled fieldset), and anything inside an
  // aria-disabled or inert container, stay silent.
  isDisabled(element) {
    if (!element?.matches) return false;
    return element.matches(":disabled") || Boolean(element.closest('[aria-disabled="true"], [inert]'));
  }
}

const memory = new Map();

// A sound name as written (dashes allowed, aliases allowed) → its key in RECIPES.
function resolve(name) {
  const key = String(name ?? "").trim().replaceAll("-", "_");
  return ALIASES[key] || key;
}

// A sound's loudness trim in dB (see LEVELS). A half uses its cue's trim.
function trimOf(name) {
  return LEVELS[name] ?? LEVELS[String(name).replace(/_(down|up)$/, "")] ?? 0;
}

// ---- Synth ---------------------------------------------------------------------------------

const lastPlayedAt = {};
const lastEmittedAt = {};

// Rapid repeats (scrubbing a slider) play lighter, so a flurry never gets harsh.
function lightness(name) {
  const now = performance.now();
  const since = (now - (lastPlayedAt[name] || 0)) / 1000;
  lastPlayedAt[name] = now;
  return 1 - 0.3 * Math.max(0, Math.min(1, (0.22 - since) / 0.15));
}

const synth = {
  stage: null,

  // Returns false when nothing could be played (blocked autoplay, no Web Audio).
  play(recipe, level, pitch) {
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return false;

    const stage = this.open();
    if (!stage) return false;

    const { context } = stage;
    if (context.state === "running") {
      voice(stage, recipe, level, pitch);
    } else {
      // A browser can hold resume() until the next gesture. A sound that was meant for an earlier
      // moment is dropped then, so it never plays late.
      const requested = performance.now();
      context.resume().then(
        () => performance.now() - requested < STALE_AFTER && voice(stage, recipe, level, pitch),
        () => {},
      );
    }
    return true;
  },

  // One shared AudioContext, created lazily on the first gesture.
  open() {
    if (this.stage) return this.stage;

    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return null;

    // On iOS and iPadOS, "ambient" mixes with whatever is already playing (music, a podcast) instead
    // of pausing it, and follows the silent switch. Only the default is changed, never an app's own choice.
    try {
      if (navigator.audioSession?.type === "auto") navigator.audioSession.type = "ambient";
    } catch {
      // Not supported: the browser keeps its default.
    }

    try {
      this.stage = outputStage(new Context({ latencyHint: "interactive" }));
    } catch {
      return null;
    }
    return this.stage;
  },
};

// The output stage every cue plays through, on a live or an offline context:
//   cue → master → 40 Hz high-pass → soft clip → speakers
//   cue → small room → master
function outputStage(context) {
  const master = context.createGain();
  master.gain.value = OUTPUT_GAIN;

  // A subsonic cut, then a soft clip above 0.7 instead of a hard ceiling.
  const subsonic = context.createBiquadFilter();
  subsonic.type = "highpass";
  subsonic.frequency.value = 40;
  subsonic.Q.value = -3;

  // Rolls the top end off gently so bright cues stay round at high volume.
  const round = context.createBiquadFilter();
  round.type = "lowpass";
  round.frequency.value = 7000;
  round.Q.value = 0.5;

  const clip = context.createWaveShaper();
  const curve = new Float32Array(2048);
  for (let index = 0; index < curve.length; index++) {
    const x = (index / (curve.length - 1)) * 2 - 1;
    const over = Math.abs(x) - 0.7;
    curve[index] = over > 0 ? Math.sign(x) * (0.7 + over - (over * over) / 0.6) : x;
  }
  clip.curve = curve;

  master.connect(subsonic).connect(round).connect(clip).connect(context.destination);

  const room = context.createConvolver();
  room.normalize = false;
  room.buffer = roomResponse(context);
  room.connect(master);

  // Two seconds of white noise, shared by every noise layer.
  const noise = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const data = noise.getChannelData(0);
  for (let index = 0; index < data.length; index++) data[index] = Math.random() * 2 - 1;

  return { context, master, room, noise };
}

// Plays a cue on a stage. Returns the time its last layer has rung out.
function voice(stage, recipe, level, pitch) {
  const { context, master, room } = stage;
  const start = context.currentTime + 0.005;
  const nudge = (amount) => 1 + (Math.random() * 2 - 1) * amount;
  const vary = recipe.vary;
  const strikePitch = vary ? nudge(vary.pitch) : 1;
  const strikeForce = vary ? nudge(vary.level) : 1;
  const shift = Number.isFinite(pitch) ? Math.min(4, Math.max(0.25, pitch)) : 1; // The `pitch` param moves notes, not noise

  const bus = context.createGain();
  bus.gain.value = recipe.gain * level;
  bus.connect(master);

  const send = context.createGain();
  send.gain.value = ROOM_SEND * recipe.room;
  bus.connect(send).connect(room);

  let end = start;

  layersOf(recipe).forEach((source) => {
    const layer = { ...source };
    if (vary) {
      // Only the ring varies per layer. The pitch of every layer moves together (strikePitch), so
      // a note and its overtones, and the notes of a run, always stay in tune with each other.
      layer.decay *= nudge(VARIATION_RING);
    }
    const factor = layer.kind === "tone" ? strikePitch * shift : strikePitch * strikeForce; // Louder noise is brighter
    layer.frequency *= factor;
    if (layer.glideTo) layer.glideTo *= factor;
    layer.peak *= strikeForce;

    end = Math.max(end, playLayer(stage, bus, layer, start + layer.offset));
  });

  // The ring is long gone (-60 dB at `decay`, silence a moment later) before the nodes are freed.
  // An offline render keeps its nodes until it is done.
  if (!stage.offline) {
    setTimeout(() => {
      bus.disconnect();
      send.disconnect();
    }, (end + 0.3 - context.currentTime) * 1000);
  }
  return end;
}

// The press layers, then the release layers a moment later.
function layersOf(recipe) {
  return [...recipe.layers, ...recipe.release.map((layer) => ({ ...layer, offset: layer.offset + RELEASE_GAP }))];
}

// One layer: a source, a filter if it is noise, and an envelope that swells in straight and
// rings out exponentially, reaching -60 dB at `decay` (setTargetAtTime with tau = decay / (3 ln 10)).
function playLayer({ context, noise }, destination, layer, at) {
  const { kind, frequency, glideTo, attack, decay, peak } = layer;
  const glideTime = layer.glideTime ?? attack + decay;
  const finish = at + attack + decay + 0.05;
  const amp = context.createGain();

  amp.gain.setValueAtTime(0, at);
  amp.gain.linearRampToValueAtTime(peak, at + attack);
  amp.gain.setTargetAtTime(0, at + attack, decay / (3 * Math.LN10));
  amp.connect(destination);

  if (kind === "tone") {
    const oscillator = context.createOscillator();
    oscillator.frequency.setValueAtTime(frequency, at);
    if (glideTo) oscillator.frequency.exponentialRampToValueAtTime(glideTo, at + glideTime);
    oscillator.connect(amp);
    oscillator.start(at);
    oscillator.stop(finish);
  } else {
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    source.buffer = noise;
    filter.type = kind;
    filter.Q.value = layer.q;
    filter.frequency.setValueAtTime(frequency, at);
    if (glideTo) filter.frequency.exponentialRampToValueAtTime(glideTo, at + glideTime);
    source.connect(filter).connect(amp);
    source.start(at, Math.random() * 1.5); // A different slice each time, so the texture never repeats
    source.stop(finish);
  }

  return finish;
}

// ---- Measuring -----------------------------------------------------------------------------

// Renders a sound offline, with no variation, and returns its peak level in dBFS at full volume,
// with its LEVELS trim applied (or `trim`, in dB). Pass a name or a recipe. The noise differs on
// every render, so it renders five times and returns the middle peak. For setting LEVELS (see
// suggestLevel); nothing calls it while your app plays sounds.
export async function measure(sound, { trim } = {}) {
  const name = typeof sound === "string" ? resolve(sound) : null;
  const recipe = name ? RECIPES[name] : sound;
  const Offline = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!recipe?.layers || !Offline) return null;

  const rate = 48000;
  const length = Math.max(...layersOf(recipe).map((layer) => layer.offset + layer.attack + layer.decay)) + 0.5;
  const level = 10 ** ((Number.isFinite(trim) ? trim : trimOf(name)) / 20);

  const peaks = [];
  for (let run = 0; run < 5; run++) {
    const context = new Offline(2, Math.ceil(rate * length), rate);
    voice({ ...outputStage(context), offline: true }, { ...recipe, vary: null }, level, 1);
    const rendered = await context.startRendering();
    let peak = 0;
    for (let channel = 0; channel < rendered.numberOfChannels; channel++) {
      for (const sample of rendered.getChannelData(channel)) peak = Math.max(peak, Math.abs(sample));
    }
    peaks.push(peak);
  }
  const middle = peaks.sort((a, b) => a - b)[2];
  return middle > 0 ? 20 * Math.log10(middle) : -Infinity;
}

// Measures a sound and returns the trim (rounded to 0.5 dB) that brings it to its target in
// LEVEL_TARGETS: { kind, peak, target, trim }. A suggestion: some sounds sit off target on purpose.
export async function suggestLevel(sound, { trim } = {}) {
  const name = typeof sound === "string" ? resolve(sound) : null;
  const recipe = name ? RECIPES[name] : sound;
  if (!recipe?.layers) return null;

  const current = Number.isFinite(trim) ? trim : trimOf(name);
  const peak = await measure(recipe, { trim: current });
  if (!Number.isFinite(peak)) return null;

  const kind = kindOf(recipe);
  const target = LEVEL_TARGETS[kind];
  return { kind, peak, target, trim: Math.round((current + target - peak) * 2) / 2 };
}

// "note" when a tone rings on (chimes, chords, a bubble), "click" for presses, ticks and whooshes.
function kindOf(recipe) {
  return layersOf(recipe).some((layer) => layer.kind === "tone" && layer.decay >= LONG_RING) ? "note" : "click";
}

// The small room: 8 ms to the first reflection, highs damped above
// 3.5 kHz, four damped feedback delays per ear, gone in about a quarter of a second. Rendered
// once as an impulse response so the browser can convolve with it.
function roomResponse(context) {
  const rate = context.sampleRate;
  const length = Math.round(rate * 0.45);
  const response = context.createBuffer(2, length, rate);

  const damping = 1 - Math.exp((-2 * Math.PI * 3500) / rate); // One-pole low-pass at 3.5 kHz
  const input = new Float32Array(length);
  let smoothed = 0;
  input[0] = 1;
  for (let index = 0; index < length; index++) {
    smoothed += damping * (input[index] - smoothed);
    input[index] = smoothed;
  }

  [[23.1, 29.7, 37.1, 41.1], [24.3, 31.9, 35.3, 43.7]].forEach((delays, channel) => {
    const out = response.getChannelData(channel);
    const pre = Math.round(0.008 * rate);

    delays.forEach((milliseconds) => {
      const size = Math.round((milliseconds / 1000) * rate);
      const feedback = 10 ** ((-3 * (milliseconds / 1000)) / 0.25); // Each pass loses its share of 60 dB in 0.25 s
      const line = new Float32Array(size);
      let position = 0;
      let damp = 0;

      for (let index = 0; index < length; index++) {
        const heard = line[position];
        damp = 0.6 * heard + 0.4 * damp;
        line[position] = (index >= pre ? input[index - pre] : 0) + damp * feedback;
        position = (position + 1) % size;
        out[index] += heard * 0.35;
      }
    });
  });

  return response;
}

// min and max of a native range input, or of the Slider component the input belongs to.
// A toggle button that holds its state in aria-pressed or aria-checked (not a native checkbox).
function isAriaToggle(element) {
  return !(element instanceof HTMLInputElement) && Boolean(element?.matches?.("[aria-pressed], [aria-checked]"));
}

// Whether a switch is on: checked for checkboxes and radios, aria-checked / aria-pressed otherwise.
function isOn(element) {
  if ("checked" in element) return element.checked;
  return (element.getAttribute("aria-checked") ?? element.getAttribute("aria-pressed")) === "true";
}

// Whether a key presses this element the way the browser activates it: Space for checkboxes and
// radios, Enter for links, both for buttons and button-like roles. Never in text fields.
function activatesWith(element, key) {
  if (key !== " " && key !== "Enter") return false;
  if (element instanceof HTMLInputElement) {
    if (element.type === "checkbox" || element.type === "radio") return key === " ";
    return ["button", "submit", "reset", "image"].includes(element.type);
  }
  if (element.isContentEditable || element.matches("textarea, select")) return false;
  if (element instanceof HTMLButtonElement || element.localName === "summary") return true;
  if (element.matches("a[href]")) return key === "Enter";
  return KEY_ROLES.test(element.getAttribute("role") || "");
}

function rangeOf(input) {
  const host = input.closest("[data-slider-max-value]");
  const read = (attribute, fallback, value) =>
    value !== "" && value != null ? Number(value) : Number(host?.dataset[attribute] ?? fallback);
  return { min: read("sliderMinValue", 0, input.min), max: read("sliderMaxValue", 100, input.max) };
}

function clamp(value) {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 1;
}
