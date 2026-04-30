import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    this.autogrow();
  }

  autogrow() {
    // Check if cursor is at the end before resizing
    const cursorAtEnd = this.element.selectionStart === this.element.value.length;

    // Resize the textarea
    this.element.style.height = "auto";
    this.element.style.height = `${this.element.scrollHeight}px`;

    // If cursor was at the end, scroll to bottom
    if (cursorAtEnd) {
      this.element.scrollTop = this.element.scrollHeight;
    }
  }
}
