# Collapsible Component

Expandable/collapsible content sections with smooth content animations and instant icon switching.

## Features

- Multiple icon styles (chevron, plus/minus, arrows)
- Animated open/close transitions (optional)
- Instant icon swap between states
- Default open state support
- Disabled state
- ARIA accessibility attributes

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/collapsible/` | Full control, copy-paste |
| **Shared Partials** | `app/views/shared/components/collapsible/` | Reusable partials, data-driven |
| **ViewComponent** | `app/components/collapsible/` | Block-style content, testing |

---

## Stimulus Controller

### Values

| Value | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `open` | Boolean | `false` | Whether the collapsible starts expanded |
| `animated` | Boolean | `true` | Enables/disables content transitions |

### Targets

| Target | Required | Description |
| ------ | -------- | ----------- |
| `content` | Yes | The collapsible content container |
| `collapsedIcon` | Yes | Icon shown when content is collapsed |
| `expandedIcon` | Yes | Icon shown when content is expanded |

### Actions

| Action | Usage | Description |
| ------ | ----- | ----------- |
| `toggle` | `click->collapsible#toggle` | Toggles content open/closed |

---

## Plain ERB

Copy the code block into your view and customize as needed.

### Basic Example

```erb
<div data-controller="collapsible" data-collapsible-open-value="false" data-state="closed" class="w-full space-y-2">
  <div class="flex items-center justify-between space-x-4">
    <h4 class="text-sm font-semibold">Show more items</h4>

    <button type="button" class="relative flex items-center justify-center gap-1.5 rounded-lg bg-transparent p-1.5 font-medium whitespace-nowrap text-neutral-800 transition-all duration-100 ease-in-out select-none hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 dark:text-neutral-50 dark:hover:bg-neutral-600/50 dark:hover:text-white" data-action="click->collapsible#toggle">
      <!-- Collapsed icon -->
      <span data-collapsible-target="collapsedIcon" style="opacity: 1;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" class="absolute size-4.5">
          <g fill="currentColor">
            <path d="M8.99999 13.5C8.80799 13.5 8.61599 13.4271 8.46999 13.2801L2.21999 7.03005C1.92699 6.73705 1.92699 6.26202 2.21999 5.96902C2.51299 5.67602 2.98799 5.67602 3.28099 5.96902L9.00099 11.689L14.721 5.96902C15.014 5.67602 15.489 5.67602 15.782 5.96902C16.075 6.26202 16.075 6.73705 15.782 7.03005L9.53199 13.2801C9.38599 13.4261 9.19399 13.5 9.00199 13.5H8.99999Z"></path>
          </g>
        </svg>
      </span>

      <!-- Expanded icon -->
      <span data-collapsible-target="expandedIcon" style="opacity: 0;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" class="absolute size-4.5">
          <g fill="currentColor">
            <path d="M9.00001 4.5C9.19201 4.5 9.38401 4.5729 9.53001 4.7199L15.78 10.9699C16.073 11.2629 16.073 11.738 15.78 12.031C15.487 12.324 15.012 12.324 14.719 12.031L8.99901 6.311L3.27901 12.031C2.98601 12.324 2.51101 12.324 2.21801 12.031C1.92501 11.738 1.92501 11.2629 2.21801 10.9699L8.46801 4.7199C8.61401 4.5739 8.80601 4.5 8.99801 4.5H9.00001Z"></path>
          </g>
        </svg>
      </span>

      <span class="sr-only">Toggle</span>
    </button>
  </div>

  <div data-collapsible-target="content" data-state="closed" class="overflow-hidden transition-all duration-300 ease-in-out" style="max-height: 0; opacity: 0;">
    <div class="space-y-2 pt-2">
      <div class="rounded-md border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-700/50 px-4 py-3 font-mono text-sm">Item 1</div>
      <div class="rounded-md border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-700/50 px-4 py-3 font-mono text-sm">Item 2</div>
    </div>
  </div>
</div>
```

### Key Modifications

**Default open:** Set `data-collapsible-open-value="true"`, `data-state="open"`, and adjust icon/content styles.

**Different icons:** Replace the SVG icons with plus/minus or arrow variants (see icon examples below).

