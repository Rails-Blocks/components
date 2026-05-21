# frozen_string_literal: true

module Pagination
  class Component < ViewComponent::Base
    VARIANTS = %i[full compact minimal].freeze
    SIZES = %i[sm md lg].freeze

    # @param pagy [Pagy] The Pagy pagination object
    # @param variant [Symbol] Display variant: :full (numbered), :compact (prev/next with info), :minimal (prev/next only)
    # @param size [Symbol] Size variant: :sm, :md, :lg
    # @param frame_id [String] Turbo Frame ID for SPA navigation
    # @param show_info [Boolean] Show "Showing X-Y of Z" info text
    # @param show_page_form [Boolean] Show "Jump to page" form (only with :full variant)
    # @param show_limit_form [Boolean] Show rows per page selector
    # @param limit_options [Array<Integer>] Options for rows per page selector
    # @param preserve_params [Hash] Query params to preserve across page changes
    # @param request_path [String] Custom request path for forms
    # @param classes [String] Additional CSS classes for the wrapper
    def initialize(
      pagy:,
      variant: :full,
      size: :md,
      frame_id: nil,
      show_info: true,
      show_page_form: false,
      show_limit_form: false,
      limit_options: [10, 25, 50],
      preserve_params: {},
      request_path: nil,
      classes: nil
    )
      super()
      @pagy = pagy
      @variant = VARIANTS.include?(variant) ? variant : :full
      @size = SIZES.include?(size) ? size : :md
      @frame_id = frame_id
      @show_info = show_info
      @show_page_form = show_page_form && @variant == :full
      @show_limit_form = show_limit_form
      @limit_options = limit_options.map(&:to_i)
      @preserve_params = preserve_params
      @request_path = request_path
      @classes = classes
    end

    def wrapper_classes
      base = "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      [@classes, base].compact.reject(&:empty?).join(" ")
    end

    def nav_wrapper_classes
      "inline-flex items-center gap-2 text-sm font-medium"
    end

    def info_classes
      case @size
      when :sm then "text-xs text-neutral-600 dark:text-neutral-300"
      when :lg then "text-base text-neutral-600 dark:text-neutral-300"
      else "text-sm text-neutral-600 dark:text-neutral-300"
      end
    end

    def page_key
      @pagy.options[:page_key] || "page"
    end

    def limit_key
      @pagy.options[:limit_key] || "limit"
    end

    def query_params
      @query_params ||= begin
        params = @preserve_params.stringify_keys.except(page_key.to_s, limit_key.to_s)
        params[limit_key] = @pagy.limit.to_s
        params
      end
    end

    def anchor_string
      @frame_id.present? ? "data-turbo-frame='#{@frame_id}'" : nil
    end

    def prev_url
      return nil unless @pagy.previous

      @pagy.page_url(@pagy.previous, querify: ->(q) { q.merge!(query_params) })
    end

    def next_url
      return nil unless @pagy.next

      @pagy.page_url(@pagy.next, querify: ->(q) { q.merge!(query_params) })
    end

    def nav_html
      common_opts = {
        anchor_string: anchor_string,
        querify: ->(q) { q.merge!(query_params) }
      }.compact

      @pagy.series_nav(**common_opts)
    end

    def prev_html
      common_opts = {
        anchor_string: anchor_string,
        querify: ->(q) { q.merge!(query_params) },
        aria_label: "Previous"
      }.compact

      @pagy.previous_tag(**common_opts)
    end

    def next_html
      common_opts = {
        anchor_string: anchor_string,
        querify: ->(q) { q.merge!(query_params) },
        aria_label: "Next"
      }.compact

      @pagy.next_tag(**common_opts)
    end

    def form_path
      @request_path || helpers.request.path
    end

    # Icons
    def prev_icon
      tag.svg(
        xmlns: "http://www.w3.org/2000/svg",
        class: icon_size_class,
        width: "18",
        height: "18",
        viewBox: "0 0 18 18"
      ) do
        tag.g(fill: "currentColor") do
          tag.path(d: "M11.5607 3.93934C11.9512 4.32986 11.9512 4.96303 11.5607 5.35355L7.91421 9L11.5607 12.6464C11.9512 13.037 11.9512 13.6701 11.5607 14.0607C11.1701 14.4512 10.537 14.4512 10.1464 14.0607L5.79289 9.70711C5.40237 9.31658 5.40237 8.68342 5.79289 8.29289L10.1464 3.93934C10.537 3.54882 11.1701 3.54882 11.5607 3.93934Z")
        end
      end
    end

    def next_icon
      tag.svg(
        xmlns: "http://www.w3.org/2000/svg",
        class: icon_size_class,
        width: "18",
        height: "18",
        viewBox: "0 0 18 18"
      ) do
        tag.g(fill: "currentColor") do
          tag.path(d: "M6.43934 14.0607C6.04882 13.6701 6.04882 13.037 6.43934 12.6464L10.0858 9L6.43934 5.35355C6.04882 4.96303 6.04882 4.32986 6.43934 3.93934C6.82986 3.54882 7.46303 3.54882 7.85355 3.93934L12.2071 8.29289C12.5976 8.68342 12.5976 9.31658 12.2071 9.70711L7.85355 14.0607C7.46303 14.4512 6.82986 14.4512 6.43934 14.0607Z")
        end
      end
    end

    private

    def icon_size_class
      case @size
      when :sm then "size-3"
      when :lg then "size-5"
      else "size-4"
      end
    end
  end
end
