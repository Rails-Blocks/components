# Banner Component

Announcement banners, cookie notices, promotional messages, and notification bars with dismissal, countdown timers, and cookie persistence.

## Features

- Multiple positions (top, bottom, floating)
- Five visual variants (default, info, warning, success, promotional)
- Dismissible with cookie-based persistence
- Countdown timer support with auto-hide
- Smooth slide-in/out animations
- Action buttons with CTA support
- Custom icons
- Dark mode support

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/banner/` | Full control, copy-paste |
| **Shared Partials** | `app/views/shared/components/banner/` | Reusable partials, data-driven |
| **ViewComponent** | `app/components/banner/` | Type-safe, testable components |

---

## Stimulus Controller

### Values

| Value | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `cookieName` | String | `"banner_dismissed"` | Cookie name for dismissal persistence |
| `cookieDays` | Number | `0` | How long to persist: -1 = no cookie, 0 = session, >0 = days |
| `countdownEndTime` | String | `""` | ISO 8601 date string for countdown timer |
| `autoHide` | Boolean | `false` | Auto hide after countdown expires |

### Targets

| Target | Required | Description |
| ------ | -------- | ----------- |
| `days` | No | Countdown days display element |
| `hours` | No | Countdown hours display element |
| `minutes` | No | Countdown minutes display element |
| `seconds` | No | Countdown seconds display element |

### Actions

| Action | Usage | Description |
| ------ | ----- | ----------- |
| `hide` | `click->banner#hide` | Dismisses the banner with animation |
| `hideAndNavigate` | `click->banner#hideAndNavigate` | Dismisses and allows link navigation |

---

## Plain ERB

Copy the code block into your view and customize as needed.

### Basic Example

```erb
<div data-controller="banner" data-banner-cookie-name-value="my_banner" data-banner-cookie-days-value="-1" class="hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border-b border-black/10 dark:border-white/10 shadow-xs transition-all duration-300 ease-in-out opacity-0 -translate-y-full">
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between gap-2 sm:gap-4 py-3">
      <div class="flex items-center gap-3 flex-1">
        <div class="hidden sm:flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-90">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="m2 17 10 5 10-5"></path>
            <path d="m2 12 10 5 10-5"></path>
          </svg>
        </div>
        <div class="space-y-1">
          <p class="text-sm font-semibold">New Feature Launch!</p>
          <p class="hidden sm:block text-xs text-neutral-600 dark:text-neutral-400">Check out our latest updates.</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <a href="#" class="inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-400/30 bg-neutral-800 px-3 py-1.5 text-sm font-medium whitespace-nowrap text-white shadow-sm transition-all duration-100 ease-in-out select-none hover:bg-neutral-700 dark:bg-white dark:text-neutral-800 dark:hover:bg-neutral-100">
          Learn more
        </a>
        <button data-action="click->banner#hide" class="inline-flex items-center justify-center p-1.5 rounded-full opacity-70 transition-opacity hover:opacity-100 hover:bg-neutral-500/15" aria-label="Close banner">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
        </button>
      </div>
    </div>
  </div>
</div>
```

### Key Modifications

**Position:** Change from `top-0 -translate-y-full` to `bottom-0 translate-y-full` for bottom banners.

**Cookie persistence:** Set `data-banner-cookie-days-value` to `0` (session), `7` (one week), `30` (one month), etc.

**Countdown timer:** Add `data-banner-countdown-end-time-value="2024-12-31T23:59:59"` and include countdown targets.

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/banner/banner",
  title: "New Feature Launch!",
  description: "Check out our latest updates."
%>
```

### With Options

```erb
<%= render "shared/components/banner/banner",
  title: "Black Friday Sale!",
  description: "Get 30% off all products. Limited time only!",
  position: "top",
  variant: "promotional",
  action_text: "Shop Now",
  action_url: "/shop",
  cookie_name: "black_friday",
  cookie_days: 7,
  countdown_end_time: (Time.current + 3.days).iso8601,
  auto_hide: true
%>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `title` | String | required | Banner title/message |
| `description` | String | `nil` | Optional description (supports HTML) |
| `position` | String | `"top"` | `"top"`, `"bottom"`, `"floating"` |
| `variant` | String | `"default"` | `"default"`, `"info"`, `"warning"`, `"success"`, `"promotional"` |
| `dismissible` | Boolean | `true` | Show dismiss button |
| `sticky` | Boolean | `true` | Fixed position |
| `show_icon` | Boolean | `true` | Show icon |
| `custom_icon` | String | `nil` | Custom icon HTML/SVG |
| `action_text` | String | `nil` | CTA button text |
| `action_url` | String | `nil` | CTA button URL |
| `cookie_name` | String | `"banner_dismissed"` | Cookie name |
| `cookie_days` | Integer | `-1` | Cookie duration (-1 = none, 0 = session) |
| `countdown_end_time` | String | `nil` | ISO 8601 date for countdown |
| `auto_hide` | Boolean | `false` | Auto hide after countdown |
| `classes` | String | `nil` | Additional CSS classes |

