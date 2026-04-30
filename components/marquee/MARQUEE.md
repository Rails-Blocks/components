# Marquee Component

Infinitely scrolling/ticker content with smooth requestAnimationFrame animation, hover interactions, and seamless looping.

## Features

- Multi-direction scrolling (left, right, up, or down)
- Configurable animation speed
- Pause or slow on hover
- Seamless infinite loop with cloned content
- Consistent seam spacing between cloned lists
- Optional edge fade mask
- Fully responsive
- Dark mode support

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/marquee/` | Full control, copy-paste |
| **Shared Partials** | `app/views/shared/components/marquee/` | Reusable partials, data-driven |
| **ViewComponent** | `app/components/marquee/` | Block-style content, testing |

---

## Stimulus Controller

### Values

| Value | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `speed` | Number | `20` | Animation duration in seconds (lower = faster) |
| `hoverSpeed` | Number | `0` | Speed on hover (0 = pause completely) |
| `direction` | String | `"left"` | Scroll direction: `"left"`, `"right"`, `"up"`, or `"down"` |
| `clones` | Number | `2` | Number of content clones for seamless loop |

### Targets

| Target | Required | Description |
| ------ | -------- | ----------- |
| `track` | Yes | Container that holds the scrolling content |
| `list` | Yes | The original content list that gets cloned |

### Actions

| Action | Usage | Description |
| ------ | ----- | ----------- |
| `pauseAnimation` | `mouseenter->marquee#pauseAnimation` | Pauses or slows the animation |
| `resumeAnimation` | `mouseleave->marquee#resumeAnimation` | Resumes normal animation speed |

---

## Plain ERB

Copy the code block into your view and customize as needed.

### Basic Example

```erb
<div
  data-controller="marquee"
  data-marquee-speed-value="15"
  class="relative overflow-hidden py-4 [--marquee-fade-size:1.25rem] [mask-image:linear-gradient(to_right,transparent,black_var(--marquee-fade-size),black_calc(100%-var(--marquee-fade-size)),transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_var(--marquee-fade-size),black_calc(100%-var(--marquee-fade-size)),transparent)]"
  data-action="mouseenter->marquee#pauseAnimation mouseleave->marquee#resumeAnimation"
>
  <div data-marquee-target="track" class="relative flex w-full">
    <div data-marquee-target="list" class="flex w-full shrink-0 flex-nowrap items-center justify-around gap-8">
      <div class="flex items-center space-x-2">
        <span class="text-sm font-medium text-neutral-800 dark:text-neutral-200">Item 1</span>
      </div>
      <div class="flex items-center space-x-2">
        <span class="text-sm font-medium text-neutral-800 dark:text-neutral-200">Item 2</span>
      </div>
      <div class="flex items-center space-x-2">
        <span class="text-sm font-medium text-neutral-800 dark:text-neutral-200">Item 3</span>
      </div>
    </div>
  </div>
</div>
```

### Key Modifications

**Change direction:** Set `data-marquee-direction-value` to `"right"`, `"up"`, or `"down"` as needed.

**Slow on hover instead of pause:** Set `data-marquee-hover-speed-value="40"` for slower speed on hover.

**Adjust speed:** Lower values are faster. `data-marquee-speed-value="10"` is fast, `30` is slow.

**Remove edge fade:** Remove the `mask-image` and `-webkit-mask-image` classes.

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/marquee/marquee",
  items: [
    { content: "Ruby on Rails" },
    { content: "Tailwind CSS" },
    { content: "Stimulus" }
  ]
%>
```

### With Options

```erb
<%= render "shared/components/marquee/marquee",
  items: [
    { content: '<span class="font-bold">Breaking News</span>' },
    { content: "Latest updates from around the world" },
    { content: '<span class="font-bold">Technology</span>' }
  ],
  speed: 10,
  hover_speed: 30,
  direction: "right",
  gap: "gap-12",
  show_fade: true,
  classes: "py-4"
