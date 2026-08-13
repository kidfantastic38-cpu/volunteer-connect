import Link from "next/link"
import type { ComponentProps } from "react"
import { type VariantProps } from "class-variance-authority"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ButtonLinkProps = ComponentProps<typeof Link> &
  VariantProps<typeof buttonVariants> & {
    sizeUp?: boolean
  }

export function ButtonLink({ className, variant, size, sizeUp, ...props }: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        buttonVariants({ variant, size }),
        sizeUp && "h-11 gap-2 px-6 text-sm",
        className,
      )}
      {...props}
    />
  )
}
