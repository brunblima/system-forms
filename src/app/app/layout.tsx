import { auth } from "@/services/auth/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import Sidebar from "./_components/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SessionProvider } from "next-auth/react";

export default async function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  let user = undefined;
  const session = await auth();
  if (session) {
    user = session.user;
  } else {
    return redirect("/");
  }

  return (
    <div className="flex min-h-screen w-full">
      <SessionProvider>
        <SidebarProvider>
          <Sidebar user={user} />
          <div className="flex w-full flex-col">
            <SidebarTrigger className="md:hidden ml-2 mt-2" />
            <main>{children}</main>
          </div>
        </SidebarProvider>
      </SessionProvider>
    </div>
  );
}
