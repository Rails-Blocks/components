# Resize Component

Resizable panel groups for Rails: split views, sidebars, editor layouts and three-column app shells. One dependency-free Stimulus controller handles mouse, touch and keyboard, with min and max sizes, collapsible panels, nesting and saved layouts. Free component.

## Features

- Horizontal or vertical groups with any number of panels; nest groups to mix directions
- Sizes in percentages (`30`) or pixels (`"240px"`), with per-panel minimum, maximum and default
- Collapsible panels that snap shut past half their minimum, optionally to an icon rail (`collapsed_size: "52px"`)
- Mouse, touch (large hit areas on coarse pointers) and keyboard: arrows, Shift + arrows, Home, End, Enter, Escape
- Double-click or double-tap a handle to reset; one-directional cursor when a handle can't go further
- Saved layouts in localStorage (synced across tabs) or in a cookie that Rails renders on the server, so nothing jumps on load
- `resize:change` (every frame) and `resize:commit` (once per interaction) events, plus `toggle`, `collapse`, `expand`, `reset` and `set` actions
- Automatic ARIA: `role="separator"`, `aria-valuenow`/`min`/`max`, `aria-controls` and `aria-expanded` on toggle buttons
- RTL aware, reduced-motion aware, strict-CSP safe, survives Turbo navigation and cache restores
- Console warnings for common setup mistakes (wrong handle count, padding on panels, missing labels…)

## Implementation Options

| Option | Best for | Files |
|--------|----------|-------|
| ViewComponent | Ruby API: panels as slots, handles added for you, cookie layouts rendered on the server | `app/components/resize/` |
| Shared partial | Apps without ViewComponent: the same options and markup, panels as hashes with `capture`d content | `app/views/shared/components/resize/` |
| Plain ERB | Full markup control; copy one of the showcase examples | `app/views/components/resize/` |

All three need `app/javascript/controllers/resize_controller.js` (no other dependencies).

## Installation

1. Copy `resize_controller.js` to `app/javascript/controllers/`. With importmap and `eagerLoadControllersFrom` / `pin_all_from` it registers itself as `resize`.
2. For the ViewComponent, copy `app/components/resize/` (needs the `view_component` gem, 4.x).
3. For the handle partial, copy `app/views/shared/components/resize/`.
4. Tailwind CSS v4.1+ (the handles use the `pointer-coarse:` variant for bigger touch targets).

## ViewComponent

### Basic Usage

```erb
<%= render Resize::Component.new(classes: "h-96 rounded-xl border border-black/10 dark:border-white/10") do |group| %>
  <% group.with_panel(id: "sidebar", tag: :nav, default_size: 25, min_size: "180px", collapsible: true,
                      handle_label: "Resize sidebar", html: { aria: { label: "Main" } }) do %>
    <div class="min-w-44 p-3">…</div>
  <% end %>
  <% group.with_panel(tag: :main, min_size: 40) do %>
    <button type="button" data-action="resize#toggle" data-resize-panel-param="sidebar" aria-controls="sidebar" aria-label="Toggle sidebar">…</button>
    <div class="p-5">…</div>
  <% end %>
<% end %>
```

Handles are inserted between panels automatically. Each panel's inline `flex` style is rendered from its default size, so the layout is right before JavaScript loads.

### Component Options

| Option | Default | Description |
|--------|---------|-------------|
| `orientation` | `:horizontal` | `:horizontal` (side by side) or `:vertical` (stacked) |
| `handle` | `:line` | `:line` (1px line, wide hit area), `:grip` (line with a visible grip), `:pill` (floating pill for panels with a gap between them) |
| `storage_key` | `nil` | Saves the layout under this key. Use a key unique to this layout |
| `storage` | `:local` | `:local` (localStorage, synced across tabs) or `:cookie` (rendered on the server) |
| `keyboard_step` | `5` | Percent moved per arrow key press (x3 with Shift) |
| `handle_classes` | `nil` | Extra classes for every handle |
| `classes` | `nil` | Classes for the group. Give it a height (`h-96`, `h-full`…) |
| `html` | `{}` | Extra attributes for the group, e.g. `{ id: "editor", data: { action: "resize:commit->layout#save" } }` |

