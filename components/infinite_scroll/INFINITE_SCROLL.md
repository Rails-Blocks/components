# Infinite Scroll

Load server-rendered records in small batches when the user reaches the end of a page or scrollable container. The component uses Stimulus for observation and rendering, Pagy for pagination, and Tailwind CSS for presentation.

## Features

- Automatic loading with `IntersectionObserver`
- Optional manual “Load more” mode
- Window or container-based scrolling
- Pagy-backed JSON pagination
- Arbitrary server-rendered item markup
- Configurable labels, messages, and observer margin
- Reduced-motion-safe item and loading transitions
- Accessible live-region updates and loading state
- Reusable ERB partial and ViewComponent implementations

## Requirements

- Rails 7+
- Tailwind CSS 4+
- Stimulus
- Pagy 43+

Add Pagy to your Gemfile:

```ruby
gem "pagy", "~> 43.5.6"
```

Include Pagy in the controller where the feed is loaded:

```ruby
class ApplicationController < ActionController::Base
  include Pagy::Method
end
```

Install `infinite_scroll_controller.js` in `app/javascript/controllers`. Stimulus Rails and Importmap will register it automatically when controllers are eager-loaded.

## Server Response Contract

The URL passed to the component must return JSON with server-rendered item HTML and the next page URL:

```json
{
  "html": "<article>...</article>",
  "next_url": "/activities?page=3",
  "count": 6
}
```

Every top-level element in `html` is appended directly to the items container. Return `null` for `next_url` when the collection is complete.

For production feeds, paginate a uniquely ordered Active Record relation with Pagy's keyset paginator:

```ruby
class ActivitiesController < ApplicationController
  def index
    activities = Activity.order(created_at: :desc, id: :desc)
    @pagy, @activities = pagy(:keyset, activities, limit: 6)
    next_url = @pagy.next && activities_path(page: @pagy.next)

    respond_to do |format|
      format.html
      format.json do
        render json: {
          html: render_to_string(
            partial: "activities/items",
            formats: [:html],
            locals: { activities: @activities }
          ),
          next_url: next_url,
          count: @activities.length
        }
      end
    end
  end
end
```

## ERB Partial

Render arbitrary direct child elements inside the shared partial:

```erb
<%= render "shared/components/infinite_scroll/infinite_scroll",
  next_url: @next_page_url,
  scroll_root: "container",
  items_tag: "ol",
  viewport_classes: "max-h-[32rem] overflow-y-auto overscroll-contain",
  items_classes: "divide-y divide-neutral-200 dark:divide-neutral-800" do %>
  <% @activities.each do |activity| %>
    <li id="activity_<%= activity.id %>" class="p-4">
      <%= activity.description %>
    </li>
  <% end %>
<% end %>
```

Use `manual: true` to show a button instead of observing the sentinel automatically.

## ViewComponent

Use the same content model through `InfiniteScroll::Component`:

```erb
<%= render InfiniteScroll::Component.new(
  next_url: @next_page_url,
  scroll_root: :container,
  items_tag: :ol,
  viewport_classes: "max-h-[32rem] overflow-y-auto overscroll-contain",
  items_classes: "divide-y divide-neutral-200 dark:divide-neutral-800"
) do %>
  <% @activities.each do |activity| %>
    <li id="activity_<%= activity.id %>" class="p-4">
      <%= activity.description %>
    </li>
  <% end %>
<% end %>
```

## Options

| Option | Default | Description |
| --- | --- | --- |
| `next_url` | required | URL for the next JSON batch. Use `nil` when complete. |
| `scroll_root` | `window` | Observe against the window or the internal `container`. |
| `root_margin` | `0px 0px 120px` | IntersectionObserver margin used to preload before the end. |
| `animate` | `true` | Animate initial and appended top-level items. |
| `manual` | `false` | Disable automatic observation and show “Load more.” |
| `items_tag` | `div` | Semantic items wrapper: `div`, `ul`, or `ol`. |
| `classes` | `nil` | Additional outer-wrapper classes. |
| `viewport_classes` | `nil` | Scrolling, sizing, and layout classes for the viewport. |
| `items_classes` | `nil` | Layout classes for the items container. |
| `sentinel_classes` | `nil` | Additional classes for the floating controls wrapper. |
| `load_more_label` | `Load more` | Label used by the manual button. |
| `loading_label` | `Loading...` | Label shown while requesting a page. |
| `end_message` | `You're all caught up` | Completed-state message. |
| `error_message` | `More items could not be loaded. Try again.` | Accessible failure message. |
| `html_options` | `{}` | Additional attributes for the outer wrapper. |

## Behavior Notes

- The controller prevents overlapping requests and aborts an active fetch when disconnected.
- Automatic mode stops observing the sentinel while a request is active.
- The loading pill fades in over 150ms. Item entrances and the loading fade are disabled when reduced motion is preferred.
- Failed requests keep the current content and expose a retry button.
- The end message replaces the loading control when `next_url` is empty.
- A stable unique order is required to avoid duplicate or missing records between pages.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB:** Use the activity-feed example when you want a ready-made visual treatment and direct markup control.
- **ERB template partial:** Use when you want a reusable render call with arbitrary server-rendered children.
- **ViewComponent:** Use when you prefer a Ruby initializer, encapsulated defaults, and component tests.

### Quick Reference

- **Vanilla example:** `app/views/components/infinite_scroll/_1_activity_feed.html.erb`
- **ERB partial:** `app/views/shared/components/infinite_scroll/_infinite_scroll.html.erb`
- **ERB usage:** `render "shared/components/infinite_scroll/infinite_scroll"`
- **ViewComponent:** `render InfiniteScroll::Component.new(...)`
- **Stimulus controller:** `app/javascript/controllers/infinite_scroll_controller.js`

### Implementation Checklist

- Install Pagy and include `Pagy::Method` in the relevant Rails controller.
- Install and register `infinite_scroll_controller.js`.
- Return JSON containing `html`, `next_url`, and optionally `count`.
- Ensure each top-level response element is a complete item suitable for direct append.
- Use a unique, deterministic database order; prefer Pagy keyset pagination for changing feeds.
- Set `scroll_root` to `container` only when `viewport_classes` creates a constrained overflow area.
- Preserve the sentinel, controls, status live region, Stimulus targets, and data values.
- Keep `next_url` empty when no records remain.

### Common Mistakes

- Do not return a full layout or Turbo Frame response from the JSON endpoint.
- Do not wrap all returned items in an extra container; only top-level elements are appended.
- Do not use an unstable sort such as `created_at` without a unique tiebreaker.
- Do not remove the `aria-live` status region or `aria-busy` updates.
- Do not mix ERB partial locals with ViewComponent initializer arguments.
- Do not remove the initial opacity and transition classes from the loading button; the controller relies on them for the fade.
