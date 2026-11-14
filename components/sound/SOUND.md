# Sound Component

Short, quiet interface sounds for buttons, switches, sliders, forms, and notifications. Every sound is synthesized live with the Web Audio API by one Stimulus controller, so there are no audio files to host and no dependencies. A single global mute and volume preference, saved in `localStorage`, keeps users in control.

## Features

- 25 sounds (presses, ticks, switches, success, error, warning, notification, and more), all synthesized, no audio files
- One attribute, no actions: `data-sound="tap"` on a button, `data-sound` on a checkbox or range
- Two-part cues for buttons and switches: one half on `pointerdown`, the other on `pointerup`
- Keyboard support: Space and Enter play the press half when the key goes down and the release when it comes up, like a pointer
- Sounds from the server: `data-sound-play-on-connect-value` in a Turbo Stream or flash message
- Sounds from JavaScript: a `sound:play` event, or `play(name, { volume, pitch })` through an outlet
- Touch-safe: a scroll that starts on a button or switch stays silent
- Global mute and volume, shared by every controller on the page and across tabs
- Starts muted for users who prefer reduced motion, until they unmute
- Respects browser autoplay rules: nothing plays before the first click or key press, and blocked sounds are dropped, never queued
- Optional visual echo (`indicator` target) and `data-sound-muted` for styling
- Works with Turbo forms (`turbo:submit-end->sound#result`)

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/sound/` | Copying a ready-made pattern into your views |
| **`data-sound` attribute** | Any element inside a `sound` controller | Adding sound to existing buttons, switches, ranges, and selects with one attribute |
| **Stimulus actions** | Any element inside a `sound` controller | Full control: custom halves, params, events such as `invalid` or `turbo:submit-end` |
| **Shared Partials** | `app/views/shared/components/sound/` | A sound wrapper and a mute button, rendered with locals |
| **ViewComponent** | `app/components/sound/` | The same wrapper and mute button with a Ruby API |

Sound is mostly behavior, added with `data-sound` to the elements you already have. The partials and ViewComponents cover the two pieces that are markup: the wrapper that holds the controller (with its default sound, volume, and play-on-connect), and a ready-made mute button.

### Shared Partials and ViewComponents

Both have the same options and render the same HTML.

```erb
<%# Wrapper: data-sound works on anything inside it %>
<%= render Sound::Component.new(name: "click", volume: 0.5, classes: "flex gap-2") do %>
  <button type="button" data-sound>Next</button>
<% end %>

<%= render "shared/components/sound/sound", name: "click", volume: 0.5, classes: "flex gap-2" do %>
  <button type="button" data-sound>Next</button>
<% end %>

<%# A message in a Turbo Stream that plays once as it appears %>
<%= render Sound::Component.new(tag: :li, play_on_connect: "notification") do %>…<% end %>
<%= render "shared/components/sound/sound", tag: :li, play_on_connect: "notification" do %>…<% end %>

<%# Mute button: works anywhere, it brings its own controller %>
<%= render Sound::Component::MuteButtonComponent.new(label: "Mute interface sounds", show_label: true) %>
<%= render "shared/components/sound/mute_button", label: "Mute interface sounds", show_label: true %>
```

**Wrapper options** (`Sound::Component` / `shared/components/sound/sound`)

| Option | Default | Description |
| ------ | ------- | ----------- |
| `tag` | `:div` | The wrapper element, e.g. `:div`, `:section`, `:li` |
| `name` | `"tap"` | Default sound for elements with an empty `data-sound` |
| `volume` | `1` | Volume for this wrapper, 0 to 1, multiplied with the global volume |
| `respect_motion` | `true` | Start muted for people who prefer reduced motion, until they unmute |
| `play_on_connect` | `nil` | A sound played once when the element appears |
| `classes` | `nil` | Additional CSS classes |
| `html_options` | `{}` | Other HTML attributes (`id`, `aria`, `data`, …). An extra `data: { controller: … }` is kept alongside `sound`. |

**Mute button options** (`Sound::Component::MuteButtonComponent` / `shared/components/sound/mute_button`)

| Option | Default | Description |
| ------ | ------- | ----------- |
| `label` | `"Mute sounds"` | Accessible name, and the visible text when `show_label` is true |
| `show_label` | `false` | Show the label next to the icon |
| `size` | `:md` / `"md"` | `sm`, `md`, or `lg` |
| `classes` | `nil` | Additional CSS classes for the button |

---

## Installation

1. Copy `sound_controller.js` into `app/javascript/controllers/`. It has no dependencies.
2. Put the controller on `<body>` once. Every element in the app can then play a sound:

```erb
<body data-controller="sound">
  <button type="button" data-sound="tap">Publish</button>
  <button type="button" data-action="sound#play" data-sound-name-param="success">Save</button>
