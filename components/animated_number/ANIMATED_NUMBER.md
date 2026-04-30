# Animated Number Component

Display smooth, slot-machine style animated number transitions. Perfect for statistics, counters, dashboards, and data visualization. Powered by [Number Flow](https://number-flow.barvian.me/vanilla).

## Features

- Smooth slot-machine style digit animations
- **Flexible formatting** - Currency, percentages, compact notation (K, M, B)
- **Multiple triggers** - Viewport intersection, page load, or manual
- **Prefix/suffix support** - Add symbols, units, or text
- **Realtime mode** - Step-by-step countdown/countup animations
- **Continuous vs discrete** - Smooth transitions or classic slot-machine effects
- **Custom easing** - Control animation timing curves
- Dark mode support
- Zero external dependencies beyond Number Flow

## Prerequisites

This component requires the Number Flow library and a Stimulus controller. See the installation section on the [Animated Number blocks page](/blocks/animated_number).

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/animated_number/` | Full control, copy-paste |
| **Shared Partial** | `app/views/shared/components/animated_number/` | Reusable partial with locals |
| **ViewComponent** | `app/components/animated_number/` | Ruby-based, testable, object-oriented |

### Plain ERB

Copy the animated number HTML directly into your views for maximum flexibility:

```erb
<span
  data-controller="animated-number"
  data-animated-number-start-value="0"
  data-animated-number-end-value="1250"
  data-animated-number-duration-value="2000"
></span>
```

### Shared Partial

Use the reusable partial for consistent animated numbers across your app:

```erb
<%= render "shared/components/animated_number/animated_number",
  end_value: 1250,
  duration: 2000 %>
```

### ViewComponent

Use the object-oriented ViewComponent approach for better testing and Ruby-based logic:

```erb
<%= render AnimatedNumber::Component.new(
  end_value: 1250,
  duration: 2000
) %>
```

---

## Options Reference

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `end_value` | Numeric | **Required** | The ending value for the animation |
| `start_value` | Numeric | `0` | The starting value for the animation |
| `duration` | Integer | `700` | Animation duration in milliseconds |
| `trigger` | String | `"viewport"` | When to trigger: `"viewport"`, `"load"`, or `"manual"` |
| `prefix` | String | `nil` | Text to display before the number |
| `suffix` | String | `nil` | Text to display after the number |
| `format_options` | Hash | `nil` | Intl.NumberFormat options |
| `trend` | Integer | `nil` | Direction trend: `-1`, `0`, or `1` |
| `realtime` | Boolean | `false` | Use real-time ticking instead of smooth animation |
| `update_interval` | Integer | `1000` | Interval in ms for realtime updates |
| `continuous` | Boolean | `true` | Enable continuous plugin for smooth transitions |
| `spin_easing` | String | `nil` | Easing function for digit spin animations |
| `transform_easing` | String | `nil` | Easing function for layout transforms |
| `opacity_easing` | String | `nil` | Easing function for fade effects |
| `classes` | String | `nil` | Additional CSS classes for the wrapper |

---

## Common Use Cases

### Basic Counter

```erb
<div class="text-4xl font-bold">
  <%= render AnimatedNumber::Component.new(
    end_value: 1250,
    duration: 2000
  ) %>
</div>
```

### Currency Display

```erb
<%= render AnimatedNumber::Component.new(
  start_value: 50,
  end_value: 850.99,
  duration: 2500,
  format_options: { style: "currency", currency: "USD", minimumFractionDigits: 2 },
  suffix: " / month"
) %>
```

### Large Numbers (Compact)

```erb
<%= render AnimatedNumber::Component.new(
  end_value: 125600,
  duration: 2000,
  format_options: { notation: "compact", compactDisplay: "short" }
) %>
<!-- Displays: 126K -->
```

### Percentage Growth

```erb
<%= render AnimatedNumber::Component.new(
  end_value: 147.5,
  duration: 2800,
  format_options: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
  prefix: "+",
  suffix: "%"
) %>
```

### Countdown Timer

```erb
<%= render AnimatedNumber::Component.new(
  start_value: 10,
  end_value: 0,
  duration: 500,
  trend: -1,
  format_options: { minimumIntegerDigits: 2 },
  suffix: "s",
  realtime: true,
  update_interval: 1000
) %>
```

### Stats Card

```erb
<div class="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm">
  <div class="text-center">
    <div class="text-4xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
      <%= render AnimatedNumber::Component.new(
        end_value: 12500,
        duration: 2000,
        format_options: { notation: "compact" }
      ) %>
    </div>
    <p class="text-sm text-neutral-600 dark:text-neutral-400">Active Users</p>
  </div>
</div>
```

---

## Format Options

The `format_options` parameter accepts any valid [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) options:

| Format Options | Result |
| -------------- | ------ |
| `{ style: "currency", currency: "USD" }` | $1,000.00 |
| `{ notation: "compact", compactDisplay: "short" }` | 1K, 1M, 1B |
| `{ minimumFractionDigits: 2, maximumFractionDigits: 2 }` | 123.45 |
| `{ style: "percent" }` | 75% |
| `{ minimumIntegerDigits: 2 }` | 01, 02, 03 |

---

## Trigger Modes

| Trigger | Description |
| ------- | ----------- |
| `viewport` | Animation starts when element enters the browser viewport (default) |
| `load` | Animation starts immediately on page load |
| `manual` | Animation starts via JavaScript action |

---

## Easing Options

Control animation timing with standard CSS easing or custom cubic-bezier curves:

```erb
<%= render AnimatedNumber::Component.new(
  end_value: 5000,
  duration: 3000,
  spin_easing: "ease-out",
  transform_easing: "ease-out",
  opacity_easing: "ease-in"
) %>
```

Common easing values:
- `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`
- `cubic-bezier(0.68, -0.55, 0.265, 1.55)` (bounce effect)
- `cubic-bezier(0.175, 0.885, 0.32, 1.275)` (spring motion)

---

## Animation Modes

### Continuous (Default)

Smooth transitions through all intermediate numbers:

```erb
<%= render AnimatedNumber::Component.new(
  end_value: 999,
  duration: 2000,
  continuous: true
) %>
```

### Discrete (Slot-Machine)

Classic slot-machine style digit-by-digit animation:

```erb
<%= render AnimatedNumber::Component.new(
  end_value: 999,
  duration: 2000,
  continuous: false
) %>
```

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/animated_number/`
- **Shared partial files**: `app/views/shared/components/animated_number/`
- **shared partial**: `render "shared/components/animated_number/animated_number"`
- **ViewComponent**: `render AnimatedNumber::Component.new(...)`
- **ViewComponent files**: `app/components/animated_number/`

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