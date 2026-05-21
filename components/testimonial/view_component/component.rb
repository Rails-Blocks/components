# frozen_string_literal: true

module Testimonial
  class Component < ViewComponent::Base
    VARIANTS = %i[default card centered].freeze
    SIZES = %i[sm md lg].freeze

    # @param quote [String] The testimonial quote text (required)
    # @param author_name [String] The author's name (required)
    # @param author_title [String] The author's job title or role
    # @param author_image [String] URL to the author's avatar image
    # @param company [String] The author's company name
    # @param rating [Integer] Star rating (1-5), nil to hide
    # @param variant [Symbol] Display variant: :default, :card, :centered
    # @param size [Symbol] Size variant: :sm, :md, :lg
    # @param show_quote_icon [Boolean] Whether to show the quote icon
    # @param classes [String] Additional CSS classes for the wrapper
    def initialize(
      quote:,
      author_name:,
      author_title: nil,
      author_image: nil,
      company: nil,
      rating: nil,
      variant: :default,
      size: :md,
      show_quote_icon: false,
      classes: nil
    )
      super()
      @quote = quote
      @author_name = author_name
      @author_title = author_title
      @author_image = author_image
      @company = company
      @rating = rating.to_i.clamp(0, 5) if rating.present?
      @variant = VARIANTS.include?(variant) ? variant : :default
      @size = SIZES.include?(size) ? size : :md
      @show_quote_icon = show_quote_icon
      @classes = classes
    end

    def wrapper_classes
      [
        base_classes,
        variant_classes,
        @classes
      ].compact.reject(&:empty?).join(" ")
    end

    def quote_classes
      [
        "text-neutral-700 dark:text-neutral-300 leading-relaxed",
        quote_size_classes
      ].join(" ")
    end

    def author_name_classes
      [
        "font-semibold text-neutral-900 dark:text-white",
        author_name_size_classes
      ].join(" ")
    end

    def author_title_classes
      [
        "text-neutral-500 dark:text-neutral-400",
        author_title_size_classes
      ].join(" ")
    end

    def avatar_classes
      [
        "rounded-full object-cover",
        avatar_size_classes
      ].join(" ")
    end

    def avatar_wrapper_classes
      [
        "rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden",
        avatar_size_classes
      ].join(" ")
    end

    def show_rating?
      @rating.present? && @rating.positive?
    end

    def filled_stars
      @rating || 0
    end

    def empty_stars
      5 - filled_stars
    end

    def centered?
      @variant == :centered
    end

    def card?
      @variant == :card
    end

    def author_subtitle
      parts = []
      parts << @author_title if @author_title.present?
      parts << @company if @company.present?
      parts.join(" at ") if parts.any?
    end

    private

    attr_reader :quote, :author_name, :author_title, :author_image, :company,
                :rating, :variant, :size, :show_quote_icon

    def base_classes
      ""
    end

    def variant_classes
      case @variant
      when :card
        "bg-white dark:bg-neutral-900 rounded-lg border border-black/10 dark:border-white/10 p-6 sm:p-8"
      when :centered
        "text-center"
      else # :default
        ""
      end
    end

    def quote_size_classes
      case @size
      when :sm then "text-sm"
      when :lg then "text-lg md:text-xl"
      else "text-base" # :md
      end
    end

    def author_name_size_classes
      case @size
      when :sm then "text-sm"
      when :lg then "text-lg"
      else "text-base" # :md
      end
    end

    def author_title_size_classes
      case @size
      when :sm then "text-xs"
      when :lg then "text-base"
      else "text-sm" # :md
      end
    end

    def avatar_size_classes
      case @size
      when :sm then "size-8"
      when :lg then "size-14"
      else "size-10" # :md
      end
    end
  end
end
