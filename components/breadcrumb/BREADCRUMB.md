# Breadcrumb Component

Display navigation breadcrumbs to show the current page location within a website hierarchy. Helps users understand where they are and navigate back to parent pages.

## Features

- Multiple separator styles (slash, chevron)
- Three style variants (default, with background, with icons)
- Optional home icon for first breadcrumb item
- Truncation support for long breadcrumb trails
- Current page text truncation with max-width
- Custom icons per breadcrumb item
- Responsive and overflow-friendly
- Dark mode support
- Accessibility-friendly markup with `aria-label` and `aria-current`
- Zero JavaScript required

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/breadcrumb/` | Full control, copy-paste |
| **Shared Partial** | `app/views/shared/components/breadcrumb/` | Reusable partial with locals |
| **ViewComponent** | `app/components/breadcrumb/` | Ruby-based, testable, object-oriented |

### Plain ERB

Copy the breadcrumb HTML directly into your views for maximum flexibility and customization. Best when you need one-off breadcrumbs or want to modify the markup.

### Shared Partial

Use the reusable partial for consistent breadcrumbs across your app:

```erb
<%= render "shared/components/breadcrumb/breadcrumb",
  items: [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Electronics" }
  ] %>
```

### ViewComponent

Use the object-oriented ViewComponent approach for better testing and Ruby-based logic:

```erb
<%= render Breadcrumb::Component.new(
  items: [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Electronics" }
  ]
) %>
```

---

## Variants

### Basic Breadcrumb (Slash Separators)

The default style with simple slash separators.

```erb
<!-- Basic Breadcrumb -->
<nav aria-label="Breadcrumb" class="flex justify-center overflow-x-auto whitespace-nowrap">
  <ol class="flex items-center space-x-2 text-sm">
    <li>
      <a href="#" class="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors">
        Home
      </a>
    </li>
    <li class="flex items-center space-x-2">
      <span class="text-neutral-400 dark:text-neutral-600">/</span>
      <a href="#" class="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors">
        Products
      </a>
    </li>
    <li class="flex items-center space-x-2">
      <span class="text-neutral-400 dark:text-neutral-600">/</span>
      <span class="text-neutral-900 dark:text-neutral-100 font-medium" aria-current="page">
        Electronics
      </span>
    </li>
  </ol>
</nav>
```

### Breadcrumb with Chevron Separators

Uses chevron icons instead of slashes for a more polished look.

```erb
<!-- Breadcrumb with Chevrons -->
<nav aria-label="Breadcrumb" class="flex justify-center overflow-x-auto whitespace-nowrap">
  <ol class="flex items-center space-x-2 text-sm">
    <li>
      <a href="#" class="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors">
        Home
      </a>
    </li>
    <li class="flex items-center space-x-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="size-4 shrink-0 text-neutral-400 dark:text-neutral-600" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
      <a href="#" class="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors">
        Products
      </a>
    </li>
    <li class="flex items-center space-x-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="size-4 shrink-0 text-neutral-400 dark:text-neutral-600" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
      <span class="text-neutral-900 dark:text-neutral-100 font-medium" aria-current="page">
        Electronics
      </span>
    </li>
  </ol>
</nav>
```

### Breadcrumb with Background

A pill-style breadcrumb with a subtle background.

```erb
<!-- Breadcrumb with Background -->
<nav aria-label="Breadcrumb" class="flex justify-center overflow-x-auto whitespace-nowrap">
  <ol class="flex items-center space-x-1 text-sm bg-neutral-50 dark:bg-neutral-900 px-4 py-2 rounded-lg">
    <li>
      <a href="#" class="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors font-medium">
        Home
      </a>
    </li>
    <li class="flex items-center space-x-1">
      <svg xmlns="http://www.w3.org/2000/svg" class="size-4 shrink-0 text-neutral-400 dark:text-neutral-600" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
      <a href="#" class="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors font-medium">
        Products
      </a>
    </li>
    <li class="flex items-center space-x-1">
      <svg xmlns="http://www.w3.org/2000/svg" class="size-4 shrink-0 text-neutral-400 dark:text-neutral-600" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
      <span class="text-neutral-900 dark:text-neutral-100 font-semibold" aria-current="page">
        Electronics
      </span>
    </li>
  </ol>