### Panel Options (`with_panel`)

| Option | Default | Description |
|--------|---------|-------------|
| `default_size` | equal share | Initial size: `30` (percent) or `"240px"` |
| `min_size` | `0` | Smallest size it can be dragged to |
| `max_size` | `100` | Largest size it can be dragged to |
| `collapsible` | `false` | Snaps closed when dragged past half its minimum; toggled with Enter or `resize#toggle` |
| `collapsed_size` | `0` | Size while collapsed, e.g. `"52px"` for an icon rail |
| `handle_label` | `"Resize panels"` | `aria-label` of the handle after this panel |
| `id` | generated | Panel id; set it when a button outside the group toggles the panel |
| `tag` | `:div` | Element to render (`:nav`, `:main`, `:aside`, `:article`…) |
| `classes` | `nil` | Classes for the panel (backgrounds, `group/sidebar`…). No padding: see below |
| `html` | `{}` | Extra attributes for the panel |

Unknown options, handle styles, orientations and storages raise `ArgumentError`, and a group needs at least two panels.

## Shared Partial

Same options and the same markup as the ViewComponent, for apps without `view_component`. Panels are hashes; their content comes from `capture`:

```erb
<% sidebar = capture do %>
  <div class="min-w-44 p-3">…</div>
<% end %>
<% main = capture do %>
  <button type="button" data-action="resize#toggle" aria-label="Toggle sidebar">…</button>
  <div class="p-5">…</div>
<% end %>

<%= render "shared/components/resize/resize",
  classes: "h-96 rounded-xl border border-black/10 dark:border-white/10",
  panels: [
    { tag: :nav, default_size: 25, min_size: "180px", collapsible: true, handle_label: "Resize sidebar",
      html: { aria: { label: "Main" } }, content: sidebar },
    { tag: :main, min_size: 40, content: main }
  ] %>
```

