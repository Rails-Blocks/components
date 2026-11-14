# Dock Component

macOS-style dock/taskbar with magnification animation, tooltips, and mobile responsiveness.

## Features

- Magnification effect on hover (icons grow when mouse approaches)
- Tooltips with optional keyboard hotkeys, shown on hover and keyboard focus
- Mobile-responsive with expandable menu and frosted backdrop glow
- Active state highlighting
- Position variants (bottom, top)
- Style variants (default, rounded, pill)
- Keyboard hotkey support
- Works as a `data-turbo-permanent` dock that persists across Turbo visits
- Respects `prefers-reduced-motion` (magnification is turned off)

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/dock/` | Full control, copy-paste |
| **Shared Partials** | `app/views/shared/components/dock/` | Reusable partials, data-driven |
| **ViewComponent** | `app/components/dock/` | Block-style content, testing |

---

## Dependencies

This component requires:

- **Motion** library for animations (`import { animate, transform, spring, stagger } from "motion"`)

Tooltips are anchored with CSS, so no positioning library is needed. Ensure Motion is available in your importmap or bundler:

```ruby
# config/importmap.rb
pin "motion", to: "https://cdn.jsdelivr.net/npm/motion@14.14.0/+esm"
```

---

## Stimulus Controller

### Values

This controller has no configurable values.

### Targets

| Target | Required | Description |
| ------ | -------- | ----------- |
| `icon` | Yes | Each dock item anchor (for hover animation) |
| `mobileMenu` | No | Container for mobile expanded menu |
| `mobileButton` | No | Toggle button for mobile menu (`aria-expanded` is kept in sync) |
| `mobileGlow` | No | Frosted backdrop that blooms behind the open mobile menu |

### Data Attributes (on each `icon`)

| Attribute | Description |
| --------- | ----------- |
| `data-tooltip` | Tooltip text |
| `data-tooltip-hotkey` | Optional hotkey shown as a badge in the tooltip |
| `data-tooltip-placement` | `top` (default) or `bottom` |

The controller creates one shared tooltip and appends it inside the hovered icon anchor, so each icon anchor needs `relative`.

### Actions

| Action | Usage | Description |
| ------ | ----- | ----------- |
| `toggleMobile` | `click->dock#toggleMobile` | Toggles mobile menu visibility |

---

## Plain ERB

Copy the code block into your view and customize as needed.

### Basic Example

```erb
<% menu_items = [
  { url: "/", tooltip: "Home", hotkey: "h", svg: '<svg>...</svg>' },
  { url: "/articles", tooltip: "Articles", hotkey: "a", svg: '<svg>...</svg>' },
  { url: "/projects", tooltip: "Projects", hotkey: "p", svg: '<svg>...</svg>' }
] %>

<div class="flex w-fit mx-auto items-center justify-center" data-controller="dock">
  <div class="mx-auto hidden h-16 items-end gap-4 rounded-2xl bg-neutral-50 px-4 pb-3 md:flex dark:bg-neutral-950 border border-neutral-200/50 dark:border-neutral-600/50">
    <% menu_items.each do |item| %>
      <a href="<%= item[:url] %>" class="relative rounded-full" aria-label="<%= item[:tooltip] %>" data-dock-target="icon" data-tooltip="<%= item[:tooltip] %>" data-tooltip-placement="top" data-tooltip-hotkey="<%= item[:hotkey] %>">
        <div class="size-10 relative flex aspect-square items-center justify-center rounded-full border border-neutral-200/50 dark:border-neutral-600/50 text-neutral-500 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-800">
          <div class="flex items-center justify-center *:size-full" style="width: 50%; height: 50%">
            <%= raw(item[:svg]) %>
          </div>
        </div>
      </a>
    <% end %>
  </div>
</div>
```

### Key Modifications

**Top position:** Change `items-end pb-3` to `items-start pt-3` and `data-tooltip-placement` to `"bottom"`.

**Active item:** Add active classes: `text-neutral-50 dark:text-neutral-800 bg-neutral-800 dark:bg-neutral-100`.

**Without hotkeys:** Remove `data-tooltip-hotkey` and hotkey controller attributes.

**Mobile glow:** Add `<div class="pointer-events-none absolute ... hidden" data-dock-target="mobileGlow"></div>` before the mobile menu (see the full example for the classes). It is optional; the controller skips it when missing.

### Persistent Page Dock (Turbo)

For a site-wide dock, render it once in your layout, fix it to the viewport and mark it permanent so it isn't re-rendered (and doesn't flicker) on Turbo visits. The full-screen fixed wrapper is also the positioning context for the mobile menu, toggle and glow:

```erb
<div id="dock" data-turbo-permanent class="fixed inset-0 z-40 flex items-end justify-center pb-5 pointer-events-none *:pointer-events-auto">
  <%= render "shared/components/dock/dock", items: dock_items %>
</div>
```

The controller sets itself up once in `initialize()`, highlights the destination as soon as a visit starts, and blurs the clicked icon after the new page loads so no stray focus ring is left behind.

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/dock/dock",
  items: [
    { url: "/", tooltip: "Home", hotkey: "h", icon: '<svg>...</svg>' },
    { url: "/articles", tooltip: "Articles", icon: '<svg>...</svg>' },
    { url: "/projects", tooltip: "Projects", active: true, icon: '<svg>...</svg>' }
  ]
