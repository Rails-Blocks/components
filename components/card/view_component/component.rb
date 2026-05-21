# frozen_string_literal: true

module Card
  class Component < ViewComponent::Base
    VARIANTS = %i[default elevated well].freeze
    PADDINGS = %i[none sm md lg].freeze
    SHADOWS = %i[none xs sm md lg xl].freeze
    ROUNDED = %i[none sm md lg xl full].freeze

    renders_one :header
    renders_one :body
    renders_one :footer
    renders_one :image, lambda { |src:, alt: "", position: :top, aspect: nil, classes: nil|
      ImageComponent.new(src: src, alt: alt, position: position, aspect: aspect, classes: classes)
    }

    # @param variant [Symbol] Style variant: :default, :elevated, :well
    # @param padding [Symbol] Content padding: :none, :sm, :md, :lg
    # @param shadow [Symbol] Shadow size: :none, :xs, :sm, :md, :lg, :xl
    # @param rounded [Symbol] Border radius: :none, :sm, :md, :lg, :xl, :full
    # @param border [Boolean] Show border
    # @param hoverable [Boolean] Add hover effects
    # @param clickable [Boolean] Make entire card clickable (adds cursor and hover)
    # @param divide [Boolean] Add dividers between header, body, footer
    # @param full_width_mobile [Boolean] Edge-to-edge on mobile
    # @param classes [String] Additional CSS classes
    def initialize(
      variant: :default,
      padding: :md,
      shadow: :xs,
      rounded: :xl,
      border: true,
      hoverable: false,
      clickable: false,
      divide: false,
      full_width_mobile: false,
      classes: nil
    )
      super()
      @variant = VARIANTS.include?(variant) ? variant : :default
      @padding = PADDINGS.include?(padding) ? padding : :md
      @shadow = SHADOWS.include?(shadow) ? shadow : :xs
      @rounded = ROUNDED.include?(rounded) ? rounded : :xl
      @border = border
      @hoverable = hoverable
      @clickable = clickable
      @divide = divide
      @full_width_mobile = full_width_mobile
      @classes = classes
    end

    def wrapper_classes
      [
        base_classes,
        variant_classes,
        shadow_classes,
        rounded_classes,
        border_classes,
        hover_classes,
        divide_classes,
        @classes
      ].compact.reject(&:empty?).join(" ")
    end

    def header_classes
      [
        header_padding_classes,
        header_background_classes
      ].compact.reject(&:empty?).join(" ")
    end

    def body_classes
      body_padding_classes
    end

    def footer_classes
      [
        footer_padding_classes,
        footer_background_classes
      ].compact.reject(&:empty?).join(" ")
    end

    private

    def base_classes
      "overflow-hidden"
    end

    def variant_classes
      case @variant
      when :well
        "bg-neutral-50 dark:bg-neutral-900/50"
      else # :default (elevated)
        "bg-white dark:bg-neutral-800"
      end
    end

    def shadow_classes
      return "" if @variant == :well

      case @shadow
      when :none then ""
      when :sm then "shadow-sm"
      when :md then "shadow-md"
      when :lg then "shadow-lg"
      when :xl then "shadow-xl"
      else "shadow-xs" # :xs
      end
    end

    def rounded_classes
      if @full_width_mobile
        case @rounded
        when :none then ""
        when :sm then "sm:rounded-sm"
        when :md then "sm:rounded-md"
        when :lg then "sm:rounded-lg"
        when :full then "sm:rounded-full"
        else "sm:rounded-xl" # :xl
        end
      else
        case @rounded
        when :none then ""
        when :sm then "rounded-sm"
        when :md then "rounded-md"
        when :lg then "rounded-lg"
        when :full then "rounded-full"
        else "rounded-xl" # :xl
        end
      end
    end

    def border_classes
      return "" unless @border

      if @full_width_mobile
        "border-y sm:border border-black/10 dark:border-white/10"
      else
        "border border-black/10 dark:border-white/10"
      end
    end

    def hover_classes
      return "" unless @hoverable || @clickable

      classes = []
      classes << "transition-all duration-200"
      classes << "hover:shadow-md dark:hover:shadow-neutral-900/50" if @hoverable
      classes << "cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/50" if @clickable
      classes.join(" ")
    end

    def divide_classes
      return "" unless @divide

      "divide-y divide-black/10 dark:divide-white/10"
    end

    def header_padding_classes
      case @padding
      when :none then ""
      when :sm then "px-3 py-3 sm:px-4"
      when :lg then "px-6 py-6 sm:px-8"
      else "px-4 py-5 sm:px-6" # :md
      end
    end

    def header_background_classes
      return "" unless @divide

      "bg-neutral-50 dark:bg-neutral-900/50 border-b border-black/10 dark:border-white/10"
    end

    def body_padding_classes
      case @padding
      when :none then ""
      when :sm then "px-3 py-3 sm:p-4"
      when :lg then "px-6 py-6 sm:p-8"
      else "px-4 py-5 sm:p-6" # :md
      end
    end

    def footer_padding_classes
      case @padding
      when :none then ""
      when :sm then "px-3 py-3 sm:px-4"
      when :lg then "px-6 py-5 sm:px-8"
      else "px-4 py-4 sm:px-6" # :md
      end
    end

    def footer_background_classes
      "bg-neutral-50 dark:bg-neutral-900/50"
    end

    attr_reader :variant, :padding, :shadow, :rounded, :border, :hoverable, :clickable, :divide, :full_width_mobile

    # Nested ImageComponent for card images
    class ImageComponent < ViewComponent::Base
      POSITIONS = %i[top bottom].freeze
      ASPECTS = %i[auto square video wide].freeze
      attr_reader :src, :alt, :position

      def initialize(src:, alt: "", position: :top, aspect: nil, classes: nil)
        super()
        @src = src
        @alt = alt
        @position = POSITIONS.include?(position) ? position : :top
        @aspect = aspect
        @classes = classes
      end

      def wrapper_classes
        [
          aspect_classes,
          "bg-neutral-200 dark:bg-neutral-700",
          @classes
        ].compact.reject(&:empty?).join(" ")
      end

      def image_classes
        "w-full h-full object-center object-cover"
      end

      private

      def aspect_classes
        case @aspect
        when :square then "aspect-square"
        when :video then "aspect-video"
        when :wide then "aspect-[21/9]"
        else "" # auto - no fixed aspect
        end
      end
    end
  end
end
