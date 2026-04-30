import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["content", "collapsedIcon", "expandedIcon"];
  static values = {
    open: Boolean,
    animated: { type: Boolean, default: true },
  };

  connect() {
    this.isOpen = this.openValue;
    this.updateDisplay({ animate: false });
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.updateDisplay();
  }

  updateDisplay({ animate = true } = {}) {
    if (!this.hasContentTarget) return;

    const shouldAnimate =
      animate && this.animatedValue && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const content = this.contentTarget;

    if (this.isOpen) {
      content.style.maxHeight = shouldAnimate ? content.scrollHeight + "px" : "none";
      content.style.opacity = "1";
      content.setAttribute("data-state", "open");
      this.element.setAttribute("data-state", "open");
    } else {
      content.style.maxHeight = "0";
      content.style.opacity = "0";
      content.setAttribute("data-state", "closed");
      this.element.setAttribute("data-state", "closed");
    }

    this.updateIconDisplay();
    this.openValue = this.isOpen;
  }

  updateIconDisplay() {
    if (!this.hasCollapsedIconTarget || !this.hasExpandedIconTarget) return;

    const collapsedIcon = this.collapsedIconTarget;
    const expandedIcon = this.expandedIconTarget;
    collapsedIcon.style.transition = "none";
    expandedIcon.style.transition = "none";
    collapsedIcon.style.filter = "";
    expandedIcon.style.filter = "";

    if (this.isOpen) {
      collapsedIcon.style.opacity = "0";
      expandedIcon.style.opacity = "1";
    } else {
      collapsedIcon.style.opacity = "1";
      expandedIcon.style.opacity = "0";
    }
  }
}
