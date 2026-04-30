import { Controller } from "@hotwired/stimulus";

// Connects to data-controller="conditional-field"
export default class extends Controller {
  static targets = ["conditionalField"];
  static values = {
    fieldMap: Object, // Maps input values to their corresponding conditional field targets
  };

  connect() {
    this.updateVisibility();
  }

  // Called when an input (radio or checkbox) changes
  change(event) {
    this.updateVisibility();
  }

  updateVisibility() {
    // Find all checked inputs (works for both radios and checkboxes)
    const checkedInputs = this.element.querySelectorAll('input:checked');
    const selectedValues = Array.from(checkedInputs).map(input => input.value);

    // Hide all conditional fields first
    this.conditionalFieldTargets.forEach((field) => {
      field.classList.add("hidden");
    });

    // Show the relevant fields based on selected values
    selectedValues.forEach((selectedValue) => {
      if (this.fieldMapValue[selectedValue]) {
        const targetFieldName = this.fieldMapValue[selectedValue];
        const targetField = this.conditionalFieldTargets.find(
          (field) => field.dataset.conditionalField === targetFieldName
        );

        if (targetField) {
          targetField.classList.remove("hidden");
        }
      }
    });
  }
}
