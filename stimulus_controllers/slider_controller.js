import { Controller } from "@hotwired/stimulus";

// Slider and range slider.
//
// The controller owns the values, pointer + keyboard input, ARIA and form
// inputs. It never touches layout: it only publishes CSS custom properties
// that your Tailwind classes read, so the same controller drives thin, thick,
// horizontal, vertical and two-thumb sliders.
//
//   --slider-position   on each thumb   where that thumb sits (0% - 100%)
//   --slider-start      on the root     where the filled range starts
//   --slider-end        on the root     where the filled range ends
//   --slider-stretch    on the root     rubber-band amount while over-dragging
//
// Render the first three in your HTML too (style="--slider-position: 40%"),
// so the slider looks right before JavaScript loads.
//
// State attributes for styling:
//
//   data-dragging       on the root     while a pointer is down on the track
//   data-jumping        on the root     for 200ms after a press on the track, so
//                                       the thumb can glide to the pointer
//   data-disabled       on the root     while the slider is disabled
//   data-at-min         on the root     while the first thumb is at min
//   data-at-max         on the root     while the last thumb is at max
//   data-active         on a thumb      while that thumb is pressed
//   data-focus-visible  on a thumb      while it has keyboard focus (browsers
//                                       show :focus-visible after a scripted
//                                       focus, so the controller tracks it)
//   data-active         on a tick       while the tick is inside the range
//   data-overshoot      on the root     "min" or "max" while over-dragging
//
// Optional "field" targets are text inputs bound to one thumb (data-index).
// They show the formatted value, switch to a plain number while focused, and
// commit on Enter or blur. Arrow Up / Down step the value (Shift = large step).
//
// The track gets touch-action and user-select from the controller when your
// classes don't set them, so touch drags never scroll the page.
export default class extends Controller {
  static targets = ["track", "thumb", "input", "output", "tick", "field"];

