import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["mac", "nonMac"];

  connect() {
    this.detectOS();
  }

  detectOS() {
    const isMac = this.#isMac();

    // Show/hide mac-specific elements
    this.macTargets.forEach((el) => {
      el.classList.toggle("hidden", !isMac);
    });

    // Show/hide non-mac elements
    this.nonMacTargets.forEach((el) => {
      el.classList.toggle("hidden", isMac);
    });
  }

  #isMac() {
    // Use modern userAgentData API when available
    if (navigator.userAgentData && navigator.userAgentData.platform) {
      return navigator.userAgentData.platform === "macOS";
    }

    // Fallback to userAgent detection
    return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
  }
}
