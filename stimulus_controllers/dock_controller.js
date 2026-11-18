import { Controller } from "@hotwired/stimulus";
import { animate, stagger, spring, transform } from "motion";

const ICON_REST_SIZE = 40;
const ICON_MAX_SIZE = 80;
const MAGNIFY_RANGE = 150; // px from an icon's center where it starts to grow

// Maps the pointer's distance from an icon to that icon's size.
const iconSizeFor = transform([-MAGNIFY_RANGE, 0, MAGNIFY_RANGE], [ICON_REST_SIZE, ICON_MAX_SIZE, ICON_REST_SIZE]);

const TOOLTIP_BASE_CLASSES =
  "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap px-1.5 py-1 text-xs font-medium text-neutral-900 bg-white border border-neutral-200/70 rounded-md shadow-sm opacity-0 dark:bg-neutral-800 dark:border-neutral-600/50 dark:text-neutral-100";
const TOOLTIP_PLACEMENT_CLASSES = {
  top: "bottom-full mb-2",
  bottom: "top-full mt-2",
};
const TOOLTIP_HOTKEY_CLASSES =
  "capitalize text-[10px] font-semibold ml-0.5 px-1 py-px bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded";

const DESKTOP_ACTIVE_CLASSES =
  "text-neutral-50 dark:text-neutral-800 bg-neutral-800 dark:bg-neutral-100 active:bg-neutral-700 dark:active:bg-neutral-200";
const DESKTOP_INACTIVE_CLASSES =
  "text-neutral-500 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-800 active:bg-neutral-300 dark:active:bg-neutral-700";
const MOBILE_ACTIVE_CLASSES =
  "text-neutral-50 dark:text-neutral-800 hover:text-neutral-50 dark:hover:text-neutral-800 bg-neutral-800 dark:bg-neutral-100 active:bg-neutral-700 dark:active:bg-neutral-200";
const MOBILE_INACTIVE_CLASSES =
  "text-neutral-500 dark:text-neutral-300 hover:text-neutral-500 dark:hover:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 active:bg-neutral-100 dark:active:bg-neutral-700";

export default class extends Controller {
  static targets = ["icon", "mobileMenu", "mobileButton", "mobileGlow"];

  // A dock is often marked data-turbo-permanent, so Turbo moves it into each new page and
  // disconnects/reconnects this controller on every visit. One-time setup lives here so it
  // runs once and the element listeners aren't stacked on each reconnect.
  initialize() {
    this.isToggling = false;
    this.initDesktopHover();
    this.initTooltips();
  }

  connect() {
    this.updateActiveMenu();

    this.updateActiveMenuBound = () => this.updateActiveMenu();
    document.addEventListener("turbo:load", this.updateActiveMenuBound);

    // Highlight the destination right away instead of waiting for the page to arrive.
    this.highlightVisitBound = (event) => this.updateActiveMenu(new URL(event.detail.url, window.location.origin));
    document.addEventListener("turbo:visit", this.highlightVisitBound);

    // On a permanent dock, a clicked icon keeps focus across pages and shows a focus ring
    // on the next keypress. Drop it like a full page load would.
    this.releaseFocusBound = () => {
      if (this.element.contains(document.activeElement)) document.activeElement.blur();
    };
    document.addEventListener("turbo:load", this.releaseFocusBound);
  }

  disconnect() {
    document.removeEventListener("turbo:load", this.updateActiveMenuBound);
    document.removeEventListener("turbo:visit", this.highlightVisitBound);
    document.removeEventListener("turbo:load", this.releaseFocusBound);
  }

  // Desktop magnification
  initDesktopHover() {
    this.mouseX = Infinity;
    this.iconSizes = this.iconTargets.map(() => ICON_REST_SIZE);
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameRequest = null;

    // At most one update per frame, however often mousemove fires.
    const scheduleUpdate = () => {
      frameRequest ??= requestAnimationFrame(() => {
        frameRequest = null;
        this.updateIconAnimations();
      });
    };

    this.element.addEventListener("mouseenter", () => this.measureRestCenters());
    this.element.addEventListener("mousemove", (event) => {
      this.mouseX = event.clientX;
      scheduleUpdate();
    });
    this.element.addEventListener("mouseleave", () => {
      this.mouseX = Infinity;
      scheduleUpdate();
    });
  }

