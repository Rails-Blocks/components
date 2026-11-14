import { Controller } from "@hotwired/stimulus";

// Resizable panel groups with draggable, keyboard-accessible handles.
//
//   <div data-controller="resize" class="flex h-64">
//     <div data-resize-target="panel" data-resize-default-size="30" data-resize-min-size="20">…</div>
//     <div data-resize-target="handle" role="separator" tabindex="0" aria-label="Resize sidebar"></div>
//     <div data-resize-target="panel">…</div>
//   </div>
//
// Panels and handles alternate inside one flex container. Sizes are percentages of
// the group ("30") or pixels ("240px"). Groups can be nested freely: put another
// data-controller="resize" inside a panel.
//
// Panels are pure layout boxes: keep padding and borders (along the resize axis)
// on an element inside the panel, otherwise the sizes will be slightly off.
//
// Per-panel options (data attributes on the panel):
//   data-resize-default-size     Initial size. Panels without one share what is left.
//   data-resize-min-size         Smallest size the panel can be dragged to.
//   data-resize-max-size         Largest size the panel can be dragged to.
//   data-resize-collapsible      Snap the panel closed when dragged past half of its min size.
//   data-resize-collapsed-size   Size while collapsed (default 0, e.g. "56px" for an icon rail).
//
// Actions: resize#toggle, resize#collapse, resize#expand, resize#reset, resize#set.
// Events:  resize:change (every frame while dragging), resize:commit (once per finished
//          interaction: the one to use for saving). Both carry { sizes, collapsed, panels }.
//
// Panels without an id get one, handles get aria-controls, and buttons that collapse a
// panel get aria-expanded kept in sync.

const PRECISION = 0.01;
const DOUBLE_TAP_MS = 350;
const EASING = "cubic-bezier(0.25, 1, 0.5, 1)";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const sum = (numbers) => numbers.reduce((total, number) => total + number, 0);

export default class extends Controller {
  static targets = ["panel", "handle", "size"];
  static values = {
    orientation: { type: String, default: "horizontal" }, // "horizontal" (side by side) or "vertical" (stacked)
    storageKey: String, // Persist the layout under this key
    storage: { type: String, default: "local" }, // "local" (localStorage) or "cookie" (readable by Rails)
    keyboardStep: { type: Number, default: 5 }, // Percent moved per arrow key press (x3 with Shift)
  };

  connect() {
    this.drag = null;
    this.frame = null;
    this.lastTap = null;
    this.transitionTimer = null;
    this.cursorHandle = null;
    this.remembered = []; // Size of each panel before it was collapsed

    // One set of delegated listeners covers every handle in the group.
    this.listeners = {
      pointerdown: this.startDrag.bind(this),
      pointermove: this.moveDrag.bind(this),
      pointerup: this.endDrag.bind(this),
      pointercancel: this.endDrag.bind(this),
      lostpointercapture: this.endDrag.bind(this),
      keydown: this.keydown.bind(this),
    };
    Object.entries(this.listeners).forEach(([type, listener]) => this.element.addEventListener(type, listener));
    // Switching windows mid-drag can swallow the pointerup, so end the drag there too.
    this.onWindowBlur = () => this.finishDrag();
    window.addEventListener("blur", this.onWindowBlur);

    this.handleTargets.forEach((handle) => {
      if (!handle.hasAttribute("role")) handle.setAttribute("role", "separator");
      if (!handle.hasAttribute("tabindex")) handle.setAttribute("tabindex", "0");
      // A separator's orientation describes the line itself, which is perpendicular to the group.
      handle.setAttribute("aria-orientation", this.horizontal ? "vertical" : "horizontal");
      handle.style.touchAction = "none"; // Let touch drags resize instead of scrolling the page
    });

    // Every panel gets an id so handles and toggle buttons can point at it with aria-controls.
    this.panelTargets.forEach((panel) => {
      if (!panel.id) panel.id = `resize-panel-${Math.random().toString(36).slice(2, 10)}`;
    });

    this.measure();
    this.warnAboutSetup();
    this.layout = null;
    this.apply(this.restore() || this.defaults());
    this.committed = this.layout;
    // A group that starts hidden (modal, tab, collapsed section) has no size yet, so
    // pixel sizes can't be resolved. The first real measurement lays it out again.
    this.initialLayout = this.available > 0 ? null : this.layout;

    this.onStorage = (event) => this.syncFromStorage(event);
    window.addEventListener("storage", this.onStorage);

    // Pixel-based constraints are converted to percentages, so they need to be
    // re-evaluated whenever the group itself changes size.
    this.resizeObserver = new ResizeObserver(() => this.refresh());
    this.resizeObserver.observe(this.element);
  }

