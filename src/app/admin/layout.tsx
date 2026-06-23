import { redirect } from "next/navigation";
import { auth, isModerator } from "@/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin/contributions");
  }
  if (!isModerator(session.user.role)) {
    redirect("/");
  }
  return <>{children}</>;
}
