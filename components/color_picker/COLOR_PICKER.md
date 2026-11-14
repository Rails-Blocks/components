# Color Picker Component

A fully custom color picker for Rails built with Tailwind CSS and Stimulus. It has a configurable color area (saturation/brightness, hue/saturation, hue/brightness, a wheel, or none), hue/saturation/brightness/opacity sliders in any combination, swatches, an eyedropper, copy to clipboard, and HEX/RGB/HSL/HSV/OKLCH output. It needs no web components or theme stylesheets.

## Features

- Four area types: `sv` (saturation × brightness, the default), `hs` (hue × saturation), `hv` (hue × brightness), and `wheel` (hue angle, saturation radius), or no area at all
- Hue, saturation, and brightness sliders in any combination, plus an optional opacity slider, so hue-only strips and slider-only pickers work out of the box
- Editable text value that accepts HEX (3/4/6/8 digits), `rgb()`, `hsl()`, `hsv()`, `oklch()`, and CSS color names
- Format toggle that cycles HEX → RGB → HSL → HSV → OKLCH
- Swatches inside the panel, with the active swatch highlighted
- EyeDropper button (hidden automatically when the browser does not support it)
- Click the preview to copy the current value
- Dropdown rendered in the top layer with the Popover API (never clipped by `overflow: hidden`) and anchored with Floating UI, or an always-visible inline mode
- Small, medium, and large sizes that scale the trigger and the whole panel
- Smooth by default: handles move with `transform` only, pointer moves are coalesced to one render per frame, and the grid hides the cursor while dragging
- 16px value field on touch devices so iOS doesn't zoom in on focus
- Keyboard support for every handle (arrow keys, Shift for larger steps, Alt/Option for fine steps, Home/End, Escape)
- Hidden input for form submissions, plus `color-picker:input` and `color-picker:change` events
- Dark mode and reduced-motion support

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/color_picker/` | Full control, copy-paste |
| **Shared Partials** | `app/views/shared/components/color_picker/` | Reusable partials, data-driven |
| **ViewComponent** | `app/components/color_picker/` | Ruby API + testability |

---

## Installation

### 1. Stimulus controller

Add `app/javascript/controllers/color_picker_controller.js`.

### 2. Floating UI

The dropdown panel is positioned with Floating UI. With importmaps:

```ruby
# config/importmap.rb
pin "@floating-ui/dom", to: "https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.8.0/+esm"
```

Or install it with `npm install @floating-ui/dom` / `yarn add @floating-ui/dom`.

No extra CSS is required. All styling uses Tailwind utility classes.

---

## Stimulus Controller

### Values

| Value | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `value` | String | `"#3b82f6"` | Current color (any supported format). Kept in sync on every commit; change it to update the picker |
| `format` | String | `"hex"` | Output format: `hex`, `rgb`, `hsl`, `hsv`, `oklch` |
| `opacity` | Boolean | `false` | Enable the alpha channel |
| `uppercase` | Boolean | `false` | Output uppercase values |
| `inline` | Boolean | `false` | Panel is always visible (no dropdown) |
| `disabled` | Boolean | `false` | Disable all interactions |
| `placement` | String | `"bottom-start"` | Floating UI placement for the dropdown |
| `sheetBelow` | Number | `640` | Below this viewport width the dropdown opens as a bottom sheet over a backdrop, pinned above the on-screen keyboard. `0` keeps it anchored |
| `native` | String | `"auto"` | `auto`: system color picker on iPhone/iPad (see below); `true`: wherever `<input type="color">` exists; `false`: always the custom panel |
| `area` | String | `"sv"` | Axes of the `grid` target: `sv`, `hs`, `hv`, or `wheel` (square element, `rounded-full`) |

### Targets

| Target | Required | Description |
| ------ | -------- | ----------- |
| `trigger` | Dropdown only | Button that toggles the panel |
| `triggerSwatch` | No | Element whose background shows the current color |
| `panel` | Yes | Picker panel |
| `grid` / `gridThumb` / `gridHandle` | No | 2D color area (axes set by `area`), full-size transform layer, and handle |
| `hue` / `hueThumb` / `hueHandle` | No | Hue slider track, transform layer, and handle |
| `saturation` / `saturationThumb` / `saturationHandle` | No | Saturation slider (gradient painted for the current hue and brightness) |
| `brightness` / `brightnessThumb` / `brightnessHandle` | No | Brightness slider (gradient painted for the current hue and saturation) |
| `alpha` / `alphaThumb` / `alphaHandle` / `alphaGradient` | With opacity | Opacity slider track, transform layer, handle, and gradient overlay |
| `preview` / `previewSwatch` | No | Copy button and its swatch. Gets `data-copied` after copying and `data-contrast="light|dark"` for icon color |
| `textField` | No | Editable value input |
| `formatButton` | No | Format toggle button |
| `eyeDropper` | No | EyeDropper button |
| `swatch` | No | Preset buttons with `data-color` |
| `input` | No | Hidden form input kept in sync |
| `value` | No | Any element whose text shows the current color |
| `sheetHandle` | Dropdown only | Grab handle shown when the panel opens as a bottom sheet (hidden otherwise) |

### Actions

| Action | Typical binding |
| ------ | --------------- |
| `toggle` | `click->color-picker#toggle` on the trigger |
| `dismiss` | `click` on the bottom sheet's grab handle (it is the sheet's "Close" button) |
| `startSheetDrag` | `pointerdown` on the grab handle: drag the sheet down to close it |
| `closeOnEscape` | `keydown.esc->color-picker#closeOnEscape` on the controller element |
| `startGridDrag` / `startHueDrag` / `startSaturationDrag` / `startBrightnessDrag` / `startAlphaDrag` | `pointerdown` on each track |
| `gridKeydown` / `hueKeydown` / `saturationKeydown` / `brightnessKeydown` / `alphaKeydown` | `keydown` on each handle |
| `textInput` / `textCommit` | `input`, `change`, and `keydown.enter` on the text field |
| `cycleFormat` | `click` on the format button |
| `selectSwatch` | `click` on a swatch |
| `pickFromScreen` | `click` on the eyedropper button |
| `copy` | `click` on the preview |

