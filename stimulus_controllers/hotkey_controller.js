import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static values = {
    allowWhileTyping: { type: Boolean, default: false },
  };

  click(event) {
    this.#isClickable && !this.#shouldIgnore(event) && this.element.click();
  }

  #shouldIgnore(event) {
    // Always respect events that have already been handled
    if (event.defaultPrevented) return true;

    // If explicitly allowed, do not ignore while typing/focused in inputs
    if (this.hasAllowWhileTypingValue && this.allowWhileTypingValue === true) return false;

    const targetElement =
      event.target instanceof Element ? event.target : event.target instanceof Node ? event.target.parentElement : null;

    if (!targetElement) return false;

    return !!targetElement.closest("input, textarea, [contenteditable], trix-editor, .trix-dialog");
  }

  get #isClickable() {
    return getComputedStyle(this.element).pointerEvents !== "none";
  }
}
