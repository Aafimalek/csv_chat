import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 neo-border",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground neo-shadow",
                destructive:
                    "bg-destructive text-destructive-foreground neo-shadow",
                outline:
                    "bg-background hover:bg-accent hover:text-accent-foreground neo-shadow",
                secondary:
                    "bg-secondary text-secondary-foreground neo-shadow",
                ghost: "hover:bg-accent hover:text-accent-foreground border-transparent",
                link: "text-primary underline-offset-4 hover:underline border-transparent",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 px-3",
                lg: "h-11 px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = (asChild ? Slot : motion.button) as any

        // Only apply motion props if not a Slot (Slot doesn't accept motion props directly in this pattern easily without more work)
        // For simplicity, we'll assume standard button usage for animations.
        // If asChild is true, animations might need to be handled by the child or a wrapper.
        const motionProps = !asChild ? {
            whileHover: { x: -2, y: -2, boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)" },
            whileTap: { x: 0, y: 0, boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" },
            transition: { type: "spring", stiffness: 400, damping: 17 }
        } : {}

        // Adjust shadow color for dark mode in motion props if needed, but CSS class handles static shadow.
        // Dynamic shadow color in Framer Motion is tricky with CSS classes. 
        // We'll stick to a simple translate effect for now which is safer and effective.

        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
                {...(!asChild ? {
                    whileHover: { x: -2, y: -2 },
                    whileTap: { x: 0, y: 0 },
                } : {})}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