### Events

| Event | Detail | Description |
| ----- | ------ | ----------- |
| `color-picker:input` | `{ color, format, rgba, hsva, okhsva }` | Fired continuously while dragging or typing |
| `color-picker:change` | `{ color, format, rgba, hsva, okhsva }` | Fired when a color is committed |

The hidden `input` target also dispatches native `input` and `change` events.

---

## Plain ERB

Copy any example from `app/views/components/color_picker/`. The minimal structure is:

```erb
<div class="group/picker relative inline-flex items-center gap-3"
     data-controller="color-picker"
     data-color-picker-value-value="#3b82f6"
     data-action="keydown.esc->color-picker#closeOnEscape">
  <button type="button" aria-haspopup="dialog" aria-expanded="false"
          data-color-picker-target="trigger" data-action="color-picker#toggle">
    <span data-color-picker-target="triggerSwatch"></span>
  </button>

  <div class="absolute top-0 left-0 m-0 w-64 ..." popover="manual" role="dialog" data-state="closed"
       data-color-picker-target="panel">
    <div class="relative h-40 touch-none" data-color-picker-target="grid"
         data-action="pointerdown->color-picker#startGridDrag">
      <%# the controller paints the area on a canvas inside this element %>
      <div class="pointer-events-none absolute inset-0" data-color-picker-target="gridThumb">
        <span role="slider" tabindex="0" data-color-picker-target="gridHandle"
              data-action="keydown->color-picker#gridKeydown"></span>
      </div>
    </div>
    <div class="relative h-3 touch-none" data-color-picker-target="hue"
         data-action="pointerdown->color-picker#startHueDrag">
      <div class="pointer-events-none absolute inset-0" data-color-picker-target="hueThumb">
        <span role="slider" tabindex="0" data-color-picker-target="hueHandle"
              data-action="keydown->color-picker#hueKeydown"></span>
      </div>
    </div>
    <input type="text" data-color-picker-target="textField"
           data-action="input->color-picker#textInput change->color-picker#textCommit keydown.enter->color-picker#textCommit">
  </div>

  <input type="hidden" name="settings[brand_color]" data-color-picker-target="input">
</div>
```

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/color_picker/color_picker",
  id: "my_color",
  label: "Choose a color",
  value: "#3b82f6"
