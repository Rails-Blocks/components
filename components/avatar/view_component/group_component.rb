# frozen_string_literal: true

module Avatar
  class GroupComponent < ViewComponent::Base
    SIZES = Avatar::Component::SIZES

    OVERLAP_CLASSES = {
      xs: "-space-x-2",
      sm: "-space-x-3",
      md: "-space-x-4",
      lg: "-space-x-5",
      xl: "-space-x-6"
    }.freeze

    COMPACT_OVERLAP_CLASSES = {
      xs: "-space-x-4",
      sm: "-space-x-5",
      md: "-space-x-6",
      lg: "-space-x-7",
      xl: "-space-x-8"
    }.freeze

    renders_many :avatars, lambda { |alt:, src: nil, fallback: nil, status: nil, status_label: "Online", pulse: true, classes: nil, html_options: {}, image_options: {}|
      Avatar::Component.new(
        alt: alt,
        src: src,
        fallback: fallback,
        size: @size,
        status: status,
        status_label: status_label,
        pulse: pulse,
        classes: classes,
        html_options: html_options,
        image_options: image_options
      )
    }

    # @param size [Symbol] Size shared by every avatar: :xs, :sm, :md, :lg, :xl
    # @param remaining_count [Integer, nil] Number displayed after the visible avatars.
    # @param label [String] Accessible label for the group.
    # @param animated [Boolean] Whether the compact group expands to normal overlap on hover.
    # @param classes [String, nil] Additional wrapper classes.
    # @param html_options [Hash] Additional wrapper attributes such as data, aria, id, or title.
    def initialize(size: :md, remaining_count: nil, label: "Avatar group", animated: false, classes: nil, html_options: {})
      super()
      @size = normalize_size(size)
      @remaining_count = remaining_count
      @label = label
      @animated = animated
      @classes = classes
      @html_options = html_options.to_h
    end

    def wrapper_attributes
      attributes = @html_options.deep_dup.symbolize_keys
      attributes[:class] = [wrapper_classes, attributes[:class]].compact.reject(&:blank?).join(" ")
      attributes[:role] ||= "group"
      attributes[:aria] = { label: @label }.merge(attributes.fetch(:aria, {}).symbolize_keys)
      attributes
    end

    def wrapper_classes
      [
        @animated ? "group flex w-fit" : "flex w-fit",
        @animated ? COMPACT_OVERLAP_CLASSES.fetch(@size) : OVERLAP_CLASSES.fetch(@size),
        @classes
      ].compact.reject(&:blank?).join(" ")
    end

    def item_wrapper_classes
      return "inline-flex isolate" unless @animated

      "inline-flex isolate transition-transform duration-200 ease-in-out group-hover:translate-x-[var(--avatar-offset)] motion-reduce:transform-none motion-reduce:transition-none"
    end

    def item_wrapper_style(index)
      return nil unless @animated

      "--avatar-offset: #{index * 0.5}rem"
    end

    def remaining?
      @remaining_count.to_i.positive?
    end

    def remaining_label
      "#{@remaining_count} more"
    end

    def count_classes
      [
        "relative isolate inline-flex shrink-0 items-center justify-center rounded-full bg-neutral-100 font-medium text-neutral-600 select-none",
        "after:pointer-events-none after:absolute after:inset-0 after:z-10 after:rounded-full after:content-[''] after:shadow-[inset_0_0_0_1px_rgb(0_0_0_/_10%)]",
        "dark:bg-neutral-800 dark:text-neutral-300 dark:after:shadow-[inset_0_0_0_1px_rgb(255_255_255_/_10%)]",
        Avatar::Component::SIZE_CLASSES.fetch(@size),
        Avatar::Component::FALLBACK_TEXT_CLASSES.fetch(@size)
      ].join(" ")
    end

    private

    def normalize_size(size)
      normalized = size.to_s.to_sym
      SIZES.include?(normalized) ? normalized : :md
    end
  end
end
