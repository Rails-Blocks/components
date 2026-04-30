import { Controller } from "@hotwired/stimulus";
import { animate, stagger, spring, transform } from "motion";
import { computePosition, offset, flip, shift } from "@floating-ui/dom";

export default class extends Controller {
  static targets = ["icon", "mobileMenu", "mobileButton", "tooltip", "tooltipContent"];

  connect() {
    this.isToggling = false;
    this.initDesktopHover();
    this.initTooltips();

    // Update active menu styling on Turbo page loads.
    this.updateActiveMenu();
    this.updateActiveMenuBound = this.updateActiveMenu.bind(this);
    document.addEventListener("turbo:load", this.updateActiveMenuBound);

    // Restore any tooltip if still hovering during a Turbo transition.
    this.restoreTooltipBound = this.restoreTooltip.bind(this);
    document.addEventListener("turbo:load", this.restoreTooltipBound);
  }

  // Desktop hover animations
  initDesktopHover() {
    this.mouseX = Infinity;
    this.animations = new Map();

    // Debounce the animation frame request
    let frameRequest;
    const updateAnimations = () => {
      frameRequest = requestAnimationFrame(() => this.updateIconAnimations());
    };

    this.element.addEventListener("mousemove", (e) => {
      this.mouseX = e.pageX;
      if (frameRequest) {
        cancelAnimationFrame(frameRequest);
      }
      updateAnimations();
    });

    this.element.addEventListener("mouseleave", () => {
      this.mouseX = Infinity;
      if (frameRequest) {
        cancelAnimationFrame(frameRequest);
      }
      updateAnimations();
    });
  }

  updateIconAnimations() {
    // Add transform utility for smooth size mapping
    const sizeTransformer = transform(
      [-150, 0, 150], // Input range (distance from center)
      [40, 80, 40] // Output range (icon size)
    );

    this.iconTargets.forEach((icon) => {
      const rect = icon.getBoundingClientRect();
      const distance = this.mouseX - (rect.x + rect.width / 2);
      const targetSize = sizeTransformer(distance);
      const iconElement = icon.querySelector("div:first-child");
      if (!iconElement) return;

      // Use spring animation with proper physics parameters
      animate(
        iconElement,
        { width: `${targetSize}px`, height: `${targetSize}px` },
        {
          duration: 2,
          easing: "easeOut",
          type: spring,
          stiffness: 1150,
          damping: 80,
          mass: 0.7,
          restDelta: 0.1,
        }
      );
    });
  }

  // Mobile toggle functionality
  async toggleMobile() {
    if (this.isToggling) return;
    this.isToggling = true;
    const is_open = this.mobileMenuTarget.classList.contains("hidden");
    if (is_open) {
      // Opening: remove hidden immediately and enable interactions
      this.mobileMenuTarget.classList.remove("hidden");
      this.mobileMenuTarget.style.pointerEvents = "auto"; // re-enable pointer events
    } else {
      // Closing: disable pointer events immediately to prevent hover interactions
      this.mobileMenuTarget.style.pointerEvents = "none";
    }
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const menuPromise = this.animateMobileMenu(is_open);
    const buttonPromise = this.rotateMobileButton(is_open);
    await Promise.all([menuPromise, buttonPromise]);
    if (!is_open) {
      // Closing: add hidden once animation completes
      this.mobileMenuTarget.classList.add("hidden");
    }
    this.isToggling = false;
  }

  animateMobileMenu(is_open) {
    const menuItems = Array.from(this.mobileMenuTarget.children);
    const properties = {
      opacity: [is_open ? 0 : 1, is_open ? 1 : 0],
      y: [is_open ? 20 : 0, is_open ? 0 : 10],
      scale: [is_open ? 0.9 : 1, is_open ? 1 : 0.95],
    };

    const options = is_open
      ? {
          delay: stagger(0.01, { start: 0.1, from: "first" }),
          duration: 0.3,
          type: spring,
          stiffness: 500,
          damping: 25,
          mass: 1.5,
        }
      : {
          delay: stagger(0.01, { from: "last" }),
          duration: 0.1,
          type: spring,
          stiffness: 400,
          damping: 45,
          mass: 1.5,
        };

    const animations = animate(menuItems, properties, options);
    // If multiple elements are animated, wait for all animations to finish
    if (Array.isArray(animations)) {
      return Promise.all(animations.map((anim) => anim.finished));
    }
    return animations.finished;
  }