%>
```

### With Options

```erb
<%= render "shared/components/color_picker/color_picker",
  id: "brand_color",
  name: "settings[brand_color]",
  label: "Brand color",
  value: "#8b5cf6cc",
  format: "hex",
  size: "medium",
  opacity: true,
  swatches: ["#1a202c", "#2d3748", "#4a5568", "#718096"],
  required: true
%>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `id` | String | auto-generated | Trigger ID (panel uses `#{id}_panel`) |
| `name` | String | `nil` | Hidden input name for form submissions |
| `value` | String | `"#3b82f6"` | Initial color value |
| `label` | String | `"Color"` | Accessible label for the trigger and panel |
| `format` | String | `"hex"` | `"hex"`, `"rgb"`, `"hsl"`, `"hsv"`, `"oklch"` |
| `size` | String | `"medium"` | Picker size (trigger + panel): `"small"`, `"medium"`, `"large"` |
| `area` | String | `"sv"` | `"sv"`, `"hs"`, `"hv"`, `"wheel"`, or `"none"` |
| `sliders` | Array | per area | Any of `"hue"`, `"saturation"`, `"brightness"` |
| `opacity` | Boolean | `false` | Enable alpha channel |
| `no_format_toggle` | Boolean | `false` | Hide format toggle |
| `no_eye_dropper` | Boolean | `false` | Hide EyeDropper button |
| `uppercase` | Boolean | `false` | Output uppercase values |
| `inline` | Boolean | `false` | Render the panel inline |
| `placement` | String | `"bottom-start"` | Dropdown placement: `top`, `right`, `bottom`, `left`, each optionally `-start`/`-end` |
| `sheet_below` | Integer | `640` | Below this width (px) the dropdown opens as a bottom sheet; `0` disables |
| `native` | Symbol/String | `:auto` | `:auto` uses the system picker on iPhone/iPad, `true` wherever supported, `false` never |
| `swatches` | Array/String | `[]` | Array or semicolon string, shown in the panel. Values that aren't plain color syntax are dropped (they end up in `style` attributes) |
| `show_value` | Boolean | `true` | Show value text next to the trigger (dropdown only) |
| `disabled` | Boolean | `false` | Disable picker |
| `required` | Boolean | `false` | Accepted for form-builder compatibility. A color picker always holds a value, so it never blocks submission |
| `classes` | String | `nil` | Additional wrapper classes |

---

## ViewComponent

### Basic Usage

```erb
<%= render ColorPicker::Component.new(
  id: "my_color",
  label: "Choose a color",
  value: "#3b82f6"
) %>
```

### With Options

```erb
<%= render ColorPicker::Component.new(
  id: "brand_color",
  name: "settings[brand_color]",
  label: "Brand color",
  value: "#8b5cf6",
  format: :hsl,
  size: :large,
  inline: true,
  swatches: ["#1a202c", "#2d3748", "#4a5568", "#718096"]
) %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `id` | String | auto-generated | Trigger ID (panel uses `#{id}_panel`) |
| `name` | String | `nil` | Hidden input name for form submissions |
| `value` | String | `"#3b82f6"` | Initial color value |
| `label` | String | `"Color"` | Accessible label for the trigger and panel |
| `format` | Symbol/String | `:hex` | `:hex`, `:rgb`, `:hsl`, `:hsv`, `:oklch` |
| `size` | Symbol/String | `:medium` | Picker size (trigger + panel): `:small`, `:medium`, `:large` |
| `area` | Symbol/String | `:sv` | `:sv`, `:hs`, `:hv`, `:wheel`, or `:none` |
| `sliders` | Array | per area | Any of `:hue`, `:saturation`, `:brightness` |
| `opacity` | Boolean | `false` | Enable alpha channel |
| `no_format_toggle` | Boolean | `false` | Hide format toggle |
| `no_eye_dropper` | Boolean | `false` | Hide EyeDropper button |
| `uppercase` | Boolean | `false` | Output uppercase values |
| `inline` | Boolean | `false` | Render the panel inline |
| `placement` | String | `"bottom-start"` | Dropdown placement: `top`, `right`, `bottom`, `left`, each optionally `-start`/`-end` |
| `sheet_below` | Integer | `640` | Below this width (px) the dropdown opens as a bottom sheet; `0` disables |
| `native` | Symbol/String | `:auto` | `:auto` uses the system picker on iPhone/iPad, `true` wherever supported, `false` never |
| `swatches` | Array/String | `[]` | Array or semicolon string, shown in the panel. Values that aren't plain color syntax are dropped (they end up in `style` attributes) |
| `show_value` | Boolean | `true` | Show value text next to the trigger (dropdown only) |
| `disabled` | Boolean | `false` | Disable picker |
| `required` | Boolean | `false` | Accepted for form-builder compatibility. A color picker always holds a value, so it never blocks submission |
| `classes` | String | `nil` | Additional wrapper classes |

