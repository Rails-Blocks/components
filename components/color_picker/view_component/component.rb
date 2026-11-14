# frozen_string_literal: true

module ColorPicker
  class Component < ViewComponent::Base
    FORMATS = %w[hex rgb hsl hsv oklch].freeze
    PLACEMENTS = %w[top top-start top-end right right-start right-end bottom bottom-start bottom-end left left-start left-end].freeze

    # Colors are written into style attributes, so only plain color syntax is accepted (hex,
    # rgb()/hsl()/oklch(), names). Anything with ; : { } quotes or backslashes is dropped,
    # which stops CSS injection from user-supplied values and swatches.
    SAFE_COLOR = %r{\A[#\w\s(),.%/+-]+\z}

    # The 2D area. "sv" is the classic saturation/brightness square for the current hue,
    # "hs"/"hv" put the hue on the x axis, "wheel" is a hue/saturation wheel, "none" hides it.
    AREAS = %w[sv hs hv wheel none].freeze
    AREA_LABELS = {
      "sv" => "Saturation and brightness",
      "hs" => "Hue and saturation",
      "hv" => "Hue and brightness",
      "wheel" => "Hue and saturation"
    }.freeze

    # Sliders available below the area. Opacity is added with `opacity: true`.
    SLIDERS = %w[hue saturation brightness].freeze
    SLIDER_LABELS = { "hue" => "Hue", "saturation" => "Saturation", "brightness" => "Brightness" }.freeze
    SLIDER_MAX = { "hue" => 360, "saturation" => 100, "brightness" => 100 }.freeze

    # The slider that controls whatever channel the area leaves out.
    DEFAULT_SLIDERS = {
      "sv" => %w[hue],
      "hs" => %w[brightness],
      "hv" => %w[saturation],
      "wheel" => %w[brightness],
      "none" => %w[hue saturation brightness]
    }.freeze

    # Size tokens scale the trigger and the whole panel together.
    SIZES = {
      "small" => { trigger: "size-7", panel: "w-56 space-y-2.5 p-2.5", grid: "h-32", sliders: "space-y-2.5", track: "h-2.5", handle: "size-3.5", preview: "size-7", control: "h-7", format: "w-10", square: "w-7", swatches: "gap-1.5 pt-2.5" },
      "medium" => { trigger: "size-9", panel: "w-64 space-y-3 p-3", grid: "h-40", sliders: "space-y-3", track: "h-3", handle: "size-4", preview: "size-8", control: "h-8", format: "w-11", square: "w-8", swatches: "gap-1.5 pt-3" },
      "large" => { trigger: "size-11", panel: "w-72 space-y-3.5 p-3.5", grid: "h-48", sliders: "space-y-3.5", track: "h-3.5", handle: "size-[18px]", preview: "size-9", control: "h-9", format: "w-12", square: "w-9", swatches: "gap-2 pt-3.5" }
    }.freeze

    attr_reader :id, :name, :value, :label, :swatches, :placement, :area, :sliders, :sheet_below, :native

    # @param id [String] Unique identifier for the trigger button
    # @param name [String] Optional hidden input name for form submissions
    # @param value [String] Initial color value (hex, rgb, hsl, hsv, oklch, or any CSS color)
    # @param label [String] Accessible label for the trigger and panel
    # @param format [Symbol, String] Output format (:hex, :rgb, :hsl, :hsv, :oklch)
    # @param size [Symbol, String] Picker size, trigger + panel (:small, :medium, :large)
    # @param area [Symbol, String] 2D area type (:sv, :hs, :hv, :wheel, :none)
    # @param sliders [Array<Symbol, String>] Sliders to show (:hue, :saturation, :brightness), defaults per area
    # @param opacity [Boolean] Enable the alpha channel slider
    # @param no_format_toggle [Boolean] Hide the format toggle button
    # @param no_eye_dropper [Boolean] Hide the EyeDropper button
    # @param uppercase [Boolean] Output uppercase values
    # @param inline [Boolean] Render the panel inline instead of in a dropdown
    # @param placement [String] Dropdown placement (Floating UI), e.g. "bottom-start"
    # @param sheet_below [Integer] Below this viewport width (px) the dropdown opens as a bottom sheet; 0 disables
    # @param native [Symbol, String] :auto uses the system picker on iPhone/iPad, true always where supported, false never
    # @param swatches [Array<String>, String] Swatches shown in the panel
    # @param show_value [Boolean] Show selected value text next to the trigger
    # @param disabled [Boolean] Disable the picker
    # @param required [Boolean] Accepted for form-builder compatibility. A color picker always holds a value, so it never blocks submission
    # @param classes [String] Additional wrapper classes
    def initialize(
      id: nil,
      name: nil,
      value: "#3b82f6",
      label: "Color",
      format: :hex,
      size: :medium,
      area: :sv,
      sliders: nil,
      opacity: false,
      no_format_toggle: false,
      no_eye_dropper: false,
      uppercase: false,
      inline: false,
      placement: "bottom-start",
      sheet_below: 640,
      native: :auto,
      swatches: [],
      show_value: true,
      disabled: false,
      required: false,
      classes: nil
    )
      super()
      @id = id || "color_picker_#{SecureRandom.hex(4)}"
      @name = name
      @value = safe_color(value) || "#3b82f6"
      @label = label
      @format = FORMATS.include?(format.to_s) ? format.to_s : "hex"
      @size = SIZES.key?(size.to_s) ? size.to_s : "medium"
      @area = AREAS.include?(area.to_s) ? area.to_s : "sv"
      @sliders = normalize_sliders(sliders)
      @opacity = opacity
      @no_format_toggle = no_format_toggle
      @no_eye_dropper = no_eye_dropper
      @uppercase = uppercase
      @inline = inline
      @placement = PLACEMENTS.include?(placement.to_s) ? placement.to_s : "bottom-start"
      @sheet_below = sheet_below.to_i
      @native = %w[auto true false].include?(native.to_s) ? native.to_s : "auto"
      @swatches = normalize_swatches(swatches)
      @show_value = show_value
      @disabled = disabled
      @required = required
      @classes = classes
    end

    def picker_format = @format

    def area? = @area != "none"
    def wheel? = @area == "wheel"
    def area_label = AREA_LABELS[@area]

    def opacity? = @opacity
    def uppercase? = @uppercase
    def inline? = @inline
    def disabled? = @disabled
    def required? = @required
    def format_toggle? = !@no_format_toggle
    def eye_dropper? = !@no_eye_dropper
    def show_value? = @show_value && !@inline

    def panel_id
      "#{id}_panel"
    end

    def sz
      SIZES[@size]
    end

    def wrapper_classes
      ["group/picker relative inline-flex items-center gap-3", @classes].compact.reject(&:blank?).join(" ")
    end

    def area_classes
      wheel? ? "aspect-square rounded-full" : "#{sz[:grid]} rounded-lg group-data-sheet/panel:h-48"
    end

    # The classic saturation/brightness gradient doubles as the pre-JS look of the "sv" area.
    def area_background
      @area == "sv" ? "bg-[linear-gradient(to_top,#000,transparent),linear-gradient(to_right,#fff,transparent)]" : "bg-neutral-200 dark:bg-neutral-700"
    end

    # Hue has a static fallback gradient; saturation and brightness are painted by the controller.
    def slider_background(slider)
      if slider == "hue"
        "bg-[linear-gradient(to_right,#f00_0%,#ff0_17%,#0f0_33%,#0ff_50%,#00f_67%,#f0f_83%,#f00_100%)]"
      else
        "bg-[linear-gradient(to_right,#000,#fff)]"
      end
    end

    private

    def normalize_sliders(sliders)
      return DEFAULT_SLIDERS[@area] if sliders.nil?

      Array(sliders).map(&:to_s) & SLIDERS
    end

    def normalize_swatches(swatches)
      values = swatches.is_a?(String) ? swatches.split(";") : Array(swatches)
      values.compact.map(&:to_s).map(&:strip).select { |color| safe_color(color) }
    end

    def safe_color(color)
      color = color.to_s.strip
      color if color.match?(SAFE_COLOR)
    end
  end
end
