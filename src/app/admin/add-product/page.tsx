import { redirect } from "next/navigation";

export default function AddProductPage() {
  // The products dashboard is the single, current editor. It supports
  // multiple images, regular products, and combo packs.
  redirect("/admin/products");
}
