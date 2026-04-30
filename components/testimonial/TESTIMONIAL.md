# Testimonial Component

Display customer testimonials and reviews with customizable layouts. Perfect for social proof sections, customer quotes, product reviews, and trust-building content.

## Features

- 3 display variants (default, card, centered)
- 3 size options (sm, md, lg)
- Optional star ratings (1-5 stars)
- Avatar image support
- Optional quote icon
- Author name, title, and company display
- Dark mode support
- Zero JavaScript required

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/testimonial/` | Full control, copy-paste |
| **Shared Partial** | `app/views/shared/components/testimonial/` | Reusable partial with locals |
| **ViewComponent** | `app/components/testimonial/` | Ruby-based, testable, object-oriented |

---

## Plain ERB

Copy the testimonial HTML directly into your views for maximum flexibility:

```erb
<div class="bg-white dark:bg-neutral-900 rounded-lg border border-black/10 dark:border-white/10 p-6 sm:p-8">
  <div class="flex items-center mb-4">
    <img src="avatar.jpg" alt="Author" class="size-10 rounded-full object-cover">
    <div class="ml-4">
      <div class="font-semibold text-neutral-900 dark:text-white">Sarah Johnson</div>
      <div class="text-sm text-neutral-500 dark:text-neutral-400">Product Manager at TechCorp</div>
    </div>
  </div>
  <blockquote class="text-neutral-700 dark:text-neutral-300 leading-relaxed">
    "This product has completely transformed how we approach our daily workflow."
  </blockquote>
</div>
```

---

## Shared Partial

### Basic Usage

```erb
<%= render "shared/components/testimonial/testimonial",
  quote: "This product has completely transformed our workflow.",
  author_name: "Sarah Johnson",
  author_title: "Product Manager",
  company: "TechCorp" %>
```

### With Avatar

```erb
<%= render "shared/components/testimonial/testimonial",
  quote: "The attention to detail in this product is remarkable.",
  author_name: "Emily Chen",
  author_title: "Senior Designer",
  company: "CreativeCo",
  author_image: "https://example.com/avatar.jpg" %>
```

### Card Variant with Rating

```erb
<%= render "shared/components/testimonial/testimonial",
  quote: "Outstanding quality and service! Exceeded all my expectations.",
  author_name: "Michael Rodriguez",
  author_title: "Verified Customer",
  author_image: "https://example.com/avatar.jpg",
  rating: 5,
  variant: "card" %>
```

### Centered Variant

```erb
<%= render "shared/components/testimonial/testimonial",
  quote: "The best component library I've ever worked with.",
  author_name: "Lisa Wang",
  author_title: "Marketing Director",
  author_image: "https://example.com/avatar.jpg",
  rating: 5,
  show_quote_icon: true,
  variant: "centered" %>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `quote` | String | **required** | The testimonial quote text |
| `author_name` | String | **required** | The author's name |
| `author_title` | String | `nil` | Author's job title or role |
| `author_image` | String | `nil` | URL to the author's avatar image |
| `company` | String | `nil` | Author's company name |
| `rating` | Integer | `nil` | Star rating (1-5), nil to hide |
| `variant` | String | `"default"` | `"default"`, `"card"`, `"centered"` |
| `size` | String | `"md"` | `"sm"`, `"md"`, `"lg"` |
| `show_quote_icon` | Boolean | `false` | Show decorative quote icon |
| `classes` | String | `nil` | Additional CSS classes |

---

## ViewComponent

### Basic Usage

```erb
<%= render(Testimonial::Component.new(
  quote: "This product has completely transformed our workflow.",
  author_name: "Sarah Johnson",
  author_title: "Product Manager",
  company: "TechCorp"
)) %>
```

### With Avatar

```erb
<%= render(Testimonial::Component.new(
  quote: "The attention to detail in this product is remarkable.",
  author_name: "Emily Chen",
  author_title: "Senior Designer",
  company: "CreativeCo",
  author_image: "https://example.com/avatar.jpg"
)) %>
```

### Card Variant with Rating

```erb
<%= render(Testimonial::Component.new(
  quote: "Outstanding quality and service! Exceeded all my expectations.",
  author_name: "Michael Rodriguez",
  author_title: "Verified Customer",
  author_image: "https://example.com/avatar.jpg",
  rating: 5,
  variant: :card
)) %>
```

### Centered Variant with Quote Icon

