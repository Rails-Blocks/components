# frozen_string_literal: true

module Switch
  class Component < ViewComponent::Base
    SIZES = %i[sm md lg].freeze
    LABEL_POSITIONS = %i[left right].freeze

    # @param label [String] The switch label text (optional if using just the switch)
    # @param name [String] The input name attribute for form submission
    # @param id [String] The input id attribute (auto-generated if not provided)
    # @param value [String] The input value attribute (default: "1")
    # @param checked [Boolean] Whether the switch is on
    # @param disabled [Boolean] Whether the switch is disabled
    # @param required [Boolean] Whether the switch is required
    # @param description [String] Optional description text below the label
    # @param size [Symbol] Size: :sm (small), :md (medium/default), :lg (large)
    # @param show_icons [Boolean] Whether to show check/x icons inside the switch
    # @param label_position [Symbol] Position of label: :left or :right (default)
    # @param error [String] Error message to display
    # @param classes [String] Additional CSS classes for the wrapper
    # @param switch_classes [String] Additional CSS classes for the switch track
    # @param label_classes [String] Additional CSS classes for the label element
    def initialize(
      label: nil,
      name: nil,
      id: nil,
      value: "1",
      checked: false,
      disabled: false,
      required: false,
      description: nil,
      size: :md,
      show_icons: false,
      label_position: :right,
      error: nil,
      classes: nil,
      switch_classes: nil,
      label_classes: nil
    )
      super()
      @label = label
      @name = name
      @id = id || generate_id
      @value = value
      @checked = checked
      @disabled = disabled
      @required = required
      @description = description
      @size = SIZES.include?(size) ? size : :md
      @show_icons = show_icons
      @label_position = LABEL_POSITIONS.include?(label_position) ? label_position : :right
      @error = error
      @classes = classes
      @switch_classes = switch_classes
      @label_classes = label_classes
    end

    def wrapper_classes
      base = "group flex"
      align_class = supporting_text? ? "items-start" : "items-center"
      gap_class = @label.present? ? "gap-2.5" : "gap-0"
      cursor_class = @disabled ? "cursor-not-allowed" : "cursor-pointer"
      direction_class = @label_position == :left ? "flex-row-reverse justify-end" : ""

      [base, align_class, gap_class, cursor_class, direction_class, @classes].compact.reject(&:empty?).join(" ")
    end

    def control_wrapper_classes
      classes = ["relative flex-shrink-0"]
      classes << "mt-0.5" if supporting_text? && @label.present?
      classes.join(" ")
    end

    def track_classes
      [
        base_track_classes,
        checked_track_classes,
        size_track_classes,
        state_track_classes,
        @switch_classes
      ].compact.reject(&:empty?).join(" ")
    end

    def thumb_classes
      [
        base_thumb_classes,
        size_thumb_classes,
        size_thumb_translate
      ].compact.reject(&:empty?).join(" ")
    end

    def label_classes
      base = "font-medium select-none"
      size_class = label_size_classes
      color_class = if @disabled
                      "text-neutral-400 dark:text-neutral-500"
                    elsif @error.present?
                      "text-red-700 dark:text-red-400"
                    else
                      "text-neutral-700 dark:text-neutral-300"
                    end

      [base, size_class, color_class, @label_classes].compact.reject(&:empty?).join(" ")
    end

    def description_classes
      size_class = case @size
                   when :sm then "text-[11px]"
                   when :lg then "text-sm"
                   else "text-xs"
                   end
      color_class = @disabled ? "text-neutral-400 dark:text-neutral-500" : "text-neutral-500 dark:text-neutral-400"

      [size_class, color_class, "leading-normal"].join(" ")
    end

    def error_classes
      size_class = case @size
                   when :sm then "text-[11px]"
                   when :lg then "text-sm"
                   else "text-xs"
                   end

      [size_class, "text-red-600 dark:text-red-400 leading-normal"].join(" ")
    end

    def text_content_classes
      gap_class = supporting_text? ? "gap-0.5" : "gap-0"
      ["min-w-0 flex-1 flex flex-col leading-snug", gap_class].join(" ")
    end

    def icon_size_classes
      case @size
      when :sm then "size-2.5"
      when :lg then "size-4"
      else "size-3"
      end
    end

    private

    def supporting_text?
      @description.present? || @error.present?
    end

    def label_size_classes
      case @size
      when :sm then supporting_text? ? "text-xs leading-snug" : "text-xs leading-none"
      when :lg then supporting_text? ? "text-base leading-snug" : "text-base leading-none"
      else supporting_text? ? "text-sm leading-snug" : "text-sm leading-none"
      end
    end

    def generate_id
      "switch_#{SecureRandom.hex(4)}"
    end

    def base_track_classes
      "relative rounded-full transition-all duration-150 ease-in-out " \
        "bg-neutral-200 border border-black/10 " \
        "group-hover:bg-neutral-300 " \
        "dark:bg-neutral-700 dark:border-white/10 dark:group-hover:bg-neutral-600 " \
        "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-neutral-600 " \
        "dark:peer-focus-visible:outline-neutral-200"
    end

    def checked_track_classes
      classes = ["peer-checked:border-white/10", "dark:peer-checked:border-black/20"]
      return classes.join(" ") if custom_checked_background?

      classes.unshift(
        "peer-checked:bg-neutral-800",
        "peer-checked:group-hover:bg-neutral-700",
        "dark:peer-checked:bg-neutral-50",
        "dark:peer-checked:group-hover:bg-neutral-100"
      )
      classes.join(" ")
    end

    def size_track_classes
      case @size
      when :sm then "w-8 h-5"
      when :lg then "w-14 h-8"
      else "w-10 h-6"
      end
    end

    def state_track_classes
      classes = []
      classes << "opacity-50 cursor-not-allowed" if @disabled
      classes.join(" ")
    end

    def base_thumb_classes
      "absolute bg-white rounded-full shadow-sm transition-all duration-150 ease-in-out " \
        "flex items-center justify-center " \
        "dark:bg-neutral-200 dark:peer-checked:bg-neutral-800"
    end

    def size_thumb_classes
      case @size
      when :sm then "top-[2px] left-[2px] w-4 h-4"
      when :lg then "top-[4px] left-[4px] w-[24px] h-[24px]"
      else "top-[3px] left-[3px] w-[18px] h-[18px]"
      end
    end

    def size_thumb_translate
      case @size
      when :sm then "peer-checked:translate-x-3"
      when :lg then "peer-checked:translate-x-6"
      else "peer-checked:translate-x-4"
      end
    end

    def custom_checked_background?
      classes = @switch_classes.to_s
      classes.match?(/(?:^|\s)(?:dark:)?peer-checked:bg-\S+/)
    end

    attr_reader :label, :name, :id, :value, :checked, :disabled, :required, :description, :size, :show_icons, :label_position, :error
  end
end
