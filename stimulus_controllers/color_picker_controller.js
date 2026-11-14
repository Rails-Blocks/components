import { Controller } from "@hotwired/stimulus";
import { computePosition, autoUpdate, offset, flip, shift, hide } from "@floating-ui/dom";

// Color Picker Controller
//
// A dependency-light color picker built with Tailwind CSS + Stimulus.
// The picker works in Okhsv (Björn Ottosson's perceptual take on HSV), so hue and
// lightness behave evenly: yellow is not brighter than blue at the same slider
// position, and the whole saturation/brightness grid stays inside the sRGB gamut.
// Features: a 2D color area (saturation/brightness, hue/saturation, hue/brightness or a
// wheel), hue/saturation/brightness/opacity sliders in any combination, text input that
// accepts any CSS color (including oklch), hex/rgb/hsl/hsv/oklch output with a format toggle, swatches,
// EyeDropper support, copy-to-clipboard preview, keyboard + pointer control,
// inline or dropdown mode, and form integration via a hidden input.
//
// The dropdown panel uses the native Popover API (top layer, never clipped by
// overflow) and is anchored with Floating UI using the "absolute" strategy, so
// it scrolls natively with the page instead of chasing the trigger on scroll.
// Below the `sheetBelow` width (phones) it opens as a bottom sheet over a backdrop
// instead, so it never overflows the screen and sits above the on-screen keyboard.
//
// On iPhone and iPad (`native: "auto"`) the trigger opens the system color picker
// through a hidden <input type="color"> instead of the custom panel. The value is
// still converted to the configured format, so events and the hidden input are the same.
//
// Events (bubble from the controller element):
//   color-picker:input  -> fired continuously while dragging/typing
//   color-picker:change -> fired when a color is committed
//   detail: { color, format, rgba: { r, g, b, a }, hsva: { h, s, v, a }, okhsva: { h, s, v, a } }

const FORMATS = ["hex", "rgb", "hsl", "hsv", "oklch"];
const EXIT_DURATION = 150;
// Must match the sheet's exit transition (data-sheet:duration-250), or it is cut short.
const SHEET_EXIT_DURATION = 250;
const GRID_W = 96;
const GRID_H = 64;
const WHEEL_SIZE = 128;

// The 2D area: which Okhsv channel runs along x and y, and which one the area is painted for.
// "wheel" maps hue to the angle and saturation to the distance from the center.
const AREAS = {
  sv: { x: "s", y: "v", fixed: "h", label: "Saturation and brightness" },
  hs: { x: "h", y: "s", fixed: "v", label: "Hue and saturation" },
  hv: { x: "h", y: "v", fixed: "s", label: "Hue and brightness" },
  wheel: { x: "h", y: "s", fixed: "v", label: "Hue and saturation", polar: true },
};
const RANGE = { h: 360, s: 100, v: 100, a: 1 };
const CHANNEL_NAMES = { h: "Hue", s: "Saturation", v: "Brightness", a: "Opacity" };

// One-dimensional sliders. Any combination can be rendered; each is optional.
const SLIDERS = { hue: "h", saturation: "s", brightness: "v", alpha: "a" };
// Holding Alt/Option while dragging zooms the track to a fifth of the range (the handle stays
// under the cursor); with the arrow keys it makes steps a tenth the size.
const FINE = 0.1;
const FINE_DRAG = 0.2;

export default class extends Controller {
  static targets = [
    "trigger",
    "triggerSwatch",
    "panel",
    "grid",
    "gridThumb",
    "gridHandle",
    "hue",
    "hueThumb",
    "hueHandle",
    "saturation",
    "saturationThumb",
    "saturationHandle",
    "brightness",
    "brightnessThumb",
    "brightnessHandle",
    "alpha",
    "alphaThumb",
    "alphaHandle",
    "alphaGradient",
    "preview",
    "previewSwatch",
    "textField",
    "formatButton",
    "eyeDropper",
    "swatch",
    "input",
    "value",
    "sheetHandle",
  ];

  static values = {
    value: { type: String, default: "#3b82f6" },
    format: { type: String, default: "hex" },
    opacity: { type: Boolean, default: false },
    uppercase: { type: Boolean, default: false },
    inline: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    placement: { type: String, default: "bottom-start" },
    area: { type: String, default: "sv" },
    sheetBelow: { type: Number, default: 640 },
    native: { type: String, default: "auto" },
  };

  connect() {
    this.okhsva = parseColor(this.valueValue) || rgbaToOkhsva({ r: 59, g: 130, b: 246, a: 1 });
    if (!this.opacityValue) this.okhsva.a = 1;
    if (!FORMATS.includes(this.formatValue)) this.formatValue = "hex";
    this.area = AREAS[this.areaValue] || AREAS.sv;
    this.trackKeys = new Map();

    this.isOpen = false;
    this.lastCommitted = this.formattedColor();
    this.boundOutsideClick = this.handleOutsideClick.bind(this);
    this.boundPlaceSheet = this.placeSheet.bind(this);
    this.supportsPopover = this.hasPanelTarget && typeof this.panelTarget.showPopover === "function";

    if (!this.inlineValue && this.hasPanelTarget && !this.supportsPopover) {
      this.panelTarget.hidden = true;
    }

    if (this.hasEyeDropperTarget && !("EyeDropper" in window)) {
      this.eyeDropperTarget.hidden = true;
    }

    if (this.useNativePicker()) this.setupNative();

    this.setupCanvas();
    this.render();
    // The hidden input submits the formatted color even if the user never touches the picker
    // (value="rgb(...)" with format "hex" would otherwise submit the raw string).
    if (this.hasInputTarget) this.inputTarget.value = this.lastCommitted;

    // Tabbing out of an open dropdown closes it, like a native select.
    this.boundFocusOut = this.handleFocusOut.bind(this);
    this.element.addEventListener("focusout", this.boundFocusOut);
    // Form reset brings back the color the page was rendered with.
    this.initialColor ??= this.valueValue;
    this.form = this.element.closest("form");
    this.boundReset = () => setTimeout(() => this.syncColor(this.initialColor));
    this.form?.addEventListener("reset", this.boundReset);

    this.connected = true;
    this.disabledValueChanged();
    this.element.dataset.ready = "";
  }

  disconnect() {
    this.connected = false;
    this.close({ restoreFocus: false, immediate: true });
    this.stopDrag?.();
    clearTimeout(this.copyTimeout);
    this.teardownNative?.();
    this.element.removeEventListener("focusout", this.boundFocusOut);
    this.form?.removeEventListener("reset", this.boundReset);
    // Moving the element in the DOM reconnects it; the canvas is rebuilt then.
    this.gridCanvas?.remove();
    this.gridCanvas = null;
  }

  // The value attribute follows every commit (so Turbo's cached snapshot restores the picked
  // color), and changing it from outside, e.g. element.dataset.colorPickerValueValue = "red",
  // updates the picker without firing change events.
  valueValueChanged(value) {
    if (!this.connected || value === this.lastCommitted) return;
    this.syncColor(value);
  }

  disabledValueChanged() {
    if (!this.connected) return;
    const disabled = this.disabledValue;
    this.element.toggleAttribute("data-disabled", disabled);
    if (disabled) this.close({ restoreFocus: false });
    for (const name of ["grid", "hue", "saturation", "brightness", "alpha"]) {
      for (const handle of this.targets.findAll(`${name}Handle`)) {
        handle.tabIndex = disabled ? -1 : 0;
        handle.toggleAttribute("aria-disabled", disabled);
      }
    }
    for (const control of [this.triggerTargets, this.swatchTargets, this.textFieldTargets, this.formatButtonTargets, this.eyeDropperTargets, this.previewTargets, this.inputTargets].flat()) {
      control.disabled = disabled;
    }
    if (this.nativeInput) this.nativeInput.disabled = disabled;
  }

  // Shows a color without firing events: attribute changes and form reset.
  syncColor(value) {
    const parsed = parseColor(value);
    if (!parsed) return;
    this.setHsva(parsed);
    this.render();
    this.lastCommitted = this.formattedColor();
    this.valueValue = this.lastCommitted;
    if (this.hasInputTarget) this.inputTarget.value = this.lastCommitted;
  }

