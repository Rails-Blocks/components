# Switch Component

Toggle switch inputs for binary on/off settings. A visually distinctive alternative to checkboxes, ideal for settings panels, preferences, and feature toggles.

## Features

- Multiple sizes (small, medium, large)
- Label and optional description support
- Optional check/X icons inside the switch
- Label position (left or right)
- Disabled and required states
- Error message display
- Dark mode support
- Zero JavaScript required (pure CSS)
- Accessibility-friendly markup
- Form integration with name/value attributes
- Customizable styling via class overrides

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/switch/` | Full control, copy-paste |
| **Shared Partial** | `app/views/shared/components/switch/` | Reusable partial with locals |
| **ViewComponent** | `app/components/switch/` | Ruby-based, testable, object-oriented |

### Plain ERB

Copy the switch HTML directly into your views for maximum flexibility and customization. Best when you need one-off toggles or want to modify the markup.

### Shared Partial

Use the reusable partial for consistent switches across your app:

```erb
<%= render "shared/components/switch/switch",
  label: "Enable dark mode",
  name: "user[dark_mode]",
  checked: @user.dark_mode %>
```

### ViewComponent

Use the object-oriented ViewComponent approach for better testing and Ruby-based logic:

```erb
<%= render Switch::Component.new(
  label: "Enable dark mode",
  name: "user[dark_mode]",
  checked: @user.dark_mode
) %>
```

---

## Options Reference

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `label` | String | `nil` | The switch label text (optional) |
| `name` | String | `nil` | The input name attribute for form submission |
| `id` | String | auto-generated | The input id attribute |
| `value` | String | `"1"` | The input value attribute |
| `checked` | Boolean | `false` | Whether the switch is on |
| `disabled` | Boolean | `false` | Whether the switch is disabled |
| `required` | Boolean | `false` | Whether the switch is required |
| `description` | String | `nil` | Optional description text below the label |
| `size` | Symbol/String | `:md` / `"md"` | Size: `:sm`, `:md`, `:lg` |
| `show_icons` | Boolean | `false` | Whether to show check/X icons inside switch |
| `label_position` | Symbol/String | `:right` / `"right"` | Label position: `:left` or `:right` |
| `error` | String | `nil` | Error message to display |
| `classes` | String | `nil` | Additional CSS classes for the wrapper |
| `switch_classes` | String | `nil` | Additional CSS classes for the switch track |
| `label_classes` | String | `nil` | Additional CSS classes for the label |

---

## Basic Examples

### Simple Switch (No Label)

```erb
<%= render "shared/components/switch/switch" %>
```

### With Label

```erb
<%= render "shared/components/switch/switch",
  label: "Enable notifications" %>
```

### With Form Name

```erb
<%= render "shared/components/switch/switch",
  label: "Dark mode",
  name: "user[dark_mode]" %>
```

### Pre-checked

```erb
<%= render "shared/components/switch/switch",
  label: "Feature enabled",
  name: "settings[feature]",
  checked: true %>
```

### Disabled

```erb
<%= render "shared/components/switch/switch",
  label: "Premium feature (upgrade required)",
  disabled: true %>
```

### Required

```erb
<%= render "shared/components/switch/switch",
  label: "Accept terms of service",
  name: "accept_terms",
  required: true %>
```

---

## With Description

For switches that need additional context:

```erb
<%= render "shared/components/switch/switch",
  label: "Email notifications",
  name: "settings[email]",
  description: "Receive updates about your account via email" %>
```

**ViewComponent:**
```erb
<%= render Switch::Component.new(
  label: "Email notifications",
  name: "settings[email]",
  description: "Receive updates about your account via email"
) %>
```

---

## Sizes

### Small

```erb
<%= render "shared/components/switch/switch",
  label: "Compact toggle",
  size: "sm" %>
```

### Medium (Default)

```erb
<%= render "shared/components/switch/switch",
  label: "Standard toggle",
  size: "md" %>
```

### Large

```erb
<%= render "shared/components/switch/switch",
  label: "Prominent toggle",
  size: "lg" %>
```

---

## With Icons

Show check/X icons inside the switch thumb:

```erb
<%= render "shared/components/switch/switch",
  label: "Show icons",
  show_icons: true %>
```

---

## Label Position

### Label on Right (Default)

```erb
<%= render "shared/components/switch/switch",
  label: "Setting name",
  label_position: "right" %>
```

### Label on Left

```erb
<%= render "shared/components/switch/switch",
  label: "Setting name",
  label_position: "left" %>
```

---

## Error States

Display validation errors alongside the switch:

```erb
<%= render "shared/components/switch/switch",
  label: "Enable two-factor authentication",
  name: "security[2fa]",
  error: "Two-factor authentication is required for admin accounts" %>
