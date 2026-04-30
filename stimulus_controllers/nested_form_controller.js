import { Controller } from "@hotwired/stimulus";

// Connects to data-controller="nested-form"
export default class extends Controller {
  static targets = ["container", "template", "item", "button", "maxHint"];
  static values = {
    index: Number,
    maxFields: {
      type: Number,
      default: 5,
    },
    minItems: {
      type: Number,
      default: 1,
    },
    maxHintText: String,
  };

  connect() {
    if (!this.hasIndexValue) {
      this.indexValue = this.itemTargets.length;
    }

    this.updateButtonStates();
  }

  add(event) {
    event.preventDefault();

    if (this.maxReached()) {
      return;
    }

    const content = this.templateTarget.innerHTML.replace(/NEW_RECORD/g, this.indexValue);
    this.containerTarget.insertAdjacentHTML("beforeend", content);
    this.indexValue += 1;

    const newItem = this.itemTargets[this.itemTargets.length - 1];
    const focusableField = newItem?.querySelector(
      "input:not([type='hidden']):not([disabled]), textarea:not([disabled]), select:not([disabled])",
    );

    if (focusableField) {
      requestAnimationFrame(() => focusableField.focus());
    }

    this.dispatchLifecycleEvent("add");
    this.updateButtonStates();
  }

  remove(event) {
    event.preventDefault();

    const item = event.currentTarget.closest('[data-nested-form-target="item"]');

    if (!item) {
      return;
    }

    if (!this.canRemoveItem()) {
      return;
    }

    const destroyInput = item.querySelector('input[name*="[_destroy]"]');

    if (item.dataset.newRecord === "true" || !destroyInput) {
      item.remove();
      this.dispatchLifecycleEvent("remove");
      this.updateButtonStates();
      return;
    }

    destroyInput.value = "1";
    item.classList.add("hidden");

    this.dispatchLifecycleEvent("remove");
    this.updateButtonStates();
  }

  activeItemCount() {
    return this.itemTargets.filter((item) => !item.classList.contains("hidden")).length;
  }

  canRemoveItem() {
    return this.activeItemCount() > this.minItemsValue;
  }

  updateButtonStates() {
    this.updateAddButtonState();
    this.updateRemoveButtonsState();
    this.updateMaxHintState();
  }

  updateAddButtonState() {
    const addButton = this.addButtonElement;
    if (!addButton) {
      return;
    }

    addButton.disabled = this.maxReached();
  }

  updateRemoveButtonsState() {
    const disableRemove = !this.canRemoveItem();
    this.removeButtons.forEach((button) => {
      button.disabled = disableRemove;
    });
  }

  get addButtonElement() {
    if (this.hasButtonTarget) {
      return this.buttonTarget;
    }

    return this.element.querySelector('[data-action~="nested-form#add"]');
  }

  get removeButtons() {
    return Array.from(this.element.querySelectorAll('[data-action~="nested-form#remove"]'));
  }

  updateMaxHintState() {
    if (!this.hasMaxHintTarget) {
      return;
    }

    const showHint = this.maxReached();
    this.maxHintTarget.classList.toggle("hidden", !showHint);

    if (this.hasMaxHintTextValue && this.maxHintTextValue.length > 0) {
      this.maxHintTarget.textContent = this.maxHintTextValue;
      return;
    }

    this.maxHintTarget.textContent = `Maximum of ${this.maxFieldsValue} items reached.`;
  }

  maxReached() {
    return this.maxFieldsValue > 0 && this.activeItemCount() >= this.maxFieldsValue;
  }

  dispatchLifecycleEvent(actionName) {
    this.element.dispatchEvent(new CustomEvent(`rails-nested-form:${actionName}`, { bubbles: true }));
  }
}