  // Where each icon's center sits when nothing is magnified. The row stays centered while it
  // grows, so these hold during a hover and the per-frame update never has to read layout.
  measureRestCenters() {
    const icons = this.iconTargets;
    const row = icons[0]?.parentElement;
    if (!row) return;

    const rowRect = row.getBoundingClientRect();
    const rowCenter = rowRect.left + rowRect.width / 2;
    const step = ICON_REST_SIZE + (parseFloat(getComputedStyle(row).columnGap) || 0);
    this.restCenters = icons.map((_, index) => rowCenter + (index - (icons.length - 1) / 2) * step);
  }

  updateIconAnimations() {
    if (!this.restCenters) this.measureRestCenters();
    if (!this.restCenters) return;

    const magnify = !this.reducedMotion.matches;

    this.iconTargets.forEach((icon, index) => {
      const targetSize = magnify ? Math.round(iconSizeFor(this.mouseX - this.restCenters[index])) : ICON_REST_SIZE;
      // Skip icons whose target hasn't changed, so the spring isn't restarted every frame.
      if (this.iconSizes[index] === targetSize) return;
      this.iconSizes[index] = targetSize;

      const iconElement = icon.firstElementChild;
      if (!iconElement) return;

      animate(
        iconElement,
        { width: `${targetSize}px`, height: `${targetSize}px` },
        { type: spring, stiffness: 950, damping: 120, mass: 0.7, restDelta: 0.1 },
      );
    });
  }

  // Mobile menu
  async toggleMobile(event) {
    if (this.isToggling || !this.hasMobileMenuTarget) return;
    this.isToggling = true;

    // A tap shouldn't leave a focus ring behind once a key is pressed.
    if (event?.detail && this.hasMobileButtonTarget) this.mobileButtonTarget.blur();

    const isOpening = this.mobileMenuTarget.classList.contains("hidden");
    if (this.hasMobileButtonTarget) this.mobileButtonTarget.setAttribute("aria-expanded", isOpening);

    if (isOpening) {
      this.mobileMenuTarget.classList.remove("hidden");
      if (this.hasMobileGlowTarget) this.mobileGlowTarget.classList.remove("hidden");
      this.mobileMenuTarget.style.pointerEvents = "auto";
    } else {
      // Disable pointer events right away so items can't be hovered while they fade out.
      this.mobileMenuTarget.style.pointerEvents = "none";
    }

    await new Promise((resolve) => requestAnimationFrame(resolve));
    await Promise.all([
      this.animateMobileMenu(isOpening),
      this.rotateMobileButton(isOpening),
      this.animateMobileGlow(isOpening),
    ]);

    if (!isOpening) {
      this.mobileMenuTarget.classList.add("hidden");
      if (this.hasMobileGlowTarget) this.mobileGlowTarget.classList.add("hidden");
    }
    this.isToggling = false;
  }

  animateMobileMenu(isOpening) {
    const menuItems = Array.from(this.mobileMenuTarget.children);
    const properties = {
      opacity: [isOpening ? 0 : 1, isOpening ? 1 : 0],
      y: [isOpening ? 20 : 0, isOpening ? 0 : 10],
      scale: [isOpening ? 0.9 : 1, isOpening ? 1 : 0.95],
    };

    const options = isOpening
      ? { delay: stagger(0.01, { start: 0.1, from: "first" }), duration: 0.3, type: spring, stiffness: 500, damping: 25, mass: 1.5 }
      : { delay: stagger(0.01, { from: "last" }), duration: 0.1, type: spring, stiffness: 400, damping: 45, mass: 1.5 };

    const animations = animate(menuItems, properties, options);
    return Array.isArray(animations) ? Promise.all(animations.map((a) => a.finished)) : animations.finished;
  }

  // The glow blooms out of the button corner on open and sinks back into it on close.
  animateMobileGlow(isOpening) {
    if (!this.hasMobileGlowTarget) return Promise.resolve();

    return animate(
      this.mobileGlowTarget,
      { opacity: isOpening ? 1 : 0, scale: isOpening ? [0.4, 1] : 0.6 },
      isOpening ? { type: spring, stiffness: 260, damping: 26, mass: 1 } : { duration: 0.18, ease: "easeIn" },
    ).finished;
  }

  rotateMobileButton(isOpening) {
    const buttonIcon = this.hasMobileButtonTarget && this.mobileButtonTarget.querySelector("svg");
    if (!buttonIcon) return Promise.resolve();

    return animate(
      buttonIcon,
      { rotate: isOpening ? "180deg" : "0deg" },
      { type: spring, stiffness: 1150, damping: 80, mass: 5, restDelta: 0.1 },
    ).finished;
  }

