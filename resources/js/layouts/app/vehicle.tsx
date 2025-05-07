import AppLayout from "@/layouts/app-layout";
import React from "react";

export default function VehicleLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout>
      <main>{children}</main>
    </AppLayout>
  );
} 