```erb
<%= render(Testimonial::Component.new(
  quote: "The best component library I've ever worked with.",
  author_name: "Lisa Wang",
  author_title: "Marketing Director",
  author_image: "https://example.com/avatar.jpg",
  rating: 5,
  show_quote_icon: true,
  variant: :centered
)) %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `quote` | String | **required** | The testimonial quote text |
| `author_name` | String | **required** | The author's name |
| `author_title` | String | `nil` | Author's job title or role |
| `author_image` | String | `nil` | URL to the author's avatar image |
| `company` | String | `nil` | Author's company name |
| `rating` | Integer | `nil` | Star rating (1-5), nil to hide |
| `variant` | Symbol | `:default` | `:default`, `:card`, `:centered` |
| `size` | Symbol | `:md` | `:sm`, `:md`, `:lg` |
| `show_quote_icon` | Boolean | `false` | Show decorative quote icon |
| `classes` | String | `nil` | Additional CSS classes |

---

## Variants

### Default

Minimal layout with quote and author. Best for inline testimonials.

```erb
<%= render(Testimonial::Component.new(
  quote: "Great product!",
  author_name: "John Doe",
  author_title: "Developer"
)) %>
```

### Card

Contained in a bordered card with padding. Best for testimonial grids.

```erb
<%= render(Testimonial::Component.new(
  quote: "Outstanding service!",
  author_name: "Jane Smith",
  author_title: "Designer",
  variant: :card
)) %>
```

### Centered

Centered text alignment. Best for hero testimonials and featured quotes.

```erb
<%= render(Testimonial::Component.new(
  quote: "The best decision we ever made.",
  author_name: "CEO",
  company: "BigCorp",
  variant: :centered,
  show_quote_icon: true
)) %>
```

---

## Size Reference

| Size | Quote Text | Avatar | Author Name |
| ---- | ---------- | ------ | ----------- |
| `sm` | `text-sm` | `size-8` | `text-sm` |
| `md` | `text-base` | `size-10` | `text-base` |
| `lg` | `text-lg md:text-xl` | `size-14` | `text-lg` |

---

## Common Use Cases

### Testimonial Grid

```erb
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <% testimonials.each do |t| %>
    <%= render(Testimonial::Component.new(
      quote: t.quote,
      author_name: t.author_name,
      author_title: t.author_title,
      author_image: t.author_image,
      variant: :card
    )) %>
  <% end %>
</div>
```

### Hero Testimonial

```erb
<div class="max-w-3xl mx-auto py-16">
  <%= render(Testimonial::Component.new(
    quote: "This changed everything for our business.",
    author_name: "CEO Name",
    author_title: "Chief Executive Officer",
    company: "Fortune 500 Company",
    author_image: "ceo-avatar.jpg",
    size: :lg,
    variant: :centered,
    show_quote_icon: true
  )) %>
</div>
```

### Product Review

```erb
<%= render(Testimonial::Component.new(
  quote: "Exactly what I was looking for. Ships fast and great quality!",
  author_name: "Verified Buyer",
  rating: 5,
  variant: :card,
  size: :sm
)) %>
```

### Simple Inline Quote

```erb
<div class="my-8 px-4 border-l-4 border-neutral-300 dark:border-neutral-600">
  <%= render(Testimonial::Component.new(
    quote: "Simple, elegant, and effective.",
    author_name: "Alex",
    author_title: "Customer"
  )) %>
</div>
```

---

## Customization

### Custom Wrapper Classes

Add custom styling with the `classes` parameter:

```erb
<%= render(Testimonial::Component.new(
  quote: "Amazing!",
  author_name: "User",
  variant: :card,
  classes: "shadow-lg max-w-md mx-auto"
)) %>
```

### Custom Background (Plain ERB)

For custom backgrounds, use plain ERB:

```erb
<div class="relative rounded-xl overflow-hidden">
  <!-- Background Image -->
  <img class="absolute inset-0 w-full h-full object-cover" src="background.jpg" alt="">
  <div class="absolute inset-0 bg-gradient-to-t from-neutral-900/90 to-neutral-900/30"></div>
  
  <!-- Content -->
  <div class="relative z-10 px-8 py-16 text-center text-white">
    <blockquote class="text-xl font-medium leading-relaxed mb-8">
      "An incredible experience from start to finish."
    </blockquote>
    <footer>
      <img class="size-16 rounded-full mx-auto mb-4 border-2 border-white/20" src="avatar.jpg" alt="">
      <div class="font-semibold text-lg">John Doe</div>
      <div class="text-white/80">CEO, Company</div>
    </footer>
  </div>
</div>
```

---

## Best Practices

1. **Use real photos**: Authentic customer photos build more trust than stock images
2. **Include context**: Job titles and company names add credibility
3. **Keep quotes concise**: Shorter quotes are more impactful and readable
4. **Show ratings when relevant**: Star ratings work well for product reviews
5. **Use appropriate variants**: Card for grids, centered for hero sections
6. **Test dark mode**: Ensure testimonials look good in both themes
7. **Lazy load images**: Use `loading="lazy"` for images in testimonial grids
8. **Add structured data**: Consider adding Schema.org Review markup for SEO

---

## Accessibility

- Uses semantic `<blockquote>` and `<footer>` elements
- Images include alt text with author names
- Color contrasts meet WCAG guidelines
- Star ratings are decorative (consider adding aria-label for screen readers)

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/testimonial/`
- **Shared partial files**: `app/views/shared/components/testimonial/`
- **shared partial**: `render "shared/components/testimonial/testimonial"`
- **ViewComponent**: `render Testimonial::Component.new(...)`
- **ViewComponent files**: `app/components/testimonial/`

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