  // One shared tooltip that moves into whichever icon is hovered. CSS anchors it above (or
  // below) the icon, so it follows the icon as it grows without any per-frame positioning.
  //
  // It shows while an icon is hovered or keyboard-focused. Turbo moving the permanent dock into the next
  // page blurs and refocuses the clicked icon, and turbo:load then blurs it for good. The pointer
  // never left, so those don't count: events during the swap are ignored, and a blur only hides
  // the tooltip once the icon isn't hovered either.
  initTooltips() {
    this.tooltip = document.createElement("div");
    this.tooltip.setAttribute("role", "tooltip");
    this.hoveredIcon = null;
    this.focusedIcon = null;
    this.tooltipIcon = null;
    this.isRendering = false;

    const track = (icon, key, value) => {
      if (this.isRendering) return;
      this[key] = value ? icon : this[key] === icon ? null : this[key];
      this.syncTooltip();
    };

    this.iconTargets.forEach((icon) => {
      icon.addEventListener("mouseenter", () => track(icon, "hoveredIcon", true));
      icon.addEventListener("mouseleave", () => track(icon, "hoveredIcon", false));
      // Keyboard focus only: a click focuses the link too, and that shouldn't hold the tooltip open.
      icon.addEventListener("focus", () => track(icon, "focusedIcon", icon.matches(":focus-visible")));
      icon.addEventListener("blur", () => track(icon, "focusedIcon", false));
    });

    document.addEventListener("turbo:before-render", () => (this.isRendering = true));
    document.addEventListener("turbo:render", () => (this.isRendering = false));
  }

  syncTooltip() {
    const icon = this.hoveredIcon || this.focusedIcon;
    if (icon) {
      this.showTooltip(icon);
    } else {
      this.hideTooltip();
    }
  }

  showTooltip(icon) {
    if (this.tooltipIcon === icon) return;
    this.tooltipIcon = icon;

    const label = icon.dataset.tooltip;
    if (!label) return;

    const placement = icon.dataset.tooltipPlacement === "bottom" ? "bottom" : "top";
    this.tooltip.className = `${TOOLTIP_BASE_CLASSES} ${TOOLTIP_PLACEMENT_CLASSES[placement]}`;
    this.tooltip.replaceChildren(document.createTextNode(label));

    const hotkey = icon.dataset.tooltipHotkey?.trim();
    if (hotkey) {
      const hotkeyBadge = document.createElement("span");
      hotkeyBadge.className = TOOLTIP_HOTKEY_CLASSES;
      hotkeyBadge.textContent = hotkey;
      this.tooltip.append(" ", hotkeyBadge);
    }

    icon.appendChild(this.tooltip);
    animate(this.tooltip, { opacity: 1 }, { duration: 0.3 });
  }

  hideTooltip() {
    if (!this.tooltipIcon) return;
    this.tooltipIcon = null;
    animate(this.tooltip, { opacity: 0 }, { duration: 0.1 });
  }

  // Highlights the item matching the given URL (the current location by default).
  // Items without search params match on pathname; items with them must match exactly.
  updateActiveMenu(location = window.location) {
    const matches = (anchor) => {
      try {
        const anchorUrl = new URL(anchor.getAttribute("href"), window.location.origin);
        if (anchorUrl.pathname !== location.pathname) return false;
        return anchorUrl.search === "" || anchorUrl.search === location.search;
      } catch {
        return false;
      }
    };

    const setState = (element, isActive, activeClasses, inactiveClasses) => {
      element.classList.remove(...(isActive ? inactiveClasses : activeClasses).split(" "));
      element.classList.add(...(isActive ? activeClasses : inactiveClasses).split(" "));
      if (isActive) {
        element.closest("a")?.setAttribute("aria-current", "page");
      } else {
        element.closest("a")?.removeAttribute("aria-current");
      }
    };

    this.iconTargets.forEach((anchor) => {
      const iconBox = anchor.firstElementChild;
      if (iconBox) setState(iconBox, matches(anchor), DESKTOP_ACTIVE_CLASSES, DESKTOP_INACTIVE_CLASSES);
    });

    if (this.hasMobileMenuTarget) {
      this.mobileMenuTarget.querySelectorAll("a").forEach((anchor) => {
        setState(anchor, matches(anchor), MOBILE_ACTIVE_CLASSES, MOBILE_INACTIVE_CLASSES);
      });
    }
  }
}
