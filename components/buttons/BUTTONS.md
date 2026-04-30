# Button Component

Versatile button components with multiple variants, sizes, and styles. Perfect for actions, navigation, and form submissions.

## Features

- Multiple variants (primary, secondary, outline, ghost, destructive)
- Two visual styles (basic and fancy with enhanced shadows)
- Four sizes (xs, sm, md, lg)
- Pill shape option (fully rounded)
- Icon support (left, right, or icon-only)
- Loading state with spinner
- Disabled state
- Full width option
- Renders as `<button>` or `<a>` tag
- Dark mode support
- Zero JavaScript required
- Accessibility-friendly markup

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/buttons/` | Full control, copy-paste |
| **Shared Partial** | `app/views/shared/components/buttons/` | Reusable partial with locals |
| **ViewComponent** | `app/components/buttons/` | Ruby-based, testable, object-oriented |

### Plain ERB

Copy the button HTML directly into your views for maximum flexibility and customization. Best when you need one-off buttons or want to modify the markup.

### Shared Partial

Use the reusable partial for consistent buttons across your app:

```erb
<%= render "shared/components/buttons/button",
  text: "Primary Button",
  variant: "primary" %>
```

### ViewComponent

Use the object-oriented ViewComponent approach for better testing and Ruby-based logic:

```erb
<%= render Buttons::Component.new(
  text: "Primary Button",
  variant: :primary
) %>
```

---

## Variants

### Primary Button

The default button style for primary actions.

```erb
<%= render "shared/components/buttons/button",
  text: "Primary Button" %>
```

### Secondary Button

For secondary actions that complement primary buttons.

```erb
<%= render "shared/components/buttons/button",
  text: "Secondary Button",
  variant: "secondary" %>
```

### Outline Button

For lower emphasis actions with a border-only style.

```erb
<%= render "shared/components/buttons/button",
  text: "Outline Button",
  variant: "outline" %>
```

### Ghost Button

For minimal UI, often used in toolbars or navigation.

```erb
<%= render "shared/components/buttons/button",
  text: "Ghost Button",
  variant: "ghost" %>
```

### Destructive Button

For dangerous actions like delete or remove.

```erb
<%= render "shared/components/buttons/button",
  text: "Delete",
  variant: "destructive" %>
```

---

## Sizes

| Size | Description | Use Case |
| ---- | ----------- | -------- |
| `xs` | Extra small | Dense UIs, toolbars |
| `sm` | Small | Secondary actions |
| `md` | Medium (default) | Primary actions |
| `lg` | Large | Hero sections, CTAs |

```erb
<%= render "shared/components/buttons/button",
  text: "Extra Small",
  size: "xs" %>

<%= render "shared/components/buttons/button",
  text: "Small",
  size: "sm" %>

<%= render "shared/components/buttons/button",
  text: "Medium",
  size: "md" %>

<%= render "shared/components/buttons/button",
  text: "Large",
  size: "lg" %>
```

---

## Styles

### Basic Style (Default)

Clean, flat design with subtle shadows and borders.

```erb
<%= render "shared/components/buttons/button",
  text: "Basic Button",
  style: "basic" %>
```

### Fancy Style

Enhanced visual design with 3D effect, gradient borders, and rich shadows. Best for hero sections and prominent CTAs.

```erb
<%= render "shared/components/buttons/button",
  text: "Fancy Button",
  style: "fancy" %>
```

---

## Options Reference

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `text` | String | nil | Button text content |
| `variant` | String/Symbol | "primary" | primary, secondary, outline, ghost, destructive |
| `size` | String/Symbol | "md" | xs, sm, md, lg |
| `style` | String/Symbol | "basic" | basic, fancy |
| `pill` | Boolean | false | Rounded-full shape |
| `disabled` | Boolean | false | Disabled state |
| `loading` | Boolean | false | Shows loading spinner |
| `icon` | String | nil | SVG icon HTML |
| `icon_position` | String/Symbol | "left" | left, right |
| `icon_only` | Boolean | false | Icon-only button (no text) |
| `full_width` | Boolean | false | Takes full container width |
| `href` | String | nil | Renders as `<a>` tag if provided |
| `type` | String | "button" | button, submit, reset |
| `classes` | String | nil | Additional CSS classes |
| `data` | Hash | {} | Data attributes |

---

## With Icons

### Icon Left (Default)

```erb
<%= render "shared/components/buttons/button",
  text: "Add Item",
  icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>' %>
