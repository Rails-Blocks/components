# Feedback Component

An expandable feedback widget with smooth button-to-form animations. Perfect for collecting user feedback, bug reports, or suggestions without navigating away from the current page.

## Features

- Smooth animated transition from button to form using Motion JS
- Nine anchor point positions (center, corners, edges)
- Keyboard support (Escape to close, Cmd/Ctrl+Enter to submit)
- Click-outside to close
- Success state animation after submission
- Dark mode support
- Optional server-side form submission

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/feedback/` | Full control, copy-paste |
| **Shared Partials** | `app/views/shared/components/feedback/` | Reusable partials, data-driven |
| **ViewComponent** | `app/components/feedback/` | Block-style content, testing |

---

## Stimulus Controller

### Values

| Value | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `expanded` | Boolean | `false` | Whether the form is currently expanded |
| `anchorPoint` | String | `"center"` | Position where form expands from |

### Targets

| Target | Required | Description |
| ------ | -------- | ----------- |
| `container` | Yes | The wrapper element |
| `button` | Yes | The feedback button that toggles the form |
| `buttonText` | Yes | The button text container (for success state animation) |
| `form` | Yes | The expandable form container |
| `textarea` | Yes | The textarea input element |

### Actions

| Action | Usage | Description |
| ------ | ----- | ----------- |
| `toggle` | `click->feedback#toggle` | Toggles form open/closed |
| `submit` | `submit->feedback#submit` | Handles form submission |

---

## Plain ERB

Copy the code block into your view and customize as needed.

### Basic Example

```erb
<div class="flex items-center justify-center relative" data-controller="feedback" data-feedback-expanded-value="false" data-feedback-anchor-point-value="center" data-feedback-target="container">
  <!-- Button -->
  <button type="button" class="flex items-center justify-center gap-1.5 rounded-lg border border-black/10 bg-white/90 px-3.5 py-2 text-sm font-medium whitespace-nowrap text-neutral-800 shadow-xs transition-all duration-100 ease-in-out select-none hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-neutral-700/50 dark:text-neutral-50 dark:hover:bg-neutral-700/75 dark:focus-visible:outline-neutral-200" data-feedback-target="button" data-action="click->feedback#toggle">
    <span class="flex items-center gap-1.5" data-feedback-target="buttonText">
      Feedback
    </span>
  </button>

  <!-- Form -->
  <div class="absolute hidden h-32 w-64 sm:h-48 sm:w-96 overflow-hidden rounded-lg border border-black/5 bg-neutral-100 p-1.5 shadow-xs outline-none dark:border-white/10 dark:bg-neutral-900 dark:shadow-neutral-900/50" data-feedback-target="form">
    <form class="flex h-full flex-col overflow-hidden rounded-lg border border-black/10 bg-white dark:border-neutral-600 dark:bg-neutral-700/75" data-action="submit->feedback#submit">
      <textarea class="small-scrollbar w-full flex-1 resize-none rounded-t-lg p-3 text-sm text-black placeholder-neutral-500 outline-none dark:text-neutral-100 dark:placeholder-neutral-400"
                required
                placeholder="Tell us what you think..."
                data-feedback-target="textarea"></textarea>

      <div class="relative flex h-12 items-center border-t border-dashed border-black/10 bg-neutral-50 px-2.5 dark:border-white/20 dark:bg-neutral-800">
        <button type="submit" class="ml-auto flex items-center justify-center rounded-md bg-neutral-800 py-1 px-2 text-xs font-medium text-white transition-colors duration-200 hover:bg-neutral-700 dark:bg-white dark:text-neutral-800 dark:hover:bg-neutral-100">
          <span>Send feedback</span>
        </button>
      </div>
    </form>
  </div>
</div>
```

### Key Modifications

**Change anchor point:** Update `data-feedback-anchor-point-value` to one of: `center`, `top-left`, `top`, `top-right`, `left`, `right`, `bottom-left`, `bottom`, `bottom-right`. Also adjust container alignment classes:
- Top positions: `items-start`
- Bottom positions: `items-end`
- Center: `items-center`

**Add server-side submission:** Add `action` and `method` attributes to the form element and include CSRF token.

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/feedback/feedback" %>
```

### With Options

```erb
<%= render "shared/components/feedback/feedback",
  button_text: "Report Issue",
  placeholder: "Describe the issue...",
  submit_text: "Submit Report",
  anchor_point: "top-right",
  form_action: "/feedback",
  form_method: "post",
  name: "issue_report"
