# frozen_string_literal: true

module CheckboxSelectAll
  class Component
    class ItemComponent < ViewComponent::Base
      attr_reader :label, :value, :name, :checked, :disabled, :is_child

      # @param label [String] The checkbox label
      # @param value [String] The checkbox value
      # @param name [String] Form field name
      # @param checked [Boolean] Whether checkbox starts checked
      # @param disabled [Boolean] Whether checkbox is disabled
      # @param id [String] Optional custom id
      # @param is_child [Boolean] Whether this is a child item in a group (affects styling and targets)
      # @param classes [String] Additional CSS classes
      def initialize(label:, value:, name:, checked: false, disabled: false, id: nil, is_child: false, classes: nil)
        super()
        @label = label
        @value = value
        @name = name
        @checked = checked
        @disabled = disabled
        @id = id
        @is_child = is_child
        @classes = classes
      end

      def unique_id
        @unique_id ||= @id || "checkbox-#{SecureRandom.hex(4)}"
      end

      def item_classes
        base = if is_child
                 "-ml-2 pl-2 -mr-3 pr-3 py-1.5 rounded-md border border-transparent " \
                   "has-[:checked]:bg-neutral-100 dark:has-[:checked]:bg-neutral-800 " \
                   "has-[:checked]:border-black/5 dark:has-[:checked]:border-white/10"
               else
                 "px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 has-[:checked]:bg-neutral-50 dark:has-[:checked]:bg-neutral-800/50"
               end
        [base, @classes].compact.reject(&:empty?).join(" ")
      end

      def checkbox_targets
        is_child ? "checkbox child" : "checkbox"
      end

      def label_classes
        base = "inline-block text-sm cursor-pointer select-none"
        checked_state = is_child ? " has-[:checked]:text-neutral-900 dark:has-[:checked]:text-neutral-50 has-[:checked]:font-medium" : ""
        disabled_state = disabled ? " opacity-50" : ""
        "#{base}#{checked_state}#{disabled_state}"
      end
    end
  end
end
