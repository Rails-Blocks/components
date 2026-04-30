import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["item", "trigger", "content", "icon"];
  static values = {
    allowMultiple: { type: Boolean, default: false }, // Allow multiple items to be open at once
  };

  // Get only the direct child targets (not nested accordion targets)
  get ownItemTargets() {
    return this.itemTargets.filter((item) => item.closest('[data-controller="accordion"]') === this.element);
  }

  get ownTriggerTargets() {
    return this.triggerTargets.filter((trigger) => trigger.closest('[data-controller="accordion"]') === this.element);
  }

  get ownContentTargets() {
    return this.contentTargets.filter((content) => content.closest('[data-controller="accordion"]') === this.element);
  }

  get ownIconTargets() {
    return this.iconTargets.filter((icon) => icon.closest('[data-controller="accordion"]') === this.element);
  }

  _applyOpenVisuals(index) {
    const items = this.ownItemTargets;
    const triggers = this.ownTriggerTargets;
    const contents = this.ownContentTargets;
    const icons = this.ownIconTargets;

    if (!items[index] || !triggers[index] || !contents[index]) return;

    const item = items[index];
    const trigger = triggers[index];
    const content = contents[index];
    const icon = icons[index] || null;

    // Remove hidden first to allow measurement
    content.removeAttribute("hidden");
    // Force reflow to ensure hidden is removed before animation starts
    content.offsetHeight;

    item.dataset.state = "open";
    trigger.setAttribute("aria-expanded", "true");
    trigger.dataset.state = "open";
    content.dataset.state = "open";

    // Update inner wrapper and body states for opacity transition
    this._updateInnerStates(content, "open");

    if (icon) {
      const isPlusMinus = icon.querySelector('path[d*="M5 12h14"]');
      const isLeftChevron = icon.classList.contains("-rotate-90");

      if (isPlusMinus) {
        // For plus/minus icons, CSS handles the animation via aria-expanded
      } else if (isLeftChevron) {
        icon.classList.add("rotate-0");
        icon.classList.remove("-rotate-90");
      } else {
        icon.classList.add("rotate-180");
      }
    }
  }

  _applyClosedVisuals(index, skipHidden = false) {
    const items = this.ownItemTargets;
    const triggers = this.ownTriggerTargets;
    const contents = this.ownContentTargets;
    const icons = this.ownIconTargets;

    if (!items[index] || !triggers[index] || !contents[index]) return;

    const item = items[index];
    const trigger = triggers[index];
    const content = contents[index];
    const icon = icons[index] || null;

    item.dataset.state = "closed";
    trigger.setAttribute("aria-expanded", "false");
    trigger.dataset.state = "closed";
    content.dataset.state = "closed";

    // Update inner wrapper and body states for opacity transition
    this._updateInnerStates(content, "closed");

    // For initial setup, set hidden immediately; for animations, it's handled in close()
    if (!skipHidden) {
      content.setAttribute("hidden", "");
    }

    if (icon) {
      const isPlusMinus = icon.classList.contains("scale-0");
      const isLeftChevron = icon.classList.contains("rotate-0");

      if (isPlusMinus) {
        // For plus/minus icons, CSS handles the animation
      } else if (isLeftChevron) {
        icon.classList.remove("rotate-0");
        icon.classList.add("-rotate-90");
      } else {
        icon.classList.remove("rotate-180");
      }
    }
  }

  connect() {
    this.addKeyboardListeners();
    this.activeIndices = new Set();

    // Store bound function references for proper cleanup
    this.boundHandleTriggerKeydown = this.handleTriggerKeydown.bind(this);
    this.boundHandleKeydown = this.handleKeydown.bind(this);

    const ownTriggers = this.ownTriggerTargets;
    const ownItems = this.ownItemTargets;

    // Ensure all trigger buttons are focusable and have keyboard listeners
    ownTriggers.forEach((trigger) => {
      if (!trigger.hasAttribute("tabindex")) {
        trigger.setAttribute("tabindex", "0");
      }
      trigger.addEventListener("keydown", this.boundHandleTriggerKeydown);
    });

    const initiallyOpenIndexesFromDOM = [];
    ownItems.forEach((item, index) => {
      if (ownTriggers[index]?.getAttribute("aria-expanded") === "true") {
        initiallyOpenIndexesFromDOM.push(index);
      } else if (item.dataset.state === "open" && !initiallyOpenIndexesFromDOM.includes(index)) {
        initiallyOpenIndexesFromDOM.push(index);
      }
    });

    if (!this.allowMultipleValue) {
      if (initiallyOpenIndexesFromDOM.length > 0) {
        const indexToKeepOpen = initiallyOpenIndexesFromDOM[0];
        this.activeIndices.add(indexToKeepOpen);
        this._applyOpenVisuals(indexToKeepOpen);

        for (let i = 0; i < ownItems.length; i++) {
          if (i !== indexToKeepOpen) {
            this._applyClosedVisuals(i);
          }
        }
      } else {
        ownItems.forEach((_, index) => this._applyClosedVisuals(index));
      }
    } else {
      initiallyOpenIndexesFromDOM.forEach((index) => {
        this.activeIndices.add(index);
        this._applyOpenVisuals(index);
      });
      ownItems.forEach((_, index) => {
        if (!this.activeIndices.has(index)) {
          this._applyClosedVisuals(index);
        }
      });
    }
  }

  disconnect() {
    this.element.removeEventListener("keydown", this.boundHandleKeydown);

    // Remove individual trigger listeners
    this.ownTriggerTargets.forEach((trigger) => {
      trigger.removeEventListener("keydown", this.boundHandleTriggerKeydown);
    });

    // Clean up transition listeners
    this.ownContentTargets.forEach((content) => {
      if (content._onTransitionEnd) {
        content.removeEventListener("transitionend", content._onTransitionEnd);
      }
    });
  }

  addKeyboardListeners() {
    this.element.addEventListener("keydown", this.boundHandleKeydown);
  }

  // Safari-compatible trigger-specific keydown handler
  handleTriggerKeydown(event) {
    const currentTrigger = event.currentTarget;
    const ownTriggers = this.ownTriggerTargets;
    const currentIndex = ownTriggers.indexOf(currentTrigger);

    if (currentIndex === -1) return;

    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        this.focusPreviousItem(currentIndex);
        break;
      case "ArrowDown":
        event.preventDefault();
        this.focusNextItem(currentIndex);
        break;
      case "Home":
        event.preventDefault();
        this.focusFirstItem();
        break;
      case "End":
        event.preventDefault();
        this.focusLastItem();
        break;
      case "Enter":
      case " ": // Space key
        event.preventDefault();
        this.toggle(event);
        break;
    }
  }

  handleKeydown(event) {
    const ownTriggers = this.ownTriggerTargets;
    let currentIndex = -1;

    ownTriggers.forEach((trigger, index) => {
      if (trigger === document.activeElement || trigger.contains(document.activeElement)) {
        currentIndex = index;
      }
    });

    if (currentIndex === -1) return;

    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        this.focusPreviousItem(currentIndex);
        break;
      case "ArrowDown":
        event.preventDefault();
        this.focusNextItem(currentIndex);
        break;
      case "Home":
        event.preventDefault();
        this.focusFirstItem();
        break;
      case "End":
        event.preventDefault();
        this.focusLastItem();
        break;
    }
  }

  focusPreviousItem(currentIndex) {
    const ownTriggers = this.ownTriggerTargets;
    const previousIndex = (currentIndex - 1 + ownTriggers.length) % ownTriggers.length;
    ownTriggers[previousIndex].focus();
  }

  focusNextItem(currentIndex) {
    const ownTriggers = this.ownTriggerTargets;
    const nextIndex = (currentIndex + 1) % ownTriggers.length;
    ownTriggers[nextIndex].focus();
  }

  focusFirstItem() {
    this.ownTriggerTargets[0]?.focus();
  }

  focusLastItem() {
    const ownTriggers = this.ownTriggerTargets;
    ownTriggers[ownTriggers.length - 1]?.focus();
  }

  toggle(event) {
    const ownTriggers = this.ownTriggerTargets;
    const index = ownTriggers.indexOf(event.currentTarget);

    if (index === -1) return;

    if (this.activeIndices.has(index)) {
      this.close(index);
    } else {
      if (!this.allowMultipleValue) {
        this.activeIndices.forEach((i) => this.close(i));
      }
      this.open(index);
    }
  }

  open(index) {
    const items = this.ownItemTargets;
    const triggers = this.ownTriggerTargets;
    const contents = this.ownContentTargets;
    const icons = this.ownIconTargets;

    const item = items[index];
    const trigger = triggers[index];
    const content = contents[index];
    const icon = icons[index];

    if (!item || !trigger || !content) return;

    // Remove hidden first to allow CSS Grid animation
    content.removeAttribute("hidden");
    // Force reflow to ensure hidden is removed before animation starts
    content.offsetHeight;

    // Set the open state - CSS Grid handles the animation
    item.dataset.state = "open";
    trigger.setAttribute("aria-expanded", "true");
    trigger.dataset.state = "open";
    content.dataset.state = "open";

    // Update inner wrapper and body states for opacity transition
    this._updateInnerStates(content, "open");

    // Handle icon animation
    if (icon) {
      const isPlusMinus = icon.querySelector('path[d*="M5 12h14"]');
      const isLeftChevron = icon.classList.contains("-rotate-90");

      if (isPlusMinus) {
        // CSS handles plus/minus via aria-expanded
      } else if (isLeftChevron) {
        icon.classList.add("rotate-0");
        icon.classList.remove("-rotate-90");
      } else {
        icon.classList.add("rotate-180");
      }
    }

    this.activeIndices.add(index);
  }

  close(index) {
    const items = this.ownItemTargets;
    const triggers = this.ownTriggerTargets;
    const contents = this.ownContentTargets;
    const icons = this.ownIconTargets;

    const item = items[index];
    const trigger = triggers[index];
    const content = contents[index];
    const icon = icons[index];

    if (!item || !trigger || !content) return;

    // Set closed state - CSS Grid handles the animation
    item.dataset.state = "closed";
    trigger.setAttribute("aria-expanded", "false");
    trigger.dataset.state = "closed";
    content.dataset.state = "closed";

    // Update inner wrapper and body states for opacity transition
    this._updateInnerStates(content, "closed");

    // Handle icon animation
    if (icon) {
      const isPlusMinus = icon.querySelector('path[d*="M5 12h14"]');
      const isLeftChevron = icon.classList.contains("rotate-0");

      if (isPlusMinus) {
        // CSS handles plus/minus via aria-expanded
      } else if (isLeftChevron) {
        icon.classList.remove("rotate-0");
        icon.classList.add("-rotate-90");
      } else {
        icon.classList.remove("rotate-180");
      }
    }

    // Remove any existing listener
    if (content._onTransitionEnd) {
      content.removeEventListener("transitionend", content._onTransitionEnd);
    }

    // Add hidden after transition completes for accessibility
    content._onTransitionEnd = (e) => {
      if (e.propertyName === "grid-template-rows" && content.dataset.state === "closed") {
        content.setAttribute("hidden", "");
      }
      content.removeEventListener("transitionend", content._onTransitionEnd);
    };
    content.addEventListener("transitionend", content._onTransitionEnd);

    this.activeIndices.delete(index);
  }

  // Update data-state on inner wrapper elements (for opacity transitions)
  _updateInnerStates(content, state) {
    // Find direct children with data-state attribute and update them
    const innerElements = content.querySelectorAll(":scope > [data-state], :scope > * > [data-state]");
    innerElements.forEach((el) => {
      // Only update if it's not a nested accordion element
      if (
        !el.closest('[data-controller="accordion"]') ||
        el.closest('[data-controller="accordion"]') === this.element
      ) {
        el.dataset.state = state;
      }
    });
  }
}
