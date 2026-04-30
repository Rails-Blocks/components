# Card Component

Content containers with optional headers, bodies, footers, and images. Perfect for organizing related information, displaying articles, showcasing products, or creating dashboard widgets.

## Features

- 3 style variants (default, elevated, well)
- 4 padding sizes (none, sm, md, lg)
- 6 shadow options (none, xs, sm, md, lg, xl)
- 6 border radius options (none, sm, md, lg, xl, full)
- Optional header, body, and footer sections
- Image support with configurable position and aspect ratio
- Hover and clickable states
- Section dividers
- Edge-to-edge mobile layout option
- Dark mode support
- Zero JavaScript required

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/card/` | Full control, copy-paste |
| **Shared Partial** | `app/views/shared/components/card/` | Reusable partial with locals |
| **ViewComponent** | `app/components/card/` | Block-style content, slots, testing |

---

## Plain ERB

Copy the card HTML directly into your views for maximum flexibility:

```erb
<div class="bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 rounded-xl shadow-xs overflow-hidden">
  <div class="px-4 py-5 sm:p-6">
    <h3 class="text-lg/6 font-medium text-neutral-900 dark:text-white">Card Title</h3>
    <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
      Card content goes here.
    </p>
  </div>
</div>
```

---

## Shared Partial

### Basic Usage

```erb
<%= render "shared/components/card/card",
  body_content: "<p class='text-neutral-700 dark:text-neutral-300'>Simple card content.</p>" %>
```

### With Header and Footer

```erb
<%= render "shared/components/card/card",
  divide: true,
  header_content: capture { %>
    <h3 class="text-lg/6 font-medium text-neutral-900 dark:text-white">Title</h3>
  <% },
  body_content: "<p class='text-neutral-700 dark:text-neutral-300'>Body content here.</p>",
  footer_content: '<a href="#" class="text-sm text-blue-600">View details →</a>' %>
```

### With Image

```erb
<%= render "shared/components/card/card",
  image_src: "https://example.com/image.jpg",
  image_alt: "Description",
  image_aspect: "video",
  body_content: capture { %>
    <h3 class="text-xl font-semibold text-neutral-900 dark:text-white">Article Title</h3>
    <p class="text-sm text-neutral-700 dark:text-neutral-300">Article excerpt...</p>
  <% } %>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `variant` | String | `"default"` | `"default"`, `"elevated"`, `"well"` |
| `padding` | String | `"md"` | `"none"`, `"sm"`, `"md"`, `"lg"` |
| `shadow` | String | `"xs"` | `"none"`, `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"` |
| `rounded` | String | `"xl"` | `"none"`, `"sm"`, `"md"`, `"lg"`, `"xl"`, `"full"` |
| `border` | Boolean | `true` | Show border |
| `hoverable` | Boolean | `false` | Add hover shadow effect |
| `clickable` | Boolean | `false` | Add clickable appearance |
| `divide` | Boolean | `false` | Add dividers between sections |
| `full_width_mobile` | Boolean | `false` | Edge-to-edge on mobile |
| `classes` | String | `nil` | Additional CSS classes |
| `header_content` | String/HTML | `nil` | Header section content |
| `body_content` | String/HTML | `nil` | Body section content |
| `footer_content` | String/HTML | `nil` | Footer section content |
| `image_src` | String | `nil` | Image URL |
| `image_alt` | String | `""` | Image alt text |
| `image_position` | String | `"top"` | `"top"` or `"bottom"` |
| `image_aspect` | String | `nil` | `"square"`, `"video"`, `"wide"`, or `nil` |
| `image_classes` | String | `nil` | Additional image wrapper classes |

---

## ViewComponent

### Basic Usage

```erb
<%= render(Card::Component.new) do |card| %>
  <% card.with_body do %>
    <h3 class="text-lg/6 font-medium text-neutral-900 dark:text-white">Card Title</h3>
    <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">Card content.</p>
  <% end %>
<% end %>
```

### With Header and Footer

```erb
<%= render(Card::Component.new(divide: true)) do |card| %>
  <% card.with_header do %>
    <h3 class="text-lg/6 font-medium text-neutral-900 dark:text-white">Title</h3>
  <% end %>
  <% card.with_body do %>
    <p class="text-neutral-700 dark:text-neutral-300">Body content here.</p>
  <% end %>
  <% card.with_footer do %>
    <a href="#" class="text-sm text-blue-600">View details →</a>
  <% end %>
<% end %>
```

### With Image