**No animation:** Set `data-collapsible-animated-value="false"` on the root `data-controller="collapsible"` element to disable content transitions.

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/collapsible/collapsible",
  title: "Show more items",
  content: capture do %>
    <div class="space-y-2 pt-2">
      <p>Hidden content here</p>
    </div>
  <% end %>
%>
```

### With Options

```erb
<%= render "shared/components/collapsible/collapsible",
  title: "Configuration",
  default_open: true,
  icon: "plus_minus",
  classes: "max-w-md",
  content: capture do %>
    <div class="space-y-2 pt-2">
      <p>Configuration content</p>
    </div>
  <% end %>
%>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `title` | String | required | Header text |
| `content` | String/HTML | required | Collapsible content |
| `default_open` | Boolean | `false` | Start expanded |
| `icon` | String | `"chevron"` | `"chevron"`, `"plus_minus"`, `"arrows"` |
| `animated` | Boolean | `true` | Enable animations |
| `disabled` | Boolean | `false` | Disable interaction |
| `visible_content` | String/HTML | `nil` | Always-visible content rendered above the collapsible region |
| `summary_content` | String/HTML | `nil` | Backward-compatible alias for `visible_content` |
| `summary_text` | String/HTML | `nil` | Backward-compatible alias for `visible_content` |
| `classes` | String | `nil` | Additional wrapper classes |
| `trigger_classes` | String | `nil` | Additional trigger button classes |
| `content_classes` | String | `nil` | Additional content area classes |

---

## ViewComponent

### Basic Usage

```erb
<%= render(Collapsible::Component.new(title: "Show more items")) do %>
  <div class="space-y-2 pt-2">
    <p>Hidden content here</p>
  </div>
<% end %>
```

### With Options

```erb
<%= render(Collapsible::Component.new(
  title: "Configuration",
  default_open: true,
  icon: :plus_minus,
  classes: "max-w-md"
)) do %>
  <div class="space-y-2 pt-2">
    <p>Configuration content</p>
  </div>
<% end %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `title` | String | required | Header text |
| `default_open` | Boolean | `false` | Start expanded |
| `icon` | Symbol | `:chevron` | `:chevron`, `:plus_minus`, `:arrows` |
| `animated` | Boolean | `true` | Enable animations |
| `disabled` | Boolean | `false` | Disable interaction |
| `visible_content` | String/HTML | `nil` | Always-visible content rendered above the collapsible region |
| `summary_content` | String/HTML | `nil` | Backward-compatible alias for `visible_content` |
| `summary_text` | String/HTML | `nil` | Backward-compatible alias for `visible_content` |
| `classes` | String | `nil` | Additional wrapper classes |
| `trigger_classes` | String | `nil` | Additional trigger button classes |
| `content_classes` | String | `nil` | Additional content area classes |

---

## Icon Styles

| Icon | Description |
| ---- | ----------- |
| `chevron` | Down/up chevron arrows (default) |
| `plus_minus` | Plus sign collapses to minus |
| `arrows` | Inward/outward pointing arrows |

---

## Accessibility

Implements accessibility best practices:

- `aria-expanded` on trigger button
- `aria-controls` linking trigger to content
- `role="region"` on content area
- `data-state` for CSS styling hooks
- Screen reader-only toggle label

---

## Collapsible vs Accordion

| Feature | Collapsible | Accordion |
| ------- | ----------- | --------- |
| Items | Single | Multiple |
| Keyboard nav | Basic | Full (↑↓, Home/End) |
| Use case | Show/hide single section | FAQ, grouped content |
| Controller | `collapsible` | `accordion` |

Use **Collapsible** for single expandable sections. Use **Accordion** for multiple related items where keyboard navigation between items is needed.

---

## Troubleshooting

**Content doesn't animate:** Ensure content has `overflow-hidden` and transition classes.

**Icons don't swap:** Check `data-collapsible-target="collapsedIcon"` and `data-collapsible-target="expandedIcon"` are on the icon wrapper spans.

**Starts in wrong state:** Verify `data-collapsible-open-value` matches the inline styles on icons and content.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/collapsible/`
- **Shared partial files**: `app/views/shared/components/collapsible/`
- **shared partial**: `render "shared/components/collapsible/collapsible"`
- **ViewComponent**: `render Collapsible::Component.new(...)`
- **ViewComponent files**: `app/components/collapsible/`

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
