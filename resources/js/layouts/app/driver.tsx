import AppLayout from "@/layouts/app-layout";
import React from "react";

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout>
      <main>{children}</main>
    </AppLayout>
  );
} 