</nav>
```

### Breadcrumb with Icons

Features a home icon and hover backgrounds on links.

```erb
<!-- Breadcrumb with Icons -->
<nav aria-label="Breadcrumb" class="flex justify-center overflow-x-auto whitespace-nowrap">
  <ol class="flex items-center space-x-1 text-sm">
    <li>
      <a href="#" class="flex items-center text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
        <svg xmlns="http://www.w3.org/2000/svg" class="size-4 shrink-0" width="18" height="18" viewBox="0 0 18 18">
          <g fill="currentColor">
            <path d="M7.94127 1.36281C8.56694 0.887445 9.4333 0.886569 10.0591 1.36312L15.3088 5.35287C15.7448 5.68398 16 6.20008 16 6.746V14.25C16 15.7692 14.7692 17 13.25 17H10.75V13.251C10.75 12.699 10.302 12.251 9.75 12.251H8.25C7.698 12.251 7.25 12.699 7.25 13.251V17H4.75C3.23079 17 2 15.7692 2 14.25V6.746C2 6.19867 2.2559 5.68346 2.69155 5.3526L7.94127 1.36281Z"></path>
          </g>
        </svg>
        <span class="sr-only">Home</span>
      </a>
    </li>
    <li class="flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="size-4 shrink-0 text-neutral-400 dark:text-neutral-600" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
      <a href="#" class="ml-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
        Products
      </a>
    </li>
    <li class="flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="size-4 shrink-0 text-neutral-400 dark:text-neutral-600" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
      <span class="ml-1 text-neutral-900 dark:text-neutral-100 font-medium p-1.5" aria-current="page">
        Electronics
      </span>
    </li>
  </ol>
</nav>
```

---

## Truncation

### Breadcrumb with Ellipsis Truncation

For long breadcrumb trails, use truncation to collapse middle items.

```erb
<!-- Truncated Breadcrumb -->
<nav aria-label="Breadcrumb" class="flex justify-center overflow-x-auto whitespace-nowrap">
  <ol class="flex items-center space-x-2 text-sm">
    <li>
      <a href="#" class="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors">
        Home
      </a>
    </li>
    <li class="flex items-center space-x-2">
      <span class="text-neutral-400 dark:text-neutral-600">/</span>
      <button type="button" class="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors">
        ...
      </button>
    </li>
    <li class="flex items-center space-x-2">
      <span class="text-neutral-400 dark:text-neutral-600">/</span>
      <a href="#" class="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors">
        Category
      </a>
    </li>
    <li class="flex items-center space-x-2">
      <span class="text-neutral-400 dark:text-neutral-600">/</span>
      <span class="text-neutral-900 dark:text-neutral-100 font-medium" aria-current="page">
        Current Page
      </span>
    </li>
  </ol>
</nav>
```

### Current Page Text Truncation

Truncate long page names with a max-width and tooltip.

```erb
<!-- Truncated Current Page Text -->
<li class="flex items-center space-x-2">
  <span class="text-neutral-400 dark:text-neutral-600">/</span>
  <span
    class="text-neutral-900 dark:text-neutral-100 font-medium truncate"
    style="max-width: 200px"
    aria-current="page"
    title="Very Long Product Name That Might Need Truncation"
  >
    Very Long Product Name That Might Need Truncation
  </span>
