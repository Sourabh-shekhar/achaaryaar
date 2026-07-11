import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AdminProductsClient from "./AdminProductsClient";

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);


  console.log("SESSION:", JSON.stringify(session, null, 2));
  if (
    !session ||
    (session.user as { role?: string }).role !== "admin"
  ) {
    redirect("/admin/login");
  }

  return <AdminProductsClient />;
}