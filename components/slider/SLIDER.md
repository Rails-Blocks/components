# Slider Component

Sliders let people pick a value or a range by dragging. One Stimulus controller (`slider_controller.js`) handles pointer, touch and keyboard input, ARIA, and form fields. It never positions anything itself: it publishes CSS variables and state attributes, and Tailwind classes in your markup read them. The same controller drives thin, thick, horizontal, vertical and two-thumb sliders.

## Features

- Single value and range (two thumbs) with a minimum distance
- Pointer, touch and keyboard input (arrows, Page Up / Down, Home, End, Shift for a large step)
- Escape during a drag puts the thumbs back
- Real form fields: one hidden input per thumb, form reset restores the starting values
- `Intl.NumberFormat` formatting (currency, units, percent, signs) and named steps
- Editable number fields bound to a thumb, which read numbers in the page language
- Vertical sliders, RTL, reduced motion, rubber-band overdrag (opt-in)
- Survives Turbo morph refreshes; values, thumbs and inputs can change after connect
- Server-rendered thumb positions, so nothing jumps when JavaScript loads
- Windows high contrast support (`forced-colors:` classes)

## Implementation Options

| Option | Path | Best for |
|--------|------|----------|
| Plain ERB | `app/views/components/slider/` | Full markup control, custom designs |
| Shared partial | `render "shared/components/slider/slider"` | The same options and markup as the ViewComponent, in apps without ViewComponent |
| ViewComponent | `render Slider::Component.new(...)` | Form builder support, variants, slots, validation |

All three need `app/javascript/controllers/slider_controller.js`.

## Stimulus Controller

### Values

All values go on the element with `data-controller="slider"`. Every value can change after connect.

| Value | Attribute | Type | Default | Description |
|-------|-----------|------|---------|-------------|
| `min` | `data-slider-min-value` | Number | `0` | Lowest value |
| `max` | `data-slider-max-value` | Number | `100` | Highest value |
| `step` | `data-slider-step-value` | Number | `1` | Values snap to multiples of the step |
| `largeStep` | `data-slider-large-step-value` | Number | 10% of the range | Page Up / Down and Shift + arrows |
| `minDistance` | `data-slider-min-distance-value` | Number | `0` | Smallest gap between two thumbs |
| `orientation` | `data-slider-orientation-value` | String | `"horizontal"` | `"vertical"` reads the pointer bottom to top |
| `disabled` | `data-slider-disabled-value` | Boolean | `false` | Ignores input, leaves the tab order, disables the inputs |
| `rubberBand` | `data-slider-rubber-band-value` | Boolean | `false` | Publishes `--slider-stretch` when dragged past an end |
| `format` | `data-slider-format-value` | Object | `{}` | `Intl.NumberFormat` options, e.g. `{"style":"currency","currency":"USD"}` |
| `labels` | `data-slider-labels-value` | Array | `[]` | A name per step, e.g. `["Low","Medium","High"]` |
| `valueText` | `data-slider-value-text-value` | String | `""` | Screen reader text with `{value}`, e.g. `"{value} decibels"` |

The starting value of each thumb comes from its `input` target, or from `aria-valuenow` on the thumb.

### Targets

| Target | Required | Description |
|--------|----------|-------------|
| `track` | No | The pressable area. Give it padding of half a thumb. Defaults to the controller element |
| `thumb` | Yes | One per value (two for a range). Needs `aria-label` or `aria-labelledby` |
| `input` | No | One hidden input per thumb, same order. Receives `input` and `change` events |
| `output` | No | Shows the formatted value. Inside a thumb (or with `data-index`) it shows that thumb; otherwise the whole range |
| `field` | No | Editable text input bound to a thumb by `data-index`. Commits on Enter or blur |
| `tick` | No | Any element with `data-value`. Gets `data-active` while inside the filled range |

### CSS variables and state attributes

| Name | Set on | Description |
|------|--------|-------------|
| `--slider-position` | Each thumb | Where that thumb sits, 0% to 100% |
| `--slider-start` | Controller | Where the fill starts (0% with one thumb) |
| `--slider-end` | Controller | Where the fill ends |
| `--slider-stretch` | Controller | Rubber-band amount (with `rubberBand`) |
| `data-dragging` | Controller | While a pointer is down |
| `data-jumping` | Controller | For 200ms after a press on the track; scope position transitions to it |
| `data-disabled` | Controller | While disabled. Render it in the HTML too |
| `data-at-min` / `data-at-max` | Controller | While the first thumb is at min / the last thumb is at max |
| `data-active` | Thumb, tick | Thumb is pressed / tick is inside the range |
| `data-focus-visible` | Thumb | Keyboard focus. Style focus rings with it, not `:focus-visible` |
| `data-overshoot` | Controller | `"min"` or `"max"` while stretched |
| `data-slider-initial` | Controller | Written by the controller: the starting values for form reset |