  handleFocusOut(event) {
    const next = event.relatedTarget;
    // No relatedTarget means focus went to nothing focusable (a click on the panel's background,
    // the browser UI): keep the panel open. Outside clicks are handled by handleOutsideClick.
    if (!this.isOpen || !next || this.element.contains(next)) return;
    this.close({ restoreFocus: false });
  }

  // ---------------------------------------------------------------------------
  // Native picker (iOS)
  // ---------------------------------------------------------------------------

  // "auto" picks the system picker on iPhone/iPad, where it is excellent (grid, spectrum,
  // sliders, eyedropper, saved colors). Pickers without an area (hue-only, sliders-only) are
  // deliberate constraints the system picker can't express, so they keep the custom panel, as
  // do opacity pickers on iOS versions whose picker has no opacity slider (before 18.4).
  useNativePicker() {
    if (this.inlineValue || !this.hasTriggerTarget || this.nativeValue === "false") return false;

    const probe = document.createElement("input");
    probe.type = "color";
    if (probe.type !== "color") return false;
    if (this.opacityValue && !("alpha" in probe)) return false;
    if (this.nativeValue === "true") return true;

    // iPadOS reports itself as a Mac, so a touch-capable "Mac" is an iPad.
    const ua = navigator.userAgent;
    const ios = !/Android/i.test(ua) && (/iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
    return ios && this.hasGridTarget;
  }

  // An invisible color input laid exactly over the trigger, so the tap opens the system
  // picker anchored to the trigger. The trigger stays as the visual.
  setupNative() {
    // Turbo's page cache snapshots the page with this input in it; drop that dead copy.
    this.element.querySelectorAll("input[data-color-picker-native]").forEach((stale) => stale.remove());
    const input = document.createElement("input");
    input.dataset.colorPickerNative = "";
    input.type = "color";
    if (this.opacityValue) input.setAttribute("alpha", "");
    input.className = "absolute m-0 cursor-pointer appearance-none border-0 p-0 opacity-0 disabled:cursor-default";
    input.setAttribute("aria-label", this.triggerTarget.getAttribute("aria-label") || "Color");
    input.disabled = this.disabledValue;
    this.triggerTarget.tabIndex = -1;
    this.triggerTarget.setAttribute("aria-hidden", "true");
    this.triggerTarget.after(input);
    this.nativeInput = input;

    const place = () => {
      const t = this.triggerTarget;
      Object.assign(input.style, { left: `${t.offsetLeft}px`, top: `${t.offsetTop}px`, width: `${t.offsetWidth}px`, height: `${t.offsetHeight}px` });
    };
    place();
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(place) : null;
    observer?.observe(this.element);

    const onInput = () => {
      const parsed = parseColor(input.value);
      if (!parsed) return;
      this.setHsva(parsed);
      this.render({ skipNative: true });
      this.dispatch("input", { detail: this.eventDetail() });
    };
    const onChange = () => {
      onInput();
      this.commit();
    };
    input.addEventListener("input", onInput);
    input.addEventListener("change", onChange);

    this.teardownNative = () => {
      observer?.disconnect();
      input.remove();
      this.triggerTarget.removeAttribute("tabindex");
      this.triggerTarget.removeAttribute("aria-hidden");
      this.nativeInput = null;
    };
  }

  // The system picker takes #rrggbb, or CSS color() when it handles opacity.
  nativeColorValue() {
    const { r, g, b, a } = okhsvaToRgba(this.okhsva);
    if (!this.opacityValue) return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    return `color(srgb ${round(r / 255, 4)} ${round(g / 255, 4)} ${round(b / 255, 4)} / ${round(a, 3)})`;
  }

  // No area is a linear gradient in Okhsv, so it is painted to a small canvas (re-painted only
  // when the channel it depends on changes) and stretched over the track.
  setupCanvas() {
    if (!this.hasGridTarget) return;
    const size = this.area.polar ? [WHEEL_SIZE, WHEEL_SIZE] : [GRID_W, GRID_H];
    // A canvas left behind by Turbo's page cache (cloned while connected) is replaced.
    this.gridTarget.querySelectorAll(":scope > canvas[data-color-picker-canvas]").forEach((canvas) => canvas.remove());
    this.gridCanvas = document.createElement("canvas");
    this.gridCanvas.dataset.colorPickerCanvas = "";
    [this.gridCanvas.width, this.gridCanvas.height] = size;
    this.gridCanvas.className = "pointer-events-none absolute inset-0 size-full rounded-[inherit]";
    this.gridCanvas.setAttribute("aria-hidden", "true");
    this.gridTarget.style.backgroundImage = "none";
    this.gridTarget.prepend(this.gridCanvas);
    this.paintedArea = null;
  }

  // Slider gradients: hue is shown at full saturation/brightness, saturation and brightness
  // at the current color. While zoomed (Alt-drag) only the visible slice of the range is drawn.
  paintTrack(name) {
    const track = this[`${name}Target`];
    const key = SLIDERS[name];
    const win = this.zoom?.kind === name ? this.zoom.win.x : null;
    const { h, s, v } = this.okhsva;
    const base = key === "h" ? { h: 0, s: 100, v: 100 } : { h, s, v };
    const cacheKey = `${win}|${key === "h" ? "" : `${round(h, 1)},${round(s, 1)},${round(v, 1)}`}`;
    if (this.trackKeys.get(name) === cacheKey) return;
    this.trackKeys.set(name, cacheKey);

    const from = win ?? 0;
    const span = win === null ? 1 : FINE_DRAG;
    const colorAt = (t) => {
      const { r, g, b } = okhsvaToRgba({ ...base, [key]: clamp(from + t * span, 0, 1) * RANGE[key], a: 1 });
      return [r, g, b];
    };
    const gradient = () => {
      const stops = gradientStops(colorAt).map(([t, [r, g, b]]) => `rgb(${r} ${g} ${b}) ${round(t * 100, 3)}%`);
      return `linear-gradient(to right, ${stops.join(", ")})`;
    };
    // The full hue track never changes, so every picker on the page shares one.
    track.style.backgroundImage = key === "h" && win === null ? (HUE_GRADIENT ??= gradient()) : gradient();
  }

  paintArea() {
    if (!this.gridCanvas) return;
    const { fixed, polar } = this.area;
    const win = this.zoom?.kind === "grid" ? this.zoom.win : null;
    const key = `${round(this.okhsva[fixed], 1)}|${win ? `${win.x},${win.y}` : ""}`;
    if (this.paintedArea === key) return;
    const ctx = this.gridCanvas.getContext("2d");
    if (!ctx) return;

    this.paintedArea = key;
    polar ? this.paintWheel(ctx) : this.paintRect(ctx, win);
  }

  paintRect(ctx, win) {
    const { x: xKey, y: yKey, fixed } = this.area;
    const image = ctx.createImageData(GRID_W, GRID_H);
    const fixedHue = fixed === "h" ? okhsvHue(round(this.okhsva.h, 1)) : null;
    const fixedS = this.okhsva.s / 100;
    const fixedV = this.okhsva.v / 100;
    const { data } = image;

    // Columns outer so the (expensive) per-hue constants are computed once per column.
    for (let x = 0; x < GRID_W; x++) {
      const px = x / (GRID_W - 1);
      const nx = win ? clamp(win.x + px * FINE_DRAG, 0, 1) : px;
      const hue = fixedHue || okhsvHue(nx * 360);
      // When saturation is constant down the column (sv, hv), its half of the math runs once.
      const columnPrep = yKey === "v" ? okhsvPrep(hue, xKey === "s" ? nx : fixedS) : null;
      for (let y = 0; y < GRID_H; y++) {
        const py = y / (GRID_H - 1);
        const ny = 1 - (win ? clamp(win.y + py * FINE_DRAG, 0, 1) : py);
        const i = (y * GRID_W + x) * 4;
        // Only hs varies saturation down the column; sv and hv reuse the column's prep.
        if (columnPrep) okhsvFinish(columnPrep, ny, data, i);
        else okhsvFinish(okhsvPrep(hue, ny), fixedV, data, i);
        data[i + 3] = 255;
      }
    }

    ctx.putImageData(image, 0, 0);
  }

  paintWheel(ctx) {
    const image = ctx.createImageData(WHEEL_SIZE, WHEEL_SIZE);
    const v = this.okhsva.v / 100;
    // Hue and saturation never change per pixel, so only the brightness pass runs on repaint.
    this.wheelPixels ??= wheelPixels();

    for (const { i, prep, alpha } of this.wheelPixels) {
      okhsvFinish(prep, v, image.data, i);
      image.data[i + 3] = alpha;
    }

    ctx.putImageData(image, 0, 0);
  }

  // Normalized (0..1) handle position in the area for the current color.
  areaPosition() {
    const { x, y, polar } = this.area;
    if (polar) {
      const angle = (this.okhsva.h * Math.PI) / 180;
      const radius = this.okhsva.s / 100;
      return { x: 0.5 + (Math.cos(angle) * radius) / 2, y: 0.5 - (Math.sin(angle) * radius) / 2 };
    }
    return { x: this.okhsva[x] / RANGE[x], y: 1 - this.okhsva[y] / RANGE[y] };
  }

  swatchTargetConnected(swatch) {
    const parsed = parseColor(swatch.dataset.color);
    swatch.dataset.colorKey = parsed ? formatColor(parsed, "hex", true, false) : "";
  }

  // ---------------------------------------------------------------------------
  // Dropdown
  // ---------------------------------------------------------------------------

  toggle(event) {
    event?.preventDefault();
    this.isOpen ? this.close() : this.open();
  }

  open() {
    if (this.nativeInput || this.inlineValue || this.isOpen || this.disabledValue || !this.hasPanelTarget || !this.hasTriggerTarget) return;

    const panel = this.panelTarget;
    this.isOpen = true;
    clearTimeout(this.hideTimeout);
    // A closed panel skips its canvas and gradients (see render), so paint them before showing.
    this.render({ skipTextField: true, skipNative: true });

    // Pick the mode before showing the panel. Showing it resolves its style, and that style is
    // where the opening transition starts from: switching to (or out of) sheet mode afterwards
    // would first slide the panel the wrong way, then reverse, which reads as a pop.
    this.sheet = this.sheetBelowValue > 0 && window.innerWidth < this.sheetBelowValue;
    if (this.sheet) {
      panel.dataset.sheet = "";
      this.placeSheet();
    } else {
      delete panel.dataset.sheet;
    }

    if (this.supportsPopover) {
      if (!panel.matches(":popover-open")) panel.showPopover();
    } else {
      panel.hidden = false;
    }

    this.triggerTarget.setAttribute("aria-expanded", "true");
    if (this.sheet) {
      this.lockScroll();
      // The visual viewport shrinks and scrolls when the on-screen keyboard opens.
      const viewport = window.visualViewport || window;
      viewport.addEventListener("resize", this.boundPlaceSheet);
      viewport.addEventListener("scroll", this.boundPlaceSheet);
      this.cleanupAutoUpdate = () => {
        viewport.removeEventListener("resize", this.boundPlaceSheet);
        viewport.removeEventListener("scroll", this.boundPlaceSheet);
      };
    } else {
      this.cleanupAutoUpdate = autoUpdate(this.triggerTarget, panel, () => this.position());
    }

    if (this.sheet) {
      // A transition's clock starts at the style change, not at the first visible frame. A
      // freshly shown sheet has an expensive first paint (canvas, gradients, shadow, backdrop),
      // and on phones that frame can land late enough to swallow the start of the slide, so it
      // looks like it pops in. Paint it once off-screen, then start the slide on the next frame.
      this.openFrame = requestAnimationFrame(() => {
        this.openFrame = requestAnimationFrame(() => {
          this.openFrame = null;
          if (this.isOpen) panel.dataset.state = "open";
        });
      });
    } else {
      // Force a reflow so the transition starts from the closed state, then animate in.
      void panel.offsetHeight;
      panel.dataset.state = "open";
    }
    this.firstHandle().focus({ preventScroll: true });

    document.addEventListener("pointerdown", this.boundOutsideClick, true);
  }

  close({ restoreFocus = true, immediate = false } = {}) {
    if (this.inlineValue || !this.isOpen) return;

    const panel = this.panelTarget;
    this.isOpen = false;
    this.stopSheetDrag?.();
    this.unlockScroll();
    cancelAnimationFrame(this.openFrame);
    this.openFrame = null;
    this.cleanupAutoUpdate?.();
    this.cleanupAutoUpdate = null;
    document.removeEventListener("pointerdown", this.boundOutsideClick, true);

    this.triggerTarget?.setAttribute("aria-expanded", "false");
    panel.dataset.state = "closed";

    const hidePanel = () => {
      if (this.isOpen) return;
      if (this.supportsPopover) {
        if (panel.matches(":popover-open")) panel.hidePopover();
      } else {
        panel.hidden = true;
      }
    };

    // With reduced motion the dropdown closes instantly; the sheet still crossfades (no movement).
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (immediate || (reduceMotion && !this.sheet)) hidePanel();
    else this.hideTimeout = setTimeout(hidePanel, this.sheet ? SHEET_EXIT_DURATION : EXIT_DURATION);

    this.commit();
    if (restoreFocus && this.hasTriggerTarget) this.triggerTarget.focus({ preventScroll: true });
  }

  closeOnEscape(event) {
    if (!this.isOpen) return;
    event.preventDefault();
    event.stopPropagation();
    this.close();
  }

  // Tap on the sheet's grab handle (also its accessible "Close" button). A drag that ends
  // on the handle also fires a click, which must not close a sheet that snapped back.
  dismiss(event) {
    event?.preventDefault();
    if (this.sheetDragged) {
      this.sheetDragged = false;
      return;
    }
    this.close();
  }

  // Drag the sheet down by its handle. It follows the finger (translate written straight to the
  // element, no transition), then closes when pulled past a quarter of its height or flicked
  // down, and otherwise springs back with the opening curve. Only the handle starts a drag, so
  // the color area and sliders below it keep their own drags.
  startSheetDrag(event) {
    if (!this.sheet || !this.isOpen || event.button > 0 || this.stopSheetDrag) return;

    const panel = this.panelTarget;
    const handle = event.currentTarget;
    const pointerId = event.pointerId;
    const startY = event.clientY;
    const height = panel.offsetHeight;
    // Recent samples for the release velocity.
    let samples = [{ y: startY, t: event.timeStamp }];
    let offset = 0;
    this.sheetDragged = false;

    const move = (e) => {
      if (e.pointerId !== pointerId) return;
      const dy = e.clientY - startY;
      if (!this.sheetDragged && Math.abs(dy) > 4) {
        this.sheetDragged = true;
        handle.dataset.dragging = "";
        panel.style.transition = "none";
      }
      if (!this.sheetDragged) return;

      // Pulling up meets resistance instead of lifting the sheet off the bottom edge.
      offset = dy > 0 ? dy : -Math.min(16, Math.sqrt(-dy) * 2);
      panel.style.translate = `0 ${offset}px`;
      samples.push({ y: e.clientY, t: e.timeStamp });
      samples = samples.filter((sample) => e.timeStamp - sample.t < 100);
    };

    const end = (e, cancelled = false) => {
      if (e.pointerId !== pointerId) return;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      if (handle.hasPointerCapture?.(pointerId)) handle.releasePointerCapture(pointerId);
      delete handle.dataset.dragging;
      this.stopSheetDrag = null;
      if (!this.sheetDragged) return;

      const first = samples[0];
      const velocity = e.timeStamp > first.t ? (e.clientY - first.y) / (e.timeStamp - first.t) : 0;
      const dismiss = !cancelled && (offset > height * 0.25 || (velocity > 0.5 && offset > 0));

      // Hand the position back to the stylesheet: the transition runs from where the finger
      // left the sheet, down to closed or back up to open. Reading the style first commits the
      // dragged position as the transition's start, even if no frame was drawn since the move.
      void getComputedStyle(panel).translate;
      panel.style.transition = "";
      panel.style.translate = "";
      if (dismiss) this.close();
    };
    const up = (e) => end(e);
    const cancel = (e) => end(e, true);

    try {
      handle.setPointerCapture(pointerId);
    } catch {
      // Synthetic or already-released pointer: window listeners still track it.
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    this.stopSheetDrag = () => end({ pointerId }, true);
  }

  handleOutsideClick(event) {
    const panel = this.panelTarget;

    if (this.sheet) {
      // The sheet is modal: a tap anywhere outside its box only closes it. The popover's
      // ::backdrop isn't reliably hit-tested (Safari), so the tap may target the page behind;
      // stop it here and swallow the click that follows so nothing behind is activated.
      const rect = panel.getBoundingClientRect();
      const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (inside && panel.contains(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
      this.swallowNextClick();
      return this.close({ restoreFocus: false });
    }

    if (!this.element.contains(event.target)) this.close({ restoreFocus: false });
  }

  swallowNextClick() {
    const swallow = (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      cleanup();
    };
    const cleanup = () => {
      window.removeEventListener("click", swallow, true);
      clearTimeout(timer);
    };
    // Touch devices can fire the click a few hundred ms after the pointerdown.
    const timer = setTimeout(cleanup, 800);
    window.addEventListener("click", swallow, true);
  }

  // While the sheet is open the page behind it must not scroll: lock the root and block touch
  // and wheel scrolling that starts outside the sheet (iOS ignores overflow on its own in
  // older versions). Previous inline values are restored, so this nests inside modals.
  lockScroll() {
    if (this.scrollLock) return;
    const root = document.documentElement;
    const block = (e) => {
      if (!this.panelTarget.contains(e.target)) e.preventDefault();
    };
    this.scrollLock = { overflow: root.style.overflow, overscroll: root.style.overscrollBehavior, block };
    root.style.overflow = "hidden";
    root.style.overscrollBehavior = "none";
    document.addEventListener("touchmove", block, { passive: false, capture: true });
    document.addEventListener("wheel", block, { passive: false, capture: true });
  }

  unlockScroll() {
    if (!this.scrollLock) return;
    const root = document.documentElement;
    const { overflow, overscroll, block } = this.scrollLock;
    root.style.overflow = overflow;
    root.style.overscrollBehavior = overscroll;
    document.removeEventListener("touchmove", block, { capture: true });
    document.removeEventListener("wheel", block, { capture: true });
    this.scrollLock = null;
  }

  // Pins the sheet to the bottom of the visible screen, which is the top of the on-screen
  // keyboard when one is open, and keeps it no taller than what remains.
  placeSheet() {
    if (!this.hasPanelTarget) return;
    const vv = window.visualViewport;
    const visibleBottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
    const keyboard = Math.max(0, window.innerHeight - visibleBottom);
    const height = vv ? vv.height : window.innerHeight;

    Object.assign(this.panelTarget.style, {
      position: "fixed",
      left: "0px",
      right: "0px",
      top: "auto",
      bottom: `${keyboard}px`,
      width: "auto",
      maxWidth: "none",
      maxHeight: `${height - 24}px`,
      overflowX: "hidden",
      overflowY: "auto",
      overscrollBehavior: "contain",
      // Content keeps a comfortable width on large phones and small tablets.
      paddingInline: "max(16px, calc((100% - 384px) / 2))",
      paddingBottom: keyboard ? "16px" : "max(16px, env(safe-area-inset-bottom))",
      transformOrigin: "bottom",
      visibility: "",
    });
  }

  async position() {
    if (!this.hasTriggerTarget || !this.hasPanelTarget || this.sheet) return;

    const panel = this.panelTarget;
    const { x, y, placement, middlewareData } = await computePosition(this.triggerTarget, panel, {
      // Top-layer popovers are positioned against the document, so "absolute"
      // keeps them glued to the trigger while the page scrolls natively.
      strategy: this.supportsPopover ? "absolute" : "fixed",
      placement: this.placementValue,
      middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 }), hide()],
    });

    const [side, align = "center"] = placement.split("-");
    const originX = { start: "left", end: "right", center: "center" }[align];
    const originY = { top: "bottom", bottom: "top", left: "center", right: "center" }[side];
    const origin = side === "left" ? "right" : side === "right" ? "left" : originX;

    // Never hide the panel while it holds focus: on touch devices the keyboard can push
    // the trigger out of view while someone is typing in the value field.
    const hidden = middlewareData.hide?.referenceHidden && !panel.contains(document.activeElement);

    Object.assign(panel.style, {
      position: this.supportsPopover ? "absolute" : "fixed",
      left: `${x}px`,
      top: `${y}px`,
      right: "",
      bottom: "",
      width: "",
      maxWidth: "",
      maxHeight: "",
      overflow: "",
      overscrollBehavior: "",
      paddingInline: "",
      paddingBottom: "",
      transformOrigin: `${origin} ${originY}`,
      visibility: hidden ? "hidden" : "",
    });
    panel.dataset.side = side;
  }

  // ---------------------------------------------------------------------------
  // Pointer interactions
  // ---------------------------------------------------------------------------

  startGridDrag(event) {
    const { x, y, polar } = this.area;
    if (polar) {
      // Unclamped point, so dragging outside the wheel still steers the angle.
      return this.startDrag(
        event,
        this.gridTarget,
        this.gridHandleTarget,
        (px, py) => {
          const dx = px - 0.5;
          const dy = 0.5 - py;
          const radius = Math.hypot(dx, dy) * 2;
          if (radius > 0.001) this.okhsva.h = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
          this.okhsva.s = clamp(radius, 0, 1) * 100;
        },
        () => this.areaPosition(),
        "grid",
        { raw: true },
      );
    }

    this.startDrag(
      event,
      this.gridTarget,
      this.gridHandleTarget,
      (px, py) => {
        this.okhsva[x] = px * RANGE[x];
        this.okhsva[y] = (1 - py) * RANGE[y];
      },
      () => this.areaPosition(),
      "grid",
    );
  }

  startHueDrag(event) {
    this.startSliderDrag(event, "hue");
  }

  startSaturationDrag(event) {
    this.startSliderDrag(event, "saturation");
  }

  startBrightnessDrag(event) {
    this.startSliderDrag(event, "brightness");
  }

  startAlphaDrag(event) {
    this.startSliderDrag(event, "alpha");
  }

  startSliderDrag(event, name) {
    const key = SLIDERS[name];
    this.startDrag(
      event,
      this[`${name}Target`],
      this[`${name}HandleTarget`],
      (x) => {
        this.okhsva[key] = x * RANGE[key];
      },
      () => ({ x: this.okhsva[key] / RANGE[key], y: 0 }),
      name,
    );
  }

  startDrag(event, track, handle, update, current, kind, { raw = false } = {}) {
    // Ignore secondary buttons and extra fingers once a drag is in progress.
    if (this.disabledValue || event.button > 0 || this.stopDrag) return;
    event.preventDefault();
    handle.focus({ preventScroll: true });

    const rect = track.getBoundingClientRect();
    const pointerId = event.pointerId;
    let latest = event;
    let frame = null;

    // Positions are normalized 0..1 on the track. Deliberately unclamped, so the pointer keeps
    // steering after it leaves the track.
    const point = (e) => ({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
    const unit = (p) => ({ x: clamp(p.x, 0, 1), y: clamp(p.y, 0, 1) });

    // Normally the handle sits under the pointer. While Alt is held the track zooms instead: it
    // is re-drawn to show only a FINE_DRAG-sized slice of the range around the current value,
    // so the handle stays under the cursor and the color changes slowly.
    let fine = false;
    let pointer = point(event);

    // The wheel has no zoomed view, so Alt does nothing there.
    const setFine = (on) => {
      if (raw) return;
      fine = on;
      if (on) {
        const start = unit(pointer);
        const value = current();
        this.zoom = { kind, start, win: { x: value.x - start.x * FINE_DRAG, y: value.y - start.y * FINE_DRAG }, pos: start };
      } else {
        this.zoom = null;
      }
    };

    const apply = () => {
      frame = null;
      pointer = point(latest);
      if (latest.altKey !== fine) setFine(latest.altKey);

      if (fine) {
        const { win } = this.zoom;
        this.zoom.pos = unit(pointer);
        update(clamp(win.x + pointer.x * FINE_DRAG, 0, 1), clamp(win.y + pointer.y * FINE_DRAG, 0, 1));
      } else {
        const p = raw ? pointer : unit(pointer);
        update(p.x, p.y);
      }

      this.render();
      this.dispatch("input", { detail: this.eventDetail() });
    };

    const finish = ({ commit = true } = {}) => {
      if (frame) {
        cancelAnimationFrame(frame);
        apply();
      }
      window.removeEventListener("keydown", modifierChange);
      window.removeEventListener("keyup", modifierChange);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      window.removeEventListener("blur", missedRelease);
      track.removeEventListener("lostpointercapture", missedRelease);
      if (track.hasPointerCapture?.(pointerId)) track.releasePointerCapture(pointerId);
      if (fine) {
        fine = false;
        this.zoom = null;
        this.render();
      }
      delete track.dataset.dragging;
      this.stopDrag = null;
      if (commit) this.commit();
    };

    // Coalesce pointer events into one render per frame.
    const move = (e) => {
      if (e.pointerId !== pointerId) return;
      // No button held any more (released outside the window): end the drag instead of following hover.
      if (e.pointerType === "mouse" && e.buttons === 0) return finish();
      latest = e;
      frame ??= requestAnimationFrame(apply);
    };

    const release = (e) => {
      if (e.pointerId === pointerId) finish();
    };

    // Pressing or releasing Alt without moving the pointer still zooms in or out.
    const modifierChange = (e) => {
      if (e.key !== "Alt") return;
      e.preventDefault(); // keeps Windows/Linux from toggling the menu bar
      latest = { clientX: latest.clientX, clientY: latest.clientY, altKey: e.type === "keydown" };
      frame ??= requestAnimationFrame(apply);
    };

    // The release happened somewhere we never heard about (another window, browser chrome).
    const missedRelease = () => finish();

    this.stopDrag = () => finish({ commit: false });
    track.setPointerCapture?.(pointerId);
    track.dataset.dragging = "";
    window.addEventListener("keydown", modifierChange);
    window.addEventListener("keyup", modifierChange);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    window.addEventListener("blur", missedRelease);
    track.addEventListener("lostpointercapture", missedRelease);
    apply();
  }

  // ---------------------------------------------------------------------------
  // Keyboard interactions
  // ---------------------------------------------------------------------------

  gridKeydown(event) {
    const { x, y, polar } = this.area;
    const step = event.altKey ? FINE : event.shiftKey ? 10 : 1;
    // Around the wheel the hue wraps instead of stopping at 0°/360°.
    const nudge = (key, delta) => () => {
      const next = this.okhsva[key] + delta;
      this.okhsva[key] = polar && key === "h" ? (next + 360) % 360 : clamp(next, 0, RANGE[key]);
    };
    this.handleKey(event, {
      ArrowLeft: nudge(x, -step),
      ArrowRight: nudge(x, step),
      ArrowUp: nudge(y, step),
      ArrowDown: nudge(y, -step),
    });
  }

  hueKeydown(event) {
    this.sliderKeydown(event, "h");
  }

  saturationKeydown(event) {
    this.sliderKeydown(event, "s");
  }

  brightnessKeydown(event) {
    this.sliderKeydown(event, "v");
  }

  alphaKeydown(event) {
    this.sliderKeydown(event, "a");
  }

  // Steps are 1 unit (degree or percent), or 1% for opacity.
  sliderKeydown(event, key) {
    const unit = key === "a" ? 0.01 : 1;
    const step = (event.altKey ? FINE : event.shiftKey ? 10 : 1) * unit;
    const nudge = (delta) => () => (this.okhsva[key] = clamp(this.okhsva[key] + delta, 0, RANGE[key]));
    this.handleKey(event, {
      ArrowLeft: nudge(-step),
      ArrowDown: nudge(-step),
      ArrowRight: nudge(step),
      ArrowUp: nudge(step),
      Home: () => (this.okhsva[key] = 0),
      End: () => (this.okhsva[key] = RANGE[key]),
    });
  }

  handleKey(event, keys) {
    if (this.disabledValue || !keys[event.key]) return;
    event.preventDefault();
    keys[event.key]();
    this.render();
    this.commit();
  }

  // ---------------------------------------------------------------------------
  // Text field, format toggle, swatches, eyedropper, copy
  // ---------------------------------------------------------------------------

  textInput() {
    const parsed = parseColor(this.textFieldTarget.value);
    const invalid = !parsed && this.textFieldTarget.value.trim() !== "";
    invalid ? this.textFieldTarget.setAttribute("aria-invalid", "true") : this.textFieldTarget.removeAttribute("aria-invalid");
    if (!parsed) return;

    this.setHsva(parsed);
    this.render({ skipTextField: true });
    this.dispatch("input", { detail: this.eventDetail() });
  }

  textCommit(event) {
    if (event.type === "keydown") event.preventDefault();

    const parsed = parseColor(this.textFieldTarget.value);
    if (parsed) this.setHsva(parsed);
    this.textFieldTarget.removeAttribute("aria-invalid");
    this.render();
    this.commit();
  }

  cycleFormat(event) {
    event?.preventDefault();
    const index = FORMATS.indexOf(this.formatValue);
    this.formatValue = FORMATS[(index + 1) % FORMATS.length];
    this.render();
    this.commit();
  }

  selectSwatch(event) {
    event.preventDefault();
    const parsed = parseColor(event.currentTarget.dataset.color);
    if (!parsed || this.disabledValue) return;

    this.setHsva(parsed);
    this.render();
    this.commit();
  }

  async pickFromScreen(event) {
    event?.preventDefault();
    if (!("EyeDropper" in window) || this.disabledValue) return;

    try {
      const { sRGBHex } = await new window.EyeDropper().open();
      const parsed = parseColor(sRGBHex);
      if (!parsed) return;

      this.setHsva({ ...parsed, a: this.okhsva.a });
      this.render();
      this.commit();
    } catch {
      // User cancelled the eyedropper.
    }
  }

  async copy(event) {
    event?.preventDefault();

    try {
      await navigator.clipboard.writeText(this.formattedColor());
    } catch {
      return;
    }

    if (!this.hasPreviewTarget) return;
    this.previewTarget.dataset.copied = "";
    clearTimeout(this.copyTimeout);
    this.copyTimeout = setTimeout(() => delete this.previewTarget.dataset.copied, 1400);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  // Programmatically set the color, e.g. controller.setColor("#ff0000")
  setColor(color) {
    const parsed = parseColor(color);
    if (!parsed) return false;

    this.setHsva(parsed);
    this.render();
    this.commit();
    return true;
  }

  getColor(format = this.formatValue) {
    return formatColor(this.okhsva, format, this.opacityValue, this.uppercaseValue);
  }

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------

  setHsva(parsed) {
    // Keep the current hue when picking an achromatic color so the grid does not jump.
    const hue = parsed.s < 0.01 || parsed.v < 0.01 ? this.okhsva.h : parsed.h;
    this.okhsva = { ...parsed, h: hue, a: this.opacityValue ? parsed.a : 1 };
  }

  formattedColor() {
    return this.getColor(this.formatValue);
  }

  firstHandle() {
    const handles = ["grid", "hue", "saturation", "brightness", "alpha"].map((name) => `${name}Handle`);
    const handle = handles.find((name) => this[`has${name[0].toUpperCase()}${name.slice(1)}Target`]);
    return handle ? this[`${handle}Target`] : this.panelTarget;
  }

  commit() {
    const color = this.formattedColor();
    if (color === this.lastCommitted) return;

    this.lastCommitted = color;
    this.valueValue = color;
    if (this.hasInputTarget) {
      this.inputTarget.value = color;
      this.inputTarget.dispatchEvent(new Event("input", { bubbles: true }));
      this.inputTarget.dispatchEvent(new Event("change", { bubbles: true }));
    }
    this.dispatch("change", { detail: this.eventDetail() });
  }

  eventDetail() {
    return {
      color: this.formattedColor(),
      format: this.formatValue,
      rgba: okhsvaToRgba(this.okhsva),
      hsva: rgbaToHsva(okhsvaToRgba(this.okhsva)),
      okhsva: { ...this.okhsva },
    };
  }

  // Only transforms, opacity and colors change here, so dragging stays on the compositor.
  render({ skipTextField = false, skipNative = false } = {}) {
    const { h, a } = this.okhsva;
    const rgba = okhsvaToRgba(this.okhsva);
    const hueRgb = okhsvaToRgba({ h, s: 100, v: 100, a: 1 });
    const { r, g, b } = rgba;
    const opaque = `rgb(${r} ${g} ${b})`;
    const withAlpha = `rgb(${r} ${g} ${b} / ${round(a, 3)})`;
    const color = this.formattedColor();

    // Canvas and gradients are only painted while they can be seen: a page with many closed
    // pickers then pays nothing for them up front.
    const visible = this.inlineValue || this.isOpen;
    if (visible) this.paintArea();
    if (this.hasGridThumbTarget) {
      const pos = this.zoom?.kind === "grid" ? this.zoom.pos : this.areaPosition();
      this.gridThumbTarget.style.transform = `translate(${pos.x * 100}%, ${pos.y * 100}%)`;
    }
    if (this.hasGridHandleTarget) {
      const { x, y } = this.area;
      const text = (key) => `${CHANNEL_NAMES[key].toLowerCase()} ${Math.round(this.okhsva[key])}${key === "h" ? "°" : "%"}`;
      this.gridHandleTarget.style.backgroundColor = opaque;
      this.gridHandleTarget.setAttribute("aria-label", this.area.label);
      // role="slider" needs a value: the x channel, with its own range (hue runs to 360).
      this.gridHandleTarget.setAttribute("aria-valuenow", Math.round(this.okhsva[x]));
      this.gridHandleTarget.setAttribute("aria-valuemin", 0);
      this.gridHandleTarget.setAttribute("aria-valuemax", RANGE[x]);
      const valueText = `${text(x)}, ${text(y)}`;
      this.gridHandleTarget.setAttribute("aria-valuetext", valueText[0].toUpperCase() + valueText.slice(1));
    }

    for (const name of ["hue", "saturation", "brightness"]) {
      if (!this[`has${name[0].toUpperCase()}${name.slice(1)}Target`]) continue;
      const key = SLIDERS[name];
      if (visible) this.paintTrack(name);
      const thumb = this[`${name}ThumbTarget`];
      const handle = this[`${name}HandleTarget`];
      const x = this.zoom?.kind === name ? this.zoom.pos.x : this.okhsva[key] / RANGE[key];
      thumb.style.transform = `translateX(${x * 100}%)`;
      handle.style.backgroundColor = key === "h" ? `rgb(${hueRgb.r} ${hueRgb.g} ${hueRgb.b})` : opaque;
      handle.setAttribute("aria-valuenow", Math.round(this.okhsva[key]));
    }

    // The opacity track paints its gradient + checkerboard in one background (no overlay layer).
    if (this.hasAlphaTarget) {
      this.alphaTarget.style.setProperty("--alpha-color", opaque);
      if (this.zoom?.kind === "alpha") {
        const { win } = this.zoom;
        const at = (n) => `rgb(${r} ${g} ${b} / ${round(clamp(n, 0, 1), 3)})`;
        this.alphaTarget.style.setProperty("--alpha-from", at(win.x));
        this.alphaTarget.style.setProperty("--alpha-to", at(win.x + FINE_DRAG));
      } else {
        this.alphaTarget.style.removeProperty("--alpha-from");
        this.alphaTarget.style.removeProperty("--alpha-to");
      }
    }
    if (this.hasAlphaGradientTarget) {
      this.alphaGradientTarget.style.backgroundImage = `linear-gradient(to right, rgb(${r} ${g} ${b} / 0), ${opaque})`;
    }
    if (this.hasAlphaThumbTarget) this.alphaThumbTarget.style.transform = `translateX(${this.zoom?.kind === "alpha" ? this.zoom.pos.x * 100 : a * 100}%)`;
    if (this.hasAlphaHandleTarget) {
      this.alphaHandleTarget.style.backgroundColor = withAlpha;
      this.alphaHandleTarget.setAttribute("aria-valuenow", Math.round(a * 100));
    }

    if (this.hasTriggerSwatchTarget) this.triggerSwatchTarget.style.backgroundColor = withAlpha;
    if (this.hasTriggerTarget) this.triggerTarget.setAttribute("aria-description", color);
    if (this.hasPreviewSwatchTarget) this.previewSwatchTarget.style.backgroundColor = withAlpha;
    if (this.hasPreviewTarget) this.previewTarget.dataset.contrast = isLight(rgba) ? "dark" : "light";

    if (this.hasTextFieldTarget && !skipTextField) this.textFieldTarget.value = color;
    if (this.hasFormatButtonTarget) {
      this.formatButtonTarget.textContent = this.formatValue.toUpperCase();
      // "OKLCH" is a letter longer than the others, so it steps down a size to fit the button.
      this.formatButtonTarget.style.fontSize = this.formatValue === "oklch" ? "9px" : "";
    }
    this.valueTargets.forEach((target) => (target.textContent = color));
    if (this.nativeInput && !skipNative) this.nativeInput.value = this.nativeColorValue();

    const current = formatColor(this.okhsva, "hex", true, false);
    this.swatchTargets.forEach((swatch) => {
      swatch.setAttribute("aria-pressed", swatch.dataset.colorKey === current ? "true" : "false");
    });
  }
}

// Whether dark text reads better than white on top of this color.
function isLight({ r, g, b, a }) {
  if (a < 0.5) return true;
  const channel = (c) => {
    const n = c / 255;
    return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b) > 0.36;
}

// -----------------------------------------------------------------------------
// Color math
// -----------------------------------------------------------------------------

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value, precision = 0) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function hsvaToRgba({ h, s, v, a }) {
  const sat = s / 100;
  const val = v / 100;
  const f = (n) => {
    const k = (n + h / 60) % 6;
    return val - val * sat * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return { r: Math.round(f(5) * 255), g: Math.round(f(3) * 255), b: Math.round(f(1) * 255), a };
}

function rgbaToHsva({ r, g, b, a = 1 }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const delta = max - Math.min(rn, gn, bn);
  let h = 0;

  if (delta) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
  }

  h = (h * 60 + 360) % 360;
  return { h, s: max ? (delta / max) * 100 : 0, v: max * 100, a: clamp(a, 0, 1) };
}

function hslaToHsva({ h, s, l, a = 1 }) {
  const sat = s / 100;
  const light = l / 100;
  const v = light + sat * Math.min(light, 1 - light);
  return { h, s: v ? 2 * (1 - light / v) * 100 : 0, v: v * 100, a };
}

function hsvaToHsla({ h, s, v, a }) {
  const sat = s / 100;
  const val = v / 100;
  const l = val * (1 - sat / 2);
  const sl = l === 0 || l === 1 ? 0 : (val - l) / Math.min(l, 1 - l);
  return { h, s: sl * 100, l: l * 100, a };
}

// Okhsv, ported from Björn Ottosson's reference implementation (MIT):
// https://bottosson.github.io/posts/colorpicker/
const TOE_K1 = 0.206;
const TOE_K2 = 0.03;
const TOE_K3 = (1 + TOE_K1) / (1 + TOE_K2);
const toe = (x) => 0.5 * (TOE_K3 * x - TOE_K1 + Math.sqrt((TOE_K3 * x - TOE_K1) ** 2 + 4 * TOE_K2 * TOE_K3 * x));
const toeInv = (x) => (x * x + TOE_K1 * x) / (TOE_K3 * (x + TOE_K2));

// Largest saturation (C/L) reachable in sRGB for the hue direction (a, b).
// Kept as the reference's polynomial fit rather than solved exactly: right at the blue primary
// OKLab hue folds back on itself, and the exact edge would no longer pass through #0000ff
// (it round-trips to #0037ff). The fit keeps every pure primary exact.
function maxSaturation(a, b) {
  let k0, k1, k2, k3, k4, wl, wm, ws;
  if (-1.88170328 * a - 0.80936493 * b > 1) {
    [k0, k1, k2, k3, k4] = [1.19086277, 1.76576728, 0.59662641, 0.75515197, 0.56771245];
    [wl, wm, ws] = [4.0767416621, -3.3077115913, 0.2309699292];
  } else if (1.81444104 * a - 1.19445276 * b > 1) {
    [k0, k1, k2, k3, k4] = [0.73956515, -0.45954404, 0.08285427, 0.1254107, 0.14503204];
    [wl, wm, ws] = [-1.2684380046, 2.6097574011, -0.3413193965];
  } else {
    [k0, k1, k2, k3, k4] = [1.35733652, -0.00915799, -1.1513021, -0.50559606, 0.00692167];
    [wl, wm, ws] = [-0.0041960863, -0.7034186147, 1.707614701];
  }

  let S = k0 + k1 * a + k2 * b + k3 * a * a + k4 * a * b;
  const kl = 0.3963377774 * a + 0.2158037573 * b;
  const km = -0.1055613458 * a - 0.0638541728 * b;
  const ks = -0.0894841775 * a - 1.291485548 * b;

  // One step of Halley's method.
  const l_ = 1 + S * kl;
  const m_ = 1 + S * km;
  const s_ = 1 + S * ks;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const sv = s_ ** 3;
  const f = wl * l + wm * m + ws * sv;
  const f1 = wl * 3 * kl * l_ * l_ + wm * 3 * km * m_ * m_ + ws * 3 * ks * s_ * s_;
  const f2 = wl * 6 * kl * kl * l_ + wm * 6 * km * km * m_ + ws * 6 * ks * ks * s_;
  S -= (f * f1) / (f1 * f1 - 0.5 * f * f2);
  return S;
}

// CSS gradients blend linearly in sRGB, but Okhsv tracks bend sharply at the gamut corners
// (hue bends hard at green and blue), so evenly spaced stops smear them: 13 stops were off by up
// to 89/255. Stops are added only where a straight blend drifts more than ~1/255 from the
// real color, giving an exact track with a few dozen stops.
let HUE_GRADIENT = null;
function gradientStops(colorAt, segments = 12, tolerance = 1.5) {
  const stops = [[0, colorAt(0)]];
  const off = (t0, c0, t1, c1, t, c) => c.some((n, k) => Math.abs(n - (c0[k] + ((c1[k] - c0[k]) * (t - t0)) / (t1 - t0))) > tolerance);
  const add = (t0, c0, t1, c1, depth) => {
    const probes = [0.25, 0.5, 0.75].map((u) => t0 + (t1 - t0) * u).map((t) => [t, colorAt(t)]);
    if (depth < 10 && probes.some(([t, c]) => off(t0, c0, t1, c1, t, c))) {
      const [tm, cm] = probes[1];
      add(t0, c0, tm, cm, depth + 1);
      add(tm, cm, t1, c1, depth + 1);
    } else {
      stops.push([t1, c1]);
    }
  };
  for (let i = 0; i < segments; i++) add(i / segments, stops[stops.length - 1][1], (i + 1) / segments, colorAt((i + 1) / segments), 0);
  return stops;
}

// Per-pixel wheel data (index, brightness-independent color math, rim alpha), built once.
function wheelPixels() {
  const half = WHEEL_SIZE / 2;
  const edge = 1.5 / half; // anti-aliased rim, in radius units
  const pixels = [];

  for (let y = 0; y < WHEEL_SIZE; y++) {
    for (let x = 0; x < WHEEL_SIZE; x++) {
      const dx = (x + 0.5 - half) / half;
      const dy = (half - y - 0.5) / half;
      const radius = Math.hypot(dx, dy);
      if (radius > 1 + edge) continue;

      const h = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
      pixels.push({
        i: (y * WHEEL_SIZE + x) * 4,
        prep: okhsvPrep(cachedHue(h), Math.min(radius, 1)),
        alpha: Math.round(clamp((1 + edge - radius) / edge, 0, 1) * 255),
      });
    }
  }
  return pixels;
}

// The wheel needs hue constants for every pixel; quarter-degree buckets are visually exact.
const HUE_CACHE = new Map();
function cachedHue(h) {
  const bucket = Math.round(h * 4) % 1440;
  if (!HUE_CACHE.has(bucket)) HUE_CACHE.set(bucket, okhsvHue(bucket / 4));
  return HUE_CACHE.get(bucket);
}

// Per-hue constants: direction in the a/b plane plus the gamut cusp scaled to S/T.
function okhsvHue(h) {
  const a = Math.cos((h * Math.PI) / 180);
  const b = Math.sin((h * Math.PI) / 180);
  const sCusp = maxSaturation(a, b);
  const max = Math.max(...oklchToLinear({ l: 1, c: sCusp, h }));
  const lCusp = Math.cbrt(1 / max);
  const cCusp = lCusp * sCusp;
  const sMax = cCusp / lCusp;
  const tMax = cCusp / (1 - lCusp);
  return { a, b, sMax, tMax, k: 1 - 0.5 / sMax };
}

// s, v in 0..1; returns 0..255 sRGB channels.
// Split in two so painters can reuse the brightness-independent half: okhsvPrep depends only on
// hue and saturation, okhsvFinish applies the brightness.
function okhsvPrep({ a, b, tMax, k }, s) {
  const S0 = 0.5;
  const lv = 1 - (s * S0) / (S0 + tMax - tMax * k * s);
  const cv = (s * tMax * S0) / (S0 + tMax - tMax * k * s);
  const lvt = toeInv(lv);
  const cvt = (cv * lvt) / lv;
  const [r, g, bl] = oklabToLinear(lvt, a * cvt, b * cvt);
  return { a, b, lv, cv, scaleL: Math.cbrt(1 / Math.max(r, g, bl, 0)) };
}

// v in 0..1; returns 0..255 sRGB channels. Painters pass their pixel buffer as `out` (with the
// pixel's offset) so the per-pixel loop allocates nothing; this runs ~6-12k times per repaint.
function okhsvFinish({ a, b, lv, cv, scaleL }, v, out = [0, 0, 0], i = 0) {
  const L0 = v * lv;
  if (L0 <= 0) {
    out[i] = out[i + 1] = out[i + 2] = 0;
    return out;
  }

  const Lt = toeInv(L0);
  const L = Lt * scaleL;
  const C = ((cv * Lt) / lv) * scaleL;
  // oklabToLinear, inlined.
  const l = L + C * (0.3963377774 * a + 0.2158037573 * b);
  const m = L - C * (0.1055613458 * a + 0.0638541728 * b);
  const s = L - C * (0.0894841775 * a + 1.291485548 * b);
  const l3 = l * l * l;
  const m3 = m * m * m;
  const s3 = s * s * s;
  out[i] = linearToSrgb8(4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3);
  out[i + 1] = linearToSrgb8(-1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3);
  out[i + 2] = linearToSrgb8(-0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3);
  return out;
}

// s, v in 0..1; returns 0..255 sRGB channels.
function okhsvToSrgb(hue, s, v) {
  return okhsvFinish(okhsvPrep(hue, s), v);
}

function okhsvaToRgba({ h, s, v, a }) {
  const [r, g, b] = okhsvToSrgb(okhsvHue(h), s / 100, v / 100);
  return { r, g, b, a };
}

function rgbaToOkhsva({ r, g, b, a = 1 }) {
  const { l: L, c: C, h } = rgbaToOklch({ r, g, b });
  if (L <= 0 || C === 0) return { h: 0, s: 0, v: clamp(toe(L) * 100, 0, 100), a: clamp(a, 0, 1) };

  const hue = okhsvHue(h);
  const { tMax, k } = hue;
  const S0 = 0.5;

  const t = tMax / (C + L * tMax);
  const lv = t * L;
  const cv = t * C;
  const lvt = toeInv(lv);
  const cvt = (cv * lvt) / lv;

  const scale = oklabToLinear(lvt, hue.a * cvt, hue.b * cvt);
  const scaleL = Math.cbrt(1 / Math.max(...scale, 0));
  const Lr = L / scaleL;
  const Cr = (C / scaleL) * (toe(Lr) / Lr);
  const Lt = toe(Lr);

  const v = Lt / lv;
  const s = ((S0 + tMax) * cv) / (tMax * S0 + tMax * k * cv);
  return { h, s: clamp(s * 100, 0, 100), v: clamp(v * 100, 0, 100), a: clamp(a, 0, 1) };
}

// OKLCH (Björn Ottosson's Oklab, polar form). Perceptually uniform, so equal steps in
// lightness/chroma look equal, unlike HSL/HSV.
function srgbToLinear(c) {
  const n = c / 255;
  return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
}

// Same result as Math.round(linearToSrgb(n)) clamped to 0..255, without pow(): a binary search
// over the 255 linear values where the rounded sRGB channel steps up. Painting runs this for
// every channel of every pixel, so it is the hottest line in the file.
const SRGB_STEPS = Float64Array.from({ length: 255 }, (_, k) => srgbToLinear(k + 0.5));
function linearToSrgb8(n) {
  let low = 0;
  let high = 255;
  while (low < high) {
    const mid = (low + high) >> 1;
    n >= SRGB_STEPS[mid] ? (low = mid + 1) : (high = mid);
  }
  return low;
}

function linearToSrgb(n) {
  return (n <= 0.0031308 ? 12.92 * n : 1.055 * n ** (1 / 2.4) - 0.055) * 255;
}

function rgbaToOklch({ r, g, b }) {
  const [lr, lg, lb] = [r, g, b].map(srgbToLinear);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const c = Math.hypot(a, bb);
  // Hue is meaningless for near-greys; report 0 instead of numerical noise.
  const h = c < 1e-4 ? 0 : ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360;
  return { l: L, c: c < 1e-4 ? 0 : c, h };
}

// Linear-light sRGB, unclamped (values outside 0..1 mean out of gamut).
function oklchToLinear({ l, c, h }) {
  return oklabToLinear(l, c * Math.cos((h * Math.PI) / 180), c * Math.sin((h * Math.PI) / 180));
}

function oklabToLinear(l, a, b) {
  const l1 = l + 0.3963377774 * a + 0.2158037573 * b;
  const m1 = l - 0.1055613458 * a - 0.0638541728 * b;
  const s1 = l - 0.0894841775 * a - 1.291485548 * b;
  const l_ = l1 * l1 * l1;
  const m_ = m1 * m1 * m1;
  const s_ = s1 * s1 * s1;

  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
}

// Out-of-gamut colors (common in oklch) keep their lightness and hue and lose chroma,
// which looks much closer to the intent than clipping channels independently.
function oklchToRgb({ l, c, h }) {
  const inGamut = (rgb) => rgb.every((n) => n >= -0.0001 && n <= 1.0001);
  let linear = oklchToLinear({ l, c, h });

  if (!inGamut(linear)) {
    let low = 0;
    let high = c;
    for (let i = 0; i < 20; i++) {
      const mid = (low + high) / 2;
      inGamut(oklchToLinear({ l, c: mid, h })) ? (low = mid) : (high = mid);
    }
    linear = oklchToLinear({ l, c: low, h });
  }

  const [r, g, b] = linear.map((n) => clamp(Math.round(linearToSrgb(clamp(n, 0, 1))), 0, 255));
  return { r, g, b };
}

function toHex(n) {
  return Math.round(n).toString(16).padStart(2, "0");
}

function formatColor(okhsva, format, opacity, uppercase) {
  const rgba = okhsvaToRgba(okhsva);
  const { r, g, b, a } = rgba;
  const hsva = rgbaToHsva(rgba);
  const alpha = round(a, 2);
  let result;

  switch (format) {
    case "rgb":
      result = opacity ? `rgba(${r}, ${g}, ${b}, ${alpha})` : `rgb(${r}, ${g}, ${b})`;
      break;
    case "hsl": {
      const hsl = hsvaToHsla(hsva);
      const parts = `${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%`;
      result = opacity ? `hsla(${parts}, ${alpha})` : `hsl(${parts})`;
      break;
    }
    case "hsv": {
      const parts = `${Math.round(hsva.h)}, ${Math.round(hsva.s)}%, ${Math.round(hsva.v)}%`;
      result = opacity ? `hsva(${parts}, ${alpha})` : `hsv(${parts})`;
      break;
    }
    case "oklch": {
      const { l, c, h } = rgbaToOklch({ r, g, b });
      const parts = `${round(l * 100, 1)}% ${round(c, 3)} ${round(h, 1)}`;
      result = opacity && alpha < 1 ? `oklch(${parts} / ${alpha})` : `oklch(${parts})`;
      break;
    }
    default:
      result = `#${toHex(r)}${toHex(g)}${toHex(b)}${opacity ? toHex(a * 255) : ""}`;
  }

  return uppercase ? result.toUpperCase() : result;
}

function parseAlpha(value) {
  if (value === undefined || value === "") return 1;
  const number = parseFloat(value);
  if (Number.isNaN(number)) return 1;
  return clamp(value.trim().endsWith("%") ? number / 100 : number, 0, 1);
}

function parseColor(input) {
  const rgba = parseRgba(input);
  return rgba && rgbaToOkhsva(rgba);
}

function parseRgba(input) {
  if (!input) return null;
  const value = String(input).trim().toLowerCase();

  // Hex: #rgb, #rgba, #rrggbb, #rrggbbaa (leading # optional)
  const hexMatch = value.match(/^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length <= 4) hex = [...hex].map((c) => c + c).join("");
    const n = (i) => parseInt(hex.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: hex.length === 8 ? n(6) / 255 : 1 };
  }

  // OKLCH: oklch(62.8% 0.258 29.2), oklch(0.628 0.258 29.2 / 50%), hue may carry "deg"
  const oklchMatch = value.match(/^oklch\(\s*([^)]+)\)$/);
  if (oklchMatch) {
    const parts = oklchMatch[1].split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3) return null;

    const component = (p) => (p === "none" ? 0 : parseFloat(p));
    const l = parts[0].endsWith("%") ? component(parts[0]) / 100 : component(parts[0]);
    const c = parts[1].endsWith("%") ? (component(parts[1]) / 100) * 0.4 : component(parts[1]);
    const h = ((component(parts[2]) % 360) + 360) % 360;
    if ([l, c, h].some(Number.isNaN)) return null;

    const { r, g, b } = oklchToRgb({ l: clamp(l, 0, 1), c: Math.max(0, c), h });
    return { r, g, b, a: parseAlpha(parts[3]) };
  }

