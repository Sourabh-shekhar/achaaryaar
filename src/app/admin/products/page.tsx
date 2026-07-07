import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AdminProductsClient from "./AdminProductsClient";

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    redirect("/login");
  }

  return <AdminProductsClient />;
}