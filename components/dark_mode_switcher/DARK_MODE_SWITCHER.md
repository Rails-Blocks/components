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
- Floating UI and `tooltip_controller.js` for the optional tooltips on the segmented and icon-only variants

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

## Options

| Option | Default | Description |
| --- | --- | --- |
| `variant` | `segmented` | Presentation to render: `segmented`, `cycle`, or `cycle_icon`. Use strings with the shared partial and strings or symbols with the ViewComponent. |
| `classes` | `nil` | Additional classes for the outer wrapper. |

## Preference contract

The `theme` localStorage key contains `light` or `dark`. System mode removes the key, allowing the controller to follow the operating-system preference. The resolved palette is exposed through `data-theme="light|dark"`, the root `dark` class, and the CSS `color-scheme` property.

The controller also mirrors dark mode to the root `sl-theme-dark` class for compatibility with Shoelace-backed controls. Remove that class toggle from `paintDocument` if your application does not need it.

The Theme Builder is a separate concern: it configures semantic design tokens in an isolated preview and does not read or write this light/dark preference.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB:** Use one of the three examples when you want complete control over the switcher markup and styling.
- **ERB template partial:** Use when you want a reusable render call with a `variant` local.
- **ViewComponent:** Use when your application already uses ViewComponent or you prefer a Ruby initializer for the variant and wrapper classes.

### Quick Reference

- **Vanilla examples:** `app/views/components/dark_mode_switcher/`
- **ERB partial:** `app/views/shared/components/dark_mode_switcher/_dark_mode_switcher.html.erb`
- **ERB usage:** `render "shared/components/dark_mode_switcher/dark_mode_switcher"`
- **ViewComponent:** `render DarkModeSwitcher::Component.new(...)`
- **Stimulus controller:** `app/javascript/controllers/theme_controller.js`
- **Optional tooltip dependency:** `tooltip_controller.js` and Floating UI for the `segmented` and `cycle_icon` variants

### Implementation Checklist

- Configure Tailwind's class-based `dark` variant.
- Put the pre-paint script in `<head>` before stylesheets so the saved or system palette is applied before rendering.
- Install and register `theme_controller.js` for every variant.
- Install the Tooltip component and Floating UI when retaining tooltips on the segmented or icon-only variant; otherwise remove their tooltip data attributes.
- Preserve the `theme` storage key contract: store `light` or `dark`, and remove the key for System mode.
- Preserve the Stimulus targets, mode data attributes, actions, radiogroup roles, `aria-checked` state, and roving `tabindex` behavior.
- Keep the click-cycle order as System, Light, then Dark unless the controller and accessible labels are updated together.
- Treat System as a preference that resolves to light or dark, not as a third visual palette.
- Keep accent and base color customization in a separate semantic-token theme system.

### Common Patterns

- **Application switcher:** Use `segmented` when all three preferences should remain visible.
- **Settings button:** Use `cycle` when a compact control should retain a visible mode label.
- **Toolbar action:** Use `cycle_icon` when space is limited and the tooltip dependency is acceptable.
- **Multiple switchers:** Reuse the same controller; its window event keeps instances on the page synchronized.

### Common Mistakes

- Do not save the literal value `system`; System mode is represented by removing the `theme` key.
- Do not implement segmented-control keyboard behavior through a tabs controller; it belongs to `theme_controller.js`.
- Do not remove the pre-paint script and rely only on Stimulus, or dark-mode users may see a light-theme flash.
- Do not remove `theme:changed`, `storage`, or media-query handling when multiple controls, browser tabs, or System mode must remain synchronized.
- Do not keep tooltip data attributes without also installing `tooltip_controller.js` and Floating UI.
- Do not use custom theme names as preference modes without extending the storage, resolution, painting, and accessibility contracts together.