---

## ViewComponent

### Basic Usage

```erb
<%= render(Banner::Component.new(
  title: "New Feature Launch!",
  description: "Check out our latest updates."
)) %>
```

### With Options

```erb
<%= render(Banner::Component.new(
  title: "Black Friday Sale!",
  description: "Get 30% off all products. Limited time only!",
  position: :top,
  variant: :promotional,
  action_text: "Shop Now",
  action_url: "/shop",
  cookie_name: "black_friday",
  cookie_days: 7,
  countdown_end_time: (Time.current + 3.days).iso8601,
  auto_hide: true
)) %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `title` | String | required | Banner title/message |
| `description` | String | `nil` | Optional description (supports HTML) |
| `position` | Symbol | `:top` | `:top`, `:bottom`, `:floating` |
| `variant` | Symbol | `:default` | `:default`, `:info`, `:warning`, `:success`, `:promotional` |
| `dismissible` | Boolean | `true` | Show dismiss button |
| `sticky` | Boolean | `true` | Fixed position |
| `show_icon` | Boolean | `true` | Show icon |
| `custom_icon` | String | `nil` | Custom icon HTML/SVG |
| `action_text` | String | `nil` | CTA button text |
| `action_url` | String | `nil` | CTA button URL |
| `cookie_name` | String | `"banner_dismissed"` | Cookie name |
| `cookie_days` | Integer | `-1` | Cookie duration (-1 = none, 0 = session) |
| `countdown_end_time` | String | `nil` | ISO 8601 date for countdown |
| `auto_hide` | Boolean | `false` | Auto hide after countdown |
| `classes` | String | `nil` | Additional CSS classes |

---

## Positions

| Position | Description |
| -------- | ----------- |
| `top` | Fixed to top of viewport, slides down on show |
| `bottom` | Fixed to bottom of viewport, slides up on show |
| `floating` | Centered floating card at bottom with shadow and pattern |

---

## Variants

| Variant | Description |
| ------- | ----------- |
| `default` | Neutral white/dark background |
| `info` | Blue accent for informational messages |
| `warning` | Amber accent for warnings and action required |
| `success` | Green accent for positive messages |
| `promotional` | Red/orange gradient for sales and offers |

---

## Cookie Persistence

Control how long the dismissal is remembered:

| Value | Behavior |
| ----- | -------- |
| `-1` | No cookie - banner shows every page load |
| `0` | Session cookie - dismissed until browser closes |
| `7` | Persistent cookie - dismissed for 7 days |
| `30` | Persistent cookie - dismissed for 30 days |
| `365` | Persistent cookie - dismissed for 1 year |

---

## Countdown Timer

Add a countdown timer to create urgency:

```erb
<%= render "shared/components/banner/banner",
  title: "Sale Ends Soon!",
  countdown_end_time: (Time.current + 3.days).iso8601,
  auto_hide: true
%>
```

The countdown displays days, hours, minutes, and seconds. When `auto_hide: true`, the banner automatically dismisses 2 seconds after the countdown expires.

---

## Accessibility

- Close button has `aria-label="Close banner"`
- Icon containers are marked `aria-hidden="true"`
- Focus states with visible outlines
- Keyboard accessible dismiss button

---

## Troubleshooting

**Banner doesn't appear:** Ensure the banner controller is connected. Check that `data-controller="banner"` is on the wrapper and the banner has the `hidden` class initially.

**Banner reappears after dismissal:** Check `cookie_days` value. If set to `-1`, no cookie is stored. Use `0` for session or a positive number for persistent storage.

**Countdown doesn't work:** Verify `countdown_end_time` is a valid ISO 8601 string. Use `Time.current.iso8601` or `date.iso8601` in Ruby.

**Animation doesn't play on subsequent page loads:** This is intentional. The controller remembers if the banner was shown during the session and skips the animation on subsequent page loads for better UX.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/banner/`
- **Shared partial files**: `app/views/shared/components/banner/`
- **shared partial**: `render "shared/components/banner/banner"`
- **ViewComponent**: `render Banner::Component.new(...)`
- **ViewComponent files**: `app/components/banner/`

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