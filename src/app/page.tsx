"use client";

import { useAuth } from "@/features/auth/auth-provider";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";

export default function Home() {
  const { user } = useAuth();
  const isLeadOrMaster =
    !!user &&
    (user.positions.includes("team_lead") || user.positions.includes("master"));

  if (isLeadOrMaster) {
    return <DashboardPage />;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          POSMOS 전산 시스템
        </h1>
        <p className="text-muted-foreground text-sm">
          포스 설치 및 가입 대행 전산 시스템
        </p>
      </div>
    </div>
  );
}