```

### Icon Right

```erb
<%= render "shared/components/buttons/button",
  text: "Next Step",
  icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>',
  icon_position: "right" %>
```

### Icon Only

```erb
<%= render "shared/components/buttons/button",
  icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>',
  icon_only: true %>
```

---

## States

### Loading State

Shows a spinner and disables the button.

```erb
<%= render "shared/components/buttons/button",
  text: "Processing...",
  loading: true %>
```

### Disabled State

```erb
<%= render "shared/components/buttons/button",
  text: "Disabled",
  disabled: true %>
```

---

## Pill Shape

Fully rounded buttons for a softer look.

```erb
<%= render "shared/components/buttons/button",
  text: "Pill Button",
  pill: true %>
```

---

## Full Width

Button that spans the full width of its container.

```erb
<%= render "shared/components/buttons/button",
  text: "Full Width Button",
  full_width: true %>
```

---

## As Link

Renders as an anchor tag instead of a button.

```erb
<%= render "shared/components/buttons/button",
  text: "Visit Page",
  href: "/some-page" %>
```

---

## Form Submissions

```erb
<%= render "shared/components/buttons/button",
  text: "Submit Form",
  type: "submit" %>
```

---

## With Data Attributes

```erb
<%= render "shared/components/buttons/button",
  text: "Delete",
  variant: "destructive",
  data: { turbo_method: "delete", turbo_confirm: "Are you sure?" } %>
```

---

## Combining Options

```erb
<%= render "shared/components/buttons/button",
  text: "Get Started",
  icon: '<svg ...></svg>',
  icon_position: "right",
  variant: "primary",
  style: "fancy",
  size: "lg",
  pill: true %>
```

---

## Color Scheme Reference

### Basic Style

| Variant | Light Mode | Dark Mode |
| ------- | ---------- | --------- |
| **Primary** | `bg-neutral-800 text-white` | `bg-white text-neutral-800` |
| **Secondary** | `bg-white/90 text-neutral-800` | `bg-neutral-700/50 text-neutral-50` |
| **Outline** | `border-neutral-300 text-neutral-700` | `border-neutral-600 text-neutral-300` |
| **Ghost** | `text-neutral-800` | `text-neutral-50` |
| **Destructive** | `bg-red-600 text-white` | `bg-red-600 text-white` |

---

## Accessibility

- Uses semantic `<button>` or `<a>` elements
- Includes `disabled` attribute for disabled buttons
- `aria-disabled` for disabled links
- Focus-visible outlines for keyboard navigation
- Appropriate color contrast ratios

---

## Best Practices

1. **Use appropriate variants**: Primary for main actions, secondary for less important actions
2. **Keep text concise**: Button labels should be short and action-oriented
3. **Use icons sparingly**: Only add icons when they enhance understanding
4. **Show loading states**: Use the loading prop during async operations
5. **Consider mobile**: Ensure touch targets are large enough (44x44px minimum)
6. **Test dark mode**: Verify buttons remain accessible in both themes

---

## Common Use Cases

### Form Actions

```erb
<div class="flex gap-2">
  <%= render "shared/components/buttons/button",
    text: "Cancel",
    variant: "secondary" %>
  <%= render "shared/components/buttons/button",
    text: "Save Changes",
    type: "submit" %>
</div>
```

### Toolbar

```erb
<div class="flex gap-1">
  <%= render "shared/components/buttons/button",
    icon: '<svg ...></svg>',
    icon_only: true,
    variant: "ghost",
    size: "sm" %>
  <%= render "shared/components/buttons/button",
    icon: '<svg ...></svg>',
    icon_only: true,
    variant: "ghost",
    size: "sm" %>
</div>
```

### Hero CTA

```erb
<%= render "shared/components/buttons/button",
  text: "Get Started Free",
  icon: '<svg ...></svg>',
  icon_position: "right",
  style: "fancy",
  size: "lg" %>
```

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/buttons/`
- **Shared partial files**: `app/views/shared/components/buttons/`
- **shared partial**: `render "shared/components/buttons/button"`
- **ViewComponent**: `render Buttons::Component.new(...)`
- **ViewComponent files**: `app/components/buttons/`

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