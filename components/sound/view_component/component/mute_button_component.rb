# frozen_string_literal: true

module Sound
  class Component
    # A button that mutes and unmutes every interface sound. The preference is global (shared by all
    # sound controllers) and remembered in localStorage. It works anywhere: it brings its own sound
    # controller, so it does not need to sit inside a Sound::Component.
    class MuteButtonComponent < ViewComponent::Base
      SIZES = %i[sm md lg].freeze

      # @param label [String] Accessible name, and the visible text when show_label is true (default: "Mute sounds")
      # @param show_label [Boolean] Show the label next to the icon (default: false)
      # @param size [Symbol] :sm, :md or :lg (default: :md)
      # @param classes [String] Additional CSS classes for the button
      def initialize(label: "Mute sounds", show_label: false, size: :md, classes: nil)
        super()

        @label = label
        @show_label = show_label
        @size = SIZES.include?(size) ? size : :md
        @classes = classes
      end

      attr_reader :label, :show_label

      def button_classes
        [
          "flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-transparent font-medium whitespace-nowrap text-neutral-500 transition-all duration-100 ease-in-out select-none hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 aria-pressed:text-neutral-400 dark:text-neutral-400 dark:hover:bg-neutral-600/50 dark:hover:text-white dark:focus-visible:outline-neutral-200 dark:aria-pressed:text-neutral-500",
          size_classes,
          @classes
        ].compact.join(" ")
      end

      def icon_classes
        { sm: "size-3.5", md: "size-4", lg: "size-5" }.fetch(@size)
      end

      private

      def size_classes
        if @show_label
          { sm: "px-2 py-1 text-xs", md: "px-2.5 py-1.5 text-sm", lg: "px-3 py-2 text-base" }.fetch(@size)
        else
          { sm: "size-7", md: "size-9", lg: "size-11" }.fetch(@size)
        end
      end
    end
  end
end
