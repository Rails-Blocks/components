import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["viewport", "list", "sentinel", "controls", "button", "spinner", "label", "end", "status"];
  static values = {
    url: String,
    scrollRoot: { type: String, default: "window" },
    rootMargin: { type: String, default: "0px 0px 120px" },
    animate: { type: Boolean, default: true },
    manual: { type: Boolean, default: false },
    loadMoreLabel: { type: String, default: "Load more" },
    loadingLabel: { type: String, default: "Loading..." },
    endMessage: { type: String, default: "You're all caught up" },
    errorMessage: { type: String, default: "More items could not be loaded. Try again." },
  };

  connect() {
    this.loading = false;
    this.abortController = null;
    this.buttonFadeFrame = null;
    this.nextAnimationStart = performance.now();
    this.animateItems(Array.from(this.listTarget.children));
    this.resetControls();

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) this.load();
      },
      {
        root: this.scrollRootValue === "container" ? this.viewportTarget : null,
        rootMargin: this.rootMarginValue,
        threshold: 0.01,
      },
    );

    if (this.hasUrlValue && this.urlValue) {
      if (!this.manualValue) this.observer.observe(this.sentinelTarget);
    } else {
      this.finish();
    }
  }

  disconnect() {
    this.observer?.disconnect();
    this.abortController?.abort();
    this.cancelButtonFade();
  }

  async load() {
    if (this.loading || !this.hasUrlValue || !this.urlValue) return;

    this.loading = true;
    this.observer.unobserve(this.sentinelTarget);
    this.setControlsSticky(true);
    this.controlsTarget.setAttribute("aria-busy", "true");
    this.showButton({ fade: true });
    this.endTarget.hidden = true;
    this.buttonTarget.disabled = true;
    this.spinnerTarget.hidden = false;
    this.labelTarget.textContent = this.loadingLabelValue;
    this.labelTarget.classList.add("animate-pulse");
    const requestController = new AbortController();
    this.abortController = requestController;

    try {
      const response = await fetch(this.urlValue, {
        headers: { Accept: "application/json" },
        credentials: "same-origin",
        signal: requestController.signal,
      });

      if (!response.ok) throw new Error(`Request failed with ${response.status}`);

      const { html, next_url: nextUrl } = await response.json();
      const newItems = this.append(html);

      this.urlValue = nextUrl || "";
      this.statusTarget.textContent = `${newItems.length} more items loaded.`;
      this.dispatch("loaded", { detail: { count: newItems.length, nextUrl: this.urlValue } });

      if (this.urlValue && newItems.length > 0) {
        this.resetControls();
        if (!this.manualValue) this.observer.observe(this.sentinelTarget);
      } else {
        this.finish();
      }
    } catch (error) {
      if (error.name !== "AbortError") this.showError();
    } finally {
      if (this.abortController === requestController) {
        this.loading = false;
        this.abortController = null;
      }
    }
  }

  append(html) {
    const template = document.createElement("template");
    template.innerHTML = html?.trim() || "";

    const items = Array.from(template.content.children);
    this.listTarget.append(template.content);
    this.animateItems(items);

    return items;
  }

  animateItems(items) {
    if (!this.animateValue || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const pendingItems = items.filter((item) => item.dataset.entered !== "true");
    const now = performance.now();
    const firstStart = Math.max(this.nextAnimationStart, now);

    pendingItems.forEach((item, index) => {
      const delay = firstStart + index * 45 - now;
      this.animateItem(item, delay);
    });

    this.nextAnimationStart = firstStart + pendingItems.length * 45;
  }

  animateItem(item, delay) {
    item.dataset.entered = "true";
    item.animate?.(
      [
        { opacity: 0, transform: "translateY(8px) scale(0.99)" },
        { opacity: 1, transform: "translateY(0) scale(1)" },
      ],
      {
        duration: 240,
        delay,
        easing: "cubic-bezier(0.215, 0.61, 0.355, 1)",
        fill: "backwards",
      },
    );
  }

  resetControls() {
    this.setControlsSticky(true);
    this.controlsTarget.removeAttribute("aria-busy");
    this.manualValue ? this.showButton() : this.hideButton();
    this.buttonTarget.disabled = false;
    this.spinnerTarget.hidden = true;
    this.labelTarget.textContent = this.loadMoreLabelValue;
    this.labelTarget.classList.remove("animate-pulse");
    this.endTarget.hidden = true;
  }

  finish() {
    this.observer?.disconnect();
    this.setControlsSticky(false);
    this.controlsTarget.removeAttribute("aria-busy");
    this.hideButton();
    this.labelTarget.classList.remove("animate-pulse");
    this.endTarget.hidden = false;
    this.endTarget.textContent = this.endMessageValue;
    this.statusTarget.textContent = "All items loaded.";
  }

  showError() {
    this.setControlsSticky(true);
    this.controlsTarget.removeAttribute("aria-busy");
    this.showButton();
    this.buttonTarget.disabled = false;
    this.spinnerTarget.hidden = true;
    this.labelTarget.textContent = "Try again";
    this.labelTarget.classList.remove("animate-pulse");
    this.statusTarget.textContent = this.errorMessageValue;
  }

  setControlsSticky(sticky) {
    this.controlsTarget.classList.toggle("sticky", sticky);
  }

  showButton({ fade = false } = {}) {
    this.cancelButtonFade();
    this.buttonTarget.hidden = false;

    if (!fade || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.buttonTarget.classList.remove("opacity-0");
      this.buttonTarget.classList.add("opacity-100");
      return;
    }

    this.buttonTarget.classList.remove("opacity-100");
    this.buttonTarget.classList.add("opacity-0");
    this.buttonFadeFrame = requestAnimationFrame(() => {
      this.buttonTarget.classList.remove("opacity-0");
      this.buttonTarget.classList.add("opacity-100");
      this.buttonFadeFrame = null;
    });
  }

  hideButton() {
    this.cancelButtonFade();
    this.buttonTarget.hidden = true;
    this.buttonTarget.classList.remove("opacity-100");
    this.buttonTarget.classList.add("opacity-0");
  }

  cancelButtonFade() {
    if (this.buttonFadeFrame === null) return;

    cancelAnimationFrame(this.buttonFadeFrame);
    this.buttonFadeFrame = null;
  }
}
