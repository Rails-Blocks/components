# Forms Component

Styled form elements with consistent spacing, labels, helper text, and error states. A CSS-based component system for building beautiful, accessible forms.

## Features

- Consistent form field styling with `form-control` class
- Form group wrapper for label + input + helper text
- Multiple layout variants (default, floating, inline)
- Three sizes (small, medium, large)
- Error state styling
- Disabled state styling
- Required field indicator
- Hidden labels for accessibility
- Dark mode support
- Zero JavaScript required

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/forms/` | Full control, copy-paste |
| **Shared Partial** | `app/views/shared/components/forms/` | Reusable partials with locals |
| **ViewComponent** | `app/components/forms/` | Ruby-based, testable, slot-based |

---

## CSS Classes

### Input Styling

The `form-control` class provides base styling for all form inputs:

```erb
<input type="text" class="form-control" placeholder="Enter text...">
<input type="email" class="form-control" placeholder="you@example.com">
<textarea class="form-control" rows="4"></textarea>
<select class="form-control">
  <option>Choose an option...</option>
</select>
```

### Error State

Add the `error` class for validation errors:

```erb
<input type="text" class="form-control error" value="invalid">
```

### Size Variations

Adjust padding and font size for different sizes:

```erb
<!-- Small -->
<input type="text" class="form-control text-sm py-1.5" placeholder="Small">

<!-- Default -->
<input type="text" class="form-control" placeholder="Default">

<!-- Large -->
<input type="text" class="form-control text-lg py-3" placeholder="Large">
```

---

## Plain ERB

Copy these patterns directly into your views.

### Basic Form Field

```erb
<div class="mb-6 relative gap-y-1.5">
  <label for="name">Name</label>
  <input type="text" name="name" id="name" class="form-control" placeholder="Enter your name...">
</div>
```

### Field with Error

```erb
<div class="mb-6 relative gap-y-1.5">
  <label for="email" class="text-red-700 dark:text-red-400">Email</label>
  <input type="email" name="email" id="email" class="form-control error" value="invalid">
  <p class="mt-1 text-sm/5 text-red-500 dark:text-red-400 italic">Please enter a valid email</p>
</div>
```

### Field with Helper Text

```erb
<div class="mb-6 relative gap-y-1.5">
  <label for="password">Password</label>
  <input type="password" name="password" id="password" class="form-control" placeholder="Enter password...">
  <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Must be at least 8 characters</p>
</div>
```

### Disabled Field

```erb
<div class="mb-6 relative gap-y-1.5">
  <label for="readonly" class="text-neutral-400 dark:text-neutral-500">Account ID</label>
  <input type="text" name="readonly" id="readonly" class="form-control" value="ACC-12345" disabled>
</div>
```

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/forms/form_group",
  label: "Full Name",
  name: "user[name]" do %>
  <input type="text" name="user[name]" id="user_name" class="form-control" placeholder="Enter your name...">
<% end %>
```

### With Options

```erb
<%= render "shared/components/forms/form_group",
  label: "Email Address",
  name: "user[email]",
  required: true,
  helper_text: "We'll never share your email.",
  size: "md" do %>
  <input type="email" name="user[email]" id="user_email" class="form-control" placeholder="you@example.com">
<% end %>
```

### With Error

```erb
<%= render "shared/components/forms/form_group",
  label: "Username",
  name: "username",
  error: "Username is already taken." do %>
  <input type="text" name="username" id="username" class="form-control error" value="johndoe">
<% end %>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `label` | String | `nil` | Label text for the field |
| `name` | String | `nil` | Input name attribute (auto-generates id) |
| `id` | String | auto | Input id attribute |
| `required` | Boolean | `false` | Show required indicator |
| `disabled` | Boolean | `false` | Apply disabled styling |
| `helper_text` | String | `nil` | Help text below the input |
| `error` | String | `nil` | Error message (replaces helper text) |
| `size` | String | `"md"` | `"sm"`, `"md"`, `"lg"` |
| `variant` | String | `"default"` | `"default"`, `"floating"`, `"inline"` |
| `label_hidden` | Boolean | `false` | Visually hide label (still accessible) |
| `classes` | String | `nil` | Additional wrapper classes |
| `label_classes` | String | `nil` | Additional label classes |
| `input_wrapper_classes` | String | `nil` | Additional input wrapper classes |

---

## ViewComponent

### Basic Usage

```erb
<%= render Forms::Component.new(
  label: "Full Name",
  name: "user[name]"
) do |c| %>
  <% c.with_input do %>
    <input type="text" name="user[name]" id="user_name" class="form-control" placeholder="Enter your name...">
  <% end %>
<% end %>
```

### With Options

```erb
<%= render Forms::Component.new(
  label: "Email Address",
  name: "user[email]",
  required: true,
  helper_text: "We'll never share your email.",
  size: :md
) do |c| %>
  <% c.with_input do %>
    <input type="email" name="user[email]" id="user_email" class="form-control" placeholder="you@example.com">
  <% end %>
<% end %>
```

### With Addons

```erb
<%= render Forms::Component.new(
  label: "Website",
  name: "website"
) do |c| %>
  <% c.with_addon_left do %>https://<% end %>
  <% c.with_input do %>
    <input type="text" name="website" id="website" class="form-control !rounded-none" placeholder="example.com">
  <% end %>
  <% c.with_addon_right do %>.com<% end %>