```

---

## Form Integration

### With Rails Form Builder

```erb
<%= form_with model: @user do |f| %>
  <div class="space-y-4">
    <%= render "shared/components/switch/switch",
      label: "Email notifications",
      name: "user[email_notifications]",
      description: "Receive updates via email",
      checked: @user.email_notifications %>

    <%= render "shared/components/switch/switch",
      label: "Push notifications",
      name: "user[push_notifications]",
      description: "Receive real-time browser notifications",
      checked: @user.push_notifications %>

    <%= render "shared/components/switch/switch",
      label: "SMS notifications",
      name: "user[sms_notifications]",
      description: "Receive important alerts via text",
      checked: @user.sms_notifications %>
  </div>
<% end %>
```

---

## Customization

### Custom Wrapper Styling

```erb
<%= render "shared/components/switch/switch",
  label: "Highlighted option",
  classes: "p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700" %>
```

### Custom Switch Color

```erb
<%= render "shared/components/switch/switch",
  label: "Blue switch",
  switch_classes: "peer-checked:bg-blue-600 peer-checked:group-hover:bg-blue-500 dark:peer-checked:bg-blue-500" %>
```

### Green Success Switch

```erb
<%= render "shared/components/switch/switch",
  label: "Active",
  switch_classes: "peer-checked:bg-green-600 peer-checked:group-hover:bg-green-500 dark:peer-checked:bg-green-500" %>
```

### Custom Label Styling

```erb
<%= render "shared/components/switch/switch",
  label: "Bold label",
  label_classes: "font-bold text-neutral-900 dark:text-white" %>
```

---

## Accessibility

### Semantic Considerations

- Uses native checkbox input for full accessibility
- Labels are properly associated with inputs via wrapping `<label>`
- Required fields show visual indicator (*)
- Error messages are displayed adjacent to the input
- Disabled states use appropriate styling and cursor
- Focus states are clearly visible

### Keyboard Navigation

- **Tab**: Move focus to the switch
- **Space**: Toggle the switch on/off

---

## Size Reference

| Size | Track | Thumb | Label | Description |
| ---- | ----- | ----- | ----- | ----------- |
| `sm` | `w-8 h-5` | `14px` | `text-xs` | `text-[11px]` |
| `md` | `w-10 h-6` | `18px` | `text-sm` | `text-xs` |
| `lg` | `w-14 h-8` | `24px` | `text-base` | `text-sm` |

---

## Switch vs Checkbox

Use a **switch** when:
- The setting takes effect immediately (no submit button)
- It's a binary on/off toggle
- It represents a preference or feature toggle
- Mobile-style UI is desired

Use a **checkbox** when:
- Part of a form that will be submitted
- Multiple options can be selected
- Traditional form styling is expected
- Terms acceptance or similar confirmations

---

## Best Practices

1. **Use clear labels**: Labels should clearly describe what the switch controls
2. **Immediate feedback**: Switches imply instant effect - use checkboxes for forms
3. **Provide descriptions**: Add context for complex settings
4. **Show required fields**: Use the `required` option for mandatory toggles
5. **Handle errors gracefully**: Display validation errors clearly
6. **Consider mobile**: Ensure touch targets are large enough (use `lg` size if needed)
7. **Test dark mode**: Ensure switches remain visible in both themes
8. **Group related switches**: Use consistent spacing and alignment

---

## Common Use Cases

### Settings Panel

```erb
<div class="space-y-4">
  <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
    Notification Settings
  </h3>

  <%= render "shared/components/switch/switch",
    label: "Email notifications",
    name: "settings[email]",
    description: "Receive updates about your account via email",
    checked: @user.email_notifications %>

  <%= render "shared/components/switch/switch",
    label: "Push notifications",
    name: "settings[push]",
    description: "Receive real-time notifications in your browser",
    checked: @user.push_notifications %>

  <%= render "shared/components/switch/switch",
    label: "SMS notifications",
    name: "settings[sms]",
    description: "Receive important alerts via text message",
    checked: @user.sms_notifications %>
</div>
```

### Feature Toggle

```erb
<%= render "shared/components/switch/switch",
  label: "Beta features",
  name: "user[beta_features]",
  description: "Try experimental features before they're released",
  show_icons: true,
  checked: @user.beta_features %>
```

### Privacy Settings

```erb
<div class="space-y-3">
  <h4 class="text-sm font-medium text-neutral-900 dark:text-neutral-100">Privacy</h4>

  <%= render "shared/components/switch/switch",
    label: "Make profile public",
    name: "privacy[public_profile]",
    checked: @user.public_profile %>

  <%= render "shared/components/switch/switch",
    label: "Show online status",
    name: "privacy[show_online]",
    checked: @user.show_online %>

  <%= render "shared/components/switch/switch",
    label: "Allow search engines to index",
    name: "privacy[indexable]",
    checked: @user.indexable %>
</div>
```

### Dark Mode Toggle

```erb
<%= render "shared/components/switch/switch",
  label: "Dark mode",
  name: "appearance[dark_mode]",
  show_icons: true,
  checked: @user.dark_mode %>
```

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/switch/`
- **Shared partial files**: `app/views/shared/components/switch/`
- **shared partial**: `render "shared/components/switch/switch"`
- **ViewComponent**: `render Switch::Component.new(...)`
- **ViewComponent files**: `app/components/switch/`

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