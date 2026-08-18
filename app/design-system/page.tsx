import { assertDevOnlyRoute } from "@/lib/dev-only-route"
import DesignSystemGallery from "./gallery"

export default function DesignSystemPage() {
  assertDevOnlyRoute()
  return <DesignSystemGallery />
}
