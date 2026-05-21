# frozen_string_literal: true

module EmojiPicker
  class Component < ViewComponent::Base
    # @param id [String] Unique identifier for the emoji picker
    # @param name [String] Name attribute for the hidden input field
    # @param value [String] Pre-selected emoji value
    # @param placeholder [String] Placeholder text for visible input (if show_input is true)
    # @param auto_submit [Boolean] Whether to automatically submit the form when an emoji is selected
    # @param insert_mode [Boolean] Whether to insert emoji at cursor position instead of replacing entire value
    # @param target_selector [String] CSS selector for a specific input/textarea to insert emoji into
    # @param show_input [Boolean] Show text input displaying selected emoji
    # @param button_size [Symbol] Size of the trigger button (:sm, :md, :lg)
    # @param button_style [Symbol] Style variant for the trigger button (:ghost, :outline, :solid)
    # @param picker_position [Symbol] Position of the picker dropdown (:left, :center, :right)
    # @param classes [String] Additional CSS classes for the wrapper
    # @param button_classes [String] Additional CSS classes for the button
    # @param input_classes [String] Additional CSS classes for the input
    def initialize(
      id: nil,
      name: "emoji",
      value: nil,
      placeholder: "Select an emoji...",
      auto_submit: false,
      insert_mode: false,
      target_selector: nil,
      show_input: false,
      button_size: :md,
      button_style: :ghost,
      picker_position: :center,
      classes: nil,
      button_classes: nil,
      input_classes: nil
    )
      super()
      @id = id || "emoji_picker_#{SecureRandom.hex(4)}"
      @name = name
      @value = value
      @placeholder = placeholder
      @auto_submit = auto_submit
      @insert_mode = insert_mode
      @target_selector = target_selector
      @show_input = show_input
      @button_size = button_size
      @button_style = button_style
      @picker_position = picker_position
      @classes = classes
      @button_classes = button_classes
      @input_classes = input_classes
    end

    def wrapper_classes
      base = "relative"
      [base, @classes].compact.reject(&:empty?).join(" ")
    end

    def button_classes
      base = "outline-hidden shrink-0 flex items-center justify-center rounded-md focus:outline-hidden disabled:pointer-events-none disabled:opacity-50"

      size = case @button_size
             when :sm then "size-6 text-base"
             when :lg then "size-10 text-2xl"
             else "size-8 text-xl" # :md default
             end

      style = case @button_style
              when :outline
                "border border-neutral-200 dark:border-neutral-700 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              when :solid
                "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-700"
              else # :ghost default
                "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              end

      [base, size, style, @button_classes].compact.reject(&:empty?).join(" ")
    end

    def input_classes
      base = "form-control"
      [base, @input_classes].compact.reject(&:empty?).join(" ")
    end

    def picker_position_classes
      base = "hidden absolute z-50 mt-2 flex inset-x-0"

      position = case @picker_position
                 when :left then "justify-start"
                 when :right then "justify-end"
                 else "justify-center" # :center default
                 end

      [base, position].join(" ")
    end

    def controller_data
      data = {
        controller: "emoji-picker"
      }

      data[:'emoji-picker-auto-submit-value'] = @auto_submit if @auto_submit
      data[:'emoji-picker-insert-mode-value'] = @insert_mode if @insert_mode
      data[:'emoji-picker-target-selector-value'] = @target_selector if @target_selector.present?

      { data: data }
    end

    def button_has_emoji?
      @value.present? && !@insert_mode
    end

    def button_content
      if button_has_emoji?
        content_tag(:span, @value, class: "size-6 text-xl shrink-0 flex items-center justify-center")
      else
        emoji_icon_svg
      end
    end

    private

    def emoji_icon_svg
      icon_size = case @button_size
                  when :sm then "size-4"
                  when :lg then "size-6"
                  else "size-5" # :md default
                  end

      content_tag(:svg, xmlns: "http://www.w3.org/2000/svg", class: icon_size, width: "18", height: "18", viewBox: "0 0 18 18") do
        content_tag(:g, fill: "currentColor") do
          content_tag(:path, nil,
                      d: "M9,1C4.589,1,1,4.589,1,9s3.589,8,8,8,8-3.589,8-8S13.411,1,9,1Zm-4,7c0-.552,.448-1,1-1s1,.448,1,1-.448,1-1,1-1-.448-1-1Zm4,6c-1.531,0-2.859-1.14-3.089-2.651-.034-.221,.039-.444,.193-.598,.151-.15,.358-.217,.572-.185,1.526,.24,3.106,.24,4.638,.001h0c.217-.032,.428,.036,.583,.189,.153,.153,.225,.373,.192,.589-.229,1.513-1.557,2.654-3.089,2.654Zm3-5c-.552,0-1-.448-1-1s.448-1,1-1,1,.448,1,1-.448,1-1,1Z")
        end
      end
    end
  end
end
