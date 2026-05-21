# frozen_string_literal: true

module Table
  class Component < ViewComponent::Base
    DENSITIES = %i[default compact].freeze
    ROUNDED = %i[none sm md lg xl].freeze

    renders_one :caption
    renders_one :head
    renders_one :body
    renders_one :foot

    # Convenience slots for simple table building
    renders_many :columns, lambda { |label:, align: :left, classes: nil|
      Table::Component::ColumnComponent.new(label: label, align: align, classes: classes)
    }

    renders_many :rows, lambda { |classes: nil|
      Table::Component::RowComponent.new(classes: classes, striped: @striped, hoverable: @hoverable, density: @density)
    }

    # @param striped [Boolean] Alternate row background colors
    # @param hoverable [Boolean] Highlight rows on hover
    # @param bordered [Boolean] Show borders between cells
    # @param density [Symbol] Row density: :default, :compact
    # @param sticky_header [Boolean] Make header sticky on scroll
    # @param rounded [Symbol] Border radius: :none, :sm, :md, :lg, :xl
    # @param full_width [Boolean] Table takes full container width
    # @param responsive [Boolean] Enable horizontal scroll on small screens
    # @param max_height [String] Max height for scrollable table (e.g., "400px")
    # @param container [Boolean] Wrap table in styled container
    # @param classes [String] Additional CSS classes for the table
    # @param container_classes [String] Additional CSS classes for the container
    def initialize(
      striped: false,
      hoverable: false,
      bordered: true,
      density: :default,
      sticky_header: false,
      rounded: :xl,
      full_width: true,
      responsive: true,
      max_height: nil,
      container: true,
      classes: nil,
      container_classes: nil
    )
      super()
      @striped = striped
      @hoverable = hoverable
      @bordered = bordered
      @density = DENSITIES.include?(density) ? density : :default
      @sticky_header = sticky_header
      @rounded = ROUNDED.include?(rounded) ? rounded : :xl
      @full_width = full_width
      @responsive = responsive
      @max_height = max_height
      @container = container
      @classes = classes
      @container_classes = container_classes
    end

    def container_wrapper_classes
      base = "bg-white dark:bg-neutral-900 overflow-hidden"
      classes = [base]
      classes << rounded_classes
      classes << "border border-black/10 dark:border-white/10" if @bordered
      classes << "shadow-xs"
      classes << @container_classes if @container_classes
      classes.compact.reject(&:empty?).join(" ")
    end

    def scroll_wrapper_classes
      base = "overflow-x-auto"
      classes = [base]
      if @max_height
        classes << "overflow-y-auto small-scrollbar"
      end
      classes.join(" ")
    end

    def scroll_wrapper_style
      @max_height ? "max-height: #{@max_height};" : nil
    end

    def table_classes
      classes = []
      classes << "w-full" if @full_width
      classes << @classes if @classes
      classes.compact.reject(&:empty?).join(" ")
    end

    def thead_classes
      if @sticky_header
        "sticky top-0 z-10 bg-neutral-100/75 dark:bg-neutral-800/75 backdrop-blur-sm backdrop-filter"
      else
        "bg-neutral-100 dark:bg-neutral-800"
      end
    end

    def tbody_classes
      classes = []
      classes << "*:even:bg-neutral-50 dark:*:even:bg-neutral-800/50" if @striped
      classes << density_cell_padding
      classes.compact.reject(&:empty?).join(" ")
    end

    def th_classes
      base = "text-sm font-semibold text-neutral-900 dark:text-neutral-50"
      padding = density_header_padding
      border = header_border_style.to_s
      [base, padding, border].reject(&:empty?).join(" ")
    end

    def render_with_container?
      @container
    end

    def simple_structure?
      columns.any? || rows.any?
    end

    private

    def rounded_classes
      case @rounded
      when :none then ""
      when :sm then "rounded-sm"
      when :md then "rounded-md"
      when :lg then "rounded-lg"
      when :xl then "rounded-xl"
      else "rounded-xl"
      end
    end

    def density_header_padding
      case @density
      when :compact
        "*:py-2.5"
      else
        "*:py-3"
      end
    end

    def density_cell_padding
      case @density
      when :compact
        "*:*:py-3"
      else
        "*:*:py-4"
      end
    end

    def header_border_style
      "*:text-left *:[box-shadow:inset_0_-1px_0_0_rgb(229_229_229)] dark:*:[box-shadow:inset_0_-1px_0_0_rgb(46_46_46)]"
    end

    attr_reader :striped, :hoverable, :bordered, :density, :sticky_header
  end
end
