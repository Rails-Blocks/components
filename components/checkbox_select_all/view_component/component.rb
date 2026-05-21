# frozen_string_literal: true

module CheckboxSelectAll
  class Component < ViewComponent::Base
    renders_one :action_bar

    renders_many :items, lambda { |label:, value:, name: nil, checked: false, disabled: false, id: nil, classes: nil|
      CheckboxSelectAll::Component::ItemComponent.new(
        label: label,
        value: value,
        name: name || @name,
        checked: checked,
        disabled: disabled,
        id: id,
        classes: classes
      )
    }

    renders_many :groups, lambda { |label:, description: nil, icon: nil, classes: nil, &block|
      CheckboxSelectAll::Component::GroupComponent.new(
        label: label,
        description: description,
        icon: icon,
        name: @name,
        classes: classes,
        &block
      )
    }

    # @param select_all_label [String] Label for the select all checkbox
    # @param name [String] Form field name for checkboxes (e.g., "items[]")
    # @param toggle_key [String] Keyboard shortcut to toggle focused checkbox (e.g., "x")
    # @param total_items [Integer] Total items across all pages (for "select all pages" feature)
    # @param base_amount [Number] Base amount for total calculation
    # @param show_action_bar [Boolean] Show action bar when items are selected
    # @param show_count [Boolean] Show selected count in action bar
    # @param classes [String] Additional CSS classes for the wrapper
    def initialize(
      select_all_label: "Select All",
      name: "items[]",
      toggle_key: nil,
      total_items: nil,
      base_amount: nil,
      show_action_bar: false,
      show_count: false,
      classes: nil
    )
      super()
      @select_all_label = select_all_label
      @name = name
      @toggle_key = toggle_key
      @total_items = total_items
      @base_amount = base_amount
      @show_action_bar = show_action_bar
      @show_count = show_count
      @classes = classes
    end

    def wrapper_classes
      base = "w-full"
      [base, @classes].compact.reject(&:empty?).join(" ")
    end

    def controller_data
      data = { controller: "checkbox-select-all" }
      data[:'checkbox-select-all-toggle-key-value'] = @toggle_key if @toggle_key.present?
      data[:'checkbox-select-all-total-items-value'] = @total_items if @total_items.present?
      data[:'checkbox-select-all-base-amount-value'] = @base_amount if @base_amount.present?
      { data: data }
    end

    def unique_id
      @unique_id ||= SecureRandom.hex(4)
    end

    def action_bar_content
      return action_bar if action_bar?

      content
    end

    attr_reader :select_all_label, :show_action_bar, :show_count
  end
end