</body>
```

You can also put the controller on any wrapper instead. Mute and volume are global either way.

---

## Usage Patterns

### One attribute: `data-sound`

The simplest way. No actions to wire, and it also covers elements added later by Turbo.

```erb
<button type="button" data-sound="tap">Publish</button>        <%# press and release halves %>
<button type="button" data-sound="success">Save</button>       <%# no halves: plays on click %>
<input type="checkbox" role="switch" data-sound>               <%# a switch, from the pointer or Space %>
<button type="button" aria-pressed="false" data-sound="toggle">Bold</button> <%# switch halves, from aria-pressed %>
<input type="range" min="0" max="10" data-sound>               <%# a rising note per step %>
<input type="hidden" data-slider-target="input" data-sound>    <%# the same, on the Slider component's hidden input %>
<select data-sound="tick">…</select>                           <%# plays on change, like radios %>
```

| Element | Behavior |
| ------- | -------- |
| Button, link, any other element | Sounds with halves (`tap`, `click`, `copy`, `bloom`, `press`) play one half on `pointerdown` and the other on `pointerup`. Other sounds play on `click`. An empty `data-sound` uses the controller's `name` value (`tap`). |
| `input type="checkbox"` with an empty `data-sound` or `"toggle"` | A switch: one half when the pointer or Space goes down, the other when it comes up. A press on its `<label>` counts. |
| Element with `aria-pressed` / `aria-checked` and `data-sound="toggle"` | A switch: the press half for the state it is about to take when the pointer, Space or Enter goes down, the release when it comes up. A click with neither behind it plays `toggle_on` or `toggle_off` from the new state. |
| `input type="range"`, or the Slider component's hidden input (`data-slider-target="input"`) | A note per step, rising an octave from `min` to `max` (`step` unless named) |
| Other inputs, `select`, `textarea`, radios | Plays on `change` |

Do not combine `data-sound` with `sound#…` actions on the same element.

### Plain button (one sound on click)

```erb
<button type="button" data-action="sound#play" data-sound-name-param="success">Save</button>
```

### Pressable button (a sound going down, a lighter one coming up)

Bind all three events. Space and Enter play the halves on keydown and keyup with no extra actions. `click` only plays for a click with no pointer or key behind it (a screen reader), with both halves a moment apart, so nothing plays twice.

```erb
<button type="button" data-action="pointerdown->sound#press pointerup->sound#release click->sound#release">
  Publish
</button>

<%# Custom halves %>
<button type="button"
  data-action="pointerdown->sound#press pointerup->sound#release click->sound#release"
  data-sound-press-param="tap_down"
  data-sound-release-param="tap_up">
  Tap
</button>
```

### Switch (checkbox with `role="switch"`)

The pointer actions go on the `<label>`, the `change` action on the checkbox. Space plays the press when it goes down and the release when it comes up.

```erb
<label for="notifications_mentions" data-action="pointerdown->sound#togglePress pointerup->sound#toggleRelease">
  Mentions
  <input type="checkbox" role="switch" id="notifications_mentions" data-action="change->sound#toggle">
</label>
```

### Radio group or segmented control

```erb
<fieldset data-controller="sound" data-sound-name-value="tick">
  <input type="radio" name="layout" value="list" data-action="change->sound#play">
  <input type="radio" name="layout" value="board" data-action="change->sound#play">
</fieldset>
```

### Slider (a note per step, rising an octave)

```erb
<input type="range" min="0" max="10" data-action="input->sound#step">
```

Also works on the hidden input of the Slider component (`data-slider-target="input"`).

### Rails form (sound from the server's answer)

`turbo:submit-end` plays `success` for a 2xx response and `error` otherwise (for example a 422).

```erb
<%= form_with model: @invite, data: { controller: "sound", action: "turbo:submit-end->sound#result" } do |form| %>
  <%= form.email_field :email, required: true, data: { action: "invalid->sound#play", sound_name_param: "error" } %>
  <%= form.submit "Send invite" %>
<% end %>
```

