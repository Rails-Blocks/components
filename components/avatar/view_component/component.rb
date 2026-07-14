# frozen_string_literal: true

module Avatar
  class Component < ViewComponent::Base
    SIZES = %i[xs sm md lg xl].freeze
    STATUSES = %i[online].freeze

    SIZE_CLASSES = {
      xs: "size-6",
      sm: "size-8",
      md: "size-10",
      lg: "size-12",
      xl: "size-16"
    }.freeze

    FALLBACK_TEXT_CLASSES = {
      xs: "text-[8px]",
      sm: "text-[10px]",
      md: "text-xs",
      lg: "text-sm",
      xl: "text-base"
    }.freeze

    STATUS_SIZE_CLASSES = {
      xs: "size-2 ring-1",
      sm: "size-2 ring-1",
      md: "size-2.5 ring-2",
      lg: "size-3 ring-2",
      xl: "size-4 ring-2"
    }.freeze

    # @param alt [String] Accessible image description. Use an empty string only for decorative avatars.
    # @param src [String, nil] Image URL. When omitted, fallback initials are rendered.
    # @param fallback [String, nil] Explicit fallback text. Defaults to initials derived from alt.
    # @param size [Symbol] Avatar size: :xs, :sm, :md, :lg, :xl
    # @param status [Symbol, nil] Optional status. Currently supports :online.
    # @param status_label [String] Screen-reader label for the status indicator.
    # @param pulse [Boolean] Whether the online status indicator pulses.
    # @param classes [String, nil] Additional wrapper classes.
    # @param html_options [Hash] Additional wrapper attributes such as data, aria, id, or title.
    # @param image_options [Hash] Additional image attributes.
    def initialize(
      alt:,
      src: nil,
      fallback: nil,
      size: :md,
      status: nil,
      status_label: "Online",
      pulse: true,
      classes: nil,
      html_options: {},
      image_options: {}
    )
      super()
      @alt = alt.to_s
      @src = src
      @fallback = fallback
      @size = normalize_size(size)
      @status = normalize_status(status)
      @status_label = status_label
      @pulse = pulse
      @classes = classes
      @html_options = html_options.to_h
      @image_options = image_options.to_h
    end

    def wrapper_attributes
      attributes = @html_options.deep_dup.symbolize_keys
      attributes[:class] = [wrapper_classes, attributes[:class]].compact.reject(&:blank?).join(" ")

      unless image?
        attributes[:role] ||= "img"
        attributes[:aria] = { label: @alt }.merge(attributes.fetch(:aria, {}).symbolize_keys) if @alt.present?
      end

      attributes
    end

    def image_attributes
      attributes = @image_options.deep_dup.symbolize_keys
      attributes[:src] = @src
      attributes[:alt] = @alt
      attributes[:class] = ["size-full rounded-full object-cover", attributes[:class]].compact.reject(&:blank?).join(" ")
      attributes
    end

    def wrapper_classes
      [
        "relative isolate inline-flex shrink-0 overflow-visible rounded-full bg-neutral-100 select-none",
        "after:pointer-events-none after:absolute after:inset-0 after:z-10 after:rounded-full after:content-[''] after:shadow-[inset_0_0_0_1px_rgb(0_0_0_/_10%)]",
        "dark:bg-neutral-800 dark:after:shadow-[inset_0_0_0_1px_rgb(255_255_255_/_10%)]",
        SIZE_CLASSES.fetch(@size),
        @classes
      ].compact.reject(&:blank?).join(" ")
    end

    def fallback_classes
      [
        "flex size-full items-center justify-center rounded-full font-medium uppercase text-neutral-600 dark:text-neutral-300",
        FALLBACK_TEXT_CLASSES.fetch(@size)
      ].join(" ")
    end

    def fallback_text
      return @fallback.to_s if @fallback.present?

      @alt.split.filter_map { |word| word[0] }.first(2).join.upcase
    end

    def status_wrapper_classes
      "absolute right-0 bottom-0 z-20 flex #{STATUS_SIZE_CLASSES.fetch(@size).split.first}"
    end

    def status_dot_classes
      [
        "relative inline-flex rounded-full bg-green-500 ring-white dark:bg-green-400 dark:ring-neutral-950",
        STATUS_SIZE_CLASSES.fetch(@size)
      ].join(" ")
    end

    def image?
      @src.present?
    end

    def online?
      @status == :online
    end

    attr_reader :status_label, :pulse

    private

    def normalize_size(size)
      normalized = size.to_s.to_sym
      SIZES.include?(normalized) ? normalized : :md
    end

    def normalize_status(status)
      normalized = status.to_s.to_sym
      STATUSES.include?(normalized) ? normalized : nil
    end
  end
end