  rotateMobileButton(is_open) {
    const buttonIcon = this.mobileButtonTarget.querySelector("svg");
    if (!buttonIcon) return Promise.resolve();
    return animate(
      buttonIcon,
      { rotate: is_open ? "180deg" : "0deg" },
      {
        duration: 2,
        easing: "easeOut",
        type: spring,
        stiffness: 1150,
        damping: 80,
        mass: 5,
        restDelta: 0.1,
      }
    ).finished;
  }

  // Initialize tooltips for each icon
  initTooltips() {
    this.tooltip = document.createElement("div");
    this.tooltip.className =
      "absolute z-50 px-1.5 py-1 text-xs font-medium text-neutral-900 bg-white border border-neutral-200/70 rounded-md shadow-sm opacity-0 dark:bg-neutral-800 dark:border-neutral-600/50 dark:text-neutral-100";
    this.tooltip.style.position = "fixed";
    document.body.appendChild(this.tooltip);

    this.cleanupEventListeners = [];
    this.tooltipLoopId = null;

    const setupTooltipHandlers = (icon) => {
      const mouseEnterHandler = () => {
        this.activeIcon = icon;
        const tooltipText = icon.dataset.tooltip;
        const hotkey = icon.dataset.tooltipHotkey;
        if (hotkey && hotkey.trim() !== "") {
          this.tooltip.innerHTML = `${tooltipText} <span class="tooltip-hotkey uppercase text-[10px] font-semibold ml-0.5 px-1 py-px bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded">${hotkey}</span>`;
        } else {
          this.tooltip.textContent = tooltipText;
        }
        this.positionTooltip(icon);
        animate(this.tooltip, { opacity: 1 }, { duration: 0.3 });
        const updateTooltip = () => {
          if (this.activeIcon) {
            this.positionTooltip(this.activeIcon);
            this.tooltipLoopId = requestAnimationFrame(updateTooltip);
          }
        };
        this.tooltipLoopId = requestAnimationFrame(updateTooltip);
      };

      const mouseLeaveHandler = () => {
        this.activeIcon = null;
        animate(this.tooltip, { opacity: 0 }, { duration: 0.1 });
        if (this.tooltipLoopId) {
          cancelAnimationFrame(this.tooltipLoopId);
          this.tooltipLoopId = null;
        }
      };

      icon.addEventListener("mouseenter", mouseEnterHandler);
      icon.addEventListener("mouseleave", mouseLeaveHandler);
      this.cleanupEventListeners.push(() => {
        icon.removeEventListener("mouseenter", mouseEnterHandler);
        icon.removeEventListener("mouseleave", mouseLeaveHandler);
      });
    };

    this.iconTargets.forEach(setupTooltipHandlers);
  }

