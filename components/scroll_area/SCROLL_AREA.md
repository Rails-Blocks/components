# Scroll Area Component

Custom scrollbar styling and scroll containers with auto-hide behavior, smooth interactions, and fade effects.

## Features

- Custom styled scrollbars that replace native browser scrollbars
- Auto-hide behavior with configurable delay
- Vertical, horizontal, or bidirectional scrolling
- Click-to-jump on scrollbar track
- Draggable thumb for precise control
- Scroll fade effects at edges
- Full dark mode support
- Responsive and accessible

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/scroll_area/` | Full control, copy-paste |
| **Shared Partials** | `app/views/shared/components/scroll_area/` | Reusable partials, data-driven |
| **ViewComponent** | `app/components/scroll_area/` | Block-style content, testing |

---

## Stimulus Controller

### Values

| Value | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `hideDelay` | Number | `600` | Delay in milliseconds before hiding scrollbars |

### Targets

| Target | Required | Description |
| ------ | -------- | ----------- |
| `root` | Yes | The root container element |
| `viewport` | Yes | The scrollable content container |
| `scrollbar` | Yes | The scrollbar track element(s) |
| `thumb` | Yes | The draggable thumb element(s) |

### Actions

| Action | Usage | Description |
| ------ | ----- | ----------- |
| `onRootMouseEnter` | `mouseenter->scroll-area#onRootMouseEnter` | Shows scrollbars on hover |
| `onRootMouseLeave` | `mouseleave->scroll-area#onRootMouseLeave` | Hides scrollbars when mouse leaves |
| `onViewportScroll` | `scroll->scroll-area#onViewportScroll` | Updates scrollbar position and shows scrollbars |
| `onScrollbarClick` | `click->scroll-area#onScrollbarClick` | Jump to clicked position on track |
| `onThumbMouseDown` | `mousedown->scroll-area#onThumbMouseDown` | Start dragging the thumb |

### Data Attributes

| Attribute | Element | Description |
| --------- | ------- | ----------- |
| `data-scroll-area-orientation-value` | scrollbar | Set to `"vertical"` or `"horizontal"` |
| `data-hovering` | scrollbar | Present when mouse is over root |
| `data-scrolling` | scrollbar | Present when actively scrolling |
| `data-visible` | scrollbar | Set to `"false"` when no overflow |

---

## Plain ERB

Copy the code block into your view and customize as needed.

### Basic Example

```erb
<div
  data-controller="scroll-area"
  data-scroll-area-target="root"
  data-action="mouseenter->scroll-area#onRootMouseEnter mouseleave->scroll-area#onRootMouseLeave"
  class="relative h-64 w-full max-w-md rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800"
>
  <!-- Viewport -->
  <div
    data-scroll-area-target="viewport"
    data-action="scroll->scroll-area#onViewportScroll"
    class="h-full overflow-auto scrollbar-hide scroll-fade-y"
  >
    <div class="space-y-4 text-sm text-neutral-900 dark:text-neutral-100">
      <p>Your scrollable content goes here...</p>
      <!-- More content -->
    </div>
  </div>

  <!-- Vertical Scrollbar -->
  <div
    data-scroll-area-target="scrollbar"
    data-scroll-area-orientation-value="vertical"
    data-action="click->scroll-area#onScrollbarClick"
    class="absolute right-2 top-2 bottom-2 flex w-1.5 justify-center rounded-full bg-black/5 backdrop-blur-sm opacity-0 transition-opacity duration-150 delay-300 pointer-events-none data-[hovering]:opacity-100 data-[hovering]:duration-100 data-[hovering]:delay-0 data-[hovering]:pointer-events-auto data-[scrolling]:opacity-100 data-[scrolling]:duration-100 data-[scrolling]:delay-0 data-[scrolling]:pointer-events-auto data-[visible=false]:hidden dark:bg-white/10"
  >
    <div
      data-scroll-area-target="thumb"
      data-action="mousedown->scroll-area#onThumbMouseDown"
      class="relative w-full rounded-full bg-neutral-500 transition-opacity duration-100 dark:bg-neutral-400"
    ></div>
  </div>
</div>
```

### Key Modifications

**Horizontal scrollbar:** Use `data-scroll-area-orientation-value="horizontal"` and adjust positioning classes:

