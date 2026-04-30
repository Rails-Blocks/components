# Lightbox Component

A beautiful image lightbox and gallery viewer powered by PhotoSwipe 5. Supports single images, grid galleries, masonry layouts, and inline attachment styles with smooth zoom animations and touch gestures.

## Features

- Multiple layout variants (grid, masonry, inline)
- Click-to-zoom with multi-level zoom (100%, 1.5x, 2x)
- Smooth open/close animations
- Touch and swipe gestures
- Keyboard navigation (arrows, escape)
- Download button with direct image download
- Zoom level indicator
- Dots navigation for galleries
- Auto-detection of image dimensions
- Captions overlay support
- Wheel-to-zoom support

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/lightbox/` | Full control, copy-paste |
| **Shared Partials** | `app/views/shared/components/lightbox/` | Reusable partials, data-driven |
| **ViewComponent** | `app/components/lightbox/` | Block-style content, testing |

---

## Installation

The lightbox component requires PhotoSwipe 5. Add it to your importmap:

```ruby
# config/importmap.rb
pin "photoswipe", to: "https://cdn.jsdelivr.net/npm/photoswipe@5.4.3/dist/photoswipe.esm.min.js"
```

The CSS is loaded automatically by the Stimulus controller from the CDN.

---

## Stimulus Controller

### Values

| Value | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `options` | Object | `{}` | Additional PhotoSwipe options |
| `gallerySelector` | String | `""` | Custom selector for gallery elements |
| `showDownloadButton` | Boolean | `true` | Show download button in lightbox |
| `showZoomIndicator` | Boolean | `true` | Show zoom percentage indicator |
| `showDotsIndicator` | Boolean | `true` | Show dots navigation for multiple images |

### Targets

| Target | Required | Description |
| ------ | -------- | ----------- |
| `trigger` | For single images | Clickable element that opens lightbox |
| `gallery` | For galleries | Container holding multiple lightbox items |

### Data Attributes on Links

| Attribute | Required | Description |
| --------- | -------- | ----------- |
| `data-pswp-src` | Yes | Full-size image URL |
| `data-pswp-width` | No | Image width in pixels (auto-detected if not provided) |
| `data-pswp-height` | No | Image height in pixels (auto-detected if not provided) |
| `data-pswp-caption` | No | Caption text shown below image |
| `data-pswp-alt` | No | Alt text for accessibility |

---

## Plain ERB

Copy the code block into your view and customize as needed.

### Single Image

```erb
<a href="https://example.com/full-image.jpg"
   data-controller="lightbox"
   data-lightbox-target="trigger"
   data-pswp-src="https://example.com/full-image.jpg"
   data-pswp-width="2500"
   data-pswp-height="1667"
   data-pswp-caption="Image description"
   class="inline-block">
  <img src="https://example.com/thumbnail.jpg"
       alt="Image description"
       class="rounded-lg shadow-lg hover:opacity-90 transition-opacity cursor-pointer">
</a>
```

### Gallery

```erb
<div data-controller="lightbox" data-lightbox-target="gallery" class="grid grid-cols-4 gap-4">
  <a href="https://example.com/image1.jpg"
     data-pswp-src="https://example.com/image1.jpg"
     data-pswp-caption="First image"
     class="group relative overflow-hidden rounded-lg">
    <img src="https://example.com/thumb1.jpg" alt="First image" class="w-full h-full object-cover">
  </a>
  <!-- More images... -->
</div>
```

### Key Modifications

**Disable download button:** Add `data-lightbox-show-download-button-value="false"` to the container.

**Disable zoom indicator:** Add `data-lightbox-show-zoom-indicator-value="false"` to the container.

**Disable dots navigation:** Add `data-lightbox-show-dots-indicator-value="false"` to the container.

**Specify dimensions:** Add `data-pswp-width` and `data-pswp-height` for best performance.

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/lightbox/lightbox",
  items: [
    { src: "https://example.com/image1.jpg", caption: "First image" },
    { src: "https://example.com/image2.jpg", caption: "Second image" }
  ]
%>
```

### With Options

