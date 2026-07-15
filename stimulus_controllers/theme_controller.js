import { Controller } from "@hotwired/stimulus";

const STORAGE_KEY = "theme";
const SYSTEM_MODE = "system";
const AVAILABLE_MODES = [SYSTEM_MODE, "light", "dark"];
const MODE_LABELS = { system: "System", light: "Light", dark: "Dark" };

export default class extends Controller {
  static classes = ["selected", "unselected"];
  static targets = ["option", "picker", "cycleButton", "cycleIcon", "cycleLabel"];

  initialize() {
    this.colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    this.systemPreferenceChanged = this.systemPreferenceChanged.bind(this);
    this.themeChanged = this.themeChanged.bind(this);
    this.storageChanged = this.storageChanged.bind(this);

    // The layout's inline script handles the first paint. This keeps the DOM
    // correct as soon as Stimulus initializes on subsequent renders.
    this.refresh();
  }

  connect() {
    this.refresh();
    if (this.hasPickerTarget) this.pickerTarget.classList.remove("opacity-0");

    this.colorSchemeQuery.addEventListener("change", this.systemPreferenceChanged);
    window.addEventListener("theme:changed", this.themeChanged);
    window.addEventListener("storage", this.storageChanged);
  }

  disconnect() {
    this.colorSchemeQuery.removeEventListener("change", this.systemPreferenceChanged);
    window.removeEventListener("theme:changed", this.themeChanged);
    window.removeEventListener("storage", this.storageChanged);
  }

  choose(event) {
    this.commit(event.currentTarget.dataset.themeMode);
  }

  cycle() {
    const currentIndex = AVAILABLE_MODES.indexOf(this.mode);
    const nextMode = AVAILABLE_MODES[(currentIndex + 1) % AVAILABLE_MODES.length];

    this.commit(nextMode);
  }

  navigate(event) {
    const currentIndex = this.optionTargets.indexOf(event.currentTarget);
    if (currentIndex === -1) return;

    const nextIndex = this.destinationIndex(event.key, currentIndex);
    if (nextIndex === null) return;

    event.preventDefault();

    const nextOption = this.optionTargets[nextIndex];
    nextOption.focus();
    this.commit(nextOption.dataset.themeMode);
  }

  commit(mode) {
    if (!AVAILABLE_MODES.includes(mode)) return;

    this.store(mode);
    this.refresh();
    this.announce();
  }

  refresh() {
    const mode = this.mode;
    const palette = this.resolve(mode);

    this.paintDocument(palette);
    this.paintOptions(mode);
    this.paintCycle(mode);
  }

  systemPreferenceChanged() {
    if (this.mode !== SYSTEM_MODE) return;

    this.refresh();
    this.announce();
  }

  themeChanged() {
    this.refresh();
  }

  storageChanged(event) {
    if (event.storageArea !== localStorage) return;
    if (event.key !== STORAGE_KEY && event.key !== null) return;

    this.refresh();
    this.announce();
  }

  destinationIndex(key, currentIndex) {
    switch (key) {
      case "ArrowLeft":
      case "ArrowUp":
        return (currentIndex - 1 + this.optionTargets.length) % this.optionTargets.length;
      case "ArrowRight":
      case "ArrowDown":
        return (currentIndex + 1) % this.optionTargets.length;
      case "Home":
        return 0;
      case "End":
        return this.optionTargets.length - 1;
      default:
        return null;
    }
  }

  store(mode) {
    if (mode === SYSTEM_MODE) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  }

  resolve(mode) {
    if (mode !== SYSTEM_MODE) return mode;

    return this.colorSchemeQuery.matches ? "dark" : "light";
  }

  paintDocument(palette) {
    const dark = palette === "dark";
    const root = document.documentElement;

    root.classList.toggle("dark", dark);
    root.classList.toggle("sl-theme-dark", dark);
    root.style.colorScheme = palette;
    root.dataset.theme = palette;
  }

  paintOptions(mode) {
    this.optionTargets.forEach((option) => {
      const selected = option.dataset.themeMode === mode;

      option.setAttribute("aria-checked", selected.toString());
      option.tabIndex = selected ? 0 : -1;

      if (selected) {
        option.classList.add(...this.selectedClasses);
        option.classList.remove(...this.unselectedClasses);
      } else {
        option.classList.remove(...this.selectedClasses);
        option.classList.add(...this.unselectedClasses);
      }
    });
  }

  paintCycle(mode) {
    this.cycleIconTargets.forEach((icon) => {
      icon.toggleAttribute("hidden", icon.dataset.themeMode !== mode);
    });

    if (this.hasCycleLabelTarget) this.cycleLabelTarget.textContent = MODE_LABELS[mode];
    if (!this.hasCycleButtonTarget) return;

    const nextIndex = (AVAILABLE_MODES.indexOf(mode) + 1) % AVAILABLE_MODES.length;
    const nextMode = AVAILABLE_MODES[nextIndex];

    this.cycleButtonTarget.setAttribute(
      "aria-label",
      `${MODE_LABELS[mode]} theme. Switch to ${MODE_LABELS[nextMode].toLowerCase()} theme`,
    );
  }

  announce() {
    const mode = this.mode;

    this.dispatch("changed", {
      target: window,
      detail: {
        mode,
        palette: this.resolve(mode),
      },
    });
  }

  get mode() {
    const storedMode = localStorage.getItem(STORAGE_KEY);

    return AVAILABLE_MODES.includes(storedMode) ? storedMode : SYSTEM_MODE;
  }
}
