import { Controller } from "@hotwired/stimulus";

// Connects to data-controller="toast"
export default class extends Controller {
  static targets = ["container"];
  static values = {
    position: { type: String, default: "top-center" },
    layout: { type: String, default: "default" }, // "default" (stacked) or "expanded" (all visible)
    gap: { type: Number, default: 14 }, // Gap between toasts in expanded mode
    autoDismissDuration: { type: Number, default: 4000 },
    limit: { type: Number, default: 3 }, // Maximum number of visible toasts
  };

  connect() {
    this.toasts = [];
    this.heights = []; // Track toast heights like Sonner
    this.expanded = this.layoutValue === "expanded";
    this.interacting = false;
    this.isPrimaryController = false;
    this.defaultMountParent = this.element?.parentNode || null;
    this.defaultMountNextSibling = this.element?.nextSibling || null;
    this.hoverZonePadding = 10;

    this.registerController();
    this.activatePrimaryIfNeeded();
  }

  updatePositionClasses() {
    const container = this.containerTarget;
    // Remove all position classes
    container.classList.remove(
      "right-0",
      "left-0",
      "left-1/2",
      "-translate-x-1/2",
      "top-0",
      "bottom-0",
      "mt-4",
      "mb-4",
      "mr-4",
      "ml-4",
      "sm:mt-6",
      "sm:mb-6",
      "sm:mr-6",
      "sm:ml-6",
    );

    // Add new position classes
    const classes = this.positionClasses.split(" ");
    container.classList.add(...classes);
  }

  disconnect() {
    this.unregisterController();

    // Clear all auto-dismiss timers
    if (this.autoDismissTimers) {
      Object.values(this.autoDismissTimers).forEach((timer) => clearTimeout(timer));
      this.autoDismissTimers = {};
    }

    // Clean up all toasts from the DOM
    this.clearAllToasts();

    if (!this.isPrimaryController) return;

    this.removePrimaryListeners();

    if (window.toast === this.boundShowToast) {
      delete window.toast;
    }

    if (window.__toastPrimaryController === this) {
      window.__toastPrimaryController = null;
    }

    this.isPrimaryController = false;
    this.promoteNextPrimaryController();
  }

  showToast(message, options = {}) {
    const detail = {
      type: options.type || "default",
      message: message,
      description: options.description || "",
      position: options.position || window.currentToastPosition || this.positionValue, // Use stored position
      html: options.html || "",
      action: options.action || null,
      secondaryAction: options.secondaryAction || null,
    };

    window.dispatchEvent(new CustomEvent("toast-show", { detail }));
  }

  handleToastShow(event) {
    if (!this.isPrimaryController) return;
    event.stopPropagation();

    this.ensureGlobalHostVisible();

    // Update container position if a position is specified for this toast
    if (event.detail.position) {
      this.positionValue = event.detail.position;
      window.currentToastPosition = event.detail.position; // Store globally
      this.updatePositionClasses();
    }

    const toast = {
      id: `toast-${Math.random().toString(16).slice(2)}`,
      mounted: false,
      removed: false,
      message: event.detail.message,
      description: event.detail.description,
      type: event.detail.type,
      html: event.detail.html,
      action: event.detail.action,
      secondaryAction: event.detail.secondaryAction,
    };

    // Add toast at the beginning of the array (newest first)
    this.toasts.unshift(toast);

    // Enforce toast limit synchronously to prevent race conditions
    const activeToasts = this.toasts.filter((t) => !t.removed);
    if (activeToasts.length > this.limitValue) {
      const oldestActiveToast = activeToasts[activeToasts.length - 1];
      if (oldestActiveToast && !oldestActiveToast.removed) {
        this.removeToast(oldestActiveToast.id, true);
      }
    }

    this.renderToast(toast);
  }

  handleLayoutChange(event) {
    if (!this.isPrimaryController) return;
    this.layoutValue = event.detail.layout;
    this.expanded = this.layoutValue === "expanded";
    this.updateAllToasts();
  }

