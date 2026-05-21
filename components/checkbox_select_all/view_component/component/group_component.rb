# frozen_string_literal: true

module CheckboxSelectAll
  class Component
    class GroupComponent < ViewComponent::Base
      renders_many :items, lambda { |label:, value:, name: nil, checked: false, disabled: false, id: nil, classes: nil|
        CheckboxSelectAll::Component::ItemComponent.new(
          label: label,
          value: value,
          name: name || @name,
          checked: checked,
          disabled: disabled,
          id: id,
          is_child: true,
          classes: classes
        )
      }

      renders_many :groups, lambda { |label:, description: nil, icon: nil, classes: nil, &block|
        CheckboxSelectAll::Component::GroupComponent.new(
          label: label,
          description: description,
          icon: icon,
          name: @name,
          level: @level + 1,
          classes: classes,
          &block
        )
      }

      attr_reader :label, :description, :icon

      # @param label [String] The group label
      # @param description [String] Optional description text
      # @param icon [String] Optional icon HTML (safe)
      # @param name [String] Form field name for child checkboxes
      # @param classes [String] Additional CSS classes
      def initialize(label:, description: nil, icon: nil, name: nil, level: 0, classes: nil)
        super()
        @label = label
        @description = description
        @icon = icon
        @name = name
        @level = level
        @classes = classes
      end

      def unique_id
        @unique_id ||= "group-#{SecureRandom.hex(4)}"
      end

      def group_classes
        base = @level.zero? ? "p-4 flex flex-col gap-2" : "flex flex-col gap-2"
        [base, @classes].compact.reject(&:empty?).join(" ")
      end
    end
  end
end