<% end %>
```

### Simplified Syntax

Content can be passed directly without explicit slot:

```erb
<%= render Forms::Component.new(
  label: "Notes",
  name: "notes"
) do %>
  <textarea name="notes" id="notes" class="form-control"></textarea>
<% end %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `label` | String | `nil` | Label text for the field |
| `name` | String | `nil` | Input name attribute (auto-generates id) |
| `id` | String | auto | Input id attribute |
| `required` | Boolean | `false` | Show required indicator |
| `disabled` | Boolean | `false` | Apply disabled styling |
| `helper_text` | String | `nil` | Help text below the input |
| `error` | String | `nil` | Error message (replaces helper text) |
| `size` | Symbol | `:md` | `:sm`, `:md`, `:lg` |
| `variant` | Symbol | `:default` | `:default`, `:floating`, `:inline` |
| `label_hidden` | Boolean | `false` | Visually hide label (still accessible) |
| `classes` | String | `nil` | Additional wrapper classes |
| `label_classes` | String | `nil` | Additional label classes |
| `input_wrapper_classes` | String | `nil` | Additional input wrapper classes |

### Slots

| Slot | Description |
| ---- | ----------- |
| `input` | The main input element |
| `addon_left` | Content to prepend (e.g., "https://") |
| `addon_right` | Content to append (e.g., ".com") |

---

## Variants

| Variant | Description |
| ------- | ----------- |
| `default` | Stacked layout with label above input |
| `floating` | Label floats above the input border |
| `inline` | Label and input on the same line |

### Floating Label Example

```erb
<%= render "shared/components/forms/form_group",
  label: "Email",
  name: "email",
  variant: "floating" do %>
  <input type="email" name="email" id="email" class="form-control pt-4" placeholder=" ">
<% end %>
```

### Inline Label Example

```erb
<%= render "shared/components/forms/form_group",
  label: "Search:",
  name: "q",
  variant: "inline" do %>
  <input type="search" name="q" id="q" class="form-control" placeholder="Search...">
<% end %>
```

---

## Form Element Reference

### Text Inputs

```erb
<input type="text" class="form-control" placeholder="Text">
<input type="email" class="form-control" placeholder="Email">
<input type="password" class="form-control" placeholder="Password">
<input type="url" class="form-control" placeholder="URL">
<input type="tel" class="form-control" placeholder="Phone">
<input type="number" class="form-control" placeholder="Number">
<input type="search" class="form-control" placeholder="Search">
```

### Date/Time Inputs

```erb
<input type="date" class="form-control">
<input type="time" class="form-control">
<input type="datetime-local" class="form-control">
<input type="month" class="form-control">
<input type="week" class="form-control">
```

### File Input

```erb
<div class="relative">
  <input type="file" id="file-upload" class="sr-only">
  <label for="file-upload" class="flex items-center gap-2 cursor-pointer rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:border-neutral-500">
    <span>Choose File</span>
    <span class="text-xs text-neutral-500">No file chosen</span>
  </label>
</div>
```

### Select

```erb
<select class="form-control">
  <option value="">Choose an option...</option>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</select>
```

### Multi-Select

```erb
<select class="form-control" multiple>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
  <option value="3">Option 3</option>
</select>
```

### Textarea

```erb
<textarea class="form-control" rows="4" placeholder="Enter text..."></textarea>
```

---

## Accessibility

- Labels are properly associated with inputs via `for`/`id`
- Required fields are marked with `required` attribute and visual indicator
- Error messages are adjacent to their inputs
- Hidden labels use `sr-only` class for screen reader accessibility
- Color contrast meets WCAG guidelines

---

## Integration with Rails Forms

### Form Builder Integration

```erb
<%= form_with model: @user do |f| %>
  <%= render "shared/components/forms/form_group",
    label: "Email",
    name: "user[email]",
    required: true,
    error: @user.errors[:email].first do %>
    <%= f.email_field :email, class: "form-control #{'error' if @user.errors[:email].any?}" %>
  <% end %>

  <%= render "shared/components/forms/form_group",
    label: "Password",
    name: "user[password]",
    required: true do %>
    <%= f.password_field :password, class: "form-control" %>
  <% end %>

  <%= f.submit "Save", class: "btn btn-primary" %>
<% end %>
```

### With Model Errors

```erb
<% @user.errors.full_messages.each do |message| %>
  <div class="text-sm text-red-600 dark:text-red-400"><%= message %></div>
<% end %>
```

---

## Best Practices

1. **Always use labels**: Even if hidden, labels improve accessibility
2. **Provide helper text**: Guide users on expected input format
3. **Show errors clearly**: Use the error state and message for validation
4. **Group related fields**: Use fieldsets for related inputs
5. **Mark required fields**: Use the required option consistently
6. **Test dark mode**: Ensure forms are readable in both themes
7. **Consider mobile**: Form fields should be large enough to tap

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/forms/`
- **Shared partial files**: `app/views/shared/components/forms/`
- **shared partial**: `render "shared/components/forms/form_group"`
- **ViewComponent**: `render Forms::Component.new(...)`
- **ViewComponent files**: `app/components/forms/`

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