---

## Area Types and Sliders

| `area` | X axis | Y axis | Default `sliders` | Good for |
| ------ | ------ | ------ | ----------------- | -------- |
| `sv` | Saturation | Brightness | `hue` | General purpose, matches most design tools |
| `hs` | Hue | Saturation | `brightness` | Theme builders, picking light/pastel tones across hues |
| `hv` | Hue | Brightness | `saturation` | Dark/light variants across hues at fixed vividness |
| `wheel` | Hue (angle) | Saturation (radius) | `brightness` | Painting apps, color harmony tools, lighting |
| `none` | — | — | `hue`, `saturation`, `brightness` | Hue-only strips (`sliders: [:hue]`), precise per-channel editors |

Opacity is added with `opacity: true` and always renders last. Pass `sliders:` to override the defaults, e.g. `sliders: [:hue, :saturation, :brightness]` under an `sv` area, or `sliders: []` for an area on its own. With a hue-only picker, saturation and brightness keep the initial value's levels, so every hue has the same tone.

All channels are Okhsv, so hue steps look even and brightness is perceptual.

---

## Mobile Behavior

| Device | What opens |
| ------ | ---------- |
| iPhone / iPad (`native: :auto`) | The system color picker (grid, spectrum, sliders, eyedropper, saved colors), anchored to the trigger. On iOS 18.4+ it includes an opacity slider when `opacity` is on |
| Other screens under `sheet_below` (Android phones) | The custom panel as a bottom sheet with a grab handle (drag down or tap to close), pinned above the keyboard |
| Wider screens | The custom panel anchored to the trigger |

With the system picker the value is still converted to `format`, written to the hidden input, and sent with the usual events. It has no swatches, area types, or format toggle, so `auto` keeps the custom panel for pickers without an area (`area: :none`, hue-only and slider-only) and for opacity pickers on iOS versions before 18.4. Pass `native: false` to always use the custom panel.

---

## Output Formats

| Format | Without opacity | With opacity |
| ------ | --------------- | ------------ |
| `hex` | `#3b82f6` | `#3b82f6cc` |
| `rgb` | `rgb(59, 130, 246)` | `rgba(59, 130, 246, 0.8)` |
| `hsl` | `hsl(217, 91%, 60%)` | `hsla(217, 91%, 60%, 0.8)` |
| `hsv` | `hsv(217, 76%, 96%)` | `hsva(217, 76%, 96%, 0.8)` |
| `oklch` | `oklch(62.3% 0.188 259.8)` | `oklch(62.3% 0.188 259.8 / 0.8)` |

---

## Accessibility

- The trigger has `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`, and announces the current color via `aria-description`
- The area handle and every slider handle (hue, saturation, brightness, opacity) are focusable `role="slider"` elements with live values
- Arrow keys adjust values (Shift for steps of 10, Alt/Option for steps of 0.1), Home/End jump to the ends of sliders
- Hold Alt/Option while dragging for fine control at a tenth of the speed
- Escape closes the dropdown and returns focus to the trigger; tabbing out of the panel closes it too
- Disabled pickers take their handles out of the tab order and mark them `aria-disabled`
- Swatch buttons expose `aria-label` and `aria-pressed`
- The open/close animation is disabled with `prefers-reduced-motion`

---

## Listening to Changes

```javascript
document.addEventListener("color-picker:input", (event) => {
  console.log("Previewing:", event.detail.color)
})

document.addEventListener("color-picker:change", (event) => {
  const { color, format, rgba, hsva, okhsva } = event.detail
  console.log("Color changed:", color)
})
```