Do not add `:prevent` to the `invalid` action: it hides the browser's own validation message and stops it focusing the field.

### Mute button and volume

```erb
<div data-controller="sound">
  <button type="button" data-sound-target="mute" data-action="sound#toggleMute" aria-pressed="false" aria-label="Mute interface sounds">…</button>
  <input type="range" min="0" max="100" aria-label="Volume" data-sound-target="volume" data-action="input->sound#setVolume">
</div>
```

`aria-pressed` on mute targets and the value of volume targets are kept in sync automatically.

### From the server (Turbo Streams, Action Cable, flash messages)

An element with its own sound controller and `play-on-connect` value plays once as it appears. The attribute is removed after it plays, so a Turbo cache restore never plays it again.

```erb
<%# app/views/messages/_message.html.erb, rendered by turbo_stream.prepend or broadcast_prepend_to %>
<li data-controller="sound" data-sound-play-on-connect-value="notification">
  <%= message.body %>
</li>

<%# A flash message after a redirect %>
<div data-controller="sound" data-sound-play-on-connect-value="success"><%= notice %></div>
```

Browsers block audio until the first click or key press on the page. Anything that arrives before then is shown without a sound.

### From JavaScript

Dispatch a `sound:play` event. The nearest sound controller plays it (on `window`, one controller plays it):

```js
element.dispatchEvent(new CustomEvent("sound:play", { bubbles: true, detail: { name: "notification", volume: 0.8 } }));
```

Or declare an outlet to the element that has the sound controller and call `play`:

```js
// <div data-controller="inbox" data-inbox-sound-outlet="body">
static outlets = ["sound"];

messageReceived() {
  if (this.hasSoundOutlet) this.soundOutlet.play("notification", { volume: 0.8, pitch: 1 });
}
```

---

## Stimulus Controller

### Actions

| Action | Bind to | Description |
| ------ | ------- | ----------- |
| `sound#play` | `click`, `change`, `submit`, `invalid`, … | Plays `data-sound-name-param`, or the controller's `name` value. Optional `data-sound-volume-param` (0–1) and `data-sound-pitch-param` (multiplier, 1 = unchanged). |
| `sound#press` | `pointerdown` | Plays `data-sound-press-param` (default `press`). Optional `data-sound-within-param` (CSS selector): only presses inside that part of the element count. |
| `sound#release` | `pointerup` and `click` | Plays `data-sound-release-param` (default `release`) for a press that started on the same element. Space and Enter play the halves on keydown and keyup on their own; a click with no key or pointer behind it plays both. |
| `sound#togglePress` | `pointerdown` on a switch's label | Plays the press half for the state the switch is about to take. Space on the checkbox plays it on keydown. |
| `sound#toggleRelease` | `pointerup` on a switch's label | Plays the release half. |
| `sound#toggle` | `change` on a checkbox, or `click` on a button with `aria-checked` / `aria-pressed` | Plays `toggle_on` or `toggle_off` for the new state. Silent after a pointer or key gesture (the halves already played). On a button with `aria-pressed` / `aria-checked`, Space and Enter play the halves on their own; add `pointerdown->sound#togglePress pointerup->sound#toggleRelease` on the button for pointer halves. Override with `data-sound-on-param` / `data-sound-off-param`. |
| `sound#step` | `input` on a range input | One note per step, rising an octave from `min` to `max`. Override the note with `data-sound-name-param`. |
| `sound#hover` | `pointerenter` | Quiet, throttled sound for mouse only (ignores touch and pen). |
| `sound#result` | `turbo:submit-end` on a form | `success` for a successful response, `error` otherwise. |
| `sound#toggleMute`, `sound#mute`, `sound#unmute` | `click` | Change the global mute preference. |
| `sound#setVolume` | `input` on a range input | Sets the global volume and plays a short preview tick. |

### Values

| Value | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `name` | String | `"tap"` | Sound used when an action has no name param |
| `volume` | Number | `1` | Volume for this controller (0–1), multiplied with the global volume |
| `respectMotion` | Boolean | `true` | Start muted for users who prefer reduced motion, until they choose otherwise |
| `playOnConnect` | String | `""` | A sound played once when the element connects (Turbo Streams, flash). Removed after it plays. |

### Targets

