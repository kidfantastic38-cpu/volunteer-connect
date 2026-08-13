import type { Metadata } from "next"
import { ComponentGallery } from "@/components/design-system/component-gallery"

export const metadata: Metadata = {
  title: "Component Library — VOLUNTEER CONNECT",
  description:
    "The building blocks of VOLUNTEER CONNECT: navigation, data display, forms, feedback and utility components, each documented in all states.",
}

export default function ComponentsPage() {
  return <ComponentGallery />
}
