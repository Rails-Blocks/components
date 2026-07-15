# Dark Mode Switcher

A persistent System, Light, and Dark preference switcher built with Stimulus and Tailwind CSS. The component is named Dark Mode Switcher, while its reusable Stimulus controller remains `theme_controller.js`.

## Features

- Segmented radiogroup matching the Rails Blocks app switcher
- Single-button click-cycle variant
- Icon-only click-cycle variant with a tooltip
- System preference support through `prefers-color-scheme`
- `localStorage` persistence and cross-tab synchronization
- Arrow, Home, and End keyboard navigation for the segmented control
- Native keyboard behavior for the cycle button
- Synchronized multiple switcher instances
- Accessible labels and selected state
- Pre-paint setup that prevents a light/dark flash

## Requirements

- Rails 7+
- Tailwind CSS 4+
- Stimulus
- Floating UI and `tooltip_controller.js` for the optional segmented-control tooltips

Install `theme_controller.js` in `app/javascript/controllers`. If you retain the tooltips, also install the Rails Blocks Tooltip component and `tooltip_controller.js`.

## Tailwind setup

The controller toggles a `dark` class on the root HTML element. Configure Tailwind to use it:

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```

## Pre-paint script

Put this in the document `<head>` before stylesheets:

```html
<script>
  (function() {
    const storedMode = localStorage.getItem("theme");
    const palette = storedMode === "light" || storedMode === "dark"
      ? storedMode
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const root = document.documentElement;

    root.classList.toggle("dark", palette === "dark");
    root.style.colorScheme = palette;
    root.dataset.theme = palette;
  })();
</script>
```

## Shared partial

```erb
<%= render "shared/components/dark_mode_switcher/dark_mode_switcher" %>

<%= render "shared/components/dark_mode_switcher/dark_mode_switcher",
  variant: "cycle" %>

<%= render "shared/components/dark_mode_switcher/dark_mode_switcher",
  variant: "cycle_icon" %>
```

The supported variants are `segmented` (default), `cycle`, and `cycle_icon`.

## ViewComponent

```erb
<%= render DarkModeSwitcher::Component.new %>

<%= render DarkModeSwitcher::Component.new(variant: :cycle) %>

<%= render DarkModeSwitcher::Component.new(variant: :cycle_icon) %>
```

## Preference contract

The `theme` localStorage key contains `light` or `dark`. System mode removes the key, allowing the controller to follow the operating-system preference. The resolved palette is exposed through `data-theme="light|dark"`, the root `dark` class, and the CSS `color-scheme` property.

The Theme Builder is a separate concern: it configures semantic design tokens in an isolated preview and does not read or write this light/dark preference.