%>
```

### With Options

```erb
<%= render "shared/components/dock/dock",
  items: [
    { url: "/", tooltip: "Home", icon: '<svg>...</svg>' },
    { url: "/dashboard", tooltip: "Dashboard", active: true, icon: '<svg>...</svg>' }
  ],
  position: "top",
  variant: "rounded",
  show_mobile: false,
  classes: "my-4"
%>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `items` | Array | `[]` | Dock items (see below) |
| `position` | String | `"bottom"` | `"bottom"` or `"top"` |
| `variant` | String | `"default"` | `"default"`, `"rounded"`, `"pill"` |
| `show_mobile` | Boolean | `true` | Show mobile toggle menu |
| `classes` | String | `nil` | Additional wrapper classes |

### Item Hash

| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `url` | String | required | Link URL |
| `tooltip` | String | required | Tooltip text |
| `icon` | String | required | SVG icon HTML |
| `hotkey` | String | `nil` | Keyboard shortcut key |
| `active` | Boolean | `false` | Active state styling |
| `classes` | String | `nil` | Additional item classes |

---

## ViewComponent

### Basic Usage

```erb
<%= render(Dock::Component.new) do |dock| %>
  <% dock.with_item(url: "/", tooltip: "Home", hotkey: "h") do %>
    <svg>...</svg>
  <% end %>
  <% dock.with_item(url: "/articles", tooltip: "Articles") do %>
    <svg>...</svg>
  <% end %>
<% end %>
```

### With Options

```erb
<%= render(Dock::Component.new(
  position: :top,
  variant: :rounded,
  show_mobile: false,
  classes: "my-4"
)) do |dock| %>
  <% dock.with_item(url: "/", tooltip: "Home") do %>
    <svg>...</svg>
  <% end %>
  <% dock.with_item(url: "/dashboard", tooltip: "Dashboard", active: true) do %>
    <svg>...</svg>
  <% end %>
<% end %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `position` | Symbol | `:bottom` | `:bottom` or `:top` |
| `variant` | Symbol | `:default` | `:default`, `:rounded`, `:pill` |
| `show_mobile` | Boolean | `true` | Show mobile toggle menu |
| `classes` | String | `nil` | Additional wrapper classes |

### Item Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `url` | String | required | Link URL |
| `tooltip` | String | required | Tooltip text |
| `icon` | String | `nil` | SVG icon HTML (alternative to block) |
| `hotkey` | String | `nil` | Keyboard shortcut key |
| `active` | Boolean | `false` | Active state styling |
| `classes` | String | `nil` | Additional item classes |

---

## Variants

| Variant | Description |
| ------- | ----------- |
| `default` | Standard rounded corners (rounded-2xl) |
| `rounded` | More rounded corners (rounded-xl) |
| `pill` | Fully rounded ends (rounded-full) |

---

## Accessibility

- Icon-only links carry an `aria-label`; icons are `aria-hidden`
- The active link gets `aria-current="page"`
- Tooltips show on hover and on keyboard focus
- The mobile toggle is a real `<button>` with `aria-label` and `aria-expanded`
- Desktop and mobile menus are `<nav aria-label="Dock">` landmarks
- Magnification is disabled under `prefers-reduced-motion`

---

## Troubleshooting

**Magnification not working:** Ensure Motion library is properly imported and the `data-dock-target="icon"` attribute is on each item anchor.

**Tooltips misplaced:** Make sure each `data-dock-target="icon"` anchor has the `relative` class, since the tooltip is positioned inside it.

**Magnification jumps or is offset:** The controller assumes 40px icons at rest (`ICON_REST_SIZE`). If you change the icon size, update the constants at the top of the controller.

**Mobile menu not animating:** Verify `data-dock-target="mobileMenu"` and `data-dock-target="mobileButton"` are present.

**Active state not showing:** Ensure `active: true` is passed in the item hash or ViewComponent option.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/dock/`
- **Shared partial files**: `app/views/shared/components/dock/`
- **shared partial**: `render "shared/components/dock/dock"`
- **ViewComponent**: `render Dock::Component.new(...)`
- **ViewComponent files**: `app/components/dock/`

### Implementation Checklist

- Pick one implementation path first, then stay consistent within that example.
- Use only documented locals, initializer arguments, variants, and slot names.
- Copy the base example before adding app-specific styling or behavior.
- If the component is interactive, keep the documented Stimulus controller, targets, values, and ARIA wiring intact.
- Keep variant names, enum values, and option formats exactly as documented.

### Common Patterns

- **Vanilla / plain ERB**: Best for one-off pages, direct markup edits, and quick adaptations of the shipped examples.
- **shared partial**: Best for reusable Rails view partials driven by locals or collections.
- **ViewComponent**: Best for reusable component implementations that benefit from Ruby-side defaults, slots, or testable composition.

### Common Mistakes

- Do not mix shared partial locals with ViewComponent initializer arguments in the same example.
- Do not invent undocumented variants, sizes, slot names, or helper methods.
- Do not remove required wrapper elements, IDs, or data attributes when copying the component.
- Do not swap the documented render path for a guessed partial or component name.