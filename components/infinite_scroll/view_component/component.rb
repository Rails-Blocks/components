# frozen_string_literal: true

module InfiniteScroll
  class Component < ViewComponent::Base
    ITEM_TAGS = %i[div ul ol].freeze
    SCROLL_ROOTS = %i[window container].freeze

    # Wraps arbitrary content in an infinite-scroll container.
    #
    # The JSON endpoint at +next_url+ must return:
    #   { html: "<article>...</article>", next_url: "/items?page=3" }
    #
    # Each top-level element in +html+ is appended directly to the items container.
    #
    # @param next_url [String, nil] URL for the next batch. Nil marks the collection complete.
    # @param scroll_root [Symbol] Observe against :window or the internal :container.
    # @param root_margin [String] IntersectionObserver root margin.
    # @param animate [Boolean] Animate initial and appended top-level items.
    # @param manual [Boolean] Disable automatic observation and show a Load more button.
    # @param items_tag [Symbol] Semantic tag for the item container: :div, :ul, or :ol.
    # @param classes [String, nil] Additional wrapper classes.
    # @param viewport_classes [String, nil] Classes for the viewport; add overflow/height here for container scrolling.
    # @param items_classes [String, nil] Layout classes for arbitrary content, such as grid or spacing utilities.
    # @param sentinel_classes [String, nil] Additional floating-controls wrapper classes.
    # @param load_more_label [String] Manual fallback button label.
    # @param loading_label [String] Loading button label.
    # @param end_message [String] Message shown when no next page remains.
    # @param error_message [String] Accessible message announced after a failed request.
    # @param html_options [Hash] Additional wrapper attributes.
    def initialize(
      next_url:,
      scroll_root: :window,
      root_margin: "0px 0px 120px",
      animate: true,
      manual: false,
      items_tag: :div,
      classes: nil,
      viewport_classes: nil,
      items_classes: nil,
      sentinel_classes: nil,
      load_more_label: "Load more",
      loading_label: "Loading...",
      end_message: "You're all caught up",
      error_message: "More items could not be loaded. Try again.",
      html_options: {}
    )
      super()
      @next_url = next_url
      @scroll_root = normalize_scroll_root(scroll_root)
      @root_margin = root_margin.presence || "0px 0px 120px"
      @animate = animate
      @manual = manual
      @items_tag = normalize_items_tag(items_tag)
      @classes = classes
      @viewport_classes = viewport_classes
      @items_classes = items_classes
      @sentinel_classes = sentinel_classes
      @load_more_label = load_more_label
      @loading_label = loading_label
      @end_message = end_message
      @error_message = error_message
      @html_options = html_options.to_h
    end

    def wrapper_attributes
      attributes = @html_options.deep_dup.deep_symbolize_keys
      data = attributes.fetch(:data, {})
      data[:controller] = [data[:controller], "infinite-scroll"].compact.join(" ")
      data[:infinite_scroll_url_value] = @next_url if @next_url.present?
      data[:infinite_scroll_scroll_root_value] = @scroll_root
      data[:infinite_scroll_root_margin_value] = @root_margin
      data[:infinite_scroll_animate_value] = @animate
      data[:infinite_scroll_manual_value] = @manual
      data[:infinite_scroll_load_more_label_value] = @load_more_label
      data[:infinite_scroll_loading_label_value] = @loading_label
      data[:infinite_scroll_end_message_value] = @end_message
      data[:infinite_scroll_error_message_value] = @error_message

      attributes[:data] = data
      attributes[:class] = ["relative", @classes, attributes[:class]].compact.reject(&:blank?).join(" ")
      attributes
    end

    def viewport_attributes
      {
        class: @viewport_classes,
        data: { infinite_scroll_target: "viewport" }
      }
    end

    def items_attributes
      {
        class: @items_classes,
        data: { infinite_scroll_target: "list" }
      }
    end

    def sentinel_classes
      "h-20 [overflow-anchor:none]"
    end

    def controls_classes
      [
        "pointer-events-none bottom-0 z-10 -mt-20 flex h-20 items-center justify-center px-4 py-3",
        ("sticky" if next_page?),
        @sentinel_classes
      ].compact.reject(&:blank?).join(" ")
    end

    def next_page?
      @next_url.present?
    end

    def manual?
      @manual
    end

    attr_reader :items_tag, :load_more_label, :end_message

    private

    def normalize_items_tag(items_tag)
      normalized = items_tag.to_s.to_sym
      ITEM_TAGS.include?(normalized) ? normalized : :div
    end

    def normalize_scroll_root(scroll_root)
      normalized = scroll_root.to_s.to_sym
      SCROLL_ROOTS.include?(normalized) ? normalized : :window
    end
  end
end