%>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `button_text` | String | `"Feedback"` | Text displayed on the feedback button |
| `placeholder` | String | `"Tell us what you think..."` | Placeholder text for the textarea |
| `submit_text` | String | `"Send feedback"` | Text for the submit button |
| `anchor_point` | String | `"center"` | Where form expands from (see Anchor Points) |
| `form_action` | String | `nil` | Optional form action URL |
| `form_method` | String | `"post"` | Form method: `"post"` or `"get"` |
| `name` | String | `"feedback"` | Name attribute for the textarea |
| `classes` | String | `nil` | Additional wrapper classes |

---

## ViewComponent

### Basic Usage

```erb
<%= render Feedback::Component.new %>
```

### With Options

```erb
<%= render Feedback::Component.new(
  button_text: "Report Issue",
  placeholder: "Describe the issue...",
  submit_text: "Submit Report",
  anchor_point: :top_right,
  form_action: "/feedback",
  form_method: "post",
  name: "issue_report"
) %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `button_text` | String | `"Feedback"` | Text displayed on the feedback button |
| `placeholder` | String | `"Tell us what you think..."` | Placeholder text for the textarea |
| `submit_text` | String | `"Send feedback"` | Text for the submit button |
| `anchor_point` | Symbol | `:center` | Where form expands from (see Anchor Points) |
| `form_action` | String | `nil` | Optional form action URL |
| `form_method` | String | `"post"` | Form method: `"post"` or `"get"` |
| `name` | String | `"feedback"` | Name attribute for the textarea |
| `classes` | String | `nil` | Additional wrapper classes |

---

## Anchor Points

| Value | ERB Format | ViewComponent Format | Description |
| ----- | ---------- | ------------------- | ----------- |
| Center | `"center"` | `:center` | Form expands from center (default) |
| Top Left | `"top-left"` | `:top_left` | Form expands from top-left corner |
| Top | `"top"` | `:top` | Form expands from top center |
| Top Right | `"top-right"` | `:top_right` | Form expands from top-right corner |
| Left | `"left"` | `:left` | Form expands from left center |
| Right | `"right"` | `:right` | Form expands from right center |
| Bottom Left | `"bottom-left"` | `:bottom_left` | Form expands from bottom-left corner |
| Bottom | `"bottom"` | `:bottom` | Form expands from bottom center |
| Bottom Right | `"bottom-right"` | `:bottom_right` | Form expands from bottom-right corner |

---

## Keyboard Support

| Key | Action |
| --- | ------ |
| `Escape` | Close the form and return focus to button |
| `Cmd/Ctrl + Enter` | Submit the form |

---

## JavaScript Dependency

This component requires the Motion JS library for animations:

```javascript
import { animate, stagger, spring, delay } from "motion";
```

The controller handles:
- Spring-based expand/collapse animations
- Staggered element entrance animations
- Success state with checkmark icon
- Click-outside detection
- Turbo navigation cleanup

---

## Server-Side Submission

For actual form submission to a backend endpoint:

```erb
<%= render "shared/components/feedback/feedback",
  form_action: feedback_path,
  form_method: "post",
  name: "feedback[message]"
%>
```

The controller will:
1. POST to your endpoint with the textarea value
2. Show success animation
3. Clear and collapse the form

Handle the submission in your controller:

```ruby
class FeedbackController < ApplicationController
  def create
    # params[:feedback][:message] contains the feedback text
    FeedbackMailer.new_feedback(params[:feedback][:message]).deliver_later
    head :ok
  end
end
```

---

## Accessibility

- Button has proper focus states with visible outline
- Form textarea receives focus when expanded
- Escape key closes the form
- Click-outside dismisses the form
- Success state provides visual feedback

---

## Troubleshooting

**Form doesn't expand:** Ensure the feedback Stimulus controller is registered and Motion JS is imported.

**Animations are janky:** Check that no CSS transitions conflict with the JavaScript animations.

**Form doesn't close on outside click:** Verify `data-feedback-target="container"` is on the wrapper element.

**Success state not showing:** Ensure `data-feedback-target="buttonText"` is on the span inside the button.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/feedback/`
- **Shared partial files**: `app/views/shared/components/feedback/`
- **shared partial**: `render "shared/components/feedback/feedback"`
- **ViewComponent**: `render Feedback::Component.new(...)`
- **ViewComponent files**: `app/components/feedback/`

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