  static values = {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 },
    largeStep: { type: Number, default: 0 }, // Page Up/Down and Shift + arrows. 0 = 10% of the range
    minDistance: { type: Number, default: 0 }, // Smallest gap between two thumbs
    orientation: { type: String, default: "horizontal" }, // "horizontal" or "vertical"
    disabled: { type: Boolean, default: false },
    rubberBand: { type: Boolean, default: false }, // Stretch the track when dragged past its ends
    format: { type: Object, default: {} }, // Intl.NumberFormat options, e.g. { style: "currency", currency: "USD" }
    labels: { type: Array, default: [] }, // Optional names for each step, e.g. ["Low", "Medium", "High"]
    valueText: { type: String, default: "" }, // Screen reader text, e.g. "{value} decibels"
  };

  initialize() {
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.endDrag = this.endDrag.bind(this);
    this.onKeydown = this.onKeydown.bind(this);
    this.onFormReset = this.onFormReset.bind(this);
    this.onFocusIn = this.onFocusIn.bind(this);
    this.onFocusOut = this.onFocusOut.bind(this);
    this.onFieldFocus = this.onFieldFocus.bind(this);
    this.onFieldKeydown = this.onFieldKeydown.bind(this);
    this.onFieldBlur = this.onFieldBlur.bind(this);
    this.scheduleSync = this.scheduleSync.bind(this);
  }

  connect() {
    this.root = this.hasTrackTarget ? this.trackTarget : this.element;
    this.drag = null;

    // The starting value of each thumb comes from its input, or from
    // aria-valuenow when there is no input.
    this.current = this.readValues();
    this.initial = this.readInitial();

    this.root.addEventListener("pointerdown", this.onPointerDown);
    this.element.addEventListener("keydown", this.onKeydown);
    this.element.addEventListener("focusin", this.onFocusIn);
    this.element.addEventListener("focusout", this.onFocusOut);
    // A Turbo morph refresh keeps this element (so connect() does not run
    // again) but resets its attributes and inputs to the server's HTML.
    this.element.addEventListener("turbo:morph-element", this.scheduleSync);
    this.form = this.element.closest("form") || this.inputTargets[0]?.form || null;
    this.form?.addEventListener("reset", this.onFormReset);

    this.connected = true;
    this.applyInteractionStyles();
    this.render();
  }

  disconnect() {
    this.connected = false;
    this.endDrag();
    clearTimeout(this.jumpTimer);
    this.element.removeAttribute("data-jumping");
    this.root.removeEventListener("pointerdown", this.onPointerDown);
    this.element.removeEventListener("keydown", this.onKeydown);
    this.element.removeEventListener("focusin", this.onFocusIn);
    this.element.removeEventListener("focusout", this.onFocusOut);
    this.element.removeEventListener("turbo:morph-element", this.scheduleSync);
    this.form?.removeEventListener("reset", this.onFormReset);
  }

  // ---- Changes after connect ----------------------------------------------

  // Value attributes can change at any time (by script or a morph). Stimulus
  // also calls these before connect, which the `connected` guard skips.
  minValueChanged() {
    this.refresh();
  }

  maxValueChanged() {
    this.refresh();
  }

  stepValueChanged() {
    this.refresh();
  }

  minDistanceValueChanged() {
    this.refresh();
  }

  labelsValueChanged() {
    this.refresh();
  }

  valueTextValueChanged() {
    this.refresh();
  }

  orientationValueChanged() {
    if (!this.connected) return;
    this.applyInteractionStyles();
    this.render();
  }

  disabledValueChanged() {
    if (!this.connected) return;
    if (this.disabledValue) this.endDrag();
    this.render();
  }

  formatValueChanged() {
    this.formatter = null;
    this.refresh();
  }

  // Thumbs and inputs added or removed later (a morph, a template) re-read
  // the values from the markup.
  thumbTargetConnected() {
    this.scheduleSync();
  }

  thumbTargetDisconnected() {
    this.scheduleSync();
  }

  inputTargetConnected() {
    this.scheduleSync();
  }

  inputTargetDisconnected() {
    this.scheduleSync();
  }

  fieldTargetConnected(field) {
    field.addEventListener("focus", this.onFieldFocus);
    field.addEventListener("keydown", this.onFieldKeydown);
    field.addEventListener("blur", this.onFieldBlur);
    if (this.connected) this.render();
  }

  fieldTargetDisconnected(field) {
    field.removeEventListener("focus", this.onFieldFocus);
    field.removeEventListener("keydown", this.onFieldKeydown);
    field.removeEventListener("blur", this.onFieldBlur);
  }

  // Keeps the current values (clamped and snapped to the new settings).
  refresh() {
    this.editFormatter = null; // The step sets how many decimals a field shows
    if (!this.connected) return;
    this.current = this.normalize(this.current);
    this.render();
  }

  // Many morph events and target callbacks arrive together: sync once.
  scheduleSync() {
    if (!this.connected || this.syncQueued) return;
    this.syncQueued = true;
    queueMicrotask(() => {
      this.syncQueued = false;
      if (this.connected) this.sync();
    });
  }

  // Re-reads the values from the inputs (the server's values after a morph).
  // Mid-drag, the person dragging wins and only the styles are restored.
  sync() {
    if (!this.drag) this.current = this.readValues();
    this.initial = this.readInitial();
    this.applyInteractionStyles();
    this.render();
  }

  // ---- Actions ------------------------------------------------------------

  // data-action="click->slider#focus" on a visible label focuses the thumb.
  focus() {
    if (!this.disabledValue && this.thumbTargets.length) this.focusThumb(0);
  }

  // data-action="click->slider#increment" / "click->slider#decrement"
  // Optional params: data-slider-index-param="1", data-slider-amount-param="10"
  increment(event) {
    this.nudge(event, 1);
  }

  decrement(event) {
    this.nudge(event, -1);
  }

  // data-action="click->slider#toggle" sets the value to min (mute), and a
  // second click brings back the value from before (or the middle of the range).
  // The button gets aria-pressed="true" while the value is at min.
  toggle(event) {
    if (this.disabledValue) return;
    const index = this.indexParam(event);
    const value = this.current[index];
    let next;

    if (value > this.minValue) {
      this.restoreValues ||= {};
      this.restoreValues[index] = value;
      next = this.minValue;
    } else {
      next = this.restoreValues?.[index] ?? (this.minValue + this.maxValue) / 2;
    }
    if (this.setValue(index, next)) this.commit(index);
  }

  // data-action="click->slider#set" data-slider-value-param="50"
  set(event) {
    if (this.disabledValue) return;
    const index = this.indexParam(event);
    if (this.setValue(index, Number(event.params.value))) this.commit(index);
  }

  // ---- Pointer ------------------------------------------------------------

  onPointerDown(event) {
    if (this.disabledValue || this.drag || event.button !== 0 || !this.thumbTargets.length) return;

    const fraction = this.fractionAt(event);
    const grabbed = this.thumbTargets.find((thumb) => thumb.contains(event.target));
    const index = grabbed ? this.thumbTargets.indexOf(grabbed) : this.nearestThumb(this.valueAt(fraction));

    // Stops text selection and keeps focus management in our hands.
    event.preventDefault();

    this.drag = {
      pointerId: event.pointerId,
      index,
      // Grabbing a thumb off-centre should not make it jump under the pointer.
      offset: grabbed ? fraction - this.fractionOf(this.current[index]) : 0,
      startValues: [...this.current],
    };

    try {
      this.root.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic events have no active pointer to capture. Dragging still works.
    }
    // Listen on window, not the slider: if capture is lost, a release outside
    // the slider (or outside the browser) must still end the drag.
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointercancel", this.onPointerUp);
    window.addEventListener("blur", this.endDrag);
    this.root.addEventListener("lostpointercapture", this.endDrag);

    this.activate(index);

    this.element.setAttribute("data-dragging", "");
    // Pointer capture makes the browser use the root's cursor, not the thumb's,
    // so pin the grabbing cursor on the page for the length of the drag.
    this.drag.cursor = document.documentElement.style.cursor;
    document.documentElement.style.cursor = "grabbing";
    // The capturing track usually sets its own cursor, which beats the inherited one.
    this.drag.rootCursor = this.root.style.cursor;
    this.root.style.cursor = "grabbing";

    if (!grabbed) {
      // A press on the track glides the nearest thumb to the pointer. Position
      // transitions only exist while data-jumping is set, so dragging tracks
      // the pointer 1:1 and keyboard steps land instantly.
      if (!this.reducedMotion) {
        this.element.setAttribute("data-jumping", "");
        clearTimeout(this.jumpTimer);
        this.jumpTimer = setTimeout(() => this.element.removeAttribute("data-jumping"), 200);
      }
      this.setValue(index, this.valueAt(fraction));
    }
  }

  onPointerMove(event) {
    if (!this.drag || event.pointerId !== this.drag.pointerId) return;

    // The button was released somewhere we never heard about (another window,
    // the desktop, browser chrome). Stop instead of dragging with no button held.
    if (event.pointerType === "mouse" && event.buttons === 0) {
      this.endDrag();
      return;
    }

    const fraction = this.fractionAt(event) - this.drag.offset;
    const target = this.valueAt(fraction);

    // When two thumbs sit on the same value, hand the drag to whichever one
    // can actually travel in the direction of the pointer.
    let index = this.drag.index;
    const value = this.current[index];
    while (target < value && index > 0 && this.current[index - 1] === value) index--;
    while (target > value && index < this.current.length - 1 && this.current[index + 1] === value) index++;
    if (index !== this.drag.index) this.activate(index);

    this.setValue(index, target);
    if (this.rubberBandValue) this.stretch(fraction);
  }

  onPointerUp(event) {
    if (!this.drag || event.pointerId !== this.drag.pointerId) return;
    this.endDrag();
  }

  endDrag() {
    if (!this.drag) return;

    const { pointerId, index, startValues, cursor, rootCursor } = this.drag;
    this.drag = null;
    document.documentElement.style.cursor = cursor ?? "";
    this.root.style.cursor = rootCursor ?? "";

    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerUp);
    window.removeEventListener("blur", this.endDrag);
    this.root.removeEventListener("lostpointercapture", this.endDrag);
    if (this.root.hasPointerCapture?.(pointerId)) this.root.releasePointerCapture(pointerId);

    this.element.removeAttribute("data-dragging");
    this.thumbTargets.forEach((thumb) => thumb.removeAttribute("data-active"));
    // data-overshoot stays so the spring back keeps its transform origin.
    this.element.style.setProperty("--slider-stretch", "0");

    if (startValues.some((value, i) => value !== this.current[i])) this.commit(index);
  }

  // Escape during a drag puts every thumb back where the drag started.
  cancelDrag() {
    const { startValues } = this.drag;
    const changed = startValues.map((_, i) => i).filter((i) => startValues[i] !== this.current[i]);

    this.current = [...startValues];
    this.render();
    changed.forEach((i) => this.announceInput(i));
    this.endDrag(); // Nothing changed since the drag started, so no change event
  }

  activate(index) {
    if (this.drag) this.drag.index = index;
    this.thumbTargets.forEach((thumb, i) => thumb.toggleAttribute("data-active", i === index));
    this.focusThumb(index);
  }

  // Focus that comes from a pointer should not draw the keyboard focus ring.
  focusThumb(index) {
    const thumb = this.thumbTargets[index];
    this.pointerFocus = true;
    thumb.focus({ preventScroll: true });
    this.pointerFocus = false;
    thumb.removeAttribute("data-focus-visible");
  }

  onFocusIn(event) {
    if (this.thumbTargets.includes(event.target)) {
      event.target.toggleAttribute("data-focus-visible", !this.pointerFocus);
    }
  }

  onFocusOut(event) {
    if (this.thumbTargets.includes(event.target)) event.target.removeAttribute("data-focus-visible");
  }

  // Rubber band: the further past the end you pull, the less the track gives.
  stretch(fraction) {
    const over = fraction < 0 ? fraction : fraction > 1 ? fraction - 1 : 0;
    if (over === 0 || this.reducedMotion) {
      this.element.style.setProperty("--slider-stretch", "0");
      return;
    }

    const rail = this.rail();
    const pixels = Math.abs(over) * (this.vertical ? rail.height : rail.width);
    const amount = 0.08 * (1 - 1 / (pixels / 110 + 1));

    this.element.dataset.overshoot = over < 0 ? "min" : "max";
    this.element.style.setProperty("--slider-stretch", amount.toFixed(4));
  }

  // ---- Keyboard -----------------------------------------------------------

  onKeydown(event) {
    if (event.key === "Escape" && this.drag) {
      event.preventDefault();
      this.cancelDrag();
      return;
    }
    if (this.disabledValue || event.altKey || event.ctrlKey || event.metaKey) return;

    const index = this.thumbTargets.findIndex((thumb) => thumb === event.target);
    if (index === -1) return;

    const value = this.current[index];
    const step = event.shiftKey ? this.bigStep : this.stepValue;
    const forward = this.rtl && !this.vertical ? -1 : 1;
    let next;

    switch (event.key) {
      case "ArrowRight":
        next = value + step * forward;
        break;
      case "ArrowLeft":
        next = value - step * forward;
        break;
      case "ArrowUp":
        next = value + step;
        break;
      case "ArrowDown":
        next = value - step;
        break;
      case "PageUp":
        next = value + this.bigStep;
        break;
      case "PageDown":
        next = value - this.bigStep;
        break;
      case "Home":
        next = this.minValue;
        break;
      case "End":
        next = this.maxValue;
        break;
      default:
        return;
    }

    event.preventDefault();
    event.target.setAttribute("data-focus-visible", "");
    if (this.setValue(index, next)) this.commit(index);
  }

  // ---- Fields -------------------------------------------------------------

  onFieldFocus(event) {
    const field = event.target;
    field.value = this.editText(this.current[this.fieldIndex(field)]);
    field.select();
  }

  onFieldKeydown(event) {
    const field = event.target;
    const index = this.fieldIndex(field);

    switch (event.key) {
      case "ArrowUp":
      case "ArrowDown": {
        event.preventDefault();
        this.commitField(field);
        const direction = event.key === "ArrowUp" ? 1 : -1;
        // Same steps as the thumb: Shift moves by the large step.
        const step = event.shiftKey ? this.bigStep : this.stepValue;
        if (this.setValue(index, this.current[index] + direction * step)) this.commit(index);
        field.value = this.editText(this.current[index]);
        field.select();
        break;
      }
      case "Enter":
        event.preventDefault();
        this.commitField(field);
        field.value = this.editText(this.current[index]);
        field.select();
        break;
      case "Escape":
        event.preventDefault();
        field.value = this.editText(this.current[index]); // Throw away the typed text
        field.blur();
        break;
    }
  }

  onFieldBlur(event) {
    this.commitField(event.target);
    this.render();
  }

  // Typed text moves the thumb: clamped, snapped and kept apart from the other
  // thumb by setValue. Text that is not a number changes nothing.
  commitField(field) {
    const index = this.fieldIndex(field);
    const typed = this.parseNumber(field.value);
    if (Number.isFinite(typed) && this.setValue(index, typed)) this.commit(index);
  }

  fieldIndex(field) {
    const index = Number(field.dataset.index);
    return Number.isInteger(index) ? index : 0;
  }

  // Reads a number typed in the page's locale: "1,200.5" in English and
  // "1.200,5" in German. Accepts the minus sign (−) and Arabic-Indic digits.
  parseNumber(text) {
    const { decimal, group } = this.separators;
    let cleaned = String(text)
      .trim()
      .replace(/[٠-٩]/g, (digit) => digit.charCodeAt(0) - 0x0660)
      .replace(/[۰-۹]/g, (digit) => digit.charCodeAt(0) - 0x06f0)
      .replace(/[−–]/g, "-")
      .replace(/\s/g, "");
    if (group) cleaned = cleaned.split(group).join("");
    if (decimal !== ".") cleaned = cleaned.split(decimal).join(".");
    return Number.parseFloat(cleaned.replace(/[^\d.-]/g, ""));
  }

  onFormReset() {
    this.endDrag();
    this.current = this.normalize(this.initial);
    this.render();
  }

  // ---- Values -------------------------------------------------------------

  readValues() {
    return this.normalize(
      this.thumbTargets.map((thumb, index) => {
        const raw = this.inputTargets[index]?.value ?? thumb.getAttribute("aria-valuenow");
        return raw === null || raw === "" ? this.minValue : Number(raw);
      }),
    );
  }

  // Values for form reset. Setting a hidden input's value rewrites its value
  // attribute, and Turbo caches the page with it, so the starting values are
  // kept in data-slider-initial. A morph removes that attribute, and the
  // server's new values become the starting values.
  readInitial() {
    try {
      const saved = JSON.parse(this.element.getAttribute("data-slider-initial"));
      if (Array.isArray(saved) && saved.length === this.current.length && saved.every(Number.isFinite)) return saved;
    } catch {
      // Missing or edited by hand: start over from the current values.
    }
    this.element.setAttribute("data-slider-initial", JSON.stringify(this.current));
    return [...this.current];
  }

  normalize(values) {
    return values
      .map((value) => (Number.isFinite(value) ? value : this.minValue))
      .map((value) => this.clamp(this.snap(value), this.minValue, this.maxValue))
      .sort((a, b) => a - b);
  }

  // Snaps to the step, keeps the thumb between its neighbours, and re-renders.
  // Returns true when the value actually changed.
  setValue(index, value) {
    if (!Number.isFinite(value) || index < 0 || index >= this.current.length) return false;

    const low = index > 0 ? this.current[index - 1] + this.minDistanceValue : this.minValue;
    const high = index < this.current.length - 1 ? this.current[index + 1] - this.minDistanceValue : this.maxValue;
    const next = this.clamp(this.snap(value), low, high);

    if (next === this.current[index]) return false;

    this.current[index] = next;
    this.render();
    this.announceInput(index);
    return true;
  }

  // "slider:input" fires continuously, like the native input event.
  announceInput(index) {
    this.inputTargets[index]?.dispatchEvent(new Event("input", { bubbles: true }));
    this.dispatch("input", { detail: this.detail(index) });
  }

  // "slider:change" fires once a drag ends or a key changes the value.
  commit(index) {
    this.inputTargets[index]?.dispatchEvent(new Event("change", { bubbles: true }));
    this.dispatch("change", { detail: this.detail(index) });
  }

  nudge(event, direction) {
    if (this.disabledValue) return;
    const index = this.indexParam(event);
    const amount = Number(event.params.amount) || this.stepValue;
    if (this.setValue(index, this.current[index] + amount * direction)) this.commit(index);
  }

  indexParam(event) {
    const index = Number(event.params.index);
    return Number.isInteger(index) ? index : this.current.length - 1;
  }

  detail(index) {
    return { index, value: this.current[index], values: [...this.current] };
  }

  // ---- Rendering ----------------------------------------------------------

  // Touch drags must not scroll the page, and a long press must not select
  // text or open the iOS callout. Your own touch-action classes win.
  applyInteractionStyles() {
    const style = this.root.style;
    if (this.ownsTouchAction) style.touchAction = "";
    this.ownsTouchAction = getComputedStyle(this.root).touchAction === "auto";
    if (this.ownsTouchAction) style.touchAction = this.vertical ? "pan-x" : "pan-y";

    // Safari will not let you type into inputs inside user-select: none.
    if (!this.fieldTargets.some((field) => this.root.contains(field))) {
      style.setProperty("user-select", "none");
      style.setProperty("-webkit-user-select", "none");
      style.setProperty("-webkit-touch-callout", "none");
    }
  }

  render() {
    const last = this.current.length - 1;

    this.thumbTargets.forEach((thumb, index) => {
      const value = this.current[index];

      thumb.style.setProperty("--slider-position", `${this.fractionOf(value) * 100}%`);
      thumb.setAttribute("role", "slider");
      thumb.setAttribute("tabindex", this.disabledValue ? "-1" : "0");
      thumb.setAttribute("aria-orientation", this.vertical ? "vertical" : "horizontal");
      // Each thumb of a range is bounded by its neighbour.
      thumb.setAttribute("aria-valuemin", index > 0 ? this.current[index - 1] + this.minDistanceValue : this.minValue);
      thumb.setAttribute("aria-valuemax", index < last ? this.current[index + 1] - this.minDistanceValue : this.maxValue);
      thumb.setAttribute("aria-valuenow", value);
      thumb.setAttribute("aria-valuetext", this.valueText(value));
      if (this.disabledValue) thumb.setAttribute("aria-disabled", "true");
      else thumb.removeAttribute("aria-disabled");

      const input = this.inputTargets[index];
      if (input) {
        input.value = value;
        input.disabled = this.disabledValue;
      }
    });

    // One thumb fills from the start. Two thumbs fill the gap between them.
    const start = last > 0 ? this.fractionOf(this.current[0]) : 0;
    const end = last >= 0 ? this.fractionOf(this.current[last]) : 0;
    this.element.style.setProperty("--slider-start", `${start * 100}%`);
    this.element.style.setProperty("--slider-end", `${end * 100}%`);

    this.element.toggleAttribute("data-disabled", this.disabledValue);
    this.element.toggleAttribute("data-at-min", last >= 0 && this.current[0] <= this.minValue);
    this.element.toggleAttribute("data-at-max", last >= 0 && this.current[last] >= this.maxValue);

    // Outputs show one thumb's value when they live inside that thumb (a
    // tooltip) or carry data-index, and the whole range otherwise.
    this.outputTargets.forEach((output) => {
      const thumbIndex = this.thumbTargets.findIndex((thumb) => thumb.contains(output));
      const index = thumbIndex !== -1 ? thumbIndex : output.dataset.index;
      const text =
        index === undefined
          ? this.current.map((value) => this.format(value)).join(" – ")
          : this.format(this.current[Number(index)]);
      if (output.textContent !== text) output.textContent = text;
    });

    // Fields show the formatted value, except the one being edited.
    this.fieldTargets.forEach((field) => {
      const index = this.fieldIndex(field);
      field.disabled = this.disabledValue;
      if (document.activeElement === field) {
        if (this.parseNumber(field.value) !== this.current[index]) field.value = this.editText(this.current[index]);
      } else {
        field.value = this.format(this.current[index]);
      }
    });

    const from = last > 0 ? this.current[0] : this.minValue;
    const to = last >= 0 ? this.current[last] : this.minValue;
    this.tickTargets.forEach((tick) => {
      const value = Number(tick.dataset.value);
      tick.toggleAttribute("data-active", value >= from && value <= to);
    });

    // Mute buttons report whether they are pressed (the value is at min).
    this.element.querySelectorAll("[data-action]").forEach((button) => {
      if (!/(^|[\s>])slider#toggle\b/.test(button.getAttribute("data-action"))) return;
      const param = Number.parseInt(button.getAttribute("data-slider-index-param"), 10);
      const value = this.current[Number.isInteger(param) ? param : last];
      if (value !== undefined) button.setAttribute("aria-pressed", String(value <= this.minValue));
    });
  }

  format(value) {
    if (this.labelsValue.length) {
      const label = this.labelsValue[Math.round((value - this.minValue) / this.stepValue)];
      if (label !== undefined) return String(label);
    }

    if (!this.formatter) {
      try {
        this.formatter = new Intl.NumberFormat(this.locale, this.formatValue);
      } catch {
        this.formatter = new Intl.NumberFormat(this.locale);
      }
    }
    return this.formatter.format(value);
  }

  // aria-valuetext: the formatted value, or the valueText template with
  // {value} replaced, e.g. "{value} decibels".
  valueText(value) {
    const text = this.format(value);
    return this.valueTextValue ? this.valueTextValue.replaceAll("{value}", text) : text;
  }

  // The number shown while a field is focused: no grouping, local decimals.
  editText(value) {
    this.editFormatter ||= new Intl.NumberFormat(this.locale, {
      useGrouping: false,
      maximumFractionDigits: Math.min(this.precision, 20),
    });
    return this.editFormatter.format(value);
  }

  get separators() {
    if (!this.cachedSeparators) {
      const parts = new Intl.NumberFormat(this.locale).formatToParts(12345.6);
      this.cachedSeparators = {
        decimal: parts.find((part) => part.type === "decimal")?.value ?? ".",
        group: parts.find((part) => part.type === "group")?.value.replace(/\s/g, "") ?? "",
      };
    }
    return this.cachedSeparators;
  }

  get locale() {
    return document.documentElement.lang || undefined;
  }

  // ---- Geometry -----------------------------------------------------------

  // The thumb travels inside the track's padding box, so padding on the track
  // (half a thumb wide) keeps the thumb from overhanging the ends.
  rail() {
    const rect = this.root.getBoundingClientRect();
    const style = getComputedStyle(this.root);
    const left = parseFloat(style.paddingLeft) || 0;
    const right = parseFloat(style.paddingRight) || 0;
    const top = parseFloat(style.paddingTop) || 0;
    const bottom = parseFloat(style.paddingBottom) || 0;

    return {
      left: rect.left + left,
      top: rect.top + top,
      width: Math.max(rect.width - left - right, 1),
      height: Math.max(rect.height - top - bottom, 1),
    };
  }

  // Pointer position as a 0-1 fraction of the rail. Not clamped, so the
  // rubber band knows how far past the end the pointer is.
  fractionAt(event) {
    const rail = this.rail();
    if (this.vertical) return 1 - (event.clientY - rail.top) / rail.height;

    const fraction = (event.clientX - rail.left) / rail.width;
    return this.rtl ? 1 - fraction : fraction;
  }

  fractionOf(value) {
    const span = this.maxValue - this.minValue;
    return span > 0 ? (value - this.minValue) / span : 0;
  }

  valueAt(fraction) {
    return this.minValue + this.clamp(fraction, 0, 1) * (this.maxValue - this.minValue);
  }

  nearestThumb(value) {
    let nearest = 0;
    this.current.forEach((current, index) => {
      const distance = Math.abs(current - value);
      const best = Math.abs(this.current[nearest] - value);
      // On a tie, prefer the thumb that can move towards the pointer.
      if (distance < best || (distance === best && value > current)) nearest = index;
    });
    return nearest;
  }

  snap(value) {
    const step = this.stepValue > 0 ? this.stepValue : 1;
    const snapped = this.minValue + Math.round((value - this.minValue) / step) * step;
    // Trim floating point noise (0.1 + 0.2) to the precision of the step.
    return Number(Math.min(snapped, this.maxValue).toFixed(this.precision));
  }

  clamp(value, low, high) {
    return Math.min(Math.max(value, low), Math.max(low, high));
  }

  get precision() {
    const decimals = (number) => (String(number).split(".")[1] || "").length;
    return Math.max(decimals(this.stepValue), decimals(this.minValue));
  }

  get bigStep() {
    const step = this.stepValue > 0 ? this.stepValue : 1;
    const large = this.largeStepValue || (this.maxValue - this.minValue) / 10;
    return Math.max(step, Math.round(large / step) * step);
  }

  get vertical() {
    return this.orientationValue === "vertical";
  }

  get rtl() {
    return getComputedStyle(this.root).direction === "rtl";
  }

  get reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
}
