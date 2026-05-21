# frozen_string_literal: true

module Lightbox
  class Component
    class ItemComponent < ViewComponent::Base
      # @param src [String] Full-size image URL (required)
      # @param thumbnail_src [String] Thumbnail image URL (optional, uses src if not provided)
      # @param width [Integer] Full-size image width in pixels (optional, auto-detected if not provided)
      # @param height [Integer] Full-size image height in pixels (optional, auto-detected if not provided)
      # @param alt [String] Alt text for the image
      # @param caption [String] Caption shown in lightbox overlay
      # @param variant [Symbol] Layout variant inherited from parent
      # @param classes [String] Additional CSS classes for the item
      def initialize(
        src:,
        thumbnail_src: nil,
        width: nil,
        height: nil,
        alt: nil,
        caption: nil,
        variant: :grid,
        classes: nil
      )
        super()
        @src = src
        @thumbnail_src = thumbnail_src || src
        @width = width
        @height = height
        @alt = alt || ""
        @caption = caption
        @variant = variant
        @classes = classes
      end

      def link_data_attributes
        attrs = {
          pswp_src: @src
        }
        attrs[:pswp_width] = @width if @width
        attrs[:pswp_height] = @height if @height
        attrs[:pswp_caption] = @caption if @caption.present?
        attrs[:pswp_alt] = @alt if @alt.present?
        attrs
      end

      def link_classes
        base = "group relative overflow-hidden"
        rounded = "rounded-lg"
        outline = "outline -outline-offset-1 outline-black/10 dark:outline-white/10"

        variant_classes = case @variant
                          when :masonry
                            "block break-inside-avoid mb-4"
                          when :inline
                            "inline-block"
                          else
                            "block"
                          end

        [base, rounded, outline, variant_classes, @classes].compact.reject(&:empty?).join(" ")
      end

      def image_classes
        base = "w-full h-full object-cover"
        hover = "transition-transform duration-300 group-hover:scale-110"
        [base, hover].join(" ")
      end

      def overlay_classes
        "absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"
      end

      attr_reader :src, :thumbnail_src, :alt, :caption
    end
  end
end