```erb
<div
  data-scroll-area-target="scrollbar"
  data-scroll-area-orientation-value="horizontal"
  data-action="click->scroll-area#onScrollbarClick"
  class="absolute left-2 right-2 bottom-2 flex h-1.5 items-center rounded-full bg-black/5 ..."
>
  <div data-scroll-area-target="thumb" class="h-full ..."></div>
</div>
```

**Both directions:** Add both vertical and horizontal scrollbar elements to the same container.

**Custom hide delay:** Add `data-scroll-area-hide-delay-value="1000"` to the root element.

**Scroll fade effects:** Add `scroll-fade-y`, `scroll-fade-x`, or `scroll-fade-both` to the viewport.

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/scroll_area/scroll_area",
  height: "h-64",
  border: true,
  background: true,
  padding: "p-4" do %>
  <div class="prose prose-sm dark:prose-invert">
    <p>Your scrollable content goes here...</p>
  </div>
<% end %>
```

### With Options

```erb
<%= render "shared/components/scroll_area/scroll_area",
  orientation: "horizontal",
  max_width: "max-w-2xl",
  scroll_fade: "x",
  scrollbar_style: "minimal",
  padding: "p-4" do %>
  <div class="flex gap-4">
    <% items.each do |item| %>
      <div class="flex-shrink-0 w-48 h-32 rounded-lg bg-neutral-100 p-4">
        <%= item.name %>
      </div>
    <% end %>
  </div>
<% end %>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `height` | String | `nil` | Fixed height class (e.g., `"h-64"`) |
| `max_height` | String | `nil` | Maximum height (e.g., `"max-h-96"`) |
| `width` | String | `nil` | Fixed width class (e.g., `"w-full"`) |
| `max_width` | String | `nil` | Maximum width (e.g., `"max-w-md"`) |
| `orientation` | String | `"vertical"` | `"vertical"`, `"horizontal"`, `"both"` |
| `scrollbar_style` | String | `"default"` | `"default"`, `"minimal"`, `"overlay"` |
| `scroll_fade` | String | `"none"` | `"none"`, `"y"`, `"x"`, `"both"` |
| `hide_delay` | Integer | `600` | Delay before hiding scrollbars (ms) |
| `rounded` | String | `"rounded-lg"` | Border radius class |
| `border` | Boolean | `false` | Show border |
| `background` | Boolean | `false` | Add background color |
| `padding` | String | `nil` | Padding class (e.g., `"p-4"`) |
| `classes` | String | `nil` | Additional wrapper classes |
| `viewport_classes` | String | `nil` | Additional viewport classes |

---

## ViewComponent

### Basic Usage

```erb
<%= render(ScrollArea::Component.new(
  height: "h-64",
  border: true,
  background: true,
  padding: "p-4"
)) do %>
  <div class="prose prose-sm dark:prose-invert">
    <p>Your scrollable content goes here...</p>
  </div>
<% end %>
```

### With Options

