import { Controller } from "@hotwired/stimulus";

// Shoelace Color Picker Controller
//
// Keeps a value display and optional hidden form input in sync with <sl-color-picker>.
// Also supports optional custom swatch buttons.
export default class extends Controller {
  static targets = ["picker", "value", "input", "swatch"];

  static values = {
    defaultValue: { type: String, default: "#3b82f6" },
  };

  connect() {
    this.sync(this.currentColor());
  }

  change(event) {
    const color = event.target.value;
    this.sync(color);
    this.dispatchChangeEvent(color);
  }

  selectSwatch(event) {
    event.preventDefault();
    const color = event.currentTarget.dataset.color;

    if (!color || !this.hasPickerTarget) {
      return;
    }

    this.pickerTarget.value = color;
    this.sync(color);
    this.dispatchChangeEvent(color);
  }

  currentColor() {
    if (this.hasPickerTarget && this.pickerTarget.value) {
      return this.pickerTarget.value;
    }

    return this.defaultValueValue;
  }

  sync(color) {
    const nextColor = color || this.defaultValueValue;

    if (this.hasPickerTarget && this.pickerTarget.value !== nextColor) {
      this.pickerTarget.value = nextColor;
    }

    if (this.hasValueTarget) {
      this.valueTarget.textContent = nextColor;
    }

    if (this.hasInputTarget) {
      this.inputTarget.value = nextColor;
    }

    this.updateSwatchSelection(nextColor);
  }

  updateSwatchSelection(selectedColor) {
    const normalized = (selectedColor || "").toLowerCase();

    this.swatchTargets.forEach((swatch) => {
      const swatchColor = (swatch.dataset.color || "").toLowerCase();
      const isSelected = swatchColor === normalized;

      swatch.setAttribute("aria-pressed", isSelected ? "true" : "false");
      swatch.classList.toggle("ring-neutral-500", isSelected);
      swatch.classList.toggle("dark:ring-neutral-400", isSelected);
      swatch.classList.toggle("ring-transparent", !isSelected);
    });
  }

  dispatchChangeEvent(color) {
    const event = new CustomEvent("color-picker:change", {
      bubbles: true,
      detail: { color },
    });

    this.element.dispatchEvent(event);
  }
}
