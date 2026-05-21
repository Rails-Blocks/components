# frozen_string_literal: true

module Table
  class Component
    class RowComponent < ViewComponent::Base
      renders_many :cells, lambda { |align: :left, primary: false, classes: nil|
        Table::Component::CellComponent.new(align: align, primary: primary, density: @density, classes: classes)
      }

      def initialize(classes: nil, striped: false, hoverable: false, density: :default)
        super()
        @classes = classes
        @striped = striped
        @hoverable = hoverable
        @density = density
      end

      def row_classes
        classes = []
        classes << "hover:bg-neutral-50 dark:hover:bg-neutral-800/50" if @hoverable
        classes << "[box-shadow:inset_0_-1px_0_0_rgb(229_229_229)] dark:[box-shadow:inset_0_-1px_0_0_rgb(46_46_46)] last:[box-shadow:none]"
        classes << @classes if @classes
        classes.compact.reject(&:empty?).join(" ")
      end

      attr_reader :striped, :hoverable, :density
    end
  end
end