Locals: `panels` (required; each takes `content` plus the ViewComponent's panel options), `orientation`, `handle`, `storage_key`, `storage` (`:cookie` renders the saved layout on the server here too), `keyboard_step`, `handle_classes`, `classes`, `html`. Unknown panel options raise `ArgumentError`.

For hand-written groups, `render "shared/components/resize/resize_handle", label: "Resize sidebar", orientation: :horizontal, style: :line` renders just one handle.

## Plain ERB

```erb
<div data-controller="resize" class="flex h-64 overflow-hidden rounded-xl border">
  <div data-resize-target="panel" data-resize-default-size="30" data-resize-min-size="20" style="flex: 30 1 0px" class="min-w-0 overflow-hidden">
    <div class="p-4">…</div>
  </div>
  <div data-resize-target="handle" role="separator" tabindex="0" aria-label="Resize sidebar" class="w-px shrink-0 cursor-col-resize touch-none bg-black/10 …"></div>
  <div data-resize-target="panel" data-resize-min-size="30" style="flex: 70 1 0px" class="min-w-0 overflow-hidden">
    <div class="p-4">…</div>
  </div>
</div>
```

The showcase examples in `app/views/components/resize/` cover every pattern: basic, vertical with grip, min and max sizes, pill handle, nested layout, collapsible sidebar, persisted layout, three-column mail layout and a resizable preview.

## Stimulus Controller

### Values

| Value | Default | Description |
|-------|---------|-------------|
| `data-resize-orientation-value` | `"horizontal"` | `"horizontal"` or `"vertical"` |
| `data-resize-storage-key-value` | none | Key the layout is saved under |
| `data-resize-storage-value` | `"local"` | `"local"` (localStorage) or `"cookie"` |
| `data-resize-keyboard-step-value` | `5` | Percent per arrow key press |

### Panel Attributes

`data-resize-default-size`, `data-resize-min-size`, `data-resize-max-size`, `data-resize-collapsible`, `data-resize-collapsed-size` (percent or `px`). Mirror the default size in an inline `style="flex: 30 1 0px"` so the first paint is right.

### Targets

- `panel`: a resizable panel. Panels and handles alternate as direct children of one flex container.
- `handle`: the separator between two panels.
- `size` (optional): an element inside a panel whose text shows the panel's size, like `40%`.

### Actions

- `resize#toggle`, `resize#collapse`, `resize#expand`: with `data-resize-panel-param` (panel id or index); without it, the first collapsible panel.
- `resize#reset`: animates back to the default sizes and clears the saved layout. Also on double-click / double-tap of a handle.
- `resize#set`: animates to `data-resize-sizes-param="[30, 70]"` (one size per panel, `"240px"` works). From JavaScript: `controller.setSizes([30, 70])`.

### Events

| Event | When | `event.detail` |
|-------|------|----------------|
| `resize:change` | Every frame the layout changes (during a drag too) | `{ sizes, collapsed, panels }` |
| `resize:commit` | Once per finished interaction: drag released, key pressed, panel toggled, reset, set | `{ sizes, collapsed, panels }` |

`sizes` are percentages, `collapsed` booleans, `panels` the panel ids, all in panel order.

### Keyboard

| Key | Result |
|-----|--------|
| Arrow keys | Move the focused handle one step (Shift: three steps) |
| Home / End | Move the handle as far as it goes |
| Enter | Collapse or expand the collapsible panel next to the handle |
| Escape | While dragging, cancel and go back to where the drag started |

## Saving Layouts

- **localStorage**: `storage_key: "editor:layout"`. Restored when the controller connects, kept in sync across tabs.
- **Cookie**: `storage_key: "editor:layout", storage: :cookie`. The ViewComponent reads the cookie and renders the saved sizes and `data-collapsed`, so the page loads with the saved layout. In plain ERB, read `JSON.parse(cookies["editor_layout"])` (non-word characters in the key become `_`) and write the sizes into the inline `flex` styles yourself.
- **Your backend**: listen for `resize:commit` and save `event.detail.sizes`, then render those sizes as the panels' default sizes.

A saved layout carries a fingerprint of the panels' size options, so it is ignored automatically after you change defaults, limits or collapsibility.

## Styling Hooks

- `data-dragging` on the handle being dragged: `data-[dragging]:bg-neutral-900`, `group-data-[dragging]/handle:…`
- `data-resizing` on the group while dragging: `group-data-[resizing]:select-none`
- `data-collapsed` on collapsed panels: put `group/sidebar` on the panel and use `group-data-[collapsed]/sidebar:sr-only` for labels in an icon rail; `[[data-collapsed]+&]:bg-transparent` on a handle hides its line next to a fully collapsed panel
- `pointer-coarse:` widens hit areas on touch screens; `motion-reduce:` turns off transitions

## Accessibility

- Handles get `role="separator"`, `tabindex="0"`, `aria-orientation`, `aria-valuenow`/`aria-valuemin`/`aria-valuemax` and `aria-controls`. You provide `aria-label` (ViewComponent: `handle_label`).
- Buttons that point at a collapsible panel with `aria-controls`, and `resize#toggle` buttons inside the group, get `aria-expanded` kept in sync.
- Fully collapsed panels become `inert`, so their links leave the tab order. In an icon rail, keep link text with `sr-only` (not `hidden`) and add a `title`.
- Animations respect `prefers-reduced-motion`.

## Browser Support

Current Chrome, Edge, Firefox and Safari, on desktop and mobile. `inert` needs Chrome 102, Firefox 112 or Safari 15.5; older browsers still resize, but collapsed panels keep their links in the tab order.

## Troubleshooting

- **Panels don't move or collapse to nothing**: the group needs a size along the resize direction (`h-96` for vertical groups, or `h-full` inside a sized parent).
- **Sizes are slightly off**: padding or borders on a panel along the resize direction. Move them to an element inside the panel. The console warns about this.
- **Content overflows instead of shrinking**: panels need `min-w-0` (horizontal) or `min-h-0` (vertical) plus `overflow-hidden` or `overflow-auto`.
- **Layout jumps on page load**: the inline `flex` style doesn't match the default size, or the saved layout comes from localStorage. Use `storage: :cookie` with the ViewComponent.
- **Two layouts share sizes**: they use the same `storage_key`. Make the key unique per layout.
- **Group inside a modal or tab looks wrong**: it lays itself out the first time it becomes visible; make sure the group (not only its parent) gets a real size.

---

## AI Instructions

### Choose An Implementation

- **ViewComponent**: Default when the app has `view_component`. Panels are slots, handles are inserted for you, and `storage: :cookie` renders saved layouts on the server.
- **Shared partial**: Use when the app has no ViewComponent. Same options and markup as the ViewComponent; pass panels as hashes with `content: capture { … }`. Use `resize_handle` only inside hand-written groups.
- **Plain ERB**: Use when you need markup neither covers; copy the closest file from `app/views/components/resize/`.

### Quick Reference

- **Vanilla examples**: `app/views/components/resize/`
- **Shared partial files**: `app/views/shared/components/resize/`
- **Shared partial**: `render "shared/components/resize/resize", classes: "h-96", panels: [{ default_size: 30, content: sidebar }, { content: main }]`
- **Single handle partial**: `render "shared/components/resize/resize_handle", label: "Resize sidebar", orientation: :horizontal, style: :line`
- **ViewComponent**: `render Resize::Component.new(classes: "h-96") { |group| group.with_panel(default_size: 30) { … }; group.with_panel { … } }`
- **ViewComponent files**: `app/components/resize/`
- **Stimulus controller**: `app/javascript/controllers/resize_controller.js` (identifier `resize`)

### Implementation Checklist

- Give the group a size along the resize direction: a height for vertical groups and for most horizontal ones (`h-96`, `h-[32rem]`, `h-full`).
- Panels and handles alternate as direct children of the flex container: panel, handle, panel, handle, panel.
- Put padding and borders on an element inside each panel, never on the panel itself.
- Give every handle a specific `aria-label` ("Resize sidebar", not "Handle").
- In plain ERB, mirror each panel's default size in `style="flex: N 1 0px"`, and make panels without a default share the rest (two panels at 30 and blank → 30 and 70).
- Use pixel `min_size` for panels whose content needs a fixed minimum width (sidebars, lists), percentages for the rest.
- For a collapsible sidebar, set `collapsible: true` and give its content a fixed minimum width (`min-w-44`) so it doesn't reflow while closing.
- For a toggle button outside the panel, give the panel an `id` and the button `data-action="resize#toggle" data-resize-panel-param="<id>" aria-controls="<id>"`.
- For saved layouts, pick a `storage_key` unique to this layout; prefer `storage: :cookie` with the ViewComponent to avoid a jump on load.

### Common Patterns

- App shell: horizontal group, collapsible `:nav` sidebar with `min_size: "200px"`, main panel with `min_size: 40`.
- Mail / three-column: sidebar collapsing to a `collapsed_size: "52px"` icon rail (`group/sidebar` + `group-data-[collapsed]/sidebar:sr-only`), list with a pixel minimum, reading pane.
- IDE: horizontal group (explorer + rest), nested vertical group (editor + collapsible terminal) inside the second panel.
- SQL / query editor: vertical group with `handle: :grip`.
- Dashboard cards: `handle: :pill`, each panel holding its own card.
- Responsive preview: one panel with content, a second empty panel as space to grow into.

### Common Mistakes

- Do not add padding, borders or margins to panels; sizes go wrong. Wrap content instead.
- Do not wrap a panel or handle in an extra element; they must be direct children of the same flex container.
- Do not forget the group height; a vertical group without one cannot resize.
- Do not reuse one `storage_key` for different layouts or pages.
- Do not use `hidden` for labels inside an icon rail; use `sr-only` so links keep their names.
- Do not mix ViewComponent options (`handle_label:`) with plain data attributes on the same panel.
- Do not pass a block to the shared partial; panel content goes in each panel's `content:`.
- Do not invent options (`size:`, `resizable:`, `handle: :dots`); unknown options raise `ArgumentError`.
- Do not save on `resize:change` (it fires every frame); use `resize:commit`.