### Actions and events

| Name | Description |
|------|-------------|
| `slider#increment` / `slider#decrement` | Step the value. Params: `data-slider-amount-param`, `data-slider-index-param` |
| `slider#set` | Set the value to `data-slider-value-param` |
| `slider#toggle` | Mute to min and back. The button gets `aria-pressed` |
| `slider#focus` | Focus the first thumb (put it on a visible label) |
| `slider:input` | Fires on every change. `event.detail` has `value`, `values` and `index` |
| `slider:change` | Fires once when a drag ends or a key changes the value |

### Keyboard

| Key | Action |
|-----|--------|
| Arrow Right / Up | Increase by one step (Arrow Right decreases in RTL) |
| Arrow Left / Down | Decrease by one step |
| Shift + Arrow, Page Up / Down | Increase / decrease by the large step |
| Home / End | Jump to min / max |
| Escape (while dragging) | Put the thumbs back where the drag started |

## Plain ERB

### Basic Example

```erb
<% label_id = "slider_label_#{SecureRandom.hex(4)}" %>

<div class="group/slider w-full max-w-xs" data-controller="slider" style="--slider-end: 40%">
  <div class="mb-2 flex items-baseline justify-between">
    <span id="<%= label_id %>" class="text-sm font-medium text-neutral-900 dark:text-neutral-100" data-action="click->slider#focus">Volume</span>
    <output data-slider-target="output" class="text-sm tabular-nums text-neutral-500 dark:text-neutral-400">40</output>
  </div>

  <div data-slider-target="track" class="relative h-5 cursor-pointer touch-pan-y px-2.5 before:absolute before:-inset-y-3 before:inset-x-0">
    <div class="relative h-full">
      <div class="absolute -inset-x-2.5 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-neutral-200 dark:bg-neutral-700 forced-colors:forced-color-adjust-none forced-colors:bg-[GrayText]"></div>
      <div class="absolute -start-2.5 end-[calc(100%-var(--slider-end))] top-1/2 h-1.5 -translate-y-1/2 rounded-s-full bg-neutral-800 dark:bg-neutral-100 group-data-[jumping]/slider:[transition:inset_200ms_cubic-bezier(0.23,1,0.32,1)] forced-colors:forced-color-adjust-none forced-colors:bg-[Highlight]"></div>
      <div data-slider-target="thumb" aria-labelledby="<%= label_id %>" style="--slider-position: 40%" class="absolute start-[var(--slider-position)] top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2 cursor-grab rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.25),0_0_0_1px_rgb(0_0_0/0.08)] outline-0 outline-offset-2 outline-neutral-600 data-[active]:cursor-grabbing data-[focus-visible]:outline-2 group-data-[jumping]/slider:transition-[inset] dark:outline-neutral-200 forced-colors:forced-color-adjust-none forced-colors:bg-[CanvasText] forced-colors:outline-[CanvasText]"></div>
    </div>
  </div>

  <input type="hidden" name="volume" value="40" data-slider-target="input">
</div>
```

### Key Modifications

- **Required classes:** the track needs `relative`, padding of half a thumb (`px-2.5` for a 20px thumb) and `touch-pan-y` (`touch-pan-x` when vertical). The thumb needs `absolute start-[var(--slider-position)] -translate-x-1/2 rtl:translate-x-1/2`. The fill reads `--slider-start` / `--slider-end`.
- **Starting position:** put `style="--slider-position: N%"` on each thumb and `--slider-start` / `--slider-end` on the controller element, where N is `(value - min) / (max - min) * 100`. Without it the thumbs sit at 0% until JavaScript loads.
- **Range:** add a second thumb and a second input, use `start-[var(--slider-start)]` on the fill, and wrap it in `role="group" aria-labelledby="…"`.
- **Vertical:** `data-slider-orientation-value="vertical"`, padding on top and bottom (`py-2.5`), and `bottom-[var(--slider-position)] translate-y-1/2` on the thumb.
- **Disabled look:** style it from `group-data-[disabled]/slider:`, and render `data-disabled` in the HTML.
- **Format from Ruby:** `data: { slider_format_value: { style: "currency", currency: "USD" } }` in `tag.div` writes the JSON for you.

## Shared Partials

The partial takes the same options as `Slider::Component` (as locals) and renders the same markup. The only difference: `leading` and `trailing` are locals holding HTML (from `capture`) instead of slots.

### Basic Usage

```erb
<%= render "shared/components/slider/slider", name: "volume", value: 40, label: "Volume" %>
```

### With Options