```erb
<%= render "shared/components/lightbox/lightbox",
  items: [
    { src: "https://example.com/image1.jpg", thumbnail_src: "https://example.com/thumb1.jpg", width: 1600, height: 1200, caption: "Image 1" },
    { src: "https://example.com/image2.jpg", thumbnail_src: "https://example.com/thumb2.jpg", width: 1600, height: 900, caption: "Image 2" }
  ],
  variant: "masonry",
  columns: 3,
  gap: "lg",
  show_download_button: false,
  classes: "max-w-4xl mx-auto"
%>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `items` | Array | `[]` | Array of image hashes (see below) |
| `variant` | String | `"grid"` | `"grid"`, `"masonry"`, `"inline"`, `"single"` |
| `columns` | Integer | `4` | Number of columns (2-6) |
| `gap` | String | `"md"` | Gap size: `"sm"`, `"md"`, `"lg"` |
| `show_download_button` | Boolean | `true` | Show download button |
| `show_zoom_indicator` | Boolean | `true` | Show zoom level indicator |
| `show_dots_indicator` | Boolean | `true` | Show dots navigation |
| `rounded` | Boolean | `true` | Apply rounded corners |
| `hover_effect` | Boolean | `true` | Apply hover scale effect |
| `classes` | String | `nil` | Additional wrapper classes |

### Item Hash

| Key | Type | Required | Description |
| --- | ---- | -------- | ----------- |
| `src` | String | Yes | Full-size image URL |
| `thumbnail_src` | String | No | Thumbnail URL (uses `src` if not provided) |
| `width` | Integer | No | Full-size image width in pixels |
| `height` | Integer | No | Full-size image height in pixels |
| `alt` | String | No | Alt text for accessibility |
| `caption` | String | No | Caption shown in lightbox |
| `classes` | String | No | Additional item classes |

---

## ViewComponent

### Basic Usage

```erb
<%= render(Lightbox::Component.new) do |lightbox| %>
  <% lightbox.with_item(src: "https://example.com/image1.jpg", caption: "First image") %>
  <% lightbox.with_item(src: "https://example.com/image2.jpg", caption: "Second image") %>
<% end %>
```

### With Options

```erb
<%= render(Lightbox::Component.new(
  variant: :masonry,
  columns: 3,
  gap: :lg,
  show_download_button: false,
  classes: "max-w-4xl mx-auto"
)) do |lightbox| %>
  <% lightbox.with_item(
    src: "https://example.com/image1.jpg",
    thumbnail_src: "https://example.com/thumb1.jpg",
    width: 1600,
    height: 1200,
    caption: "Image with full details"
  ) %>
  <% lightbox.with_item(src: "https://example.com/image2.jpg") %>
<% end %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `variant` | Symbol | `:grid` | `:grid`, `:masonry`, `:inline`, `:single` |
| `columns` | Integer | `4` | Number of columns (2-6) |
| `gap` | Symbol | `:md` | Gap size: `:sm`, `:md`, `:lg` |
| `show_download_button` | Boolean | `true` | Show download button |
| `show_zoom_indicator` | Boolean | `true` | Show zoom level indicator |
| `show_dots_indicator` | Boolean | `true` | Show dots navigation |
| `rounded` | Boolean | `true` | Apply rounded corners |
| `hover_effect` | Boolean | `true` | Apply hover scale effect |
| `classes` | String | `nil` | Additional wrapper classes |

### Item Options

| Option | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `src` | String | Yes | Full-size image URL |
| `thumbnail_src` | String | No | Thumbnail URL |
| `width` | Integer | No | Full-size image width |
| `height` | Integer | No | Full-size image height |
| `alt` | String | No | Alt text |
| `caption` | String | No | Caption text |
| `classes` | String | No | Additional item classes |

---

## Variants

| Variant | Description |
| ------- | ----------- |
| `grid` | Uniform grid layout with responsive columns |
| `masonry` | Pinterest-style masonry layout for varied image heights |
| `inline` | Flexbox inline layout for attachment-style displays |
| `single` | Single image mode (no gallery navigation) |

---

## Accessibility

The component integrates PhotoSwipe's accessibility features:

- Keyboard navigation (arrow keys, Escape to close)
- Focus management within the lightbox
- ARIA labels on navigation controls
- Alt text support via `data-pswp-alt`
- Proper focus restoration on close

---

## Troubleshooting

**Images don't open in lightbox:** Ensure the container has `data-controller="lightbox"` and items have `data-pswp-src`.

**Gallery shows wrong image first:** Check that `data-pswp-src` is set on each item's anchor element.

**Dimensions are wrong:** Provide explicit `width` and `height` for best results; auto-detection may estimate based on thumbnail ratio.

**Download button not working:** Ensure the full-size image URL is publicly accessible and supports CORS if needed.

**Zoom indicator stuck:** The indicator auto-hides after 2 seconds at 100% zoom; move mouse to show it again.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/lightbox/`
- **Shared partial files**: `app/views/shared/components/lightbox/`
- **shared partial**: `render "shared/components/lightbox/lightbox"`
- **ViewComponent**: `render Lightbox::Component.new(...)`
- **ViewComponent files**: `app/components/lightbox/`

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