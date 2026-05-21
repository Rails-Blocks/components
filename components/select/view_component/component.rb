# frozen_string_literal: true

module Select
  class Component < ViewComponent::Base
    SIZES = %i[sm md lg].freeze
    DEFAULTS = {
      name: nil,
      id: nil,
      options: [],
      selected: nil,
      placeholder: "Select an option...",
      multiple: false,
      dropdown_input: false,
      searchable: nil,
      clearable: true,
      clear_button: nil,
      disabled: false,
      required: false,
      grouped: false,
      label: nil,
      description: nil,
      error: nil,
      size: :md,
      allow_new: false,
      allow_create: nil,
      scroll_buttons: false,
      disable_typing: true,
      submit_on_change: false,
      update_field: false,
      update_field_target: nil,
      update_field_source: "name",
      url: nil,
      value_field: "value",
      label_field: "label",
      search_param: "query",
      per_page: 60,
      virtual_scroll: false,
      optgroup_columns: false,
      response_data_field: "data",
      dropdown_input_placeholder: "Search...",
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
      classes: nil,
      input_classes: nil,
      data: {}
    }.freeze
    DIRECT_ASSIGNMENT_KEYS = %i[
      name
      options
      selected
      placeholder
      multiple
      disabled
      required
      grouped
      label
      description
      error
      scroll_buttons
      disable_typing
      submit_on_change
      update_field
      update_field_target
      update_field_source
      url
      value_field
      label_field
      search_param
      per_page
      virtual_scroll
      optgroup_columns
      response_data_field
      dropdown_input_placeholder
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
      input_classes
    ].freeze

    # @param name [String] The input name attribute for form submission
    # @param id [String] The input id attribute (auto-generated if not provided)
    # @param options [Array] Array of options - can be simple [label, value] pairs or hashes with icon/description
    # @param selected [String, Array] Currently selected value(s)
    # @param placeholder [String] Placeholder text when nothing is selected
    # @param multiple [Boolean] Allow multiple selections
    # @param dropdown_input [Boolean] Enable search/filter input in dropdown
    # @param searchable [Boolean, nil] Alias for dropdown_input
    # @param clearable [Boolean] Show clear button (single select only)
    # @param clear_button [Boolean, nil] Alias for clearable
    # @param disabled [Boolean] Disable the select
    # @param required [Boolean] Mark as required field
    # @param grouped [Boolean] Whether options are grouped (for grouped_options_for_select)
    # @param label [String] Optional label text
    # @param description [String] Optional description text
    # @param error [String] Error message to display
    # @param size [Symbol] Size: :sm, :md (default), :lg
    # @param allow_new [Boolean] Allow creating new options
    # @param allow_create [Boolean, nil] Alias for allow_new
    # @param scroll_buttons [Boolean] Show scroll up/down buttons
    # @param disable_typing [Boolean] Disable keyboard typing (type-ahead still works)
    # @param submit_on_change [Boolean] Submit form when selection changes
    # @param update_field [Boolean] Update target field from selected option data
    # @param update_field_target [String] CSS selector for update target field
    # @param update_field_source [String] Source key for update field
    # @param url [String] URL for remote options loading
    # @param value_field [String] Field used for option values in remote data
    # @param label_field [String] Field used for option labels in remote data
    # @param search_param [String] Query parameter for remote search
    # @param per_page [Integer] Page size for remote loading
    # @param virtual_scroll [Boolean] Enable virtual scroll plugin
    # @param optgroup_columns [Boolean] Enable optgroup columns plugin
    # @param response_data_field [String] Path to array in API response
    # @param dropdown_input_placeholder [String] Placeholder for dropdown search input
    # @param show_count [Boolean] Show selected count for multi-select
    # @param count_text [String] Text after count
    # @param count_text_singular [String] Singular text after count
    # @param tags_position [String] Tag position for multi-select
    # @param enable_flag_toggle [Boolean] Enable flag toggles for tags
    # @param image_field [String] Field containing image URL
    # @param subtitle_field [String] Field containing subtitle text
    # @param meta_fields [String] Comma-separated metadata fields
    # @param badge_field [String] Field containing badge text
    # @param render_template [String] Custom option render template
    # @param no_more_results_text [String] Text shown when no more results
    # @param no_results_text [String] Text shown when search has no matches
    # @param loading_text [String] Text shown while loading
    # @param create_text [String] Text shown for create option
    # @param classes [String] Additional CSS classes for the wrapper
    # @param input_classes [String] Additional CSS classes for the select element
    # @param data [Hash] Additional data attributes for the select element
    def initialize(**kwargs)
      super()
      unknown_keywords = kwargs.keys - DEFAULTS.keys
      raise ArgumentError, "unknown keywords: #{unknown_keywords.join(', ')}" if unknown_keywords.any?

      settings = DEFAULTS.merge(kwargs)
      assign_direct_settings(settings)
      @id = settings[:id] || generate_id
      @dropdown_input = settings[:searchable].nil? ? settings[:dropdown_input] : settings[:searchable]
      @clearable = settings[:clear_button].nil? ? settings[:clearable] : settings[:clear_button]
      @size = SIZES.include?(settings[:size]) ? settings[:size] : :md
      @allow_new = settings[:allow_create].nil? ? settings[:allow_new] : settings[:allow_create]
      @additional_data = settings[:data]
    end

    def wrapper_classes
      base = "w-full"
      [base, @classes].compact.reject(&:empty?).join(" ")
    end

    def select_classes
      [
        base_select_classes,
        size_classes,
        state_classes,
        @input_classes
      ].compact.reject(&:empty?).join(" ")
    end

    def label_classes
      base = "block font-medium mb-1"
      size_class = case @size
                   when :sm then "text-xs"
                   when :lg then "text-base"
                   else "text-sm"
                   end
      color_class = if @disabled
                      "text-neutral-400 dark:text-neutral-500"
                    elsif @error.present?
                      "text-red-700 dark:text-red-400"
                    else
                      "text-neutral-700 dark:text-neutral-300"
                    end

      [base, size_class, color_class].join(" ")
    end

    def description_classes
      size_class = case @size
                   when :sm then "text-[11px]"
                   when :lg then "text-sm"
                   else "text-xs"
                   end
      color_class = @disabled ? "text-neutral-400 dark:text-neutral-500" : "text-neutral-500 dark:text-neutral-400"

      [size_class, color_class, "mt-1"].join(" ")
    end

    def error_classes
      size_class = case @size
                   when :sm then "text-[11px]"
                   when :lg then "text-sm"
                   else "text-xs"
                   end

      [size_class, "text-red-600 dark:text-red-400 mt-1"].join(" ")
    end

    def data_attributes
      base_data_attributes
        .merge(remote_data_attributes)
        .merge(core_behavior_data_attributes)
        .merge(update_field_data_attributes)
        .merge(multiselect_data_attributes)
        .merge(rendering_data_attributes)
        .merge(i18n_data_attributes)
        .merge(@additional_data)
    end

    def select_style
      "visibility: hidden;"
    end

    def options_html
      if @grouped
        grouped_options_for_select(@options, @selected)
      else
        options_for_select(formatted_options, @selected)
      end
    end

    private

    def assign_direct_settings(settings)
      DIRECT_ASSIGNMENT_KEYS.each do |key|
        instance_variable_set("@#{key}", settings[key])
      end
    end

    def base_data_attributes
      {
        controller: "select",
        select_dropdown_input_value: @dropdown_input,
        select_disable_typing_value: @disable_typing,
        select_clear_button_value: @clearable && !@multiple,
        select_scroll_buttons_value: @scroll_buttons
      }
    end

    def remote_data_attributes
      data = {}
      data[:select_url_value] = @url if @url.present?
      data[:select_value_field_value] = @value_field if @value_field != "value"
      data[:select_label_field_value] = @label_field if @label_field != "label"
      data[:select_search_param_value] = @search_param if @search_param != "query"
      data[:select_per_page_value] = @per_page if @per_page != 60
      data[:select_virtual_scroll_value] = true if @virtual_scroll
      data[:select_response_data_field_value] = @response_data_field if @response_data_field != "data"
      data
    end

    def core_behavior_data_attributes
      data = {}
      data[:select_allow_new_value] = true if @allow_new
      data[:select_optgroup_columns_value] = true if @optgroup_columns
      data[:select_submit_on_change_value] = true if @submit_on_change
      data[:select_dropdown_input_placeholder_value] = @dropdown_input_placeholder if @dropdown_input_placeholder != "Search..."
      data
    end

    def update_field_data_attributes
      return {} unless @update_field

      data = { select_update_field_value: true }
      data[:select_update_field_target_value] = @update_field_target if @update_field_target.present?
      data[:select_update_field_source_value] = @update_field_source if @update_field_source != "name"
      data
    end

    def multiselect_data_attributes
      data = {}
      if @multiple && @show_count
        data[:select_show_count_value] = true
        data[:select_count_text_value] = @count_text
        data[:select_count_text_singular_value] = @count_text_singular if @count_text_singular.present?
      end
      data[:select_tags_position_value] = @tags_position if @multiple && @tags_position != "inline"
      data[:select_enable_flag_toggle_value] = true if @enable_flag_toggle
      data
    end

    def rendering_data_attributes
      data = {}
      data[:select_image_field_value] = @image_field if @image_field.present?
      data[:select_subtitle_field_value] = @subtitle_field if @subtitle_field.present?
      data[:select_meta_fields_value] = @meta_fields if @meta_fields.present?
      data[:select_badge_field_value] = @badge_field if @badge_field.present?
      data[:select_render_template_value] = @render_template if @render_template.present?
      data
    end

    def i18n_data_attributes
      data = {}
      data[:select_no_more_results_text_value] = @no_more_results_text if @no_more_results_text != "No more results"
      data[:select_no_search_results_text_value] = @no_results_text if @no_results_text != "No results found for"
      data[:select_loading_text_value] = @loading_text if @loading_text != "Loading..."
      data[:select_create_text_value] = @create_text if @create_text != "Add"
      data
    end

    def generate_id
      "select_#{SecureRandom.hex(4)}"
    end

    def base_select_classes
      "w-full [&>*:first-child]:!cursor-pointer"
    end

    def size_classes
      case @size
      when :sm then "text-sm"
      when :lg then "text-lg"
      else ""
      end
    end

    def state_classes
      classes = []
      classes << "cursor-not-allowed" if @disabled
      classes.join(" ")
    end

    def formatted_options
      @options.map do |opt|
        if opt.is_a?(Hash)
          format_rich_option(opt)
        elsif opt.is_a?(Array) && opt.length >= 2
          opt
        else
          [opt.to_s, opt.to_s]
        end
      end
    end

    def format_rich_option(opt)
      if opt[:icon] || opt[:description] || opt[:side]
        json_data = {
          icon: opt[:icon],
          name: opt[:label] || opt[:name],
          description: opt[:description],
          side: opt[:side]
        }.compact.to_json
        [json_data, opt[:value]]
      else
        [opt[:label] || opt[:name], opt[:value]]
      end
    end

    attr_reader :name, :id, :options, :selected, :placeholder, :multiple, :dropdown_input,
                :clearable, :disabled, :required, :grouped, :label, :description, :error,
                :size, :allow_new, :scroll_buttons, :disable_typing, :submit_on_change,
                :update_field, :update_field_target, :update_field_source, :url, :value_field,
                :label_field, :search_param, :per_page, :virtual_scroll, :optgroup_columns,
                :response_data_field, :dropdown_input_placeholder, :show_count, :count_text,
                :count_text_singular, :tags_position, :enable_flag_toggle, :image_field,
                :subtitle_field, :meta_fields, :badge_field, :render_template,
                :no_more_results_text, :no_results_text, :loading_text, :create_text
  end
end