  positionTooltip(icon) {
    // Use data-tooltip-placement from the icon, defaulting to "top"
    const placement = icon.dataset.tooltipPlacement || "top";
    computePosition(icon, this.tooltip, {
      placement: placement,
      strategy: "fixed",
      middleware: [
        offset(8),
        flip(),
        shift({
          padding: 4,
          crossAxis: true,
        }),
      ],
    }).then(({ x, y }) => {
      Object.assign(this.tooltip.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    });
  }

  disconnect() {
    if (this.tooltip) this.tooltip.remove();
    if (this.tooltipLoopId) {
      cancelAnimationFrame(this.tooltipLoopId);
      this.tooltipLoopId = null;
    }
    this.cleanupEventListeners.forEach((cleanup) => cleanup());
    document.removeEventListener("turbo:load", this.updateActiveMenuBound);
    document.removeEventListener("turbo:load", this.restoreTooltipBound);
  }

  /**
   * Iterates over each menu item and updates its styling based on the current URL.
   * Both desktop and mobile menu items are updated.
   */
  updateActiveMenu() {
    const desktopActiveClasses =
      "text-neutral-50 dark:text-neutral-800 bg-neutral-800 dark:bg-neutral-100 active:bg-neutral-700 dark:active:bg-neutral-200";
    const desktopInactiveClasses =
      "text-neutral-500 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-800 active:bg-neutral-300 dark:active:bg-neutral-700";
    const mobileActiveClasses =
      "text-neutral-50 dark:text-neutral-800 hover:text-neutral-50 dark:hover:text-neutral-800 bg-neutral-800 dark:bg-neutral-100 active:bg-neutral-700 dark:active:bg-neutral-200";
    const mobileInactiveClasses =
      "text-neutral-500 dark:text-neutral-300 hover:text-neutral-500 dark:hover:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 active:bg-neutral-100 dark:active:bg-neutral-700";

    // Update desktop icons
    this.iconTargets.forEach((anchor) => {
      const iconBox = anchor.querySelector("div");
      if (!iconBox) return;
      const url = anchor.getAttribute("href");
      try {
        // Compare the anchor URL (resolved relative to the current origin) with the current pathname and search params.
        const anchorUrl = new URL(url, window.location.origin);
        // If the menu item has no search params, match only by pathname.
        // If it has search params, match both pathname and search params exactly.
        const isActive =
          anchorUrl.search === ""
            ? anchorUrl.pathname === window.location.pathname
            : anchorUrl.pathname === window.location.pathname && anchorUrl.search === window.location.search;
        if (isActive) {
          iconBox.classList.remove(...desktopInactiveClasses.split(" "));
          iconBox.classList.add(...desktopActiveClasses.split(" "));
        } else {
          iconBox.classList.remove(...desktopActiveClasses.split(" "));
          iconBox.classList.add(...desktopInactiveClasses.split(" "));
        }
      } catch (e) {
        // Skip if URL parsing fails.
      }
    });

    // Update mobile menu items (if present)
    if (this.hasMobileMenuTarget) {
      const mobileAnchors = this.mobileMenuTarget.querySelectorAll("a");
      mobileAnchors.forEach((anchor) => {
        const url = anchor.getAttribute("href");
        try {
          const anchorUrl = new URL(url, window.location.origin);
          // If the menu item has no search params, match only by pathname.
          // If it has search params, match both pathname and search params exactly.
          const isActive =
            anchorUrl.search === ""
              ? anchorUrl.pathname === window.location.pathname
              : anchorUrl.pathname === window.location.pathname && anchorUrl.search === window.location.search;
          if (isActive) {
            anchor.classList.remove(...mobileInactiveClasses.split(" "));
            anchor.classList.add(...mobileActiveClasses.split(" "));
          } else {
            anchor.classList.remove(...mobileActiveClasses.split(" "));
            anchor.classList.add(...mobileInactiveClasses.split(" "));
          }
        } catch (e) {}
      });
    }
  }

  /**
   * If an icon is still active (hovered) when Turbo loads a new page,
   * re-position the tooltip and force its opacity so it remains visible.
   */
  restoreTooltip() {
    if (this.activeIcon) {
      const tooltipText = this.activeIcon.dataset.tooltip;
      const hotkey = this.activeIcon.dataset.tooltipHotkey;
      if (hotkey && hotkey.trim() !== "") {
        this.tooltip.innerHTML = `${tooltipText} <span class="tooltip-hotkey uppercase text-[10px] font-semibold ml-0.5 px-1 py-px bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded">${hotkey}</span>`;
      } else {
        this.tooltip.textContent = tooltipText;
      }
      this.positionTooltip(this.activeIcon);
      this.tooltip.style.opacity = 1;
      if (!this.tooltipLoopId) {
        const updateTooltipLoop = () => {
          if (this.activeIcon) {
            this.positionTooltip(this.activeIcon);
            this.tooltipLoopId = requestAnimationFrame(updateTooltipLoop);
          }
        };
        this.tooltipLoopId = requestAnimationFrame(updateTooltipLoop);
      }
    }
  }
}
