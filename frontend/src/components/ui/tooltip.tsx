// Import React and Radix UI Tooltip primitives
import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

// Import a utility function for merging class names
import { cn } from "@/lib/utils"

// Re-export Radix Tooltip primitives for easier use in your app
const TooltipProvider = TooltipPrimitive.Provider // Provides context for tooltips
const Tooltip = TooltipPrimitive.Root             // The root component for a tooltip
const TooltipTrigger = TooltipPrimitive.Trigger   // The element that triggers the tooltip

// TooltipContent: The actual tooltip box that appears
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(
  // Props: className (for custom styles), sideOffset (distance from trigger), ...props (other props)
  ({ className, sideOffset = 4, ...props }, ref) => (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      // Merge default and custom class names for styling and animation
      className={cn(
        "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  )
)
// Set the display name for debugging and React DevTools
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Export all tooltip components for use in your app
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }