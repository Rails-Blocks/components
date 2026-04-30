# Autogrow Component

Auto-growing textarea that expands vertically as content is typed, with configurable minimum and maximum heights.

## Features

- Automatic height adjustment on input
- Configurable minimum and maximum heights
- Single-line to multi-line growth
- Optional manual resize
- Works with forms and form helpers
- Smooth cursor handling during resize
- Accessible with standard form attributes

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/autogrow/` | Full control, copy-paste |
| **Shared Partials** | `app/views/shared/components/autogrow/` | Reusable partials, quick integration |
| **ViewComponent** | `app/components/autogrow/` | Ruby-style configuration, testing |

---

## Stimulus Controller

### Actions

| Action | Usage | Description |
| ------ | ----- | ----------- |
| `autogrow` | `input->autogrow#autogrow` | Adjusts textarea height based on content |

### Behavior

The controller is applied directly to the `<textarea>` element (not a wrapper). It:

1. Runs on connect to size based on initial content
2. Resets height to `auto` before measuring
3. Sets height to `scrollHeight` for exact fit
4. Maintains scroll position when cursor is at end

---

## Plain ERB

Copy the code block into your view and customize as needed.

### Basic Example

```erb
<textarea
  rows="1"
  class="form-control min-h-10 max-h-52 resize-none small-scrollbar"
  placeholder="Start typing..."
  data-controller="autogrow"
  data-action="input->autogrow#autogrow"
></textarea>
```

### With Label and Container

```erb
<div class="w-full max-w-md">
  <label for="message" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
    Your Message
  </label>
  <textarea
    id="message"
    name="message"
    rows="4"
    class="form-control min-h-16 max-h-52 small-scrollbar"
    placeholder="Type your message..."
    data-controller="autogrow"
    data-action="input->autogrow#autogrow"
  ></textarea>
</div>
```

### Key Modifications

**Adjust height limits:** Change `min-h-*` and `max-h-*` Tailwind classes or use inline styles.

**Allow manual resize:** Remove `resize-none` class.

**Multi-row initial:** Set `rows="3"` or higher for larger starting size.

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/autogrow/autogrow",
  placeholder: "Start typing..."
%>
```

### With Options

```erb
<%= render "shared/components/autogrow/autogrow",
  placeholder: "Write your message here...",
  name: "message",
  id: "message-field",
  rows: 3,
  min_height: "4rem",
  max_height: "20rem",
  classes: "max-w-md"
%>
```

### Required Field with Value

```erb
<%= render "shared/components/autogrow/autogrow",
  placeholder: "Your bio...",
  name: "user[bio]",
  id: "user_bio",
  value: "Initial content here...",
  required: true,
  rows: 2
%>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `placeholder` | String | `nil` | Placeholder text |
| `name` | String | `nil` | Form field name |
| `id` | String | `nil` | Element ID |
| `rows` | Integer | `1` | Initial visible rows |
| `min_height` | String | `"2.5rem"` | Minimum height (CSS value) |
| `max_height` | String | `"13rem"` | Maximum height (CSS value) |
| `value` | String | `nil` | Initial content |
| `required` | Boolean | `false` | Mark as required field |
| `disabled` | Boolean | `false` | Disable the textarea |
| `resize` | Boolean | `false` | Allow manual resize |
| `classes` | String | `nil` | Additional CSS classes |
| `data` | Hash | `{}` | Additional data attributes |

---

## ViewComponent

### Basic Usage

```erb
<%= render Autogrow::Component.new(placeholder: "Start typing...") %>
```

### With Options

```erb
<%= render Autogrow::Component.new(
  placeholder: "Write your message here...",
  name: "message",
  id: "message-field",
  rows: 3,
  min_height: "4rem",
  max_height: "20rem",
  classes: "max-w-md"
) %>
```

### In a Form

```erb
<%= form_with model: @post do |f| %>
  <div class="mb-4">
    <label class="block text-sm font-medium mb-2">Content</label>
    <%= render Autogrow::Component.new(
      name: "post[content]",
      id: "post_content",
      value: @post.content,
      required: true,
      rows: 5,
      min_height: "8rem",
      max_height: "24rem"
    ) %>
  </div>
<% end %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `placeholder` | String | `nil` | Placeholder text |
| `name` | String | `nil` | Form field name |
| `id` | String | `nil` | Element ID |
| `rows` | Integer | `1` | Initial visible rows |
| `min_height` | String | `"2.5rem"` | Minimum height (CSS value) |
| `max_height` | String | `"13rem"` | Maximum height (CSS value) |
| `value` | String | `nil` | Initial content |
| `required` | Boolean | `false` | Mark as required field |
| `disabled` | Boolean | `false` | Disable the textarea |
| `resize` | Boolean | `false` | Allow manual resize |
| `classes` | String | `nil` | Additional CSS classes |
| `data` | Hash | `{}` | Additional data attributes |

---

## Common Patterns

### Chat Input Style

Single-line that grows into multi-line, commonly used in chat interfaces:

```erb
<%= render "shared/components/autogrow/autogrow",
  placeholder: "Type a message...",
  name: "message",
  rows: 1,
  min_height: "2.5rem",
  max_height: "10rem"
%>
```

### Comment Box

Multi-row starting point for longer content:

```erb
<%= render "shared/components/autogrow/autogrow",
  placeholder: "Write a comment...",
  name: "comment[body]",
  rows: 3,
  min_height: "5rem",
  max_height: "20rem"
%>
```

### Bio/Description Field

Larger area for profile descriptions:

```erb
<%= render "shared/components/autogrow/autogrow",
  placeholder: "Tell us about yourself...",
  name: "user[bio]",
  rows: 4,
  min_height: "6rem",
  max_height: "24rem",
  value: current_user.bio
%>
```

---

## Troubleshooting

**Textarea doesn't grow:** Ensure both `data-controller="autogrow"` and `data-action="input->autogrow#autogrow"` are present.

**Height jumps on input:** Check that no conflicting CSS is setting a fixed height.

**Can't manually resize:** Add `resize: true` option or remove `resize-none` class.

**Content cut off:** Increase `max_height` value to allow more vertical space.

**Initial content not sized:** The controller runs `autogrow()` on connect, so initial content should be sized correctly. If not, ensure the controller is loading properly.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/autogrow/`
- **Shared partial files**: `app/views/shared/components/autogrow/`
- **shared partial**: `render "shared/components/autogrow/autogrow"`
- **ViewComponent**: `render Autogrow::Component.new(...)`
- **ViewComponent files**: `app/components/autogrow/`

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