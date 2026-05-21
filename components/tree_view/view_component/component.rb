# frozen_string_literal: true

module TreeView
  class Component < ViewComponent::Base
    renders_many :nodes, lambda { |label:, type: :file, value: nil, name: nil, default_open: false, icon: nil, disabled: false, checked: false, classes: nil, &block|
      TreeView::Component::NodeComponent.new(
        label: label,
        type: type,
        value: value,
        name: name || @name,
        default_open: default_open,
        icon: icon,
        disabled: disabled,
        checked: checked,
        selectable: @selectable,
        classes: classes,
        &block
      )
    }

    # @param selectable [Boolean] Enable checkbox selection on nodes
    # @param name [String] Form field name for checkboxes when selectable (e.g., "files[]")
    # @param select_all_label [String] Label for the select all checkbox (when selectable)
    # @param show_select_all [Boolean] Show select all checkbox at the top
    # @param toggle_key [String] Keyboard shortcut to toggle focused checkbox (e.g., "x")
    # @param animate [Boolean] Enable expand/collapse animations
    # @param variant [Symbol] Visual variant: :default, :bordered
    # @param classes [String] Additional CSS classes for the wrapper
    def initialize(
      selectable: false,
      name: "items[]",
      select_all_label: "Select All",
      show_select_all: true,
      toggle_key: nil,
      animate: true,
      variant: :default,
      classes: nil
    )
      super()
      @selectable = selectable
      @name = name
      @select_all_label = select_all_label
      @show_select_all = show_select_all
      @toggle_key = toggle_key
      @animate = animate
      @variant = variant
      @classes = classes
    end

    def wrapper_classes
      base = "h-auto w-full"
      variant_class = case @variant
                      when :bordered
                        "p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                      else
                        ""
                      end
      [base, variant_class, @classes].compact.reject(&:empty?).join(" ")
    end

    def controller_data
      controllers = ["tree-view"]
      controllers << "checkbox-select-all" if @selectable

      data = { controller: controllers.join(" ") }
      data[:'tree-view-animate-value'] = @animate

      if @selectable && @toggle_key.present?
        data[:'checkbox-select-all-toggle-key-value'] = @toggle_key
      end

      { data: data }
    end

    def unique_id
      @unique_id ||= SecureRandom.hex(4)
    end

    attr_reader :selectable, :select_all_label, :show_select_all
  end
end
