# Carousel Component

Image and content slider powered by Embla Carousel with drag support, keyboard navigation, and ARIA accessibility.

## Features

- Horizontal and vertical scrolling
- Infinite loop mode
- Free dragging or snap-to-slide
- Navigation dots and buttons
- Thumbnail synchronization
- Mouse wheel gestures
- Responsive slide sizes
- Full keyboard navigation (`←`/`→` for horizontal, `↑`/`↓` for vertical, plus `Home`/`End`)
- Touch and drag support

## Installation

The carousel requires the Embla Carousel library. Add to your `config/importmap.rb`:

```ruby
pin "embla-carousel", to: "https://ga.jspm.io/npm:embla-carousel@8.0.0/embla-carousel.esm.js"
pin "embla-carousel-wheel-gestures", to: "https://ga.jspm.io/npm:embla-carousel-wheel-gestures@8.0.0/embla-carousel-wheel-gestures.esm.js"
```

Ensure the Stimulus controller is at `app/javascript/controllers/carousel_controller.js`.

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/carousel/` | Full control, copy-paste |
| **Shared Partials** | `app/views/shared/components/carousel/` | Reusable partials, data-driven |
| **ViewComponent** | `app/components/carousel/` | Block-style content, testing |

---

## Stimulus Controller

### Values

| Value | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `loop` | Boolean | `false` | Enable infinite looping |
| `dragFree` | Boolean | `false` | Allow free dragging without snap |
| `dots` | Boolean | `true` | Show navigation dots |
| `buttons` | Boolean | `true` | Show prev/next buttons |
| `axis` | String | `"x"` | Carousel axis: `"x"` or `"y"` |
| `thumbnails` | Boolean | `false` | Enable thumbnail navigation mode |
| `mainCarousel` | String | `""` | ID of main carousel for thumbnail sync |
| `wheelGestures` | Boolean | `false` | Enable mouse wheel navigation |

### Targets

| Target | Required | Description |
| ------ | -------- | ----------- |
| `viewport` | Yes | The scrollable container |
| `prevButton` | No | Previous navigation button |
| `nextButton` | No | Next navigation button |
| `dotsContainer` | No | Container for generated dot buttons |
| `thumbnailButton` | No | Thumbnail buttons for navigation |

---

## Plain ERB

Copy the code block into your view and customize as needed.

### Basic Example

```erb
<section class="overflow-hidden w-full max-w-4xl mx-auto" data-controller="carousel"
  data-carousel-dots-value="true"
  data-carousel-buttons-value="true">
  <div class="overflow-hidden outline-hidden mx-8 cursor-grab active:cursor-grabbing" data-carousel-target="viewport">
    <div class="flex">
      <div class="mr-4 flex-shrink-0 flex-grow-0 basis-1/2 min-w-0 p-8 text-center rounded-xl border border-neutral-200 bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-700 select-none">
        Slide 1
      </div>
      <div class="mr-4 flex-shrink-0 flex-grow-0 basis-1/2 min-w-0 p-8 text-center rounded-xl border border-neutral-200 bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-700 select-none">
        Slide 2
      </div>
      <div class="mr-4 flex-shrink-0 flex-grow-0 basis-1/2 min-w-0 p-8 text-center rounded-xl border border-neutral-200 bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-700 select-none">
        Slide 3
      </div>
    </div>
  </div>

  <div class="flex justify-between items-center mt-4 px-8">
    <div class="grid grid-cols-2 gap-2 items-center">
      <button class="size-10 rounded-full bg-white border border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 disabled:opacity-50" type="button" data-carousel-target="prevButton" aria-label="Previous">
        ←
      </button>
      <button class="size-10 rounded-full bg-white border border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 disabled:opacity-50" type="button" data-carousel-target="nextButton" aria-label="Next">
        →
      </button>
    </div>
    <div class="flex gap-1.5" data-carousel-target="dotsContainer"></div>
  </div>
</section>
```

### Key Modifications

**Enable looping:** Add `data-carousel-loop-value="true"` to the container.

**Free dragging:** Add `data-carousel-drag-free-value="true"` for momentum scrolling.

**Vertical carousel:** Add `data-carousel-axis-value="y"` and use `flex-col` on the slides container.

**Hide controls:** Set `data-carousel-dots-value="false"` or `data-carousel-buttons-value="false"`.

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/carousel/carousel",
  slides: [
    { content: '<div class="p-8 text-center rounded-xl bg-neutral-100">Slide 1</div>' },
    { content: '<div class="p-8 text-center rounded-xl bg-neutral-100">Slide 2</div>' },
    { content: '<div class="p-8 text-center rounded-xl bg-neutral-100">Slide 3</div>' }
  ]
%>
```

### With Options

