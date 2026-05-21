# frozen_string_literal: true

module TreeView
  class Component
    class NodeComponent < ViewComponent::Base
      renders_many :children, lambda { |label:, type: :file, value: nil, name: nil, default_open: false, icon: nil, disabled: false, checked: false, classes: nil, &block|
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

      attr_reader :label, :type, :value, :disabled, :selectable

      # @param label [String] Display name of the node (file/folder name)
      # @param type [Symbol] Node type: :file or :folder
      # @param value [String] Value for checkbox when selectable (defaults to label)
      # @param name [String] Form field name for checkbox
      # @param default_open [Boolean] Whether folder starts expanded
      # @param icon [String] Custom icon HTML (optional, uses default file/folder icons)
      # @param disabled [Boolean] Whether this node is disabled
      # @param checked [Boolean] Whether this node's checkbox is checked (when selectable)
      # @param selectable [Boolean] Whether checkboxes are enabled (inherited from parent)
      # @param classes [String] Additional CSS classes
      def initialize(label:, type: :file, value: nil, name: nil, default_open: false, icon: nil, disabled: false, checked: false, selectable: false, classes: nil)
        super()
        @label = label
        @type = type.to_sym
        @value = value || label
        @name = name
        @default_open = default_open
        @icon = icon
        @disabled = disabled
        @checked = checked
        @selectable = selectable
        @classes = classes
      end

      def unique_id
        @unique_id ||= "tree-node-#{SecureRandom.hex(4)}"
      end

      def folder?
        @type == :folder
      end

      def file?
        @type == :file
      end

      def state
        @default_open ? "open" : "closed"
      end

      def aria_expanded
        @default_open ? "true" : "false"
      end

      def content_hidden?
        !@default_open
      end

      def node_classes
        base = "flex flex-col gap-y-1"
        [base, @classes].compact.reject(&:empty?).join(" ")
      end

      def row_classes
        if @selectable
          "flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 has-[:checked]:bg-neutral-200 dark:has-[:checked]:bg-neutral-700"
        else
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700/50 outline-hidden focus:underline"
        end
      end

      def file_row_classes
        if @selectable
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 has-[:checked]:bg-neutral-200 dark:has-[:checked]:bg-neutral-700 has-[:checked]:text-neutral-900 dark:has-[:checked]:text-neutral-50"
        else
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 outline-hidden focus:underline"
        end
      end

      def folder_button_classes
        if @selectable
          "flex flex-1 items-center gap-2 text-sm outline-hidden focus:underline"
        else
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700/50 outline-hidden focus:underline"
        end
      end

      def file_button_classes
        "flex flex-1 items-center gap-2 outline-hidden focus:underline"
      end

      def content_classes
        "grid transition-[grid-template-rows] duration-300 ease-in-out data-[state=open]:grid-rows-[1fr] data-[state=closed]:grid-rows-[0fr]"
      end

      def content_inner_classes
        "ml-4 pl-2 border-l border-neutral-200 dark:border-neutral-700 flex flex-col gap-y-1 overflow-hidden min-h-0"
      end

      def checkbox_data_attrs
        if folder?
          # Folder checkboxes toggle their children
          {
            'checkbox-select-all-target': "checkbox child",
            action: "click->checkbox-select-all#toggleChildren click->checkbox-select-all#toggle"
          }
        else
          # File checkboxes just toggle themselves
          {
            'checkbox-select-all-target': "checkbox child",
            action: "click->checkbox-select-all#toggle"
          }
        end
      end

      def render_folder_icon
        if @default_open
          open_folder_svg
        else
          closed_folder_svg
        end
      end

      def open_folder_svg
        %(<svg data-tree-view-target="icon" class="folder-open" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor"><path d="M5,14.75h-.75c-1.105,0-2-.895-2-2V4.75c0-1.105,.895-2,2-2h1.825c.587,0,1.144,.258,1.524,.705l1.524,1.795h4.626c1.105,0,2,.895,2,2v1"></path><path d="M16.148,13.27l.843-3.13c.257-.953-.461-1.89-1.448-1.89H6.15c-.678,0-1.272,.455-1.448,1.11l-.942,3.5c-.257,.953,.461,1.89,1.448,1.89H14.217c.904,0,1.696-.607,1.931-1.48Z"></path></g></svg>).html_safe
      end

      def closed_folder_svg
        %(<svg data-tree-view-target="icon" class="folder-closed" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor"><path d="M13.75,5.25c1.105,0,2,.895,2,2v5.5c0,1.105-.895,2-2,2H4.25c-1.105,0-2-.895-2-2V4.75c0-1.105,.895-2,2-2h1.825c.587,0,1.144,.258,1.524,.705l1.524,1.795h4.626Z"></path></g></svg>).html_safe
      end

      def file_svg
        %(<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor"><path d="M15.16,6.25h-3.41c-.552,0-1-.448-1-1V1.852"></path><path d="M2.75,14.25V3.75c0-1.105,.895-2,2-2h5.586c.265,0,.52,.105,.707,.293l3.914,3.914c.188,.188,.293,.442,.293,.707v7.586c0,1.105-.895,2-2,2H4.75c-1.105,0-2-.895-2-2Z"></path></g></svg>).html_safe
      end
    end
  end
end