| Target | Description |
| ------ | ----------- |
| `mute` | Mute buttons. `aria-pressed` is kept in sync (`true` = muted). |
| `volume` | Range inputs (or a Slider's hidden input) kept in sync with the saved volume |
| `indicator` | Optional visual echo. Its child elements pulse when a sound plays. An indicator inside the triggering element reacts only to that element. |

### State and Events

| Name | Where | Description |
| ---- | ----- | ----------- |
| `data-sound-muted="true\|false"` | Controller element (set by the controller) | Style muted states with `group-data-[sound-muted=true]:…` |
| `sound:play` | Dispatch on an element or on `window` | Plays `detail.name` (with optional `detail.volume` and `detail.pitch`). The nearest sound controller plays it. |
| `sound:played` | Dispatched on the controller element | `event.detail.name` is the sound that played |
| `sound:change` | Dispatched on `window` | Mute or volume changed |
| `localStorage` `sound:muted`, `sound:volume` | Browser storage | The saved preferences. Falls back to memory when storage is blocked. |

---

## Sounds

| Name | Character | Use for |
| ---- | --------- | ------- |
| `tick` | Light detent | Selections, segmented controls, picking an option |
| `hover` | Softer, lower detent | Opening a menu or select |
| `tap` | Firm press and release (`tap_down` / `tap_up`) | Primary buttons |
| `click` | Soft press and release (`click_down` / `click_up`) | Secondary buttons |
| `press` / `release` | The default halves of `sound#press` / `sound#release` | Any pressable button |
| `pop` | One round bubble | Adding an item, a small positive moment |
| `toggle_on` / `toggle_off` | Switch thrown, higher for on, lower for off | Switches and toggle buttons |
| `success` | Three marimba notes rising | Saved, sent, completed |
| `error` | Low and soft | Rejected input, a failed request |
| `warning` | Two careful knocks | Needs attention, not an error |
| `notification` | Two glass notes | A new message or mention |
| `done` | Warm chord | A long task finished (export, upload) |
| `ready` | One warm note | Connected, loaded, ready |
| `bloom` | Opening chord | Going live, publishing |
| `sparkle` | Harp run and swell | Celebrations, achievements. Use rarely. |
| `glint` | Bell and its fifth | Unlocks, upgrades, small rewards |
| `copy` | Rising pair | Copied to clipboard |
| `page` | Soft whoosh | Opening a panel or moving between steps |
| `close` | Whoosh closing, settling | Closing a panel, a drawer, or a modal |
| `drop` | Dull click and low thump | Dropping a dragged item into place |
| `delete` | Falling brush and knock | Removing an item, clearing a field |
| `step` | One struck note | Used by `sound#step` on sliders |

Also accepted: the two halves of switches (`toggle_press_on`, `toggle_press_off`, `toggle_release_on`, `toggle_release_off`) and the aliases `toggle` (`toggle_on`), `chime` (`notification`), `droplet` (`pop`), `button` (`tap`), `dismiss` (`close`), and `remove` (`delete`). Dashes work in place of underscores (`toggle-on`). Unknown names are ignored silently.

To change a sound or add one, edit its entry in `RECIPES` near the top of the controller and give it a loudness trim in `LEVELS`.

### Tuning a sound

Change one thing, listen, repeat. Name what is wrong, then reach for the matching knob:

| What you hear | What to change |
| ------------- | -------------- |
| Too high or too low | `tune(recipe, { pitch })` in semitones. Notes move together, so chords stay in tune. In a recipe: the tone frequencies, or the note constants (`A4`, `E5`). |
| Too harsh or thin | `tune(recipe, { brightness: 0.8 })`. In a recipe: a lower `Part.click` / `Part.ring` frequency, or a lower bandpass `q` (wider, softer). |
| Too muffled or dull | `brightness` above 1, a higher click frequency, or a harder mallet (`Part.contact` at 2000 to 3000 Hz instead of 1000 to 1500). |
| Too long or lingering | `tune(recipe, { length: 0.7 })`. In a recipe: a shorter `decay`. Every ring decays exponentially and reaches -60 dB at its `decay`. |
| Too short or clipped | `length` above 1, or a longer `decay`. Give whooshes a longer `attack` so they swell in. |
| No weight, too light | Add a `Part.thud` (low-passed noise around 100 to 200 Hz) or a `Part.knock` under the click. |
| Too dry or too distant | `tune(recipe, { room })`, or the cue's `room` option (1 is dry, 2 rings out). |
| Feels robotic when repeated | Give the cue a `vary` option, for example `{ pitch: 0.02, level: 0.1 }`. Leave it `null` for chords, where drift would put notes out of tune. |
| Too loud or quiet next to the others | Its trim in `LEVELS`, in dB. Call `suggestLevel` for a suggestion (below), then trust your ears. |

`tune` makes a variation of an existing cue without rebuilding it. Add the result after `RECIPES`, with its own trim:

```javascript
RECIPES.soft_tap = tune(RECIPES.tap, { length: 0.8, brightness: 0.85 });
LEVELS.soft_tap = 9.5;
```

The Sound lab on the [Sound docs page](https://railsblocks.com/docs/sound#sound-lab) has the same knobs as sliders. It plays the result through your mute and volume settings, measures its level, and gives you the lines to paste.

To check a level, render the sound offline from the browser console on any page that loads the controller. `suggestLevel` measures its peak and suggests a trim: presses, clicks, and whooshes aim for -20 dBFS and ringing notes for -16. A few sounds sit off target on purpose (release halves, `hover`, and `step` are lighter, `tap` is firmer), so treat the suggestion as a starting point.

```javascript
const { suggestLevel } = await import("controllers/sound_controller");
await suggestLevel("drop"); // { kind: "click", peak: -20.3, target: -20, trim: 9.5 }
```

---

## Browser Behavior

- **Autoplay**: browsers only allow audio after the user's first click or key press. Sounds before that are dropped, not queued.
- **Touch**: a press waits up to 70 ms before playing. If the touch turns into a scroll, the sound never plays. A quick tap plays the press and release in order when the finger lifts.
- **Reduced motion**: with `respectMotion` on (the default), users who prefer reduced motion start muted until they unmute. Changing the system setting while the page is open is picked up.
- **Late sounds**: if the browser takes longer than 300 ms to wake its audio up, the sound is dropped rather than played late.
- **iOS and iPadOS**: where the Audio Session API exists (Safari 16.4+), the controller sets it to `ambient`, so sounds mix with music or podcasts instead of pausing them, and follow the silent switch. An app that already set its own audio session type keeps it.
- **Key repeat**: holding a key down plays once.
- **Sliders**: notes and volume previews are throttled while dragging, but the last one always plays, so the final position is heard.
- **Disabled**: disabled controls (including those inside a disabled `<fieldset>`) and anything inside an `aria-disabled="true"` or `inert` container stay silent.
- **No Web Audio**: the controller does nothing. No errors are thrown.

---

## Examples

| File | Shows | Also requires |
| ---- | ----- | ------------- |
| `_1_sound_board.html.erb` | Every sound, with a mute button | |
| `_2_pressable_buttons.html.erb` | Keycap buttons with press and release sounds | |
| `_3_switches.html.erb` | Switches with two-part sounds | |
| `_4_segmented_control.html.erb` | Radio-group segmented control with ticks | |
| `_5_form_feedback.html.erb` | Rails form: native validation error and server result | An endpoint that answers 2xx or 422 (see Example Endpoints) |
| `_6_notification_toast.html.erb` | Toasts with a notification or done sound | Toast component (`window.toast`). Without it the sounds still play. |
| `_7_select.html.erb` | Select with an opening detent and a tick per option | Select component (`select_controller.js`, Tom Select) |
| `_8_sound_preferences.html.erb` | Mute button and volume slider | Slider component, or a plain `<input type="range">` |
| `_9_stepped_slider.html.erb` | Slider with a rising note per step | Slider component, or a plain `<input type="range">` |
| `_10_data_sound_attribute.html.erb` | `data-sound` on buttons, a switch, a slider, and a select | Slider component |
| `_11_clipboard.html.erb` | Copy button with the `copy` sound | Clipboard component (`clipboard_controller.js`, Floating UI) |
| `_12_incoming_messages.html.erb` | Turbo Stream messages that play `notification` as they appear | An endpoint that renders the message in a Turbo Stream (see Example Endpoints) |

### Example Endpoints

Examples 5 and 12 talk to the server. These are the demo endpoints behind them: copy them, or point the examples at your own actions.

```ruby
# config/routes.rb
post "/sound/invite", to: "sound_invites#create", as: "sound_invite"
post "/sound/message", to: "sound_messages#create", as: "sound_message"
```

```ruby
# app/controllers/sound_invites_controller.rb
# The endpoint behind the Sound "Form feedback" example.
#
# The form plays its sound from the response status (turbo:submit-end->sound#result):
# 2xx plays "success", anything else plays "error". The Turbo Stream updates the hint,
# which is an aria-live region, so the result is announced as well as heard.
class SoundInvitesController < ApplicationController
  TAKEN_EMAIL = "taken@example.com".freeze

  def create
    email = params[:email].to_s.strip

    if !email.match?(URI::MailTo::EMAIL_REGEXP)
      render_hint "Enter a valid email address.", :error, status: :unprocessable_content
    elsif email.casecmp?(TAKEN_EMAIL)
      render_hint "#{email} is already on the team.", :error, status: :unprocessable_content
    else
      render_hint "Invite sent to #{email}.", :success
    end
  end

  private

  def render_hint(message, state, status: :ok)
    color = state == :success ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"

    render turbo_stream: turbo_stream.update("sound_invite_hint", helpers.tag.span(message, class: color)), status: status
  end
end
```

```ruby
# app/controllers/sound_messages_controller.rb
# The endpoint behind the Sound "Incoming messages" example.
#
# Each new message carries its own sound controller with a play-on-connect value, so it plays
# "notification" once as the Turbo Stream adds it to the page. In your app this markup usually
# lives in a partial (turbo_stream.prepend "messages", partial: "messages/message"), and
# broadcast_prepend_to from a model works the same way.
class SoundMessagesController < ApplicationController
  MESSAGES = [
    ["Maya", "Can you review the pricing page today?"],
    ["Leo", "The deploy finished, all green."],
    ["Priya", "Pushed the fix for the login bug."],
    ["Sam", "Lunch at 12:30?"]
  ].freeze

  def create
    sender, text = MESSAGES.sample.map { |value| ERB::Util.html_escape(value) }

    render turbo_stream: turbo_stream.prepend("sound_messages", <<~HTML)
      <li class="flex items-start gap-3 px-4 py-3" data-controller="sound" data-sound-play-on-connect-value="notification">
        <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200" aria-hidden="true">#{sender.first}</span>
        <span class="min-w-0 text-sm">
          <span class="block font-medium text-neutral-900 dark:text-neutral-50">#{sender}</span>
          <span class="block truncate text-neutral-500 dark:text-neutral-400">#{text}</span>
        </span>
      </li>
    HTML
  end
end
```

---

## Accessibility

- Sound is never the only feedback: pair every sound with a visible change (state, message, toast).
- Mute buttons use `aria-pressed`. Keep the accessible name static (for example "Mute" or "Mute interface sounds") and let `aria-pressed` carry the state. Do not swap the visible text between "Sound on" and "Muted" while an `aria-label` says something else.
- Form errors keep the browser's native validation message. Server results should update an `aria-live` region.
- Offer a mute control wherever sounds are enabled, ideally in your settings.

---

## AI Instructions

### Choose An Implementation

- **`data-sound` attribute**: The default. Add the controller once on `<body>`, then add `data-sound="name"` to the elements that should make a sound.
- **Stimulus actions**: Use when you need custom halves, params, or events such as `invalid` and `turbo:submit-end`.
- **`play-on-connect` value**: Use for sounds triggered by the server (Turbo Streams, Action Cable, flash messages).
- **Plain ERB examples**: Use when you need a ready-made pattern (sound board, preferences panel, switch list). Copy the example and adapt the markup.
- **Shared partial**: Use `shared/components/sound/sound` for a wrapper with its own default sound, volume, or play-on-connect, and `shared/components/sound/mute_button` for a mute control, rendered with locals.
- **ViewComponent**: Use `Sound::Component` and `Sound::Component::MuteButtonComponent` for the same pieces with a Ruby API.

### Quick Reference

- **Controller**: `app/javascript/controllers/sound_controller.js` (no dependencies)
- **Setup**: `<body data-controller="sound">`
- **Vanilla examples**: `app/views/components/sound/`
- **Shared partials**: `render "shared/components/sound/sound"`, `render "shared/components/sound/mute_button"` (files in `app/views/shared/components/sound/`)
- **ViewComponents**: `render Sound::Component.new(...)`, `render Sound::Component::MuteButtonComponent.new(...)` (files in `app/components/sound/`)
- **One attribute**: `data-sound="tap"` (button), `data-sound` (checkbox switch or range), `data-sound="tick"` (select)
- **Play on click**: `data-action="sound#play" data-sound-name-param="success"`
- **From the server**: `data-controller="sound" data-sound-play-on-connect-value="notification"`
- **From JavaScript**: `dispatchEvent(new CustomEvent("sound:play", { bubbles: true, detail: { name } }))`
- **Button halves**: `data-action="pointerdown->sound#press pointerup->sound#release click->sound#release"`
- **Switch**: label `data-action="pointerdown->sound#togglePress pointerup->sound#toggleRelease"`, checkbox `data-action="change->sound#toggle"`
- **Range**: `data-action="input->sound#step"`
- **Turbo form**: `data-action="turbo:submit-end->sound#result"` on the form

### Implementation Checklist

- Install the controller once and put it on `<body>` (or one wrapper). Do not add a separate controller to every element.
- Pick the sound from the Sounds table by meaning: `success` for completion, `error` for failure, `tick` for selection, `notification` for incoming messages.
- For buttons with press and release sounds, bind all three events: `pointerdown`, `pointerup`, and `click`.
- For switches, put the pointer actions on the label and `change->sound#toggle` on the checkbox.
- Always include a mute control when adding sounds to an app, using `data-sound-target="mute"` and `sound#toggleMute`.
- Keep every visual state change. Sound accompanies feedback, it never replaces it.
- When an example lists another component as a requirement (Toast, Select, Slider), install it or use the documented plain alternative.

### Common Patterns

- **Settings switches**: `_3_switches.html.erb`.
- **Primary action buttons**: `sound#press` / `sound#release` with the defaults, or `tap_down` / `tap_up` for a firmer feel.
- **Forms**: `turbo:submit-end->sound#result` on the form and `invalid->sound#play` with `error` on required fields.
- **Incoming messages**: render each message with `data-controller="sound" data-sound-play-on-connect-value="notification"` (see `_12_incoming_messages.html.erb`), or dispatch `sound:play` from the controller that receives it, together with a visible toast or badge.
- **Copy buttons**: `data-sound="copy"` on the Clipboard button.
- **Preferences page**: `_8_sound_preferences.html.erb`.
- **Drawers, modals, and slideovers**: `page` when they open and `close` when they close.
- **Sortable lists and drag and drop**: `drop` when the item lands in place, `delete` when it is removed.
- **Re-voicing a sound**: when asked to make a sound softer, shorter, lower, and so on, use the Tuning a sound table: change one knob at a time, prefer `tune(...)` over rewriting the recipe, and give any new recipe a trim in `LEVELS` (`suggestLevel("name")` suggests one).

### Common Mistakes

- Do not mix shared partial locals with ViewComponent arguments in the same example.
- Do not wrap every button in its own `Sound::Component`: one wrapper (or `<body data-controller="sound">`) covers everything inside it.
- Do not play sounds on page load or from a Turbo Stream before the user has interacted: browsers block it and the sound is dropped.
- Do not add sounds to every element. Reserve them for meaningful moments: confirmations, errors, toggles, and incoming messages.
- Do not use `sound#hover` on touch-first UI or on long lists. It is mouse-only and throttled, but still easy to overuse.
- Do not add `:prevent` to `invalid->sound#play`: it hides the native validation message and breaks keyboard and screen reader feedback.
- Do not invent sound names. Use only the names in the Sounds table. Unknown names play nothing.
- Do not bind `sound#press` without `sound#release` on `pointerup` and `click`.
- Do not combine `data-sound` with `sound#…` actions on the same element: the sound would be wired twice.
- Do not put `data-sound-play-on-connect-value` on an element rendered with the initial page and expect a sound: browsers block audio until the user interacts.
- Do not use `sound#play` on `pointerdown` for buttons that also need keyboard sounds without adding `keydown.enter` and `keydown.space` actions.
- Do not add a recipe without a `LEVELS` entry: the sound levels spec fails, and the sound will sit too loud or too quiet next to the others.
- Do not use `vary` with pitch drift on chords or runs of notes. Leave it `null` so the notes stay in tune.
- Do not store mute or volume yourself. Use the `mute` and `volume` targets: the controller saves and syncs them.
