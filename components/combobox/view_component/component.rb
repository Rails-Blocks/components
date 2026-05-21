# frozen_string_literal: true

module Combobox
  class Component < ViewComponent::Base
    TAGS_POSITIONS = %w[inline above below].freeze
    DEFAULTS = {
      options: [],
      selected: nil,
      name: nil,
      id: nil,
      label: nil,
      description: nil,
      placeholder: "Select...",
      multiple: false,
      searchable: true,
      dropdown_input: nil,
      clearable: true,
      clear_button: nil,
      disabled: false,
      required: false,
      allow_create: false,
      allow_new: nil,
      grouped_options: nil,
      url: nil,
      value_field: "value",
      label_field: "label",
      search_param: "query",
      per_page: 60,
      virtual_scroll: false,
      response_data_field: "data",
      optgroup_columns: false,
      submit_on_change: false,
      update_field: false,
      update_field_target: nil,
      update_field_source: "name",
      disable_typing: false,
      scroll_buttons: false,
      show_count: false,
      count_text: "selected",
      count_text_singular: nil,
      tags_position: "inline",
      enable_flag_toggle: false,
      image_field: nil,
      subtitle_field: nil,
      meta_fields: nil,
      badge_field: nil,
      render_template: nil,
      no_more_results_text: "No more results",
      no_results_text: "No results found for",
      loading_text: "Loading...",
      create_text: "Add",
      dropdown_placeholder: "Search...",
      dropdown_input_placeholder: nil,
      classes: nil,
      data: {}
    }.freeze
    DIRECT_ASSIGNMENT_KEYS = %i[
      options
      selected
      name
      label
      description
      placeholder
      multiple
      disabled
      required
      grouped_options
      url
      value_field
      label_field
      search_param
      per_page
      virtual_scroll
      response_data_field
      optgroup_columns
      submit_on_change
      update_field
      update_field_target
      update_field_source
      disable_typing
      scroll_buttons
      show_count
      count_text
      count_text_singular
      tags_position
      enable_flag_toggle
      image_field
      subtitle_field
      meta_fields
      badge_field
      render_template
      no_more_results_text
      no_results_text
      loading_text
      create_text
      classes
    ].freeze

    # @param options [Array<Array>] Array of [label, value] pairs or [label, value, options_hash] triplets
    # @param selected [String, Array] Pre-selected value(s)
    # @param name [String] Name attribute for the select element
    # @param id [String] ID attribute for the select element
    # @param label [String] Optional label text
    # @param description [String] Optional description text
    # @param placeholder [String] Placeholder text shown when no selection
    # @param multiple [Boolean] Allow multiple selections
    # @param searchable [Boolean] Enable search/filter functionality (maps to dropdown_input)
    # @param dropdown_input [Boolean, nil] Alias for searchable
    # @param clearable [Boolean] Show clear button for single select (maps to clear_button)
    # @param clear_button [Boolean, nil] Alias for clearable
    # @param disabled [Boolean] Disable the entire combobox
    # @param required [Boolean] Mark the field as required
    # @param allow_create [Boolean] Allow creating new options (maps to allow_new)
    # @param allow_new [Boolean, nil] Alias for allow_create
    # @param grouped_options [Hash] Grouped options hash (mutually exclusive with options)
    # @param url [String] URL for async data fetching
    # @param value_field [String] Field name for value in API response
    # @param label_field [String] Field name for label in API response
    # @param search_param [String] Query parameter name for search
    # @param per_page [Integer] Number of items per page for async loading
    # @param virtual_scroll [Boolean] Enable virtual scroll plugin for async loading
    # @param response_data_field [String] Path for array data in API response
    # @param optgroup_columns [Boolean] Enable optgroup columns plugin
    # @param submit_on_change [Boolean] Submit form when selection changes
    # @param update_field [Boolean] Update another field using selected option data
    # @param update_field_target [String] CSS selector for update target field
    # @param update_field_source [String] Source key to copy to target field
    # @param disable_typing [Boolean] Disable typing in the control input
    # @param scroll_buttons [Boolean] Show hover scroll buttons in dropdown
    # @param show_count [Boolean] Show count instead of tags for multi-select
    # @param count_text [String] Text after count (e.g., "selected")
    # @param count_text_singular [String] Singular form of count text
    # @param tags_position [String] Position of tags: "inline", "above", "below", or custom container ID
    # @param enable_flag_toggle [Boolean] Enable flag toggle on tags
    # @param image_field [String] Field for image URL in API response
    # @param subtitle_field [String] Field for subtitle in API response
    # @param meta_fields [String] Comma-separated metadata fields for API option rendering
    # @param badge_field [String] Field for badge in API response
    # @param render_template [String] Custom template for option rendering
    # @param no_more_results_text [String] Text when no more results are available
    # @param no_results_text [String] Text when no results match search
    # @param loading_text [String] Text shown while loading
    # @param create_text [String] Text for create option prompt
    # @param dropdown_placeholder [String] Placeholder for dropdown search input (maps to dropdown_input_placeholder)
    # @param dropdown_input_placeholder [String, nil] Alias for dropdown_placeholder
    # @param classes [String] Additional CSS classes for the wrapper
    # @param data [Hash] Additional data attributes for the select element
    def initialize(**kwargs)
      super()
      unknown_keywords = kwargs.keys - DEFAULTS.keys
      raise ArgumentError, "unknown keywords: #{unknown_keywords.join(', ')}" if unknown_keywords.any?

      settings = DEFAULTS.merge(kwargs)
      assign_direct_settings(settings)
      @id = settings[:id] || "combobox_#{SecureRandom.hex(4)}"
      @searchable = settings[:dropdown_input].nil? ? settings[:searchable] : settings[:dropdown_input]
      @clearable = settings[:clear_button].nil? ? settings[:clearable] : settings[:clear_button]
      @allow_create = settings[:allow_new].nil? ? settings[:allow_create] : settings[:allow_new]
      @dropdown_placeholder = settings[:dropdown_input_placeholder].nil? ? settings[:dropdown_placeholder] : settings[:dropdown_input_placeholder]
      @additional_data = settings[:data]
    end

    def wrapper_classes
      base = "w-full"
      [base, @classes].compact.reject(&:empty?).join(" ")
    end

    def label_classes
      color_class = if @disabled
                      "text-neutral-400 dark:text-neutral-500"
                    else
                      "text-neutral-700 dark:text-neutral-300"
                    end
      ["block text-sm font-medium mb-1", color_class].join(" ")
    end

    def description_classes
      color_class = @disabled ? "text-neutral-400 dark:text-neutral-500" : "text-neutral-500 dark:text-neutral-400"
      ["text-xs", color_class, "mt-1"].join(" ")
    end

    def select_data_attributes
      base_select_data_attributes
        .merge(async_select_data_attributes)
        .merge(form_select_data_attributes)
        .merge(multiselect_select_data_attributes)
        .merge(render_select_data_attributes)
        .merge(i18n_select_data_attributes)
        .merge(@additional_data)
    end

    def select_options
      if @grouped_options.present?
        grouped_options_for_select(@grouped_options, @selected)
      else
        options_for_select(@options, @selected)
      end
    end

    def options?
      @options.present? || @grouped_options.present? || @url.present?
    end

    private

    def assign_direct_settings(settings)
      DIRECT_ASSIGNMENT_KEYS.each do |key|
        instance_variable_set("@#{key}", settings[key])
      end
    end

    def base_select_data_attributes
      data = {
        controller: "select",
        select_dropdown_input_value: @searchable
      }
      data[:select_clear_button_value] = @clearable unless @multiple
      data[:select_allow_new_value] = true if @allow_create
      data[:select_disable_typing_value] = true if @disable_typing
      data[:select_scroll_buttons_value] = true if @scroll_buttons
      data[:select_optgroup_columns_value] = true if @optgroup_columns
      data
    end

    def async_select_data_attributes
      return {} unless @url.present?

      data = {
        select_url_value: @url,
        select_value_field_value: @value_field,
        select_label_field_value: @label_field
      }
      data[:select_search_param_value] = @search_param if @search_param != "query"
      data[:select_per_page_value] = @per_page if @per_page != 60
      data[:select_virtual_scroll_value] = true if @virtual_scroll
      data[:select_response_data_field_value] = @response_data_field if @response_data_field != "data"
      data
    end

    def form_select_data_attributes
      data = {}
      data[:select_submit_on_change_value] = true if @submit_on_change
      return data unless @update_field

      data[:select_update_field_value] = true
      data[:select_update_field_target_value] = @update_field_target if @update_field_target.present?
      data[:select_update_field_source_value] = @update_field_source if @update_field_source != "name"
      data
    end

    def multiselect_select_data_attributes
      data = {}
      if @multiple && @show_count
        data[:select_show_count_value] = true
        data[:select_count_text_value] = @count_text
        data[:select_count_text_singular_value] = @count_text_singular if @count_text_singular
      end
      data[:select_tags_position_value] = @tags_position if @multiple && @tags_position != "inline"
      data[:select_enable_flag_toggle_value] = true if @enable_flag_toggle
      data
    end

    def render_select_data_attributes
      data = {}
      data[:select_image_field_value] = @image_field if @image_field
      data[:select_subtitle_field_value] = @subtitle_field if @subtitle_field
      data[:select_meta_fields_value] = @meta_fields if @meta_fields.present?
      data[:select_badge_field_value] = @badge_field if @badge_field
      data[:select_render_template_value] = @render_template if @render_template.present?
      data
    end

    def i18n_select_data_attributes
      data = {}
      data[:select_no_more_results_text_value] = @no_more_results_text if @no_more_results_text != "No more results"
      data[:select_no_search_results_text_value] = @no_results_text if @no_results_text != "No results found for"
      data[:select_loading_text_value] = @loading_text if @loading_text != "Loading..."
      data[:select_create_text_value] = @create_text if @create_text != "Add"
      data[:select_dropdown_input_placeholder_value] = @dropdown_placeholder if @dropdown_placeholder != "Search..."
      data
    end

    attr_reader :options, :selected, :name, :id, :label, :description, :placeholder, :multiple,
                :searchable, :clearable, :disabled, :required, :allow_create,
                :grouped_options, :url, :value_field, :label_field, :search_param,
                :per_page, :virtual_scroll, :response_data_field, :optgroup_columns,
                :submit_on_change, :update_field, :update_field_target, :update_field_source,
                :disable_typing, :scroll_buttons, :show_count, :count_text,
                :count_text_singular, :tags_position, :enable_flag_toggle,
                :image_field, :subtitle_field, :meta_fields, :badge_field, :render_template,
                :no_more_results_text, :no_results_text, :loading_text, :create_text,
                :dropdown_placeholder, :classes
  end
end