```erb
<%= render(Card::Component.new) do |card| %>
  <% card.with_image(
    src: "https://example.com/image.jpg",
    alt: "Description",
    aspect: :video
  ) %>
  <% card.with_body do %>
    <h3 class="text-xl font-semibold text-neutral-900 dark:text-white">Title</h3>
  <% end %>
<% end %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `variant` | Symbol | `:default` | `:default`, `:elevated`, `:well` |
| `padding` | Symbol | `:md` | `:none`, `:sm`, `:md`, `:lg` |
| `shadow` | Symbol | `:xs` | `:none`, `:xs`, `:sm`, `:md`, `:lg`, `:xl` |
| `rounded` | Symbol | `:xl` | `:none`, `:sm`, `:md`, `:lg`, `:xl`, `:full` |
| `border` | Boolean | `true` | Show border |
| `hoverable` | Boolean | `false` | Add hover shadow effect |
| `clickable` | Boolean | `false` | Add clickable appearance |
| `divide` | Boolean | `false` | Add dividers between sections |
| `full_width_mobile` | Boolean | `false` | Edge-to-edge on mobile |
| `classes` | String | `nil` | Additional CSS classes |

### Slots

| Slot | Description |
| ---- | ----------- |
| `header` | Header section content |
| `body` | Main body content |
| `footer` | Footer section content |
| `image` | Featured image (see options below) |

### Image Slot Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `src` | String | **required** | Image URL |
| `alt` | String | `""` | Alt text |
| `position` | Symbol | `:top` | `:top` or `:bottom` |
| `aspect` | Symbol | `nil` | `:square`, `:video`, `:wide`, or `nil` |
| `classes` | String | `nil` | Additional wrapper classes |

---

## Variants

### Default
Standard white background with subtle shadow. Best for most use cases.

```erb
<%= render(Card::Component.new) do |card| %>
  <% card.with_body do %>Default card<% end %>
<% end %>
```

### Elevated
White background with larger shadow for more visual prominence.

```erb
<%= render(Card::Component.new(variant: :elevated, shadow: :lg)) do |card| %>
  <% card.with_body do %>Elevated card<% end %>
<% end %>
```

### Well
Subtle gray background with no shadow. Perfect for grouping content without visual weight.

```erb
<%= render(Card::Component.new(variant: :well)) do |card| %>
  <% card.with_body do %>Well card<% end %>
<% end %>
```

---

## Common Use Cases

### Article Card

```erb
<%= render(Card::Component.new) do |card| %>
  <% card.with_image(src: "article-image.jpg", aspect: :video) %>
  <% card.with_body do %>
    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
      Category
    </span>
    <h3 class="mt-2 text-xl font-semibold text-neutral-900 dark:text-white">Article Title</h3>
    <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">Article excerpt...</p>
  <% end %>
  <% card.with_footer do %>
    <div class="flex items-center">
      <img class="h-8 w-8 rounded-full" src="author.jpg" alt="Author">
      <span class="ml-2 text-sm text-neutral-600">Jane Doe · 5 min read</span>
    </div>
  <% end %>
<% end %>
```

### Stats Card

```erb
<%= render(Card::Component.new) do |card| %>
  <% card.with_body do %>
    <dt class="text-sm font-medium text-neutral-500">Total Revenue</dt>
    <dd class="mt-1 text-3xl font-semibold text-neutral-900">$71,897</dd>
    <div class="mt-2 flex items-baseline text-sm">
      <span class="text-green-600">↑ 12.5%</span>
      <span class="ml-2 text-neutral-500">from last month</span>
    </div>
  <% end %>
<% end %>
```

### Product Card

```erb
<%= render(Card::Component.new(hoverable: true)) do |card| %>
  <% card.with_image(src: "product.jpg", aspect: :square) %>
  <% card.with_body do %>
    <h3 class="font-medium text-neutral-900">Product Name</h3>
    <p class="text-sm text-neutral-500">Brief description</p>
    <p class="mt-2 font-semibold text-neutral-900">$99.00</p>
  <% end %>
<% end %>
```

### Settings Section

```erb
<%= render(Card::Component.new(divide: true)) do |card| %>
  <% card.with_header do %>
    <h3 class="text-lg font-medium">Account Settings</h3>
    <p class="text-sm text-neutral-500">Manage your account preferences</p>
  <% end %>
  <% card.with_body do %>
    <!-- Settings form fields -->
  <% end %>
  <% card.with_footer do %>
    <div class="flex justify-end gap-3">
      <button class="px-4 py-2 text-sm">Cancel</button>
      <button class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg">Save</button>
    </div>
  <% end %>
<% end %>
```

---

## Customization

### Custom Colors

Override the default background by passing custom classes:

```erb
<%= render(Card::Component.new(
  classes: "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
)) do |card| %>
  <% card.with_body do %>Gradient card<% end %>
<% end %>
```

### Card Grid

```erb
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  <% items.each do |item| %>
    <%= render(Card::Component.new(hoverable: true)) do |card| %>
      <% card.with_body do %>
        <h3><%= item.title %></h3>
      <% end %>
    <% end %>
  <% end %>
</div>
```

---

## Best Practices

1. **Use semantic headings**: Use appropriate heading levels (h2, h3) inside cards
2. **Keep cards focused**: Each card should represent a single concept or action
3. **Use consistent padding**: Stick to one padding size within a layout
4. **Consider touch targets**: Ensure clickable cards have adequate size on mobile
5. **Test dark mode**: Verify cards look good in both light and dark themes
6. **Use images wisely**: Set appropriate aspect ratios to prevent layout shifts
7. **Limit card depth**: Avoid nesting cards within cards

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/card/`
- **Shared partial files**: `app/views/shared/components/card/`
- **shared partial**: `render "shared/components/card/card"`
- **ViewComponent**: `render Card::Component.new(...)`
- **ViewComponent files**: `app/components/card/`

### Implementation Checklist

- Pick one implementation path first, then stay consistent within that example.
- Use only documented locals, initializer arguments, variants, and slot names.
- Copy the base example before adding app-specific styling or behavior.
- Keep the documented structure and class names intact so the visual styling remains correct.
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