```erb
<%= render "shared/components/carousel/carousel",
  slides: [
    { content: '<div class="p-8">Content 1</div>', classes: "bg-blue-100 rounded-xl" },
    { content: '<div class="p-8">Content 2</div>', classes: "bg-green-100 rounded-xl" },
    { content: '<div class="p-8">Content 3</div>', classes: "bg-purple-100 rounded-xl" }
  ],
  loop_enabled: true,
  drag_free: true,
  slide_size: "third",
  show_gradients: false
%>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `slides` | Array | `[]` | Array of slide hashes |
| `loop_enabled` | Boolean | `false` | Enable infinite looping |
| `drag_free` | Boolean | `false` | Free drag without snap |
| `dots` | Boolean | `true` | Show navigation dots |
| `buttons` | Boolean | `true` | Show prev/next buttons |
| `axis` | String | `"x"` | `"x"` or `"y"` |
| `thumbnails` | Boolean | `false` | Thumbnail mode |
| `main_carousel_id` | String | `nil` | Main carousel ID for thumbnail sync |
| `wheel_gestures` | Boolean | `false` | Mouse wheel navigation |
| `slide_size` | String | `"half"` | `"full"`, `"three_quarters"`, `"two_thirds"`, `"half"`, `"third"`, `"quarter"` |
| `show_gradients` | Boolean | `true` | Edge fade mask (horizontal or vertical, based on `axis`) |
| `height` | String | `nil` | Fixed height class for vertical |
| `classes` | String | `nil` | Additional wrapper classes |
| `id` | String | `nil` | HTML ID attribute |

### Slide Hash

| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `content` | String | required | Slide HTML content |
| `classes` | String | `nil` | Additional slide classes |

---

## ViewComponent

### Basic Usage

```erb
<%= render(Carousel::Component.new) do |carousel| %>
  <% carousel.with_slide do %>
    <div class="p-8 text-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
      Slide 1
    </div>
  <% end %>
  <% carousel.with_slide do %>
    <div class="p-8 text-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
      Slide 2
    </div>
  <% end %>
<% end %>
```

### With Options

```erb
<%= render(Carousel::Component.new(
  loop: true,
  drag_free: true,
  slide_size: :third,
  show_gradients: false
)) do |carousel| %>
  <% carousel.with_slide do %>
    <div class="p-6 rounded-xl bg-blue-500 text-white">Card 1</div>
  <% end %>
  <% carousel.with_slide do %>
    <div class="p-6 rounded-xl bg-green-500 text-white">Card 2</div>
  <% end %>
  <% carousel.with_slide(classes: "bg-purple-100 rounded-xl") do %>
    <div class="p-6 text-purple-900">Card 3</div>
  <% end %>
<% end %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `loop` | Boolean | `false` | Enable infinite looping |
| `drag_free` | Boolean | `false` | Free drag without snap |
| `dots` | Boolean | `true` | Show navigation dots |
| `buttons` | Boolean | `true` | Show prev/next buttons |
| `axis` | String | `"x"` | `"x"` or `"y"` |
| `thumbnails` | Boolean | `false` | Thumbnail mode |
| `main_carousel_id` | String | `nil` | Main carousel ID for sync |
| `wheel_gestures` | Boolean | `false` | Mouse wheel navigation |
| `slide_size` | Symbol | `:half` | `:full`, `:three_quarters`, `:two_thirds`, `:half`, `:third`, `:quarter` |
| `show_gradients` | Boolean | `true` | Edge gradients |
| `height` | String | `nil` | Fixed height class |
| `classes` | String | `nil` | Additional wrapper classes |
| `id` | String | `nil` | HTML ID attribute |

### Slide Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `classes` | String | `nil` | Additional slide classes |

---

## Slide Sizes

| Size | Breakpoint Behavior |
| ---- | ------------------- |
| `full` | 100% at all sizes |
| `three_quarters` | 100% → 75% (sm+) |
| `two_thirds` | 100% → 75% (sm+) → 66% (md+) |
| `half` | 100% → 75% (sm+) → 66% (md+) → 50% (lg+) |
| `third` | 100% → 50% (sm+) → 33% (md+) |
| `quarter` | 100% → 50% (sm+) → 33% (md+) → 25% (lg+) |

---

## Thumbnail Carousel

To create a carousel with thumbnail navigation:

```erb
<!-- Main Carousel -->
<%= render(Carousel::Component.new(
  id: "main-carousel",
  dots: false,
  slide_size: :full
)) do |carousel| %>
  <% carousel.with_slide do %>
    <img src="image1.jpg" class="w-full rounded-xl">
  <% end %>
  <% carousel.with_slide do %>
    <img src="image2.jpg" class="w-full rounded-xl">
  <% end %>
<% end %>

<!-- Thumbnail Carousel -->
<%= render(Carousel::Component.new(
  thumbnails: true,
  main_carousel_id: "main-carousel",
  buttons: false,
  dots: false,
  slide_size: :quarter
)) do |carousel| %>
  <% carousel.with_slide do %>
    <button data-carousel-target="thumbnailButton" class="w-full">
      <img src="thumb1.jpg" class="w-full rounded">
    </button>
  <% end %>
  <% carousel.with_slide do %>
    <button data-carousel-target="thumbnailButton" class="w-full">
      <img src="thumb2.jpg" class="w-full rounded">
    </button>
  <% end %>
<% end %>
```

---

## Accessibility

Implements carousel accessibility best practices:

- `role="region"` on viewport with `aria-label`
- `aria-label` on navigation buttons
- Keyboard navigation: ← → for horizontal carousels, ↑ ↓ for vertical carousels, plus Home/End
- Focus management after button clicks
- Disabled state for boundary buttons (non-loop mode)

---

## Troubleshooting

**Slides don't scroll:** Ensure viewport has `overflow-hidden` and slides have proper `flex-shrink-0` classes.

**Dots don't appear:** Check that `dotsContainer` target exists and `dots` value is `true`.

**Thumbnails don't sync:** Verify main carousel has an `id` and thumbnail carousel has matching `mainCarousel` value.

**Vertical carousel has no height:** Add a fixed height class (e.g., `h-96`) via the `height` option.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/carousel/`
- **Shared partial files**: `app/views/shared/components/carousel/`
- **shared partial**: `render "shared/components/carousel/carousel"`
- **ViewComponent**: `render Carousel::Component.new(...)`
- **ViewComponent files**: `app/components/carousel/`

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