</li>
```

---

## Parameters Reference

### ViewComponent Parameters

| Parameter | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| `items` | `Array<Hash>` | Required | Array of breadcrumb items with `{ label:, href:, icon: }` |
| `separator` | `Symbol` | `:slash` | Separator type: `:slash` or `:chevron` |
| `variant` | `Symbol` | `:default` | Style variant: `:default`, `:with_background`, `:with_icons` |
| `show_home_icon` | `Boolean` | `true` | Show home icon on first item (with_icons variant only) |
| `truncate_at` | `Integer` | `nil` | Max visible items before truncation (nil = show all) |
| `current_max_width` | `String` | `nil` | Max width for current page text (e.g., "200px") |
| `classes` | `String` | `nil` | Additional CSS classes for the nav wrapper |

### Shared Partial Locals

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `items` | `Array<Hash>` | `[]` | Array of breadcrumb items |
| `separator` | `String` | `"slash"` | Separator type: `"slash"` or `"chevron"` |
| `variant` | `String` | `"default"` | Style variant: `"default"`, `"with_background"`, `"with_icons"` |
| `show_home_icon` | `Boolean` | `true` | Show home icon on first item |
| `truncate_at` | `Integer` | `nil` | Max visible items before truncation |
| `current_max_width` | `String` | `nil` | Max width for current page text |
| `classes` | `String` | `nil` | Additional CSS classes |

### Item Hash Structure

```ruby
{
  label: "Page Name",     # Required: Display text
  href: "/path/to/page",  # Optional: Link URL (nil for current page)
  icon: "<svg>...</svg>"  # Optional: Custom icon HTML
}
```

---

## Customization

### Custom Separators

Replace the separator with any character or icon:

```erb
<!-- Custom dot separator -->
<span class="text-neutral-400 dark:text-neutral-600 mx-2">•</span>

<!-- Custom arrow separator -->
<span class="text-neutral-400 dark:text-neutral-600 mx-2">→</span>
```

### Custom Item Icons

Add icons to individual breadcrumb items:

```erb
<%= render Breadcrumb::Component.new(
  items: [
    {
      label: "Settings",
      href: "/settings",
      icon: '<svg class="size-4" ...>...</svg>'
    },
    { label: "Profile" }
  ]
) %>
```

### Integration with Rails Routes

```erb
<%= render Breadcrumb::Component.new(
  items: [
    { label: "Home", href: root_path },
    { label: "Products", href: products_path },
    { label: @category.name, href: category_path(@category) },
    { label: @product.name }
  ]
) %>
```

---

## Accessibility

### Semantic Markup

- Uses `<nav>` element with `aria-label="Breadcrumb"`
- Uses `<ol>` for ordered list semantics
- Current page marked with `aria-current="page"`
- Home icon includes `sr-only` text for screen readers

### Example with Full ARIA Support

```erb
<nav aria-label="Breadcrumb" class="...">
  <ol class="...">
    <li>
      <a href="/" class="...">Home</a>
    </li>
    <li class="...">
      <span class="..." aria-hidden="true">/</span>
      <a href="/products" class="...">Products</a>
    </li>
    <li class="...">
      <span class="..." aria-hidden="true">/</span>
      <span aria-current="page" class="...">Current Page</span>
    </li>
  </ol>
</nav>
```

---

## Best Practices

1. **Keep it Short**: Limit breadcrumbs to 4-5 levels; use truncation for deeper hierarchies
2. **Link All But Current**: All items except the current page should be clickable
3. **Match Site Hierarchy**: Breadcrumbs should reflect the actual site structure
4. **Don't Duplicate Nav**: Breadcrumbs complement, not replace, primary navigation
5. **Consider Mobile**: Use truncation or simpler styles on small screens
6. **Be Consistent**: Use the same style throughout your application
7. **Test Dark Mode**: Ensure readability in both light and dark themes

---

## Common Use Cases

### E-commerce Category Navigation

```erb
<%= render Breadcrumb::Component.new(
  items: [
    { label: "Home", href: root_path },
    { label: "Electronics", href: category_path("electronics") },
    { label: "Computers", href: category_path("computers") },
    { label: "Laptops", href: category_path("laptops") },
    { label: @product.name }
  ],
  truncate_at: 4
) %>
```

### Documentation Site

```erb
<%= render Breadcrumb::Component.new(
  items: [
    { label: "Docs", href: docs_path },
    { label: "Components", href: docs_components_path },
    { label: @component.name }
  ],
  variant: :with_background
) %>
```

### Admin Dashboard

```erb
<%= render Breadcrumb::Component.new(
  items: [
    { label: "Dashboard", href: admin_root_path },
    { label: "Users", href: admin_users_path },
    { label: @user.name }
  ],
  variant: :with_icons,
  show_home_icon: true
) %>
```

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/breadcrumb/`
- **Shared partial files**: `app/views/shared/components/breadcrumb/`
- **shared partial**: `render "shared/components/breadcrumb/breadcrumb"`
- **ViewComponent**: `render Breadcrumb::Component.new(...)`
- **ViewComponent files**: `app/components/breadcrumb/`

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