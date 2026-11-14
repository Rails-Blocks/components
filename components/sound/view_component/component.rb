# frozen_string_literal: true

module Sound
  # Wraps content in the sound Stimulus controller. Inside it, any element can play a sound with
  # data-sound="name" (or with sound#… actions). Put one around your whole layout for app-wide
  # sounds, or around a section to give it its own default sound or volume.
  class Component < ViewComponent::Base
    # @param tag [Symbol] The wrapper element, e.g. :div, :section, :li (default: :div)
    # @param name [String] Default sound for elements with an empty data-sound (default: "tap")
    # @param volume [Float] Volume for this wrapper, 0 to 1, multiplied with the global volume (default: 1)
    # @param respect_motion [Boolean] Start muted for people who prefer reduced motion, until they unmute (default: true)
    # @param play_on_connect [String] A sound played once when the element appears, e.g. in a Turbo Stream (default: nil)
    # @param classes [String] Additional CSS classes for the wrapper
    # @param html_options [Hash] Other HTML attributes for the wrapper (id, aria, data, …)
    def initialize(
      tag: :div,
      name: "tap",
      volume: 1,
      respect_motion: true,
      play_on_connect: nil,
      classes: nil,
      html_options: {}
    )
      super()

      @tag = tag
      @name = name.to_s
      @volume = volume.to_f.clamp(0.0, 1.0)
      @respect_motion = respect_motion
      @play_on_connect = play_on_connect.to_s.presence
      @classes = classes
      @html_options = html_options
    end

    def call
      content_tag(@tag, content, **wrapper_attributes)
    end

    private

    def wrapper_attributes
      extra_data = (@html_options[:data] || {}).dup
      controllers = [extra_data.delete(:controller), "sound"].compact.join(" ")

      @html_options.except(:data, :class).merge(
        class: ["group/sound", @classes, @html_options[:class]].compact.join(" "),
        data: extra_data.merge(controller: controllers).merge(sound_data)
      )
    end

    def sound_data
      data = {}
      data[:sound_name_value] = @name unless @name == "tap"
      data[:sound_volume_value] = @volume if @volume < 1
      data[:sound_respect_motion_value] = "false" unless @respect_motion
      data[:sound_play_on_connect_value] = @play_on_connect if @play_on_connect
      data
    end
  end
end