%>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `items` | Array | `[]` | Array of item hashes (see below) |
| `speed` | Integer | `20` | Animation duration in seconds |
| `hover_speed` | Integer | `0` | Speed on hover (0 = pause) |
| `direction` | String | `"left"` | `"left"`, `"right"`, `"up"`, or `"down"` |
| `clones` | Integer | `2` | Number of content clones |
| `gap` | String | `"gap-8"` | Tailwind gap class between items |
| `pause_on_hover` | Boolean | `true` | Enable hover pause/slow |
| `show_fade` | Boolean | `true` | Show edge fade mask |
| `classes` | String | `nil` | Additional wrapper classes |

### Item Hash

| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `content` | String | required | Item content (supports HTML) |
| `classes` | String | `nil` | Additional item classes |

---

## ViewComponent

### Basic Usage

```erb
<%= render(Marquee::Component.new) do |marquee| %>
  <% marquee.with_item do %>
    Ruby on Rails
  <% end %>
  <% marquee.with_item do %>
    Tailwind CSS
  <% end %>
  <% marquee.with_item do %>
    Stimulus
  <% end %>
<% end %>
```

### With Options

```erb
<%= render(Marquee::Component.new(
  speed: 10,
  hover_speed: 30,
  direction: "right",
  gap: "gap-12",
  classes: "py-4"
)) do |marquee| %>
  <% marquee.with_item do %>
    <span class="font-bold">Breaking News</span>
  <% end %>
  <% marquee.with_item do %>
    Latest updates from around the world
  <% end %>
<% end %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `speed` | Integer | `20` | Animation duration in seconds |
| `hover_speed` | Integer | `0` | Speed on hover (0 = pause) |
| `direction` | String | `"left"` | `"left"`, `"right"`, `"up"`, or `"down"` |
| `clones` | Integer | `2` | Number of content clones |
| `gap` | String | `"gap-8"` | Tailwind gap class |
| `pause_on_hover` | Boolean | `true` | Enable hover interaction |
| `show_fade` | Boolean | `true` | Show edge fade mask |
| `classes` | String | `nil` | Additional wrapper classes |

### Item Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `classes` | String | `nil` | Additional item classes |

---

## Common Patterns

### Logo Wall / Brand Showcase

```erb
<%= render(Marquee::Component.new(speed: 25, gap: "gap-6")) do |marquee| %>
  <% marquee.with_item(classes: "min-w-[150px] px-6 py-4 rounded-xl border bg-neutral-50 dark:bg-neutral-800") do %>
    <span class="text-lg font-medium">Apple</span>
  <% end %>
  <% marquee.with_item(classes: "min-w-[150px] px-6 py-4 rounded-xl border bg-neutral-50 dark:bg-neutral-800") do %>
    <span class="text-lg font-medium">Google</span>
  <% end %>
<% end %>
```

### News Ticker

```erb
<%= render(Marquee::Component.new(
  speed: 15,
  direction: "left",
  classes: "bg-red-600 text-white py-2"
)) do |marquee| %>
  <% marquee.with_item do %>
    <span class="font-bold">BREAKING:</span> Latest headlines...
  <% end %>
<% end %>
```

### Announcement Banner

```erb
<%= render(Marquee::Component.new(
  speed: 30,
  hover_speed: 0,
  show_fade: false,
  classes: "bg-neutral-100 dark:bg-neutral-900 py-2"
)) do |marquee| %>
  <% marquee.with_item do %>
    🎉 Free shipping on orders over $50
  <% end %>
  <% marquee.with_item do %>
    ⭐ New arrivals just dropped
  <% end %>
<% end %>
```

---

## Accessibility

- Animation can be paused on hover for users who prefer reduced motion
- Content is duplicated with `aria-hidden="true"` on clones
- Consider adding `prefers-reduced-motion` media query support in production

---

## Troubleshooting

**Animation not smooth:** Ensure the container has `overflow-hidden` and the track has proper flex properties.

**Content jumps at loop point:** Increase the `clones` value if content is very short, and keep spacing on the list with `gap-*` (avoid extra list edge padding).

**Fade edges too strong/weak:** Adjust `--marquee-fade-size` on the wrapper.

**Animation too fast/slow:** Adjust the `speed` value. Lower = faster, higher = slower.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/marquee/`
- **Shared partial files**: `app/views/shared/components/marquee/`
- **shared partial**: `render "shared/components/marquee/marquee"`
- **ViewComponent**: `render Marquee::Component.new(...)`
- **ViewComponent files**: `app/components/marquee/`

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