  disconnect() {
    this.finishDrag();
    this.resizeObserver?.disconnect();
    clearTimeout(this.transitionTimer);
    this.panelTargets.forEach((panel) => (panel.style.transition = ""));
    Object.entries(this.listeners).forEach(([type, listener]) => this.element.removeEventListener(type, listener));
    window.removeEventListener("blur", this.onWindowBlur);
    window.removeEventListener("storage", this.onStorage);
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  // data-action="resize#toggle" data-resize-panel-param="0" (panel index, or the panel's id)
  toggle(event) {
    const index = this.panelIndex(event?.params?.panel);
    if (index < 0) return;
    this.layout.collapsed[index] ? this.expandPanel(index) : this.collapsePanel(index);
  }

  collapse(event) {
    const index = this.panelIndex(event?.params?.panel);
    if (index >= 0) this.collapsePanel(index);
  }

  expand(event) {
    const index = this.panelIndex(event?.params?.panel);
    if (index >= 0) this.expandPanel(index);
  }

  // Back to the default sizes. Also triggered by double-clicking (or double-tapping) a handle.
  reset() {
    this.measure();
    this.remembered = [];
    this.transition();
    this.apply(this.defaults());
    this.commit({ persist: false });
    this.forget();
  }

  // data-action="resize#set" data-resize-sizes-param="[30, 70]"
  // One size per panel, as percentages or pixel strings ("240px"). A collapsible panel
  // given its collapsed size (or less) is collapsed. Also callable from JS: setSizes([30, 70]).
  set(event) {
    this.setSizes(event?.params?.sizes);
  }

  setSizes(sizes) {
    if (!Array.isArray(sizes) || sizes.length !== this.panelTargets.length) {
      console.warn(`[resize] setSizes expects ${this.panelTargets.length} sizes, one per panel. Got:`, sizes);
      return;
    }

    this.measure();
    const limits = this.constraints;
    const wanted = sizes.map((size, i) => this.percent(String(size), this.layout.sizes[i]));
    const collapsed = wanted.map((size, i) => limits[i].collapsible && size <= limits[i].collapsedSize + PRECISION);

    this.transition();
    this.apply(this.fit({ sizes: wanted, collapsed }));
    this.commit();
  }

  // ---------------------------------------------------------------------------
  // Pointer dragging
  // ---------------------------------------------------------------------------

  startDrag(event) {
    const handle = this.handleFrom(event);
    if (!handle || event.button !== 0 || this.drag) return;

    // Stops text selection and the compatibility mouse events from kicking in.
    event.preventDefault();

    if (this.lastTap && this.lastTap.handle === handle && event.timeStamp - this.lastTap.time < DOUBLE_TAP_MS) {
      this.lastTap = null;
      this.reset();
      return;
    }

    this.measure();
    if (this.available <= 0) return;

    // Pointer capture keeps the drag alive when the cursor leaves the handle,
    // crosses an iframe, or leaves the window entirely.
    try {
      handle.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic events (tests) have no active pointer to capture.
    }
    // Deliberately no handle.focus(): like most apps, a mouse or touch drag leaves focus
    // where it was (an editor keeps its cursor) and the handle returns to its idle look
    // on release. Keyboard users reach handles with Tab.

    this.drag = {
      handle,
      index: this.handleTargets.indexOf(handle),
      pointerId: event.pointerId,
      origin: this.coordinate(event),
      position: this.coordinate(event),
      start: this.layout, // Every move is resolved from here, so the handle never drifts from the cursor
      direction: this.horizontal && getComputedStyle(this.element).direction === "rtl" ? -1 : 1,
      moved: false,
    };

    handle.setAttribute("data-dragging", "");
    this.element.setAttribute("data-resizing", "");
    this.lockCursor();
  }

  moveDrag(event) {
    if (!this.drag || event.pointerId !== this.drag.pointerId) return;

    // No button held any more: the release happened somewhere we never heard
    // about (another window, the desktop). Stop instead of resizing on hover.
    if (event.pointerType === "mouse" && event.buttons === 0) {
      this.finishDrag();
      return;
    }

    this.drag.position = this.coordinate(event);
    this.drag.moved = true;
    this.frame ||= requestAnimationFrame(() => this.updateDrag());
  }

  updateDrag() {
    this.frame = null;
    if (!this.drag) return;

    const { index, origin, position, start, direction } = this.drag;
    const delta = (((position - origin) * direction) / this.available) * 100;
    const next = this.resolve(start, index, delta);

    // Snapping a panel open or closed mid-drag gets a short transition so it doesn't jump.
    if (next.collapsed.some((collapsed, i) => collapsed !== this.layout.collapsed[i])) this.transition(150);
    this.apply(next);

    // Show a one-directional cursor when the handle can't travel any further.
    const travelled = next.sizes[index] - start.sizes[index];
    const blocked = Math.abs(delta - travelled) > 0.5 ? Math.sign(delta) * direction : 0;
    this.lockCursor(blocked);
  }

  endDrag(event) {
    if (!this.drag || event.pointerId !== this.drag.pointerId) return;

    if (!this.drag.moved && event.type === "pointerup") {
      this.lastTap = { handle: this.drag.handle, time: event.timeStamp };
    }
    this.finishDrag();
  }

  finishDrag({ revert = false } = {}) {
    if (!this.drag) return;

    const { handle, pointerId, start } = this.drag;
    if (this.frame) {
      cancelAnimationFrame(this.frame);
      this.updateDrag();
    }
    this.drag = null;

    if (handle.hasPointerCapture?.(pointerId)) handle.releasePointerCapture(pointerId);
    handle.removeAttribute("data-dragging");
    this.element.removeAttribute("data-resizing");
    this.unlockCursor();

    if (revert) {
      this.transition();
      this.apply(start);
    }
    this.commit();
  }

  // ---------------------------------------------------------------------------
  // Keyboard
  // ---------------------------------------------------------------------------

  keydown(event) {
    const handle = this.handleFrom(event);
    if (!handle || event.target !== handle) return;

    if (this.drag) {
      if (event.key === "Escape") this.finishDrag({ revert: true });
      return;
    }
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    const index = this.handleTargets.indexOf(handle);
    const step = this.keyboardStepValue * (event.shiftKey ? 3 : 1);
    const rtl = this.horizontal && getComputedStyle(this.element).direction === "rtl" ? -1 : 1;
    const [backward, forward] = this.horizontal ? ["ArrowLeft", "ArrowRight"] : ["ArrowUp", "ArrowDown"];

    this.measure();
    let next = null;

    switch (event.key) {
      case backward:
        next = this.resolve(this.layout, index, -step * rtl, { snap: true });
        break;
      case forward:
        next = this.resolve(this.layout, index, step * rtl, { snap: true });
        break;
      case "Home":
        next = this.resolve(this.layout, index, -100, { snap: true });
        break;
      case "End":
        next = this.resolve(this.layout, index, 100, { snap: true });
        break;
      case "Enter": {
        // Toggle the collapsible panel next to this handle (the one before it wins).
        const panel = [index, index + 1].find((i) => this.constraints[i].collapsible);
        if (panel === undefined) return;
        event.preventDefault();
        this.layout.collapsed[panel] ? this.expandPanel(panel) : this.collapsePanel(panel);
        return;
      }
      default:
        return;
    }

    event.preventDefault();
    // Key presses repeat, so plain steps are instant. Only snapping open or closed is animated.
    if (next.collapsed.some((collapsed, i) => collapsed !== this.layout.collapsed[i])) this.transition();
    this.apply(next);
    this.commit();
  }

  // ---------------------------------------------------------------------------
  // Layout
  // ---------------------------------------------------------------------------

  // Returns the layout you get by moving handle `index` by `delta` percent,
  // starting from `from`. A positive delta grows the panel before the handle.
  //
  // The growing panel takes space from the panel on the other side of the
  // handle first, then from the ones behind it once that one hits its minimum.
  // Collapsible panels snap closed past the halfway point between their minimum
  // and collapsed size (`snap: true` skips the halfway rule for the keyboard).
  resolve(from, index, delta, { snap = false } = {}) {
    if (Math.abs(delta) < PRECISION) return from;

    const limits = this.constraints;
    const sizes = [...from.sizes];
    const collapsed = [...from.collapsed];
    const direction = delta > 0 ? 1 : -1;
    const growing = delta > 0 ? index : index + 1;
    const shrinking = delta > 0 ? index + 1 : index;
    let wanted = Math.abs(delta);

    // A collapsed panel pops open to its minimum size once dragged far enough.
    const opening = collapsed[growing];
    const gap = limits[growing].min - limits[growing].collapsedSize;
    if (opening) {
      if (!snap && wanted < gap / 2) return from;
      wanted = Math.max(wanted, gap);
    }
    wanted = Math.min(wanted, limits[growing].max - sizes[growing]);

    let taken = 0;
    for (let i = shrinking; i >= 0 && i < sizes.length && wanted - taken > PRECISION; i += direction) {
      if (collapsed[i]) continue;

      const room = sizes[i] - limits[i].min;
      let take = Math.min(room, wanted - taken);

      if (i === shrinking && limits[i].collapsible) {
        const overshoot = wanted - taken - take;
        const closing = snap ? room < PRECISION : overshoot > (limits[i].min - limits[i].collapsedSize) / 2;
        const closed = sizes[i] - limits[i].collapsedSize;

        if (closing && sizes[growing] + closed <= limits[growing].max + PRECISION) {
          take = closed;
          collapsed[i] = true;
        }
        sizes[i] -= take;
        taken += take;
        break; // A collapsible panel absorbs the drag instead of pushing its neighbours
      }

      sizes[i] -= take;
      taken += take;
    }

    if (opening) {
      if (taken < gap - PRECISION) return from; // Not enough room to open
      collapsed[growing] = false;
    }
    sizes[growing] += taken;

    return { sizes, collapsed };
  }

  // Clamps every panel to its constraints and makes the sizes add up to 100 again.
  fit({ sizes, collapsed }) {
    const limits = this.constraints;
    sizes = sizes.map((size, i) => (collapsed[i] ? limits[i].collapsedSize : clamp(size, limits[i].min, limits[i].max)));

    // Hand the difference to the largest panels first.
    let rest = 100 - sum(sizes);
    const order = sizes
      .map((_, i) => i)
      .filter((i) => !collapsed[i])
      .sort((a, b) => sizes[b] - sizes[a]);

    for (const i of order) {
      if (Math.abs(rest) < PRECISION) break;
      const size = clamp(sizes[i] + rest, limits[i].min, limits[i].max);
      rest -= size - sizes[i];
      sizes[i] = size;
    }
    // The constraints can't all be satisfied (e.g. a very narrow screen): the largest panel gives.
    if (Math.abs(rest) >= PRECISION && order.length) sizes[order[0]] = Math.max(sizes[order[0]] + rest, 0);

    return { sizes, collapsed: [...collapsed] };
  }

  defaults() {
    const given = this.constraints.map((limit) => limit.defaultSize);
    const blanks = given.filter((size) => size === null).length;
    const share = blanks ? Math.max(100 - sum(given.filter((size) => size !== null)), 0) / blanks : 0;

    return this.fit({
      sizes: given.map((size) => (size === null ? share : size)),
      collapsed: given.map(() => false),
    });
  }

  // Writes a layout to the DOM: flex sizes, state attributes, ARIA values and size labels.
  apply(layout) {
    const previous = this.layout;
    const limits = this.constraints;
    this.layout = layout;

    this.panelTargets.forEach((panel, i) => {
      const collapsed = layout.collapsed[i];
      if (collapsed && previous && !previous.collapsed[i]) {
        this.remembered[i] = (this.drag ? this.drag.start : previous).sizes[i];
      }

      // flex-grow does the work, so the browser keeps the proportions on window resize for free.
      panel.style.flex = `${layout.sizes[i].toFixed(3)} 1 0px`;
      panel.toggleAttribute("data-collapsed", collapsed);
      // Fully hidden panels shouldn't keep their links and buttons in the tab order.
      panel.inert = collapsed && limits[i].collapsedSize < PRECISION;
    });

    this.handleTargets.forEach((handle, i) => {
      const others = sum(limits.map((limit, j) => (j === i ? 0 : limit.collapsedSize)));
      handle.setAttribute("aria-valuenow", Math.round(layout.sizes[i]));
      handle.setAttribute("aria-valuemin", Math.round(limits[i].collapsedSize));
      handle.setAttribute("aria-valuemax", Math.round(Math.min(limits[i].max, 100 - others)));
      handle.setAttribute("aria-controls", this.panelTargets[i].id);
    });

    this.syncTriggers();

    // Optional live labels: <span data-resize-target="size"></span> inside a panel.
    this.sizeTargets.forEach((label) => {
      const i = this.panelTargets.indexOf(label.closest('[data-resize-target~="panel"]'));
      if (i >= 0) label.textContent = `${Math.round(layout.sizes[i])}%`;
    });

    // Fires on every frame of a drag. Use resize:commit to save or sync the layout.
    if (previous && !this.same(previous, layout)) this.dispatch("change", { detail: this.detail() });
  }

  // Called once an interaction is finished (drag released, key pressed, panel toggled, …).
  commit({ persist = true } = {}) {
    if (this.committed && this.same(this.committed, this.layout)) return;
    this.committed = this.layout;
    if (persist) this.save();
    this.dispatch("commit", { detail: this.detail() });
  }

  detail() {
    return {
      sizes: [...this.layout.sizes],
      collapsed: [...this.layout.collapsed],
      panels: this.panelTargets.map((panel) => panel.id),
    };
  }

  // Keeps aria-expanded (and aria-controls) up to date on buttons that collapse a panel:
  // anything with aria-controls pointing at a collapsible panel, anywhere on the page,
  // plus resize#toggle buttons inside the group.
  syncTriggers() {
    const limits = this.constraints;
    const own = (element) => element.closest('[data-controller~="resize"]') === this.element;

    this.element.querySelectorAll('[data-action*="resize#toggle"]').forEach((trigger) => {
      if (!own(trigger) || trigger.hasAttribute("aria-controls")) return;
      const raw = trigger.getAttribute("data-resize-panel-param");
      const index = this.panelIndex(raw && /^\d+$/.test(raw) ? Number(raw) : raw);
      if (index >= 0) trigger.setAttribute("aria-controls", this.panelTargets[index].id);
    });

    this.panelTargets.forEach((panel, i) => {
      if (!limits[i].collapsible) return;
      document.querySelectorAll(`[aria-controls~="${CSS.escape(panel.id)}"]`).forEach((trigger) => {
        if (trigger.matches('[data-resize-target~="handle"]')) return;
        trigger.setAttribute("aria-expanded", String(!this.layout.collapsed[i]));
      });
    });
  }

  // Re-checks the layout after the group changed size (window resize, parent panel dragged, …).
  refresh() {
    if (this.drag) return;
    this.measure();
    if (this.available <= 0) return;

    if (this.initialLayout) {
      const untouched = this.same(this.initialLayout, this.layout);
      this.initialLayout = null;
      if (untouched) {
        this.apply(this.restore() || this.defaults());
        this.committed = this.layout;
        return;
      }
    }

    const next = this.fit(this.layout);
    if (!this.same(next, this.layout)) this.apply(next);
  }

  collapsePanel(index) {
    this.measure();
    const limit = this.constraints[index];
    if (!limit.collapsible || this.layout.collapsed[index]) return;

    // Use the handle after the panel, except for the last panel.
    const last = index === this.panelTargets.length - 1;
    const distance = this.layout.sizes[index] - limit.collapsedSize;
    this.transition();
    this.apply(this.resolve(this.layout, last ? index - 1 : index, last ? distance : -distance));
    this.commit();
  }

  expandPanel(index) {
    this.measure();
    const limit = this.constraints[index];
    if (!this.layout.collapsed[index]) return;

    const last = index === this.panelTargets.length - 1;
    const target = clamp(this.remembered[index] || limit.defaultSize || limit.min, limit.min, limit.max);
    const distance = Math.max(target - limit.collapsedSize, PRECISION * 2);
    this.transition();
    this.apply(this.resolve(this.layout, last ? index - 1 : index, last ? -distance : distance, { snap: true }));
    this.commit();
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  get horizontal() {
    return this.orientationValue !== "vertical";
  }

  // Reads the available space and converts every panel's constraints to percentages.
  measure() {
    this.available = sum(
      this.panelTargets.map((panel) => {
        const rect = panel.getBoundingClientRect();
        return this.horizontal ? rect.width : rect.height;
      }),
    );

    this.constraints = this.panelTargets.map((panel) => {
      const data = panel.dataset;
      const collapsible = "resizeCollapsible" in data && data.resizeCollapsible !== "false";
      const min = clamp(this.percent(data.resizeMinSize, 0), 0, 100);

      return {
        min,
        max: clamp(this.percent(data.resizeMaxSize, 100), min, 100),
        collapsible,
        collapsedSize: collapsible ? Math.min(this.percent(data.resizeCollapsedSize, 0), min) : min,
        defaultSize: this.percent(data.resizeDefaultSize, null),
      };
    });
  }

  // "30" → 30, "240px" → 240 pixels as a percentage of the available space.
  percent(value, fallback) {
    if (value === undefined || value === "") return fallback;
    const number = parseFloat(value);
    if (Number.isNaN(number)) return fallback;
    if (!value.trim().endsWith("px")) return number;
    return this.available > 0 ? (number / this.available) * 100 : fallback;
  }

  coordinate(event) {
    return this.horizontal ? event.clientX : event.clientY;
  }

  // The handle an event came from, ignoring handles that belong to nested groups.
  handleFrom(event) {
    const handle = event.target.closest?.('[data-resize-target~="handle"]');
    return handle && this.handleTargets.includes(handle) ? handle : null;
  }

  panelIndex(param) {
    if (param === undefined || param === null || param === "") return this.constraints.findIndex((limit) => limit.collapsible);
    if (typeof param === "number") return param < this.panelTargets.length ? param : -1;
    return this.panelTargets.findIndex((panel) => panel.id === param);
  }

  same(a, b) {
    return (
      a.sizes.length === b.sizes.length &&
      a.sizes.every((size, i) => Math.abs(size - b.sizes[i]) < PRECISION && a.collapsed[i] === b.collapsed[i])
    );
  }

  // Animates the next layout change. Dragging itself is never animated.
  transition(duration = 220) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    clearTimeout(this.transitionTimer);
    this.panelTargets.forEach((panel) => (panel.style.transition = `flex-grow ${duration}ms ${EASING}`));
    this.transitionTimer = setTimeout(() => {
      this.panelTargets.forEach((panel) => (panel.style.transition = ""));
    }, duration + 50);
  }

  // Shows a one-directional cursor on the dragged handle when it can't travel further.
  // Pointer capture makes the browser show the handle's cursor wherever the pointer is,
  // and the prevented pointerdown stops text selection, so nothing global is needed.
  // (A page-wide `* { cursor }` rule restyles every element: 50ms+ on large pages.)
  lockCursor(blocked = 0) {
    const handle = this.drag?.handle;
    if (!handle) return;
    const cursors = this.horizontal ? ["e-resize", "col-resize", "w-resize"] : ["s-resize", "row-resize", "n-resize"];
    const cursor = cursors[blocked + 1];
    if (handle.style.cursor === cursor) return;
    handle.style.cursor = cursor;
    this.cursorHandle = handle;
  }

  unlockCursor() {
    if (this.cursorHandle) this.cursorHandle.style.cursor = "";
    this.cursorHandle = null;
  }

  // ---------------------------------------------------------------------------
  // Persistence
  // ---------------------------------------------------------------------------
  //
  // Saved as {"sizes":[30,70],"collapsed":[false,false],"v":"…"}. "v" fingerprints the
  // panels' size options, so a saved layout is ignored once you change the defaults or limits.
  // With data-resize-storage-value="cookie" the same JSON goes into a cookie named after the
  // storage key, so Rails can read it and render the saved sizes on the server.

  get cookieName() {
    return this.storageKeyValue.replace(/[^\w-]/g, "_");
  }

  get signature() {
    const options = this.panelTargets
      .map((panel) => {
        const data = panel.dataset;
        // Missing attributes count as "-", so adding an empty data-resize-collapsible changes it too.
        return [data.resizeDefaultSize, data.resizeMinSize, data.resizeMaxSize, data.resizeCollapsible, data.resizeCollapsedSize]
          .map((value) => value ?? "-")
          .join(",");
      })
      .join("|");
    let hash = 5381;
    for (let i = 0; i < options.length; i++) hash = ((hash << 5) + hash + options.charCodeAt(i)) | 0;
    return (hash >>> 0).toString(36);
  }

  save() {
    if (!this.storageKeyValue) return;
    const data = JSON.stringify({
      sizes: this.layout.sizes.map((size) => Math.round(size * 100) / 100),
      collapsed: this.layout.collapsed,
      v: this.signature,
    });
    try {
      if (this.storageValue === "cookie") {
        const secure = location.protocol === "https:" ? "; Secure" : "";
        document.cookie = `${this.cookieName}=${encodeURIComponent(data)}; path=/; max-age=31536000; SameSite=Lax${secure}`;
      } else {
        localStorage.setItem(this.storageKeyValue, data);
      }
    } catch {
      // Storage can be unavailable (private mode, quota); the layout just won't persist.
    }
  }

  read() {
    if (this.storageValue === "cookie") {
      const prefix = `${this.cookieName}=`;
      const cookie = document.cookie.split("; ").find((part) => part.startsWith(prefix));
      return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
    }
    return localStorage.getItem(this.storageKeyValue);
  }

  restore() {
    if (!this.storageKeyValue) return null;
    try {
      const saved = JSON.parse(this.read());
      const count = this.panelTargets.length;
      const valid =
        Array.isArray(saved?.sizes) &&
        Array.isArray(saved?.collapsed) &&
        saved.sizes.length === count &&
        saved.collapsed.length === count &&
        saved.sizes.every((size) => Number.isFinite(size)) &&
        (saved.v === undefined || saved.v === this.signature);
      if (!valid) return null;

      return this.fit({
        sizes: saved.sizes,
        collapsed: saved.collapsed.map((collapsed, i) => Boolean(collapsed) && this.constraints[i].collapsible),
      });
    } catch {
      return null;
    }
  }

  forget() {
    if (!this.storageKeyValue) return;
    try {
      if (this.storageValue === "cookie") {
        document.cookie = `${this.cookieName}=; path=/; max-age=0; SameSite=Lax`;
      } else {
        localStorage.removeItem(this.storageKeyValue);
      }
    } catch {
      // Nothing to clean up.
    }
  }

  // Another tab saved a new layout under the same key: follow along.
  syncFromStorage(event) {
    if (!this.storageKeyValue || this.storageValue === "cookie" || event.key !== this.storageKeyValue || this.drag) return;
    this.measure();
    if (this.available <= 0) return;

    const next = event.newValue === null ? this.defaults() : this.restore();
    if (!next || this.same(next, this.layout)) return;
    this.transition();
    this.apply(next);
    this.committed = this.layout;
  }

  // ---------------------------------------------------------------------------
  // Setup warnings
  // ---------------------------------------------------------------------------

  // Catches the usual copy-paste mistakes early, with the element to look at.
  warnAboutSetup() {
    const warn = (message, element = this.element) => console.warn(`[resize] ${message}`, element);
    const panels = this.panelTargets;
    const handles = this.handleTargets;

    if (handles.length !== panels.length - 1) {
      warn(`Found ${panels.length} panel(s) and ${handles.length} handle(s). Panels and handles must alternate, with one handle between each pair of panels.`);
    }

    const container = panels[0]?.parentElement;
    if ([...panels, ...handles].some((element) => element.parentElement !== container)) {
      warn("Panels and handles must be direct children of the same flex container.");
    } else if (container && !getComputedStyle(container).display.includes("flex")) {
      warn(`The element holding the panels must be a flex container (add "flex${this.horizontal ? "" : " flex-col"}").`, container);
    }

    const sides = this.horizontal ? ["Left", "Right"] : ["Top", "Bottom"];
    panels.forEach((panel) => {
      const style = getComputedStyle(panel);
      const extra = sides.reduce((total, side) => total + (parseFloat(style[`padding${side}`]) || 0) + (parseFloat(style[`border${side}Width`]) || 0), 0);
      if (extra > 0) warn("Panels should not have padding or borders along the resize direction. Put them on an element inside the panel, or the sizes will be off.", panel);

      const { resizeMinSize: min, resizeMaxSize: max } = panel.dataset;
      if (min && max && min.trim().endsWith("px") === max.trim().endsWith("px") && parseFloat(min) > parseFloat(max)) {
        warn(`data-resize-min-size (${min}) is larger than data-resize-max-size (${max}).`, panel);
      }
    });

    const defaults = this.constraints.map((limit) => limit.defaultSize).filter((size) => size !== null);
    if (sum(defaults) > 100 + PRECISION) warn(`The default sizes add up to ${Math.round(sum(defaults))}%, more than 100%.`);

    handles.forEach((handle) => {
      if (!handle.hasAttribute("aria-label") && !handle.hasAttribute("aria-labelledby")) {
        warn('Give each handle an aria-label (for example "Resize sidebar") so screen readers can name it.', handle);
      }
    });
  }
}
