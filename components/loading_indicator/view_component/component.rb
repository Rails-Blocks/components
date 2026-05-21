# frozen_string_literal: true

module LoadingIndicator
  class Component < ViewComponent::Base
    TYPES = %i[spinner dots bars progress].freeze
    SIZES = %i[xs sm md lg xl].freeze
    COLORS = %i[neutral primary red orange yellow green blue purple pink].freeze

    # @param type [Symbol] Loading indicator type: :spinner, :dots, :bars, :progress
    # @param size [Symbol] Size: :xs, :sm, :md, :lg, :xl
    # @param color [Symbol] Color variant: :neutral, :primary, :red, :orange, :yellow, :green, :blue, :purple, :pink
    # @param text [String] Optional loading text to display
    # @param progress [Integer] Progress percentage (0-100), only used when type is :progress
    # @param stepped [Boolean] Whether to use stepped animation for spinner (iOS-style)
    # @param classes [String] Additional CSS classes for the wrapper
    def initialize(type: :spinner, size: :md, color: :neutral, text: nil, progress: nil, stepped: false, classes: nil)
      super()
      @type = TYPES.include?(type) ? type : :spinner
      @size = SIZES.include?(size) ? size : :md
      @color = COLORS.include?(color) ? color : :neutral
      @text = text
      @progress = progress&.to_i&.clamp(0, 100)
      @stepped = stepped
      @classes = classes
    end

    def wrapper_classes
      base = "inline-flex items-center"
      gap = @text.present? ? "gap-2" : ""
      [base, gap, @classes].compact.reject(&:empty?).join(" ")
    end

    def spinner_classes
      [
        size_classes,
        color_classes,
        animation_classes
      ].join(" ")
    end

    def dot_classes(index)
      case index
      when 0 then "animation-delay: 0ms;"
      when 1 then "animation-delay: 150ms;"
      when 2 then "animation-delay: 300ms;"
      else ""
      end
      opacity = case index
                when 0 then ""
                when 1 then "opacity-80"
                when 2 then "opacity-60"
                else ""
                end
      [
        dot_size_classes,
        dot_color_classes,
        "rounded-full animate-bounce",
        opacity
      ].compact.reject(&:empty?).join(" ")
    end

    def dot_style(index)
      case index
      when 0 then "animation-delay: 0ms;"
      when 1 then "animation-delay: 150ms;"
      when 2 then "animation-delay: 300ms;"
      else ""
      end
    end

    def bar_classes(index)
      case index
      when 0 then "animation-delay: 0ms;"
      when 1 then "animation-delay: 100ms;"
      when 2 then "animation-delay: 200ms;"
      when 3 then "animation-delay: 300ms;"
      else ""
      end
      [
        bar_size_classes,
        bar_color_classes,
        "rounded-sm animate-pulse"
      ].join(" ")
    end

    def bar_style(index)
      case index
      when 0 then "animation-delay: 0ms;"
      when 1 then "animation-delay: 100ms;"
      when 2 then "animation-delay: 200ms;"
      when 3 then "animation-delay: 300ms;"
      else ""
      end
    end

    def progress_wrapper_classes
      [
        "overflow-hidden rounded-full",
        progress_bg_classes,
        progress_height_classes
      ].join(" ")
    end

    def progress_bar_classes
      [
        "h-full rounded-full transition-all duration-300 ease-out",
        progress_fill_classes
      ].join(" ")
    end

    def progress_width
      "width: #{@progress || 0}%"
    end

    def text_classes
      [
        "font-medium",
        text_size_classes,
        text_color_classes
      ].join(" ")
    end

    attr_reader :type, :text, :progress, :stepped

    private

    def size_classes
      case @size
      when :xs then "size-4"
      when :sm then "size-5"
      when :md then "size-6"
      when :lg then "size-8"
      when :xl then "size-10"
      else "size-6"
      end
    end

    def dot_size_classes
      case @size
      when :xs then "size-1"
      when :sm then "size-1.5"
      when :md then "size-2"
      when :lg then "size-2.5"
      when :xl then "size-3"
      else "size-2"
      end
    end

    def bar_size_classes
      case @size
      when :xs then "w-0.5 h-3"
      when :sm then "w-1 h-4"
      when :md then "w-1 h-5"
      when :lg then "w-1.5 h-6"
      when :xl then "w-2 h-8"
      else "w-1 h-5"
      end
    end

    def progress_height_classes
      case @size
      when :xs then "h-1"
      when :sm then "h-1.5"
      when :md then "h-2"
      when :lg then "h-3"
      when :xl then "h-4"
      else "h-2"
      end
    end

    def text_size_classes
      case @size
      when :xs then "text-xs"
      when :sm then "text-xs"
      when :md then "text-sm"
      when :lg then "text-base"
      when :xl then "text-lg"
      else "text-sm"
      end
    end

    def color_classes
      case @color
      when :neutral then "text-neutral-800 dark:text-neutral-200"
      when :primary then "text-red-600 dark:text-red-500"
      when :red then "text-red-600 dark:text-red-500"
      when :orange then "text-orange-600 dark:text-orange-500"
      when :yellow then "text-yellow-600 dark:text-yellow-500"
      when :green then "text-green-600 dark:text-green-500"
      when :blue then "text-blue-600 dark:text-blue-500"
      when :purple then "text-purple-600 dark:text-purple-500"
      when :pink then "text-pink-600 dark:text-pink-500"
      else "text-neutral-800 dark:text-neutral-200"
      end
    end

    def dot_color_classes
      case @color
      when :neutral then "bg-neutral-800 dark:bg-neutral-200"
      when :primary then "bg-red-600 dark:bg-red-500"
      when :red then "bg-red-600 dark:bg-red-500"
      when :orange then "bg-orange-600 dark:bg-orange-500"
      when :yellow then "bg-yellow-600 dark:bg-yellow-500"
      when :green then "bg-green-600 dark:bg-green-500"
      when :blue then "bg-blue-600 dark:bg-blue-500"
      when :purple then "bg-purple-600 dark:bg-purple-500"
      when :pink then "bg-pink-600 dark:bg-pink-500"
      else "bg-neutral-800 dark:bg-neutral-200"
      end
    end

    def bar_color_classes
      dot_color_classes
    end

    def progress_bg_classes
      case @color
      when :neutral then "bg-neutral-200 dark:bg-neutral-700"
      when :primary then "bg-red-100 dark:bg-red-900/30"
      when :red then "bg-red-100 dark:bg-red-900/30"
      when :orange then "bg-orange-100 dark:bg-orange-900/30"
      when :yellow then "bg-yellow-100 dark:bg-yellow-900/30"
      when :green then "bg-green-100 dark:bg-green-900/30"
      when :blue then "bg-blue-100 dark:bg-blue-900/30"
      when :purple then "bg-purple-100 dark:bg-purple-900/30"
      when :pink then "bg-pink-100 dark:bg-pink-900/30"
      else "bg-neutral-200 dark:bg-neutral-700"
      end
    end

    def progress_fill_classes
      case @color
      when :neutral then "bg-neutral-800 dark:bg-neutral-200"
      when :primary then "bg-red-600 dark:bg-red-500"
      when :red then "bg-red-600 dark:bg-red-500"
      when :orange then "bg-orange-600 dark:bg-orange-500"
      when :yellow then "bg-yellow-600 dark:bg-yellow-500"
      when :green then "bg-green-600 dark:bg-green-500"
      when :blue then "bg-blue-600 dark:bg-blue-500"
      when :purple then "bg-purple-600 dark:bg-purple-500"
      when :pink then "bg-pink-600 dark:bg-pink-500"
      else "bg-neutral-800 dark:bg-neutral-200"
      end
    end

    def text_color_classes
      case @color
      when :neutral then "text-neutral-700 dark:text-neutral-300"
      when :primary then "text-red-700 dark:text-red-400"
      when :red then "text-red-700 dark:text-red-400"
      when :orange then "text-orange-700 dark:text-orange-400"
      when :yellow then "text-yellow-700 dark:text-yellow-400"
      when :green then "text-green-700 dark:text-green-400"
      when :blue then "text-blue-700 dark:text-blue-400"
      when :purple then "text-purple-700 dark:text-purple-400"
      when :pink then "text-pink-700 dark:text-pink-400"
      else "text-neutral-700 dark:text-neutral-300"
      end
    end

    def animation_classes
      if @stepped
        "animate-[spin_0.8s_steps(8)_infinite]"
      else
        "animate-spin"
      end
    end
  end
end