```erb
<%# In a form: the builder makes the name. With form_with model:, leave out value: and it is read from the object %>
<%= form_with model: @search, method: :get do |f| %>
  <%= render "shared/components/slider/slider",
    form: f,
    attribute: %i[price_min price_max],
    label: "Price per night",
    max: 1200,
    step: 50,
    min_distance: 50,
    thumb_labels: ["Minimum price", "Maximum price"],
    format: { style: "currency", currency: "USD", maximumFractionDigits: 0 }
  %>
<% end %>

<%# Buttons before and after the track %>
<% lower = capture do %>
  <button type="button" aria-label="Lower volume" data-action="click->slider#decrement" data-slider-amount-param="10" class="group-data-[at-min]/slider:opacity-40">−</button>
<% end %>
<% higher = capture do %>
  <button type="button" aria-label="Raise volume" data-action="click->slider#increment" data-slider-amount-param="10" class="group-data-[at-max]/slider:opacity-40">+</button>
<% end %>
<%= render "shared/components/slider/slider", name: "volume", value: 60, label: "Volume", hide_label: true, output: false,
  leading: lower, trailing: higher %>
```

### Options

All locals are optional. They match the [Component Options](#component-options) below one to one, plus:

| Local | Type | Description |
|-------|------|-------------|
| `leading` | HTML | Content before the track (the component's `leading` slot) |
| `trailing` | HTML | Content after the track (the component's `trailing` slot) |
| `id` | String | Id of the root element |
| `data` | Hash | Extra data attributes for the root; a `controller` is added after `slider` |

Symbols and strings both work for `size`, `variant`, `orientation` and `tooltip`. Unknown values raise an error, like the component.

## ViewComponent

### Basic Usage

```erb
<%= render Slider::Component.new(name: "volume", value: 40, label: "Volume") %>
```

### With a Form Builder

```erb
<%= form_with model: @campaign do |f| %>
  <%= render Slider::Component.new(form: f, attribute: :budget, label: "Monthly budget",
        min: 100, max: 2000, step: 50, format: { style: "currency", currency: "USD", maximumFractionDigits: 0 }) %>

  <%= render Slider::Component.new(form: f, attribute: %i[price_min price_max], label: "Price",
        max: 1200, step: 50, min_distance: 50, thumb_labels: ["Minimum price", "Maximum price"]) %>
<% end %>
```

### With Slots

```erb
<%= render Slider::Component.new(name: "volume", value: 60, label: "Volume", hide_label: true, output: false) do |slider| %>
  <% slider.with_leading do %>
    <button type="button" aria-label="Lower volume" data-action="click->slider#decrement" data-slider-amount-param="10" class="group-data-[at-min]/slider:opacity-40">−</button>
  <% end %>
  <% slider.with_trailing do %>
    <button type="button" aria-label="Raise volume" data-action="click->slider#increment" data-slider-amount-param="10" class="group-data-[at-max]/slider:opacity-40">+</button>
  <% end %>
<% end %>
```

### Component Options

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `name` | String or Array | `nil` | Input name, or two names for a range |
| `value` | Numeric or Array | `min` | Starting value, or two values for a range |
| `form` | FormBuilder | `nil` | Builds the names and reads the values (with `attribute:`) |
| `attribute` | Symbol or Array | `nil` | Form attribute, or two for a range |
| `min` / `max` / `step` | Numeric | `0` / `100` / `1` | Range and step. Raises if `max <= min` or `step <= 0` |
| `large_step` | Numeric | `nil` | Page Up / Down amount |
| `min_distance` | Numeric | `nil` | Smallest gap between two thumbs |
| `label` | String | `nil` | Visible label; names the thumb or the group. Required for `:fluid` |
| `hide_label` | Boolean | `false` | Label for screen readers only |
| `output` | Boolean | `true` | Show the formatted value |
| `format` | Hash | `{}` | `Intl.NumberFormat` options |
| `labels` | Array | `nil` | A name per step |
| `marks` | Boolean | `false` | Show the step labels under the track as clickable shortcuts |
| `value_text` | String | `nil` | Screen reader text with `{value}` |
| `tooltip` | `true`, `false`, `:auto` | `false` | Value above the thumb; `:auto` only on hover, focus and drag |
| `thumb_labels` | Array | `["Minimum", "Maximum"]` | Names of the two range thumbs |
| `hint` | String | `nil` | Help text linked with `aria-describedby` |
| `size` | Symbol | `:md` | `:sm`, `:md`, `:lg` |
| `variant` | Symbol | `:default` | `:default` or `:fluid` (thick bar, label inside, single value) |
| `orientation` | Symbol | `:horizontal` | `:horizontal` or `:vertical` |
| `track_length` | String | `"h-40"` | Height class of a vertical track |
| `disabled` | Boolean | `false` | Disable the slider and its inputs |
| `rubber_band` | Boolean | `true` for `:fluid` | Stretch when dragged past an end |
| `classes` | String | `nil` | Extra classes for the root |
| `**html_options` | Hash | | Any other attribute for the root; `data:` merges (a `controller` is added after `slider`) |

### Slots

| Slot | Description |
|------|-------------|
| `leading` | Content before the track, such as a decrease button |
| `trailing` | Content after the track, such as an increase button |

## Variants

- **Sizes:** `sm` (16px thumb), `md` (20px), `lg` (24px)
- **Fluid:** a 44px bar where the fill is the handle and the label inverts over it
- **Vertical:** bottom to top, with a configurable track height
- **Tooltip:** the value rides above the thumb, always or on interaction

## Accessibility

- Thumbs get `role="slider"`, `tabindex`, `aria-orientation`, `aria-valuemin/max/now` and `aria-valuetext` from the controller
- Range thumbs are bounded by their neighbour, and the root is a labelled `role="group"`
- Use `value_text` when the number alone leaves out the unit (`"+6"` becomes `"+6 decibels"`)
- `slider#toggle` buttons report `aria-pressed`
- Focus rings use `data-focus-visible`, which stays off after a mouse press
- Forced colors (Windows high contrast) keep the thumb and fill visible through system colors

## Troubleshooting

**The thumbs jump when the page loads:** render `--slider-position` on each thumb and `--slider-start` / `--slider-end` on the controller element.

**Touch drags scroll the page:** the track needs `touch-pan-y` (or `touch-pan-x` when vertical). The controller sets it when your classes leave `touch-action` at `auto`.

**The thumb overhangs the track at 0% and 100%:** give the track padding of half a thumb and let the rail extend into it with a negative inset (`-inset-x-2.5`).

**The format value does nothing:** it must be valid JSON. From Ruby, pass a Hash through `data:` or call `to_json`.

**Form reset brings back the wrong values:** keep the hidden inputs as `data-slider-target="input"` inside the form.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or a custom design (fluid bars, histograms, icons that react to the value).
- **Shared partial**: Use in apps without ViewComponent. It takes the same options as the ViewComponent (as locals) and renders the same markup.
- **ViewComponent**: Use when ViewComponent is installed: Ruby-side validation, slots for leading and trailing content, and testable composition.

### Quick Reference

- **Vanilla examples**: `app/views/components/slider/`
- **Shared partial files**: `app/views/shared/components/slider/`
- **Shared partial**: `render "shared/components/slider/slider", name:, value:, label:`
- **ViewComponent**: `render Slider::Component.new(name:, value:, label:)` or `Slider::Component.new(form: f, attribute: :budget)`
- **ViewComponent files**: `app/components/slider/`
- **Stimulus controller**: `app/javascript/controllers/slider_controller.js`

### Implementation Checklist

- Install `slider_controller.js` before rendering any slider.
- Give every slider an accessible name: `label:` (or `aria-labelledby` / `aria-label` on each thumb in plain ERB), and `thumb_labels:` for ranges.
- Submit values through hidden `input` targets (one per thumb, in thumb order). Never put `name` on a `field` target.
- In plain ERB, render the starting `--slider-*` styles and keep `touch-pan-y`, the half-thumb padding and `rtl:translate-x-1/2`.
- Pass `format` as `Intl.NumberFormat` options (camelCase keys such as `maximumFractionDigits`).
- Listen to `slider:input` for live updates and `slider:change` for saves, not to pointer events.

### Common Patterns

- **Price filter:** range with `min_distance`, currency `format`, and `slider:change->filters#submit` on the root.
- **Settings form:** `Slider::Component.new(form: f, attribute: :volume)` inside `form_with`.
- **Named levels:** `labels:` plus `marks: true` instead of numbers.
- **Live preview:** `data: { action: "slider:input->preview#update" }` and read `event.detail.value`.
- **Icon buttons:** `leading` / `trailing` slots with `slider#decrement` / `slider#increment`, dimmed with `group-data-[at-min]/slider:`.

### Common Mistakes

- Do not mix the two render paths in one example. The option names are the same, but the partial takes `leading:` / `trailing:` locals where the component takes `with_leading` / `with_trailing` slots.
- Do not invent variants, sizes or slot names: sizes are `sm`, `md`, `lg`; variants are `default` and `fluid`; slots are `leading` and `trailing`.
- Do not use `:focus-visible` for the thumb focus ring; use `data-[focus-visible]:`.
- Do not hard-code label ids in reusable markup; generate them (`SecureRandom.hex`) so two sliders on a page stay valid.
- Do not pass `fluid` with two values or with `orientation: :vertical`; the component raises.
- Do not write the format as a Ruby hash string in an attribute; pass a Hash through `data:` or call `to_json`.
- Do not use a native `<input type="range">` with this controller; the thumbs are elements with `data-slider-target="thumb"`.