  // Functional notation: rgb(), rgba(), hsl(), hsla(), hsv(), hsva(), with commas or spaces
  const fnMatch = value.match(/^(rgba?|hsla?|hsva?)\(\s*([^)]+)\)$/);
  if (fnMatch) {
    const [, fn, body] = fnMatch;
    const parts = body.split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3) return null;

    const [p1, p2, p3, p4] = parts;
    const a = parseAlpha(p4);

    if (fn.startsWith("rgb")) {
      const channel = (p) => clamp(p.endsWith("%") ? (parseFloat(p) / 100) * 255 : parseFloat(p), 0, 255);
      const rgb = [p1, p2, p3].map(channel);
      if (rgb.some(Number.isNaN)) return null;
      return { r: Math.round(rgb[0]), g: Math.round(rgb[1]), b: Math.round(rgb[2]), a };
    }

    const h = ((parseFloat(p1) % 360) + 360) % 360;
    const x = clamp(parseFloat(p2), 0, 100);
    const y = clamp(parseFloat(p3), 0, 100);
    if ([h, x, y].some(Number.isNaN)) return null;

    return hsvaToRgba(fn.startsWith("hsl") ? hslaToHsva({ h, s: x, l: y, a }) : { h, s: x, v: y, a });
  }

  // color(srgb r g b / a) and color(display-p3 ...): what the system picker returns with opacity
  // or wide gamut on. P3 is converted to sRGB (out-of-gamut channels are clipped).
  const colorFnMatch = value.match(/^color\(\s*(srgb|display-p3)\s+([^)]+)\)$/);
  if (colorFnMatch) {
    const [, space, body] = colorFnMatch;
    const parts = body.split(/[\s/]+/).filter(Boolean);
    if (parts.length < 3) return null;
    let rgb = parts.slice(0, 3).map((p) => (p.endsWith("%") ? parseFloat(p) / 100 : parseFloat(p)));
    if (rgb.some(Number.isNaN)) return null;
    if (space === "display-p3") {
      const [r, g, b] = rgb.map((c) => srgbToLinear(c * 255));
      rgb = [
        1.2249401 * r - 0.2249404 * g,
        -0.0420569 * r + 1.0420571 * g,
        -0.0196376 * r - 0.0786361 * g + 1.0982735 * b,
      ].map((c) => linearToSrgb(clamp(c, 0, 1)) / 255);
    }
    const [r, g, b] = rgb.map((c) => Math.round(clamp(c, 0, 1) * 255));
    return { r, g, b, a: parseAlpha(parts[3]) };
  }

  // Named colors and anything else the browser understands (e.g. "rebeccapurple", oklch())
  if (typeof CSS !== "undefined" && CSS.supports("color", value)) {
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#000";
    ctx.fillStyle = value;
    const normalized = ctx.fillStyle;
    if (normalized && normalized !== value) return parseRgba(normalized);
  }

  return null;
}
