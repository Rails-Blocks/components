# frozen_string_literal: true

module DarkModeSwitcher
  class Component < ViewComponent::Base
    VARIANTS = %i[segmented cycle cycle_icon].freeze
    MODES = %i[system light dark].freeze
    LABELS = {
      system: "System",
      light: "Light mode",
      dark: "Dark mode"
    }.freeze
    ICON_PATHS = {
      system: "M5.75 15.75C6.508 15.511 7.628 15.25 9 15.25C9.795 15.25 10.941 15.338 12.25 15.75 M9 12.75V15.25 M14.25 2.75H3.75C2.645 2.75 1.75 3.645 1.75 4.75V10.75C1.75 11.855 2.645 12.75 3.75 12.75H14.25C15.355 12.75 16.25 11.855 16.25 10.75V4.75C16.25 3.645 15.355 2.75 14.25 2.75Z",
      light: "M9 1.25V2.25 M14.48 3.52L13.773 4.227 M16.75 9H15.75 M14.48 14.48L13.773 13.773 M9 16.75V15.75 M3.52 14.48L4.227 13.773 M1.25 9H2.25 M3.52 3.52L4.227 4.227 M13.25 9A4.25 4.25 0 1 1 4.75 9A4.25 4.25 0 0 1 13.25 9Z",
      dark: "M13 11.75C9.548 11.75 6.75 8.952 6.75 5.5C6.75 4.148 7.183 2.901 7.912 1.878C4.548 2.506 2 5.453 2 9C2 13.004 5.246 16.25 9.25 16.25C12.622 16.25 15.448 13.944 16.259 10.826C15.309 11.409 14.196 11.75 13 11.75Z"
    }.freeze

    # @param variant [Symbol] :segmented, :cycle, or :cycle_icon
    # @param classes [String, nil] Additional wrapper classes
    def initialize(variant: :segmented, classes: nil)
      super()
      normalized_variant = variant.to_s.to_sym
      @variant = VARIANTS.include?(normalized_variant) ? normalized_variant : :segmented
      @classes = classes
    end

    def cycle?
      %i[cycle cycle_icon].include?(@variant)
    end

    def icon_only?
      @variant == :cycle_icon
    end

    def modes
      MODES
    end

    def label_for(mode)
      LABELS.fetch(mode)
    end

    def icon_path_for(mode)
      ICON_PATHS.fetch(mode)
    end

    attr_reader :classes
  end
end
