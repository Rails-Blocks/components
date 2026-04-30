# Accordion Component

Collapsible content sections with smooth animations, keyboard navigation, and ARIA accessibility.

## Features

- Multiple icon styles (chevron, plus/minus, left arrow)
- Single or multiple open items
- Disabled states
- Three visual variants (default, bordered, floating)
- Full keyboard navigation (↑↓ arrows, Home/End, Enter/Space)
- Nested accordion support

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/accordion/` | Full control, copy-paste |
| **Shared Partials** | `app/views/shared/components/accordion/` | Reusable partials, data-driven |
| **ViewComponent** | `app/components/accordion/` | Block-style content, testing |

---

## Stimulus Controller

### Values

| Value | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `allowMultiple` | Boolean | `false` | Allow multiple items open simultaneously |

### Targets

| Target | Required | Description |
| ------ | -------- | ----------- |
| `item` | Yes | Container for each accordion item |
| `trigger` | Yes | Clickable button that toggles the item |
| `content` | Yes | Collapsible content area |
| `icon` | No | Icon element that animates on open/close |

### Actions

| Action | Usage | Description |
| ------ | ----- | ----------- |
| `toggle` | `click->accordion#toggle` | Toggles item open/closed |

---

## Plain ERB

Copy the code block into your view and customize as needed.

### Basic Example

```erb
<% accordion_items = [
  { question: "Is the accordion accessible?", answer: "Yes, with full keyboard navigation." },
  { question: "Is it styled?", answer: "Comes with Tailwind CSS styles you can customize." },
  { question: "Does it have animations?", answer: "Yes, smooth open/close animations." }
] %>

<div class="w-full" data-controller="accordion">
  <% accordion_items.each_with_index do |item, index| %>
    <div data-accordion-target="item" data-state="closed" class="border-b pb-2 border-neutral-200 dark:border-neutral-700">
      <h3 data-state="closed" class="flex text-base font-semibold mt-2 mb-0">
        <button
          type="button"
          data-accordion-target="trigger"
          data-action="click->accordion#toggle"
          aria-controls="accordion-content-<%= index %>"
          aria-expanded="false"
          data-state="closed"
          id="accordion-trigger-<%= index %>"
          class="flex flex-1 items-center text-left justify-between py-2 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180 focus:outline-neutral-700 dark:focus:outline-white focus:outline-offset-2 px-2"
        >
          <%= item[:question] %>
          <svg xmlns="http://www.w3.org/2000/svg" data-accordion-target="icon" class="size-4 shrink-0 transition-transform duration-300" width="18" height="18" viewBox="0 0 18 18">
            <g fill="currentColor">
              <path d="M8.99999 13.5C8.80799 13.5 8.61599 13.4271 8.46999 13.2801L2.21999 7.03005C1.92699 6.73705 1.92699 6.26202 2.21999 5.96902C2.51299 5.67602 2.98799 5.67602 3.28099 5.96902L9.00099 11.689L14.721 5.96902C15.014 5.67602 15.489 5.67602 15.782 5.96902C16.075 6.26202 16.075 6.73705 15.782 7.03005L9.53199 13.2801C9.38599 13.4261 9.19399 13.5 9.00199 13.5H8.99999Z"></path>
            </g>
          </svg>
        </button>
      </h3>
      <div
        data-accordion-target="content"
        data-state="closed"
        id="accordion-content-<%= index %>"
        role="region"
        aria-labelledby="accordion-trigger-<%= index %>"
        class="grid transition-[grid-template-rows] duration-300 ease-in-out data-[state=open]:grid-rows-[1fr] data-[state=closed]:grid-rows-[0fr]"
        hidden
      >
        <div class="overflow-hidden min-h-0">
          <div class="text-sm opacity-0 transition-opacity duration-300 data-[state=open]:opacity-100" data-state="closed">
            <p class="my-2 px-2"><%= item[:answer].html_safe %></p>
          </div>
        </div>
      </div>
    </div>
  <% end %>
</div>
```

### Key Modifications