  beforeCache() {
    if (!this.isPrimaryController) return;

    // Clear all toasts before the page is cached to prevent stale toasts on navigation
    this.clearAllToasts();
    // Reset position to default on navigation
    window.currentToastPosition = this.element.dataset.toastPositionValue || "top-center";
  }

  clearAllToasts() {
    // Remove all toast elements from DOM
    const container = this.containerTarget;
    if (container) {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    }

    // Clear arrays
    this.toasts = [];
    this.heights = [];
    if (this.layoutValue === "default") {
      this.expanded = false;
    }

    // Clear all timers
    if (this.autoDismissTimers) {
      Object.values(this.autoDismissTimers).forEach((timer) => clearTimeout(timer));
      this.autoDismissTimers = {};
    }

    this.hideGlobalHostIfIdle();
  }

  handleMouseEnter() {
    this.setExpandedState(true);
  }

  handleMouseLeave() {
    this.setExpandedState(false);
  }

  renderToast(toast) {
    this.ensureGlobalHostVisible();

    const container = this.containerTarget;
    const li = this.createToastElement(toast);
    container.insertBefore(li, container.firstChild);

    // Measure height after a short delay to ensure rendering is complete
    requestAnimationFrame(() => {
      const toastEl = document.getElementById(toast.id);
      if (toastEl) {
        const height = toastEl.getBoundingClientRect().height;

        // Add height to the beginning of heights array
        this.heights.unshift({
          toastId: toast.id,
          height: height,
        });

        // Count only active (non-removed) toasts
        const activeToasts = this.toasts.filter((t) => !t.removed);

        // Trigger mount animation
        requestAnimationFrame(() => {
          toast.mounted = true;
          toastEl.dataset.mounted = "true";

          // Update all toast positions
          this.updateAllToasts();
        });

        // Schedule auto-dismiss for visible toasts
        const activeToastIndex = activeToasts.findIndex((t) => t.id === toast.id);
        if (activeToastIndex < this.limitValue) {
          this.scheduleAutoDismiss(toast.id);
        }
      }
    });
  }

  scheduleAutoDismiss(toastId) {
    if (!this.autoDismissTimers) {
      this.autoDismissTimers = {};
    }

    if (this.autoDismissTimers[toastId]) {
      clearTimeout(this.autoDismissTimers[toastId]);
    }

    this.autoDismissTimers[toastId] = setTimeout(() => {
      this.removeToast(toastId);
      delete this.autoDismissTimers[toastId];
    }, this.autoDismissDurationValue);
  }

