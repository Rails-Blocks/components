# Emoji Picker Component

An emoji selection dropdown powered by the emoji-mart library, with support for form submission, insert mode for text fields, and full keyboard navigation.

## Features

- Full emoji-mart library integration with search
- Two modes: selection (replace) and insert (at cursor)
- Auto-submit form on selection
- Theme-aware (dark/light mode)
- Three button sizes (sm, md, lg)
- Three button styles (ghost, outline, solid)
- Configurable picker position (left, center, right)
- Keyboard navigation and Escape to close
- Pre-selected emoji support

## Installation

The emoji picker requires the emoji-mart library. Add these to your `config/importmap.rb`:

```ruby
pin "emoji-mart", to: "https://cdn.jsdelivr.net/npm/emoji-mart@5.6.0/dist/browser.js"
pin "@emoji-mart/data", to: "https://cdn.jsdelivr.net/npm/@emoji-mart/data@1.2.1/+esm"
```

Or install via npm/yarn:

```bash
npm install emoji-mart @emoji-mart/data
# or
yarn add emoji-mart @emoji-mart/data
```

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/emoji_picker/` | Full control, copy-paste |
| **Shared Partials** | `app/views/shared/components/emoji_picker/` | Reusable partials, data-driven |
| **ViewComponent** | `app/components/emoji_picker/` | Block-style content, testing |

---

## Stimulus Controller

### Values

| Value | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `autoSubmit` | Boolean | `false` | Auto-submit form when emoji is selected |
| `insertMode` | Boolean | `false` | Insert emoji at cursor instead of replacing value |
| `targetSelector` | String | `""` | CSS selector for input/textarea to insert emoji into |

### Targets

| Target | Required | Description |
| ------ | -------- | ----------- |
| `input` | Yes | Hidden or visible input storing selected emoji |
| `pickerContainer` | Yes | Container where emoji-mart picker is rendered |
| `button` | Yes | Button that toggles the picker |

### Actions

| Action | Usage | Description |
| ------ | ----- | ----------- |
| `toggle` | `click->emoji-picker#toggle` | Toggles picker open/closed |
| `clearInput` | Internal | Clears selected emoji (backspace/delete on button) |

### Events

The controller listens for:
- `click` outside to close picker
- `Escape` key to close picker
- Theme changes to update picker appearance

---

## Plain ERB

Copy the code block into your view and customize as needed.

### Basic Example

```erb
<div data-controller="emoji-picker">
  <div class="flex items-center gap-2">
    <button type="button" class="outline-hidden size-8 text-xl shrink-0 flex items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 hover:text-neutral-800 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-200" data-action="click->emoji-picker#toggle" data-emoji-picker-target="button">
      <svg xmlns="http://www.w3.org/2000/svg" class="size-5" width="18" height="18" viewBox="0 0 18 18"><g fill="currentColor"><path d="M9,1C4.589,1,1,4.589,1,9s3.589,8,8,8,8-3.589,8-8S13.411,1,9,1Zm-4,7c0-.552,.448-1,1-1s1,.448,1,1-.448,1-1,1-1-.448-1-1Zm4,6c-1.531,0-2.859-1.14-3.089-2.651-.034-.221,.039-.444,.193-.598,.151-.15,.358-.217,.572-.185,1.526,.24,3.106,.24,4.638,.001h0c.217-.032,.428,.036,.583,.189,.153,.153,.225,.373,.192,.589-.229,1.513-1.557,2.654-3.089,2.654Zm3-5c-.552,0-1-.448-1-1s.448-1,1-1,1,.448,1,1-.448,1-1,1Z"></path></g></svg>
    </button>
    <input type="text" name="emoji" class="hidden" data-emoji-picker-target="input">
  </div>
  <div data-emoji-picker-target="pickerContainer" class="hidden absolute z-50 mt-2 flex justify-center inset-x-0"></div>
</div>
```

### Key Modifications

**Auto-submit:** Add `data-emoji-picker-auto-submit-value="true"` to container.

**Insert mode:** Add `data-emoji-picker-insert-mode-value="true"` and optionally `data-emoji-picker-target-selector-value="#my-textarea"`.

**Show selected emoji:** Update button content dynamically or use visible input field.

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/emoji_picker/emoji_picker" %>
```

### With Options

```erb
<%= render "shared/components/emoji_picker/emoji_picker",
  id: "reaction_picker",
  name: "reaction",
  show_input: true,
  placeholder: "Pick a reaction...",
  auto_submit: true,
  button_style: :outline,
  picker_position: :left
%>
```

### Insert Mode for Chat

```erb
<textarea id="message_content" class="form-control" rows="4"></textarea>

<%= render "shared/components/emoji_picker/emoji_picker",
  insert_mode: true,
  target_selector: "#message_content"