**Allow multiple open:** Add `data-accordion-allow-multiple-value="true"` to container.

**Default open item:** Set `data-state="open"`, `aria-expanded="true"`, and remove `hidden` attribute.

**Different icons:** See the examples in the docs for plus/minus and left arrow variations.

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/accordion/accordion",
  items: [
    { title: "What is Rails Blocks?", content: "A UI component library." },
    { title: "How do I install it?", content: "Copy the components you need." }
  ]
%>
```

### With Options

```erb
<%= render "shared/components/accordion/accordion",
  items: [
    { title: "First item", content: "Starts expanded.", default_open: true },
    { title: "Second item", content: "Regular content." },
    { title: "Disabled item", content: "Not accessible.", disabled: true }
  ],
  icon: "plus_minus",
  variant: "bordered",
  allow_multiple: true,
  classes: "max-w-2xl"
%>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `items` | Array | `[]` | Accordion items (see below) |
| `allow_multiple` | Boolean | `false` | Allow multiple open |
| `icon` | String | `"chevron"` | `"chevron"`, `"plus_minus"`, `"left_arrow"` |
| `variant` | String | `"default"` | `"default"`, `"bordered"`, `"floating"` |
| `classes` | String | `nil` | Additional wrapper classes |

### Item Hash

| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `title` | String | required | Item title |
| `content` | String | required | Expandable content (supports HTML) |
| `default_open` | Boolean | `false` | Start expanded |
| `disabled` | Boolean | `false` | Disable interaction |
| `classes` | String | `nil` | Additional item classes |

---

## ViewComponent

### Basic Usage

```erb
<%= render(Accordion::Component.new) do |accordion| %>
  <% accordion.with_item(title: "What is Rails Blocks?") do %>
    A UI component library for Ruby on Rails.
  <% end %>
  <% accordion.with_item(title: "How do I install it?") do %>
    Copy the components you need.
  <% end %>
<% end %>
```

### With Options

```erb
<%= render(Accordion::Component.new(
  allow_multiple: true,
  icon: :plus_minus,
  variant: :bordered,
  classes: "max-w-2xl"
)) do |accordion| %>
  <% accordion.with_item(title: "First item", default_open: true) do %>
    Starts expanded.
  <% end %>
  <% accordion.with_item(title: "Disabled item", disabled: true) do %>
    Not accessible.
  <% end %>
<% end %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `allow_multiple` | Boolean | `false` | Allow multiple items open |
| `icon` | Symbol | `:chevron` | `:chevron`, `:plus_minus`, `:left_arrow` |
| `variant` | Symbol | `:default` | `:default`, `:bordered`, `:floating` |
| `classes` | String | `nil` | Additional wrapper classes |

### Item Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `title` | String | required | Item title |
| `default_open` | Boolean | `false` | Start expanded |
| `disabled` | Boolean | `false` | Disable interaction |
| `icon_position` | Symbol | `:right` | `:left` or `:right` |
| `classes` | String | `nil` | Additional item classes |

---

## Variants

| Variant | Description |
| ------- | ----------- |
| `default` | Simple border-bottom style, ideal for FAQs |
| `bordered` | Card-style with background and rounded corners |
| `floating` | Minimal style with spacing between items |

---

## Accessibility

Implements WAI-ARIA Accordion Pattern:

- `aria-expanded` on trigger buttons
- `aria-controls` linking trigger to content
- `aria-labelledby` on content regions
- `role="region"` on content areas
- `data-state` for CSS styling hooks

---

## Troubleshooting

**Content doesn't animate:** Ensure content has `overflow-hidden` and transition classes.

**Icon doesn't rotate:** Check `data-accordion-target="icon"` is on the SVG element.

**Multiple items open unexpectedly:** Verify `data-accordion-allow-multiple-value` is not set or is `"false"`.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/accordion/`
- **Shared partial files**: `app/views/shared/components/accordion/`
- **shared partial**: `render "shared/components/accordion/accordion"`
- **ViewComponent**: `render Accordion::Component.new(...)`
- **ViewComponent files**: `app/components/accordion/`

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