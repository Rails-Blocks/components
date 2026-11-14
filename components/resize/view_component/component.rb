# frozen_string_literal: true

module Resize
  # Resizable panel group driven by the `resize` Stimulus controller.
  #
  #   <%= render Resize::Component.new(classes: "h-96 rounded-xl border") do |group| %>
  #     <% group.with_panel(default_size: 30, min_size: "160px", collapsible: true, handle_label: "Resize sidebar") do %>…<% end %>
  #     <% group.with_panel(min_size: 40) do %>…<% end %>
  #   <% end %>
  #
  # Handles are inserted between the panels automatically. Sizes are percentages
  # (30) or pixel strings ("240px"). With `storage: :cookie` the saved layout is
  # read from the request and rendered on the server, so it never flashes.
  class Component < ViewComponent::Base
    ORIENTATIONS = %i[horizontal vertical].freeze
    STORAGES = %i[local cookie].freeze
    HANDLES = %i[line grip pill].freeze

    PANEL_OPTIONS = %i[default_size min_size max_size collapsed_size].freeze

    # Each panel: content plus its options, in order.
    renders_many :panels, lambda { |**options, &block|
      @panel_options << validate_panel_options(options)
      block&.call
    }

    # @param orientation [Symbol] :horizontal (side by side) or :vertical (stacked)
    # @param handle [Symbol] Handle style: :line (1px line), :grip (line with a grip), :pill (floating pill in a gap)
    # @param storage_key [String] Saves the layout under this key. Unique per layout.
    # @param storage [Symbol] :local (localStorage) or :cookie (rendered on the server, no flash)
    # @param keyboard_step [Integer] Percent moved per arrow key press (x3 with Shift)
    # @param handle_classes [String] Extra classes for every handle
    # @param classes [String] Classes for the group: give it a height (and border, rounding…)
    # @param html [Hash] Extra attributes for the group element
    def initialize(orientation: :horizontal, handle: :line, storage_key: nil, storage: :local, keyboard_step: nil,
                   handle_classes: nil, classes: nil, html: {})
      super()
      @orientation = orientation.to_sym
      @handle = handle.to_sym
      @storage = storage.to_sym
      raise ArgumentError, "orientation must be one of #{ORIENTATIONS.join(', ')}" unless ORIENTATIONS.include?(@orientation)
      raise ArgumentError, "handle must be one of #{HANDLES.join(', ')}" unless HANDLES.include?(@handle)
      raise ArgumentError, "storage must be one of #{STORAGES.join(', ')}" unless STORAGES.include?(@storage)

      @storage_key = storage_key.presence
      @keyboard_step = keyboard_step
      @handle_classes = handle_classes
      @classes = classes
      @html = html
      @panel_options = []
    end

    def before_render
      raise ArgumentError, "Resize::Component needs at least two panels" if panels.size < 2
    end

    def horizontal?
      @orientation == :horizontal
    end

    def group_attributes
      data = { controller: "resize" }
      data[:resize_orientation_value] = "vertical" unless horizontal?
      data[:resize_storage_key_value] = @storage_key if @storage_key
      data[:resize_storage_value] = "cookie" if @storage_key && @storage == :cookie
      data[:resize_keyboard_step_value] = @keyboard_step if @keyboard_step

      @html.merge(
        class: ["flex", ("flex-col" unless horizontal?), @handle == :pill ? nil : "overflow-hidden", @classes, @html[:class]].compact.join(" "),
        data: data.merge(@html[:data] || {})
      )
    end

    def panel_attributes(index)
      options = @panel_options[index]
      data = { resize_target: "panel" }
      data[:resize_default_size] = options[:default_size] unless options[:default_size].nil?
      data[:resize_min_size] = options[:min_size] unless options[:min_size].nil?
      data[:resize_max_size] = options[:max_size] unless options[:max_size].nil?
      data[:resize_collapsible] = "" if options[:collapsible]
      data[:resize_collapsed_size] = options[:collapsed_size] unless options[:collapsed_size].nil?

      html = options[:html] || {}
      attributes = html.merge(
        id: options[:id] || html[:id],
        style: ["flex: #{format_flex(initial_sizes[index])} 1 0px", html[:style]].compact.join("; "),
        # Pill handles sit between separate cards, so their panels don't clip (shadows stay visible).
        class: [horizontal? ? "min-w-0" : "min-h-0", (@handle == :pill ? nil : "overflow-hidden"), options[:classes], html[:class]].compact.join(" "),
        data: data.merge(html[:data] || {})
      )
      attributes[:'data-collapsed'] = "" if initial_collapsed[index]
      attributes.compact
    end

    def panel_tag(index)
      @panel_options[index][:tag] || :div
    end

    # The handle after panel `index` takes its label from that panel.
    def handle_label(index)
      @panel_options[index][:handle_label] || "Resize panels"
    end

    def handle_attributes(index)
      {
        role: "separator",
        tabindex: 0,
        'aria-label': handle_label(index),
        class: [handle_style[:handle], @handle_classes].compact.join(" "),
        data: { resize_target: "handle" }
      }
    end

    def handle_style
      HandleStyles.fetch(@handle, horizontal?)
    end

    # Sizes rendered into the inline flex style. Matches what the controller will
    # compute, so nothing moves when JavaScript connects.
    def initial_sizes
      @initial_sizes ||= saved_layout&.fetch("sizes") || default_sizes
    end

    def initial_collapsed
      @initial_collapsed ||= saved_layout&.fetch("collapsed") || Array.new(@panel_options.size, false)
    end

    # Same fingerprint as the controller's `signature`, so a cookie saved before
    # the panel options changed is ignored on both sides.
    def signature
      options = @panel_options.map do |option|
        [
          option[:default_size],
          option[:min_size],
          option[:max_size],
          (option[:collapsible] ? "" : nil),
          option[:collapsed_size]
        ].map { |value| value.nil? ? "-" : value.to_s }.join(",")
      end.join("|")

      hash = 5381
      options.each_codepoint { |code| hash = ((hash << 5) + hash + code) & 0xFFFFFFFF }
      hash.to_s(36)
    end

    private

    def validate_panel_options(options)
      unknown = options.keys - (PANEL_OPTIONS + %i[collapsible handle_label id tag classes html])
      raise ArgumentError, "unknown panel option(s): #{unknown.join(', ')}" if unknown.any?

      options
    end

    # Percent sizes for the first render. Pixel sizes can't be resolved on the
    # server; those panels share the remaining space until the controller connects.
    def default_sizes
      given = @panel_options.map { |option| percent(option[:default_size]) }
      blanks = given.count(&:nil?)
      share = blanks.positive? ? [100 - given.compact.sum, 0].max / blanks.to_f : 0
      given.map { |size| size || share }
    end

    def percent(value)
      return nil if value.nil? || value.to_s.strip.end_with?("px")

      Float(value.to_s, exception: false)
    end

    def saved_layout
      return @saved_layout if defined?(@saved_layout)

      @saved_layout = read_cookie
    end

    def read_cookie
      return nil unless @storage_key && @storage == :cookie

      raw = request&.cookies&.[](@storage_key.gsub(/[^\w-]/, "_"))
      return nil if raw.blank?

      saved = JSON.parse(raw)
      count = @panel_options.size
      sizes = saved["sizes"]
      collapsed = saved["collapsed"]
      valid = sizes.is_a?(Array) && collapsed.is_a?(Array) && sizes.size == count && collapsed.size == count &&
              sizes.all? { |size| size.is_a?(Numeric) && size.finite? } &&
              (saved["v"].nil? || saved["v"] == signature)
      return nil unless valid

      { "sizes" => sizes, "collapsed" => collapsed.each_with_index.map { |value, i| value == true && @panel_options[i][:collapsible].present? } }
    rescue JSON::ParserError
      nil
    end

    def format_flex(size)
      format("%.3f", size.to_f).sub(/\.?0+\z/, "")
    end

    # Class strings live in full so Tailwind can find them.
    module HandleStyles
      LINE_HORIZONTAL = "relative z-10 w-px shrink-0 cursor-col-resize touch-none bg-black/10 outline-none before:absolute before:inset-y-0 before:-left-px before:-right-px before:bg-neutral-400 before:opacity-0 before:transition-opacity before:duration-150 after:absolute after:inset-y-0 after:-left-1.5 after:-right-1.5 hover:before:opacity-100 hover:before:delay-150 focus-visible:before:delay-0 data-[dragging]:before:delay-0 focus-visible:before:bg-neutral-900 focus-visible:before:opacity-100 data-[dragging]:before:bg-neutral-900 data-[dragging]:before:opacity-100 pointer-coarse:after:-left-5 pointer-coarse:after:-right-5 dark:bg-white/10 dark:before:bg-neutral-500 dark:focus-visible:before:bg-white dark:data-[dragging]:before:bg-white"
      LINE_VERTICAL = "relative z-10 h-px w-full shrink-0 cursor-row-resize touch-none bg-black/10 outline-none before:absolute before:inset-x-0 before:-top-px before:-bottom-px before:bg-neutral-400 before:opacity-0 before:transition-opacity before:duration-150 after:absolute after:inset-x-0 after:-top-1.5 after:-bottom-1.5 hover:before:opacity-100 hover:before:delay-150 focus-visible:before:delay-0 data-[dragging]:before:delay-0 focus-visible:before:bg-neutral-900 focus-visible:before:opacity-100 data-[dragging]:before:bg-neutral-900 data-[dragging]:before:opacity-100 pointer-coarse:after:-top-5 pointer-coarse:after:-bottom-5 dark:bg-white/10 dark:before:bg-neutral-500 dark:focus-visible:before:bg-white dark:data-[dragging]:before:bg-white"

      GRIP_HORIZONTAL = "group/handle relative z-10 w-px shrink-0 cursor-col-resize touch-none bg-black/10 outline-none transition-colors duration-150 ease-out hover:bg-black/20 focus-visible:bg-neutral-900 data-[dragging]:bg-neutral-900 motion-reduce:transition-none after:absolute after:inset-y-0 after:-left-2 after:-right-2 pointer-coarse:after:-left-5 pointer-coarse:after:-right-5 dark:bg-white/10 dark:hover:bg-white/25 dark:focus-visible:bg-white dark:data-[dragging]:bg-white"
      GRIP_VERTICAL = "group/handle relative z-10 h-px w-full shrink-0 cursor-row-resize touch-none bg-black/10 outline-none transition-colors duration-150 ease-out hover:bg-black/20 focus-visible:bg-neutral-900 data-[dragging]:bg-neutral-900 motion-reduce:transition-none after:absolute after:inset-x-0 after:-top-2 after:-bottom-2 pointer-coarse:after:-top-5 pointer-coarse:after:-bottom-5 dark:bg-white/10 dark:hover:bg-white/25 dark:focus-visible:bg-white dark:data-[dragging]:bg-white"
      GRIP_SHARED = "absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-neutral-400 shadow-xs transition-[color,border-color,scale] duration-150 ease-out group-hover/handle:border-black/20 group-hover/handle:text-neutral-700 group-focus-visible/handle:border-neutral-900 group-focus-visible/handle:text-neutral-900 group-data-[dragging]/handle:scale-110 group-data-[dragging]/handle:border-neutral-900 group-data-[dragging]/handle:text-neutral-900 motion-reduce:transition-none dark:border-white/15 dark:bg-neutral-800 dark:text-neutral-500 dark:group-hover/handle:border-white/30 dark:group-hover/handle:text-neutral-200 dark:group-focus-visible/handle:border-white dark:group-focus-visible/handle:text-white dark:group-data-[dragging]/handle:border-white dark:group-data-[dragging]/handle:text-white"

      PILL_HORIZONTAL = "group/handle relative z-10 flex w-4 shrink-0 cursor-col-resize touch-none items-center justify-center outline-none after:absolute after:inset-y-0 after:-left-1 after:-right-1 pointer-coarse:after:-left-3 pointer-coarse:after:-right-3"
      PILL_VERTICAL = "group/handle relative z-10 flex h-4 w-full shrink-0 cursor-row-resize touch-none items-center justify-center outline-none after:absolute after:inset-x-0 after:-top-1 after:-bottom-1 pointer-coarse:after:-top-3 pointer-coarse:after:-bottom-3"
      PILL_BAR_HORIZONTAL = "h-8 w-1 rounded-full bg-neutral-300 transition-[height,background-color] duration-200 ease-out group-hover/handle:h-12 group-hover/handle:bg-neutral-400 group-focus-visible/handle:h-12 group-focus-visible/handle:bg-neutral-900 group-data-[dragging]/handle:h-16 group-data-[dragging]/handle:bg-neutral-900 motion-reduce:transition-none dark:bg-neutral-600 dark:group-hover/handle:bg-neutral-400 dark:group-focus-visible/handle:bg-white dark:group-data-[dragging]/handle:bg-white"
      PILL_BAR_VERTICAL = "h-1 w-8 rounded-full bg-neutral-300 transition-[width,background-color] duration-200 ease-out group-hover/handle:w-12 group-hover/handle:bg-neutral-400 group-focus-visible/handle:w-12 group-focus-visible/handle:bg-neutral-900 group-data-[dragging]/handle:w-16 group-data-[dragging]/handle:bg-neutral-900 motion-reduce:transition-none dark:bg-neutral-600 dark:group-hover/handle:bg-neutral-400 dark:group-focus-visible/handle:bg-white dark:group-data-[dragging]/handle:bg-white"

      def self.fetch(style, horizontal)
        case style
        when :line
          { handle: horizontal ? LINE_HORIZONTAL : LINE_VERTICAL }
        when :grip
          { handle: horizontal ? GRIP_HORIZONTAL : GRIP_VERTICAL, grip: [GRIP_SHARED, horizontal ? "h-7 w-3.5" : "h-3.5 w-7"].join(" ") }
        when :pill
          { handle: horizontal ? PILL_HORIZONTAL : PILL_VERTICAL, bar: horizontal ? PILL_BAR_HORIZONTAL : PILL_BAR_VERTICAL }
        end
      end
    end
  end
end