%>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `id` | String | auto-generated | Unique identifier |
| `name` | String | `"emoji"` | Input name attribute |
| `value` | String | `nil` | Pre-selected emoji |
| `placeholder` | String | `"Select an emoji..."` | Input placeholder |
| `auto_submit` | Boolean | `false` | Auto-submit form on selection |
| `insert_mode` | Boolean | `false` | Insert at cursor vs replace |
| `target_selector` | String | `nil` | CSS selector for target field |
| `show_input` | Boolean | `false` | Show visible input field |
| `button_size` | Symbol | `:md` | `:sm`, `:md`, `:lg` |
| `button_style` | Symbol | `:ghost` | `:ghost`, `:outline`, `:solid` |
| `picker_position` | Symbol | `:center` | `:left`, `:center`, `:right` |
| `classes` | String | `nil` | Additional wrapper classes |
| `button_classes` | String | `nil` | Additional button classes |
| `input_classes` | String | `nil` | Additional input classes |

---

## ViewComponent

### Basic Usage

```erb
<%= render EmojiPicker::Component.new %>
```

### With Options

```erb
<%= render EmojiPicker::Component.new(
  id: "mood_picker",
  name: "mood",
  value: "😊",
  show_input: true,
  auto_submit: true,
  button_style: :outline
) %>
```

### Insert Mode with Block Content

```erb
<%= render EmojiPicker::Component.new(
  insert_mode: true
) do %>
  <textarea
    id="chat_message"
    rows="4"
    class="form-control w-full mb-3"
    placeholder="Type your message..."
  ></textarea>
<% end %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `id` | String | auto-generated | Unique identifier |
| `name` | String | `"emoji"` | Input name attribute |
| `value` | String | `nil` | Pre-selected emoji |
| `placeholder` | String | `"Select an emoji..."` | Input placeholder |
| `auto_submit` | Boolean | `false` | Auto-submit form on selection |
| `insert_mode` | Boolean | `false` | Insert at cursor vs replace |
| `target_selector` | String | `nil` | CSS selector for target field |
| `show_input` | Boolean | `false` | Show visible input field |
| `button_size` | Symbol | `:md` | `:sm`, `:md`, `:lg` |
| `button_style` | Symbol | `:ghost` | `:ghost`, `:outline`, `:solid` |
| `picker_position` | Symbol | `:center` | `:left`, `:center`, `:right` |
| `classes` | String | `nil` | Additional wrapper classes |
| `button_classes` | String | `nil` | Additional button classes |
| `input_classes` | String | `nil` | Additional input classes |

---

## Button Sizes

| Size | Classes | Use Case |
| ---- | ------- | -------- |
| `:sm` | `size-6 text-base` | Inline with text, compact UIs |
| `:md` | `size-8 text-xl` | Default, form fields |
| `:lg` | `size-10 text-2xl` | Hero sections, large CTAs |

---

## Button Styles

| Style | Description |
| ----- | ----------- |
| `:ghost` | Transparent background, hover state only |
| `:outline` | Border with transparent background |
| `:solid` | Filled background |

---

## Common Patterns

### Reaction Button (Auto-submit)

```erb
<form action="/reactions" method="post">
  <%= render "shared/components/emoji_picker/emoji_picker",
    name: "reaction[emoji]",
    auto_submit: true,
    button_style: :ghost
  %>
</form>
```

### Chat Input with Emoji Insert

```erb
<div class="border rounded-lg p-4">
  <textarea id="message" class="form-control w-full" rows="3"></textarea>
  <div class="flex items-center justify-between mt-2">
    <%= render "shared/components/emoji_picker/emoji_picker",
      insert_mode: true,
      target_selector: "#message",
      picker_position: :left
    %>
    <button type="submit" class="btn btn-primary">Send</button>
  </div>
</div>
```

### Mood/Status Selector

```erb
<%= render "shared/components/emoji_picker/emoji_picker",
  id: "user_status",
  name: "user[status_emoji]",
  value: current_user.status_emoji,
  show_input: true,
  placeholder: "Set your status...",
  button_style: :outline
%>
```

---

## Accessibility

- Button is focusable with keyboard
- Escape closes the picker
- Backspace/Delete on button clears selection (when not in insert mode)
- emoji-mart provides built-in search and keyboard navigation

---

## Troubleshooting

**Picker doesn't appear:** Ensure emoji-mart is properly imported. Check console for errors.

**Theme not matching:** The controller watches for `dark` class on `<html>` element and reinitializes picker on theme change.

**Insert mode not working:** Verify `target_selector` points to a valid `<input>` or `<textarea>` element.

**Auto-submit not triggering:** Ensure the picker is inside a `<form>` element.

**Multiple pickers on page:** Each picker should have a unique `id` to avoid conflicts.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/emoji_picker/`
- **Shared partial files**: `app/views/shared/components/emoji_picker/`
- **shared partial**: `render "shared/components/emoji_picker/emoji_picker"`
- **ViewComponent**: `render EmojiPicker::Component.new(...)`
- **ViewComponent files**: `app/components/emoji_picker/`

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