```erb
<%= render(ScrollArea::Component.new(
  orientation: :horizontal,
  max_width: "max-w-2xl",
  scroll_fade: :x,
  scrollbar_style: :minimal,
  padding: "p-4"
)) do %>
  <div class="flex gap-4">
    <% items.each do |item| %>
      <div class="flex-shrink-0 w-48 h-32 rounded-lg bg-neutral-100 p-4">
        <%= item.name %>
      </div>
    <% end %>
  </div>
<% end %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `height` | String | `nil` | Fixed height class |
| `max_height` | String | `nil` | Maximum height class |
| `width` | String | `nil` | Fixed width class |
| `max_width` | String | `nil` | Maximum width class |
| `orientation` | Symbol | `:vertical` | `:vertical`, `:horizontal`, `:both` |
| `scrollbar_style` | Symbol | `:default` | `:default`, `:minimal`, `:overlay` |
| `scroll_fade` | Symbol | `:none` | `:none`, `:y`, `:x`, `:both` |
| `hide_delay` | Integer | `600` | Delay before hiding scrollbars |
| `rounded` | String | `"rounded-lg"` | Border radius class |
| `border` | Boolean | `false` | Show border |
| `background` | Boolean | `false` | Add background color |
| `padding` | String | `nil` | Padding class |
| `classes` | String | `nil` | Additional wrapper classes |
| `viewport_classes` | String | `nil` | Additional viewport classes |

---

## Orientation Options

| Orientation | Description |
| ----------- | ----------- |
| `vertical` | Vertical scrollbar only, content scrolls up/down |
| `horizontal` | Horizontal scrollbar only, content scrolls left/right |
| `both` | Both scrollbars, content can scroll in any direction |

---

## Scrollbar Styles

| Style | Description |
| ----- | ----------- |
| `default` | Semi-transparent track with backdrop blur |
| `minimal` | Transparent track, thumb only |
| `overlay` | Same as default, optimized for overlaying content |

---

## Scroll Fade Effects

The component supports fade effects at scroll edges to indicate more content:

| Fade | CSS Class | Description |
| ---- | --------- | ----------- |
| `none` | - | No fade effect |
| `y` | `scroll-fade-y` | Fade at top/bottom edges |
| `x` | `scroll-fade-x` | Fade at left/right edges |
| `both` | `scroll-fade-both` | Fade at all edges |

**Note:** These classes must be defined in your CSS. Example implementation:

```css
.scroll-fade-y {
  mask-image: linear-gradient(
    to bottom,
    transparent,
    black 20px,
    black calc(100% - 20px),
    transparent
  );
}
```

---

## Common Use Cases

### Text Content Container

```erb
<%= render(ScrollArea::Component.new(
  height: "h-80",
  scroll_fade: :y,
  border: true,
  background: true,
  padding: "p-4",
  rounded: "rounded-xl"
)) do %>
  <article class="prose dark:prose-invert">
    <%= @article.body %>
  </article>
<% end %>
```

### Horizontal Card Carousel

```erb
<%= render(ScrollArea::Component.new(
  orientation: :horizontal,
  scroll_fade: :x,
  classes: "w-full"
)) do %>
  <div class="flex gap-4 p-4">
    <% @cards.each do |card| %>
      <div class="flex-shrink-0 w-64">
        <%= render card %>
      </div>
    <% end %>
  </div>
<% end %>
```

### Data Table with Fixed Header

```erb
<%= render(ScrollArea::Component.new(
  orientation: :both,
  max_height: "max-h-96",
  border: true,
  background: true,
  rounded: "rounded-xl"
)) do %>
  <table class="w-full min-w-[800px]">
    <thead class="sticky top-0 bg-white dark:bg-neutral-800">
      <!-- Headers -->
    </thead>
    <tbody>
      <!-- Rows -->
    </tbody>
  </table>
<% end %>
```

### Chat/Message Container

```erb
<%= render(ScrollArea::Component.new(
  height: "h-[500px]",
  scroll_fade: :y,
  padding: "p-4",
  classes: "bg-neutral-50 dark:bg-neutral-900"
)) do %>
  <div class="space-y-4">
    <% @messages.each do |message| %>
      <%= render "message", message: message %>
    <% end %>
  </div>
<% end %>
```

---

## Required CSS

Ensure you have these utility classes in your Tailwind config or CSS:

```css
/* Hide native scrollbar */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

---

## Accessibility

- Custom scrollbars are visual enhancements; native scroll behavior is preserved
- Keyboard scrolling works as expected (arrow keys, Page Up/Down, Home/End)
- Focus management is handled by the browser
- Content remains accessible to screen readers

---

## Troubleshooting

**Scrollbar doesn't appear:** Ensure content overflows the container. Check that height/max-height is set.

**Thumb doesn't update:** Verify the Stimulus controller is connected and all data attributes are correct.

**Fade effect not working:** Ensure `scroll-fade-*` classes are defined in your CSS.

**Dragging feels laggy:** This can happen with very large content areas. Consider virtualizing long lists.

**Scrollbar visible when not needed:** The controller automatically hides scrollbars when content doesn't overflow. Check `data-[visible=false]:hidden` is in the track classes.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/scroll_area/`
- **Shared partial files**: `app/views/shared/components/scroll_area/`
- **shared partial**: `render "shared/components/scroll_area/scroll_area"`
- **ViewComponent**: `render ScrollArea::Component.new(...)`
- **ViewComponent files**: `app/components/scroll_area/`

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