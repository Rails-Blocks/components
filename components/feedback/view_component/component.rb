# frozen_string_literal: true

module Feedback
  class Component < ViewComponent::Base
    ANCHOR_POINTS = %i[center top_left top top_right left right bottom_left bottom bottom_right].freeze

    # @param button_text [String] Text displayed on the feedback button
    # @param placeholder [String] Placeholder text for the textarea
    # @param submit_text [String] Text for the submit button
    # @param anchor_point [Symbol] Where the form expands from: :center, :top_left, :top, :top_right, :left, :right, :bottom_left, :bottom, :bottom_right
    # @param form_action [String] Optional form action URL (defaults to no action - JS handles submission)
    # @param form_method [String] Form method: "post", "get" (default: "post")
    # @param name [String] Name attribute for the textarea (for form submissions)
    # @param classes [String] Additional CSS classes for the wrapper
    def initialize(
      button_text: "Feedback",
      placeholder: "Tell us what you think...",
      submit_text: "Send feedback",
      anchor_point: :center,
      form_action: nil,
      form_method: "post",
      name: "feedback",
      classes: nil
    )
      super()
      @button_text = button_text
      @placeholder = placeholder
      @submit_text = submit_text
      @anchor_point = ANCHOR_POINTS.include?(anchor_point) ? anchor_point : :center
      @form_action = form_action
      @form_method = form_method
      @name = name
      @classes = classes
    end

    def wrapper_classes
      base = case @anchor_point
             when :top_left, :top, :top_right
               "flex items-start justify-center relative"
             when :bottom_left, :bottom, :bottom_right
               "flex items-end justify-center relative"
             when :left
               "flex items-center justify-start relative"
             when :right
               "flex items-center justify-end relative"
             else # :center
               "flex items-center justify-center relative"
             end
      [base, @classes].compact.reject(&:empty?).join(" ")
    end

    def anchor_point_value
      @anchor_point.to_s.tr("_", "-")
    end

    def controller_data
      {
        data: {
          controller: "feedback",
          feedback_expanded_value: false,
          feedback_anchor_point_value: anchor_point_value,
          feedback_target: "container"
        }
      }
    end

    def button_classes
      [
        "flex items-center justify-center gap-1.5 rounded-lg border border-black/10",
        "bg-white/90 px-3.5 py-2 text-sm font-medium whitespace-nowrap text-neutral-800",
        "shadow-xs transition-all duration-100 ease-in-out select-none",
        "hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2",
        "focus-visible:outline-neutral-600 disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-white/10 dark:bg-neutral-700/50 dark:text-neutral-50",
        "dark:hover:bg-neutral-700/75 dark:focus-visible:outline-neutral-200"
      ].join(" ")
    end

    def form_wrapper_classes
      [
        "absolute hidden h-32 w-64 sm:h-48 sm:w-96 overflow-hidden rounded-lg",
        "border border-black/5 bg-neutral-100 p-1.5 shadow-xs outline-none",
        "dark:border-white/10 dark:bg-neutral-900 dark:shadow-neutral-900/50"
      ].join(" ")
    end

    def form_inner_classes
      [
        "flex h-full flex-col overflow-hidden rounded-lg border border-black/10",
        "bg-white dark:border-neutral-600 dark:bg-neutral-700/75"
      ].join(" ")
    end

    def textarea_classes
      [
        "small-scrollbar w-full flex-1 resize-none rounded-t-lg p-3 text-sm",
        "text-black placeholder-neutral-500 outline-none",
        "dark:text-neutral-100 dark:placeholder-neutral-400"
      ].join(" ")
    end

    def submit_button_classes
      [
        "ml-auto flex items-center justify-center rounded-md bg-neutral-800",
        "py-1 px-2 text-xs font-medium text-white transition-colors duration-200",
        "hover:bg-neutral-700 dark:bg-white dark:text-neutral-800 dark:hover:bg-neutral-100"
      ].join(" ")
    end

    def footer_classes
      [
        "relative flex h-12 items-center border-t border-dashed border-black/10",
        "bg-neutral-50 px-2.5 dark:border-white/20 dark:bg-neutral-800"
      ].join(" ")
    end

    attr_reader :button_text, :placeholder, :submit_text, :form_action, :form_method, :name
  end
end
