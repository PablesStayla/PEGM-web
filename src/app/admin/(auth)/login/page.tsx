import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const target =
    typeof from === "string" && from.startsWith("/admin") ? from : "/admin";

  return <LoginForm from={target} />;
}
