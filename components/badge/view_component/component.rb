# frozen_string_literal: true

module Badge
  class Component < ViewComponent::Base
    VARIANTS = %i[neutral red orange yellow green blue purple pink].freeze
    SIZES = %i[sm md].freeze

    # @param text [String] The badge text content
    # @param variant [Symbol] Color variant: :neutral, :red, :orange, :yellow, :green, :blue, :purple, :pink
    # @param size [Symbol] Size: :sm (small), :md (regular/default)
    # @param pill [Boolean] Whether to use pill shape (rounded-full) instead of rounded corners
    # @param dot [Boolean] Whether to show a colored dot indicator
    # @param removable [Boolean] Whether to show a remove/close button
    # @param classes [String] Additional CSS classes for the wrapper
    def initialize(text:, variant: :neutral, size: :md, pill: false, dot: false, removable: false, classes: nil)
      super()
      @text = text
      @variant = VARIANTS.include?(variant) ? variant : :neutral
      @size = SIZES.include?(size) ? size : :md
      @pill = pill
      @dot = dot
      @removable = removable
      @classes = classes
    end

    def wrapper_classes
      [
        base_classes,
        size_classes,
        shape_classes,
        colors[:bg],
        colors[:text],
        colors[:outline],
        @classes
      ].compact.reject(&:empty?).join(" ")
    end

    def colors
      @colors ||= case @variant
                  when :red
                    {
                      bg: "bg-red-50 dark:bg-red-400/10",
                      text: "text-red-700 dark:text-red-400",
                      outline: "outline outline-red-600/20 dark:outline-red-400/25",
                      dot: "bg-red-500 dark:bg-red-400",
                      button_bg: "bg-red-100 dark:bg-red-400/10",
                      button_text: "text-red-600 dark:text-red-400",
                      button_hover: "hover:bg-red-200 hover:dark:bg-red-400/20",
                      button_outline: "outline outline-red-500/20 dark:outline-red-400/25"
                    }
                  when :orange
                    {
                      bg: "bg-orange-50 dark:bg-orange-400/10",
                      text: "text-orange-700 dark:text-orange-400",
                      outline: "outline outline-orange-600/20 dark:outline-orange-400/25",
                      dot: "bg-orange-500 dark:bg-orange-400",
                      button_bg: "bg-orange-100 dark:bg-orange-400/10",
                      button_text: "text-orange-600 dark:text-orange-400",
                      button_hover: "hover:bg-orange-200 hover:dark:bg-orange-400/20",
                      button_outline: "outline outline-orange-500/20 dark:outline-orange-400/25"
                    }
                  when :yellow
                    {
                      bg: "bg-yellow-50 dark:bg-yellow-400/10",
                      text: "text-yellow-700 dark:text-yellow-500",
                      outline: "outline outline-yellow-700/20 dark:outline-yellow-400/25",
                      dot: "bg-yellow-500 dark:bg-yellow-400",
                      button_bg: "bg-yellow-100 dark:bg-yellow-400/10",
                      button_text: "text-yellow-600 dark:text-yellow-400",
                      button_hover: "hover:bg-yellow-200 hover:dark:bg-yellow-400/20",
                      button_outline: "outline outline-yellow-500/20 dark:outline-yellow-400/25"
                    }
                  when :green
                    {
                      bg: "bg-green-50 dark:bg-green-400/10",
                      text: "text-green-700 dark:text-green-400",
                      outline: "outline outline-green-600/20 dark:outline-green-400/25",
                      dot: "bg-green-500 dark:bg-green-400",
                      button_bg: "bg-green-100 dark:bg-green-400/10",
                      button_text: "text-green-600 dark:text-green-400",
                      button_hover: "hover:bg-green-200 hover:dark:bg-green-400/20",
                      button_outline: "outline outline-green-500/20 dark:outline-green-400/25"
                    }
                  when :blue
                    {
                      bg: "bg-blue-50 dark:bg-blue-400/10",
                      text: "text-blue-700 dark:text-blue-400",
                      outline: "outline outline-blue-600/20 dark:outline-blue-400/25",
                      dot: "bg-blue-500 dark:bg-blue-400",
                      button_bg: "bg-blue-100 dark:bg-blue-400/10",
                      button_text: "text-blue-600 dark:text-blue-400",
                      button_hover: "hover:bg-blue-200 hover:dark:bg-blue-400/20",
                      button_outline: "outline outline-blue-500/20 dark:outline-blue-400/25"
                    }
                  when :purple
                    {
                      bg: "bg-purple-50 dark:bg-purple-400/10",
                      text: "text-purple-700 dark:text-purple-400",
                      outline: "outline outline-purple-700/20 dark:outline-purple-400/25",
                      dot: "bg-purple-500 dark:bg-purple-400",
                      button_bg: "bg-purple-100 dark:bg-purple-400/10",
                      button_text: "text-purple-600 dark:text-purple-400",
                      button_hover: "hover:bg-purple-200 hover:dark:bg-purple-400/20",
                      button_outline: "outline outline-purple-500/20 dark:outline-purple-400/25"
                    }
                  when :pink
                    {
                      bg: "bg-pink-50 dark:bg-pink-400/10",
                      text: "text-pink-700 dark:text-pink-400",
                      outline: "outline outline-pink-700/20 dark:outline-pink-400/25",
                      dot: "bg-pink-500 dark:bg-pink-400",
                      button_bg: "bg-pink-100 dark:bg-pink-400/10",
                      button_text: "text-pink-600 dark:text-pink-400",
                      button_hover: "hover:bg-pink-200 hover:dark:bg-pink-400/20",
                      button_outline: "outline outline-pink-500/20 dark:outline-pink-400/25"
                    }
                  else # :neutral
                    {
                      bg: "bg-neutral-50 dark:bg-neutral-400/10",
                      text: "text-neutral-700 dark:text-neutral-400",
                      outline: "outline outline-neutral-500/20 dark:outline-neutral-400/25",
                      dot: "bg-neutral-500 dark:bg-neutral-400",
                      button_bg: "bg-neutral-100 dark:bg-neutral-400/10",
                      button_text: "text-neutral-600 dark:text-neutral-400",
                      button_hover: "hover:bg-neutral-200 hover:dark:bg-neutral-400/20",
                      button_outline: "outline outline-neutral-500/20 dark:outline-neutral-400/25"
                    }
                  end
    end

    def remove_button_classes
      button_shape = @pill ? "rounded-full" : "rounded"
      [
        button_shape,
        colors[:button_bg],
        colors[:button_text],
        colors[:button_hover],
        colors[:button_outline],
        button_size_classes,
        "focus-visible:outline-neutral-500 focus-visible:dark:outline-neutral-400"
      ].join(" ")
    end

    def dot_classes
      [
        "rounded-full",
        colors[:dot],
        dot_size_classes
      ].join(" ")
    end

    private

    def base_classes
      "inline-flex items-center font-medium"
    end

    def size_classes
      case @size
      when :sm
        addon? ? "gap-1 pl-1.5 pr-1 py-0.5 text-[11px]" : "gap-0.5 px-1.5 py-0.5 text-[11px]"
      else # :md
        addon? ? "gap-1 pl-2 pr-1.5 py-1 text-xs" : "gap-1 px-2 py-1 text-xs"
      end
    end

    def shape_classes
      @pill ? "rounded-full" : "rounded-md"
    end

    def button_size_classes
      @size == :sm ? "p-0.5 text-[10px]" : "p-0.5 text-xs"
    end

    def dot_size_classes
      @size == :sm ? "p-[0.175rem]" : "p-1"
    end

    def icon_size_classes
      @size == :sm ? "size-2" : "size-2.5"
    end

    def addon?
      @dot || @removable
    end

    def render?
      @text.present?
    end

    attr_reader :text, :dot, :removable, :size

    def icon_size
      icon_size_classes
    end
  end
end