Set a color programmatically through the Stimulus controller instance:

```javascript
const element = document.querySelector("[data-controller~='color-picker']")
const picker = window.Stimulus.getControllerForElementAndIdentifier(element, "color-picker")
picker.setColor("rebeccapurple")
picker.getColor("rgb") // "rgb(102, 51, 153)"
```

---

## Troubleshooting

**Dropdown does not open:** Ensure `@floating-ui/dom` is pinned or installed and the trigger has `data-action="color-picker#toggle"`.

**Swatches do not highlight:** Each swatch needs `data-color` and `data-color-picker-target="swatch"`. Highlighting uses the `aria-pressed:` Tailwind variant.

**Hidden input does not update:** Add `name:` so the hidden input is rendered with `data-color-picker-target="input"`.

**Panel is clipped or behind other content:** The dropdown panel needs the `popover="manual"` attribute so it renders in the top layer. Browsers without the Popover API fall back to a fixed-position panel.

**Format not applied:** Use only valid formats: `hex`, `rgb`, `hsl`, `hsv`, `oklch`.

**Changing the color after render:** Set `data-color-picker-value-value` (the picker updates without firing change events) or call `setColor(...)` on the controller (fires `color-picker:change`, see Listening to Changes). The attribute always holds the last committed color, so Turbo's back/forward cache restores the picked color.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/color_picker/`
- **Shared partial files**: `app/views/shared/components/color_picker/`
- **shared partial**: `render "shared/components/color_picker/color_picker"`
- **ViewComponent**: `render ColorPicker::Component.new(...)`
- **ViewComponent files**: `app/components/color_picker/`
- **Stimulus controller**: `app/javascript/controllers/color_picker_controller.js` (identifier `color-picker`)

### Implementation Checklist

- Pick one implementation path first, then stay consistent within that example.
- Use only documented locals, initializer arguments, and Stimulus values.
- Copy the base example before adding app-specific styling or behavior.
- Keep the documented Stimulus targets, actions, values, and ARIA wiring intact.
- Keep the `group/picker` class on the controller element and the `*Thumb` layers around each handle; styling and handle movement depend on them.
- Keep format, size, area, and slider values exactly as documented.
- For a `wheel` area keep the track square (`aspect-square rounded-full`); for other areas give it a height.
- Each slider needs its matching track, `*Thumb`, and `*Handle` targets plus its `start*Drag`/`*Keydown` actions.
- Make sure `@floating-ui/dom` is available for dropdown pickers.

### Common Patterns

- **Vanilla / plain ERB**: Best for one-off pages, direct markup edits, and quick adaptations of the shipped examples.
- **shared partial**: Best for reusable Rails view partials driven by locals or collections.
- **ViewComponent**: Best for reusable component implementations that benefit from Ruby-side defaults and testable composition.
- Use `inline: true` for editors and settings panels, the dropdown for compact form fields. On phones the dropdown opens as a bottom sheet, and on iPhone/iPad the system picker opens instead (`native`). Keep the `group/panel` and `data-sheet:*` classes on the panel and the hidden grab handle (`sheetHandle` target, `group-data-sheet/panel:flex`) when copying markup.
- Use `area: :none, sliders: [:hue]` for tag/label/avatar colors where only the hue should change; `area: :wheel` for painting tools; `area: :hs` for theme builders.
- Use `name:` to submit the color with a form; listen to `color-picker:change` for live previews elsewhere on the page.

### Common Mistakes

- Do not load Shoelace or use `<sl-color-picker>`; this component no longer depends on it.
- Do not use the old `shoelace-color-picker` controller identifier or the removed `show_swatches` option. Swatches render inside the panel whenever `swatches` is present.
- Do not invent area types (only `sv`, `hs`, `hv`, `wheel`, `none`) or slider names (only `hue`, `saturation`, `brightness`; opacity comes from `opacity`).
- Do not mix shared partial locals with ViewComponent initializer arguments in the same example.
- Do not remove required wrapper elements, IDs, or data attributes when copying the component.
- Do not swap the documented render path for a guessed partial or component name.