  createToastElement(toast) {
    const li = document.createElement("li");
    li.id = toast.id;
    li.className = "toast-item sm:max-w-xs";
    li.style.pointerEvents = "auto";
    li.dataset.mounted = "false";
    li.dataset.removed = "false";
    li.dataset.position = this.positionValue;
    li.dataset.expanded = this.expanded.toString();
    li.dataset.visible = "true";
    li.dataset.front = "false";
    li.dataset.index = "0";

    if (!toast.description) {
      li.classList.add("toast-no-description");
    }

    const span = document.createElement("span");
    span.className = `relative flex flex-col items-start shadow-xs w-full transition-all duration-200 bg-white border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 rounded-lg sm:rounded-xl sm:max-w-xs group ${
      toast.html ? "p-0" : "p-4"
    }`;
    span.style.transitionTimingFunction = "cubic-bezier(0.4, 0, 0.2, 1)";

    if (toast.html) {
      span.innerHTML = toast.html;
    } else {
      span.innerHTML = this.getToastHTML(toast);
    }

    // Add action button event listeners if not using custom HTML
    if (!toast.html && (toast.action || toast.secondaryAction)) {
      requestAnimationFrame(() => {
        if (toast.action) {
          const primaryBtn = span.querySelector('[data-action-type="primary"]');
          if (primaryBtn) {
            primaryBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              toast.action.onClick();
              this.removeToast(toast.id);
            });
          }
        }
        if (toast.secondaryAction) {
          const secondaryBtn = span.querySelector('[data-action-type="secondary"]');
          if (secondaryBtn) {
            secondaryBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              toast.secondaryAction.onClick();
              this.removeToast(toast.id);
            });
          }
        }
      });
    }

    // Add close button
    const closeBtn = document.createElement("span");
    const hasActions = toast.action || toast.secondaryAction;
    closeBtn.className = `absolute right-0 p-1.5 mr-2.5 text-neutral-400 duration-100 ease-in-out rounded-full cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:text-neutral-500 dark:hover:text-neutral-300 ${
      !toast.description && !toast.html && !hasActions ? "top-1/2 -translate-y-1/2" : "top-0 mt-2.5"
    }`;
    closeBtn.innerHTML = `<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>`;
    closeBtn.dataset.toastId = toast.id;
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.removeToast(toast.id);
    });

    span.appendChild(closeBtn);
    li.appendChild(span);

    return li;
  }

  getToastHTML(toast) {
    const typeColors = {
      success: "text-green-500 dark:text-green-400",
      error: "text-red-500 dark:text-red-400",
      info: "text-blue-500 dark:text-blue-400",
      warning: "text-orange-400 dark:text-orange-300",
      danger: "text-red-500 dark:text-red-400",
      loading: "text-neutral-500 dark:text-neutral-400",
      default: "text-neutral-800 dark:text-neutral-200",
    };

    const color = typeColors[toast.type] || typeColors.default;

    const icons = {
      success: `<svg class="size-4.5 mr-1.5 -ml-1" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><g fill="currentColor"><path d="M9,1C4.589,1,1,4.589,1,9s3.589,8,8,8,8-3.589,8-8S13.411,1,9,1Zm3.843,5.708l-4.25,5.5c-.136,.176-.343,.283-.565,.291-.01,0-.019,0-.028,0-.212,0-.415-.09-.558-.248l-2.25-2.5c-.277-.308-.252-.782,.056-1.06,.309-.276,.781-.252,1.06,.056l1.648,1.832,3.701-4.789c.253-.328,.725-.388,1.052-.135,.328,.253,.388,.724,.135,1.052Z"></path></g></svg>`,
      error: `<svg class="size-4.5 mr-1.5 -ml-1" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><g fill="currentColor"><path d="M9,1C4.589,1,1,4.589,1,9s3.589,8,8,8,8-3.589,8-8S13.411,1,9,1Zm3.28,10.22c.293,.293,.293,.768,0,1.061-.146,.146-.338,.22-.53,.22s-.384-.073-.53-.22l-2.22-2.22-2.22,2.22c-.146,.146-.338,.22-.53,.22s-.384-.073-.53-.22c-.293-.293-.293-.768,0-1.061l2.22-2.22-2.22-2.22c-.293-.293-.293-.768,0-1.061s.768-.293,1.061,0l2.22,2.22,2.22-2.22c.293-.293,.768-.293,1.061,0s.293,.768,0,1.061l-2.22,2.22,2.22,2.22Z"></path></g></svg>`,
      info: `<svg class="size-4.5 mr-1.5 -ml-1" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><g fill="currentColor"><path d="M9 1C4.5889 1 1 4.5889 1 9C1 13.4111 4.5889 17 9 17C13.4111 17 17 13.4111 17 9C17 4.5889 13.4111 1 9 1ZM9.75 12.75C9.75 13.1641 9.4141 13.5 9 13.5C8.5859 13.5 8.25 13.1641 8.25 12.75V9.5H7.75C7.3359 9.5 7 9.1641 7 8.75C7 8.3359 7.3359 8 7.75 8H8.5C9.1895 8 9.75 8.5605 9.75 9.25V12.75ZM9 6.75C8.448 6.75 8 6.301 8 5.75C8 5.199 8.448 4.75 9 4.75C9.552 4.75 10 5.199 10 5.75C10 6.301 9.552 6.75 9 6.75Z"></path></g></svg>`,
      warning: `<svg class="size-4.5 mr-1.5 -ml-1" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><g fill="currentColor"><path d="M16.4364 12.5151L11.0101 3.11316C10.5902 2.39096 9.83872 1.96045 8.99982 1.96045C8.16092 1.96045 7.40952 2.39106 6.98952 3.11316C6.98902 3.11366 6.98902 3.11473 6.98852 3.11523L1.56272 12.5156C1.14332 13.2436 1.14332 14.1128 1.56372 14.8398C1.98362 15.5664 2.73562 16 3.57492 16H14.4245C15.2639 16 16.0158 15.5664 16.4357 14.8398C16.8561 14.1127 16.8563 13.2436 16.4364 12.5151ZM8.24992 6.75C8.24992 6.3359 8.58582 6 8.99992 6C9.41402 6 9.74992 6.3359 9.74992 6.75V9.75C9.74992 10.1641 9.41402 10.5 8.99992 10.5C8.58582 10.5 8.24992 10.1641 8.24992 9.75V6.75ZM8.99992 13.5C8.44792 13.5 7.99992 13.0498 7.99992 12.5C7.99992 11.9502 8.44792 11.5 8.99992 11.5C9.55192 11.5 9.99992 11.9502 9.99992 12.5C9.99992 13.0498 9.55192 13.5 8.99992 13.5Z"></path></g></svg>`,
      danger: `<svg class="size-4.5 mr-1.5 -ml-1" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><g fill="currentColor"><path d="M16.4364 12.5151L11.0101 3.11316C10.5902 2.39096 9.83872 1.96045 8.99982 1.96045C8.16092 1.96045 7.40952 2.39106 6.98952 3.11316C6.98902 3.11366 6.98902 3.11473 6.98852 3.11523L1.56272 12.5156C1.14332 13.2436 1.14332 14.1128 1.56372 14.8398C1.98362 15.5664 2.73562 16 3.57492 16H14.4245C15.2639 16 16.0158 15.5664 16.4357 14.8398C16.8561 14.1127 16.8563 13.2436 16.4364 12.5151ZM8.24992 6.75C8.24992 6.3359 8.58582 6 8.99992 6C9.41402 6 9.74992 6.3359 9.74992 6.75V9.75C9.74992 10.1641 9.41402 10.5 8.99992 10.5C8.58582 10.5 8.24992 10.1641 8.24992 9.75V6.75ZM8.99992 13.5C8.44792 13.5 7.99992 13.0498 7.99992 12.5C7.99992 11.9502 8.44792 11.5 8.99992 11.5C9.55192 11.5 9.99992 11.9502 9.99992 12.5C9.99992 13.0498 9.55192 13.5 8.99992 13.5Z"></path></g></svg>`,
      loading: `<svg class="size-4.5 mr-1.5 -ml-1 animate-spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><g fill="currentColor"><path d="m9,17c-4.4111,0-8-3.5889-8-8S4.5889,1,9,1s8,3.5889,8,8-3.5889,8-8,8Zm0-14.5c-3.584,0-6.5,2.916-6.5,6.5s2.916,6.5,6.5,6.5,6.5-2.916,6.5-6.5-2.916-6.5-6.5-6.5Z" opacity=".4" stroke-width="0"></path><path d="m16.25,9.75c-.4141,0-.75-.3359-.75-.75,0-3.584-2.916-6.5-6.5-6.5-.4141,0-.75-.3359-.75-.75s.3359-.75.75-.75c4.4111,0,8,3.5889,8,8,0,.4141-.3359.75-.75.75Z" stroke-width="0"></path></g></svg>
      `,
    };

    const icon = icons[toast.type] || "";

    // Action buttons HTML
    const hasActions = toast.action || toast.secondaryAction;
    const actionsHTML = hasActions
      ? `<div></div>
        <div class="flex justify-end items-center gap-2 mt-0.5">
          ${
            toast.secondaryAction
              ? `<button data-action-type="secondary" class="flex items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-white/90 px-2 py-1.5 text-xs font-medium whitespace-nowrap text-neutral-800 shadow-xs transition-all duration-100 ease-in-out select-none hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-neutral-700/50 dark:text-neutral-50 dark:hover:bg-neutral-700/75 dark:focus-visible:outline-neutral-200">${toast.secondaryAction.label}</button>`
              : ""
          }
          ${
            toast.action
              ? `<button data-action-type="primary" class="flex items-center justify-center gap-1.5 rounded-lg border border-neutral-400/30 bg-neutral-800 px-2 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-sm transition-all duration-100 ease-in-out select-none hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-800 dark:hover:bg-neutral-100 dark:focus-visible:outline-neutral-200">${toast.action.label}</button>`
              : ""
          }
        </div>`
      : "";

    return `
      <div class="relative w-full">
        <div class="grid grid-cols-[auto_1fr] gap-y-1.5 items-start">
          <div class="flex items-center h-full ${color}">
            ${icon}
          </div>
          <p class="text-[13px] font-medium text-neutral-800 dark:text-neutral-200 pr-6">
            ${toast.message}
          </p>
          ${
            toast.description
              ? `<div></div>
          <div class="text-xs text-neutral-600 dark:text-neutral-400">
            ${toast.description}
          </div>`
              : ""
          }
          ${actionsHTML}
        </div>
      </div>
    `;
  }

  removeToast(id, isOverflow = false) {
    const toast = this.toasts.find((t) => t.id === id);
    if (!toast || toast.removed) return;

    const toastEl = document.getElementById(id);
    if (!toastEl) return;

    // Mark as removed
    toast.removed = true;
    toastEl.dataset.removed = "true";

    // Mark if this is an overflow removal
    if (isOverflow) {
      toastEl.dataset.overflow = "true";
    }

    // Clear auto-dismiss timer
    if (this.autoDismissTimers && this.autoDismissTimers[id]) {
      clearTimeout(this.autoDismissTimers[id]);
      delete this.autoDismissTimers[id];
    }

    // Wait for exit animation to complete
    setTimeout(() => {
      // Remove from arrays
      this.toasts = this.toasts.filter((t) => t.id !== id);
      this.heights = this.heights.filter((h) => h.toastId !== id);

      // Remove from DOM
      if (toastEl.parentNode) {
        toastEl.parentNode.removeChild(toastEl);
      }

      // Update remaining toasts
      this.updateAllToasts();

      this.hideGlobalHostIfIdle();

      // Schedule auto-dismiss for newly visible toast
      if (this.toasts.length >= this.limitValue) {
        const newlyVisibleToast = this.toasts[this.limitValue - 1];
        if (newlyVisibleToast && !this.autoDismissTimers[newlyVisibleToast.id]) {
          this.scheduleAutoDismiss(newlyVisibleToast.id);
        }
      }
    }, 400); // Match the exit animation duration (400ms)
  }

  updateAllToasts() {
    requestAnimationFrame(() => {
      const visibleToasts = this.limitValue;

      // Calculate visual index (excluding removed toasts)
      let visualIndex = 0;

      this.toasts.forEach((toast, index) => {
        const toastEl = document.getElementById(toast.id);
        if (!toastEl) return;

        // Handle overflow toasts (removed due to limit) separately
        if (toast.removed && toastEl.dataset.overflow === "true") {
          // Position as if it's the last visible toast
          toastEl.dataset.index = String(this.limitValue - 1);
          toastEl.dataset.visible = "true";
          toastEl.dataset.expanded = this.expanded.toString();
          toastEl.dataset.position = this.positionValue;
          // Set lowest z-index so it appears behind all active toasts
          toastEl.style.setProperty("--toast-z-index", 0);
          toastEl.style.setProperty("--toast-index", this.limitValue - 1);
          return;
        }

        // Skip other removed toasts
        if (toast.removed) return;

        const isVisible = visualIndex < visibleToasts;
        const isFront = visualIndex === 0;

        // Calculate offset (cumulative height of non-removed toasts before this one)
        let offset = 0;
        for (let i = 0; i < index; i++) {
          if (this.toasts[i].removed) continue;

          const heightInfo = this.heights.find((h) => h.toastId === this.toasts[i].id);
          if (heightInfo) {
            offset += heightInfo.height + this.gapValue;
          }
        }

        // Update data attributes - CSS will handle styling
        toastEl.dataset.expanded = this.expanded.toString();
        toastEl.dataset.visible = isVisible.toString();
        toastEl.dataset.front = isFront.toString();
        toastEl.dataset.index = visualIndex.toString();
        toastEl.dataset.position = this.positionValue;

        // Set CSS custom properties for dynamic values
        toastEl.style.setProperty("--toast-z-index", 100 - visualIndex);
        toastEl.style.setProperty("--toast-offset", `${offset}px`);
        toastEl.style.setProperty("--toast-index", visualIndex);

        // Set the initial height of this specific toast
        const heightInfo = this.heights.find((h) => h.toastId === toast.id);
        if (heightInfo) {
          toastEl.style.setProperty("--initial-height", `${heightInfo.height}px`);
        }

        // In stacked mode, set all toasts to front toast height for uniform appearance
        if (!this.expanded) {
          const frontHeight = this.heights[0]?.height || 0;
          toastEl.style.setProperty("--front-toast-height", `${frontHeight}px`);
        } else {
          toastEl.style.removeProperty("--front-toast-height");
        }

        // Increment visual index for next non-removed toast
        visualIndex++;
      });

      // Update container height immediately and after transitions complete
      this.updateContainerHeight();
      setTimeout(() => this.updateContainerHeight(), 400);
    });
  }

  updateContainerHeight() {
    // Count non-removed toasts
    const activeToasts = this.toasts.filter((t) => !t.removed);

    if (activeToasts.length === 0) {
      this.containerTarget.style.height = "0px";
      this.hideGlobalHostIfIdle();
      return;
    }

    if (this.expanded) {
      // In expanded mode, calculate total height of all visible non-removed toasts
      let totalHeight = 0;
      const visibleToasts = Math.min(activeToasts.length, this.limitValue);

      for (let i = 0; i < visibleToasts; i++) {
        const heightInfo = this.heights.find((h) => h.toastId === activeToasts[i].id);
        if (heightInfo) {
          totalHeight += heightInfo.height;
          if (i < visibleToasts - 1) {
            totalHeight += this.gapValue;
          }
        }
      }

      this.containerTarget.style.height = totalHeight + "px";
    } else {
      // In stacked mode, calculate based on front non-removed toast + peek amounts
      const frontToast = activeToasts[0];
      const frontHeight = frontToast ? this.heights.find((h) => h.toastId === frontToast.id)?.height || 0 : 0;
      const peekAmount = 24;
      const visibleCount = Math.min(activeToasts.length, this.limitValue);
      const totalHeight = frontHeight + peekAmount * (visibleCount - 1);

      this.containerTarget.style.height = totalHeight + "px";
    }
  }

  get positionClasses() {
    const positions = {
      "top-right": "right-0 top-0 mt-4 mr-4 sm:mt-6 sm:mr-6",
      "top-left": "left-0 top-0 mt-4 ml-4 sm:mt-6 sm:ml-6",
      "top-center": "left-1/2 -translate-x-1/2 top-0 mt-4 sm:mt-6",
      "bottom-right": "right-0 bottom-0 mb-4 mr-4 sm:mr-6 sm:mb-6",
      "bottom-left": "left-0 bottom-0 mb-4 ml-4 sm:ml-6 sm:mb-6",
      "bottom-center": "left-1/2 -translate-x-1/2 bottom-0 mb-4 sm:mb-6",
    };

    return positions[this.positionValue] || positions["top-center"];
  }

  registerController() {
    if (!window.__toastControllers) {
      window.__toastControllers = new Set();
    }

    window.__toastControllers.add(this);
  }

  unregisterController() {
    if (window.__toastControllers) {
      window.__toastControllers.delete(this);
    }
  }

  activatePrimaryIfNeeded() {
    const existingPrimary = window.__toastPrimaryController;
    const existingPrimaryConnected = existingPrimary?.element?.isConnected;

    if (existingPrimary && existingPrimary !== this && existingPrimaryConnected) {
      return;
    }

    this.becomePrimaryController();
  }

  becomePrimaryController() {
    if (this.isPrimaryController) return;

    this.isPrimaryController = true;
    window.__toastPrimaryController = this;

    this.initializePositionState();
    this.updatePositionClasses();
    this.mountToGlobalHost();
    this.applyPointerEventPolicy();

    this.boundShowToast = this.showToast.bind(this);
    window.toast = this.boundShowToast;

    this.boundHandleToastShow = this.handleToastShow.bind(this);
    this.boundHandleLayoutChange = this.handleLayoutChange.bind(this);
    this.boundBeforeCache = this.beforeCache.bind(this);
    this.boundPointerMove = this.handleGlobalPointerMove.bind(this);
    this.boundPointerLeave = this.handleGlobalPointerLeave.bind(this);
    this.boundHandleDialogStateChange = this.handleDialogStateChange.bind(this);

    window.addEventListener("toast-show", this.boundHandleToastShow);
    window.addEventListener("set-toasts-layout", this.boundHandleLayoutChange);
    window.addEventListener("pointermove", this.boundPointerMove, { passive: true });
    window.addEventListener("pointerleave", this.boundPointerLeave);
    window.addEventListener("blur", this.boundPointerLeave);
    document.addEventListener("turbo:before-cache", this.boundBeforeCache);
    this.startDialogStateObserver();
  }

  removePrimaryListeners() {
    if (this.boundHandleToastShow) {
      window.removeEventListener("toast-show", this.boundHandleToastShow);
    }

    if (this.boundHandleLayoutChange) {
      window.removeEventListener("set-toasts-layout", this.boundHandleLayoutChange);
    }

    if (this.boundPointerMove) {
      window.removeEventListener("pointermove", this.boundPointerMove);
    }

    if (this.boundPointerLeave) {
      window.removeEventListener("pointerleave", this.boundPointerLeave);
      window.removeEventListener("blur", this.boundPointerLeave);
    }

    if (this.boundBeforeCache) {
      document.removeEventListener("turbo:before-cache", this.boundBeforeCache);
    }

    this.stopDialogStateObserver();
  }

  promoteNextPrimaryController() {
    if (!window.__toastControllers?.size) return;

    const nextPrimary = Array.from(window.__toastControllers).find((controller) => controller?.element?.isConnected);
    if (nextPrimary) {
      nextPrimary.becomePrimaryController();
    }
  }

  initializePositionState() {
    if (!window.currentToastPosition) {
      window.currentToastPosition = this.positionValue;
      return;
    }

    this.positionValue = window.currentToastPosition;
  }

  mountToGlobalHost() {
    this.globalHost = this.element;

    if (!this.globalHost) return;

    if (typeof this.globalHost.showPopover === "function" && !this.globalHost.hasAttribute("popover")) {
      this.globalHost.setAttribute("popover", "manual");
    }

    const mountRoot = this.preferredMountRoot();
    if (!mountRoot) return;

    if (this.globalHost.parentNode !== mountRoot) {
      if (typeof this.globalHost.hidePopover === "function") {
        try {
          if (this.globalHost.matches(":popover-open")) {
            this.globalHost.hidePopover();
          }
        } catch {
          // Ignore popover state errors before remount.
        }
      }

      if (mountRoot === this.defaultMountParent && this.defaultMountNextSibling?.parentNode === mountRoot) {
        mountRoot.insertBefore(this.globalHost, this.defaultMountNextSibling);
      } else {
        mountRoot.appendChild(this.globalHost);
      }
    }
  }

  preferredMountRoot() {
    const openDialog = this.topmostOpenDialog();
    if (openDialog) return openDialog;

    const parentDialog = this.defaultMountParent instanceof Element ? this.defaultMountParent.closest("dialog") : null;
    if (parentDialog && !parentDialog.open) return document.body;

    if (this.defaultMountParent?.tagName === "DIALOG" && !this.defaultMountParent.open) {
      return document.body;
    }

    return this.defaultMountParent || document.body;
  }

  topmostOpenDialog() {
    const openDialogs = Array.from(document.querySelectorAll("dialog[open]")).filter((dialog) => dialog.isConnected);
    if (openDialogs.length === 0) return null;

    return openDialogs[openDialogs.length - 1];
  }

  applyPointerEventPolicy() {
    if (this.element) {
      this.element.style.pointerEvents = "none";
    }

    if (this.hasContainerTarget) {
      this.containerTarget.style.pointerEvents = "none";
    }
  }

  ensureGlobalHostVisible() {
    this.mountToGlobalHost();

    if (!this.globalHost || typeof this.globalHost.showPopover !== "function") return;

    try {
      if (this.globalHost.matches(":popover-open")) {
        this.globalHost.hidePopover();
      }
    } catch {
      // Ignore popover close errors.
    }

    try {
      this.globalHost.showPopover();
    } catch {
      // No-op: keep standard DOM rendering when Popover API isn't available.
    }
  }

  hideGlobalHostIfIdle() {
    if (!this.globalHost || typeof this.globalHost.hidePopover !== "function") return;

    const hasActiveToasts = this.toasts.some((toast) => !toast.removed);
    if (hasActiveToasts) return;

    try {
      if (this.globalHost.matches(":popover-open")) {
        this.globalHost.hidePopover();
      }
    } catch {
      // No-op: host stays visible when popover state isn't available.
    }
  }

  startDialogStateObserver() {
    if (this.dialogStateObserver) return;
    if (!document.body) return;

    this.dialogStateObserver = new MutationObserver(this.boundHandleDialogStateChange);
    this.dialogStateObserver.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["open"],
    });
  }

  stopDialogStateObserver() {
    if (!this.dialogStateObserver) return;
    this.dialogStateObserver.disconnect();
    this.dialogStateObserver = null;
  }

  handleDialogStateChange() {
    if (!this.isPrimaryController) return;

    this.mountToGlobalHost();

    const hasActiveToasts = this.toasts.some((toast) => !toast.removed);
    if (hasActiveToasts) {
      this.ensureGlobalHostVisible();
    } else {
      this.hideGlobalHostIfIdle();
    }
  }

  setExpandedState(nextExpanded) {
    if (this.layoutValue !== "default") return;
    if (nextExpanded === this.expanded) return;
    if (!nextExpanded && this.interacting) return;

    this.expanded = nextExpanded;
    this.updateAllToasts();
  }

  handleGlobalPointerMove(event) {
    if (!this.isPrimaryController) return;
    if (!this.hasContainerTarget) return;
    if (!this.toasts.some((toast) => !toast.removed)) {
      this.setExpandedState(false);
      return;
    }

    const inHoverZone = this.isInHoverZone(event.clientX, event.clientY);
    this.setExpandedState(inHoverZone);
  }

  handleGlobalPointerLeave() {
    if (!this.isPrimaryController) return;
    this.setExpandedState(false);
  }

  isInHoverZone(clientX, clientY) {
    const rect = this.containerTarget.getBoundingClientRect();
    const pad = this.hoverZonePadding;

    return (
      clientX >= rect.left - pad &&
      clientX <= rect.right + pad &&
      clientY >= rect.top - pad &&
      clientY <= rect.bottom + pad
    );
  }
}
