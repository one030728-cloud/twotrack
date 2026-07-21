import type { Metadata } from "next";
import { MswProvider } from "@/mocks/MswProvider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SnackbarProvider } from "@/components/ui/snackbar";
import { themeInitScript } from "@/components/theme/theme-script";
import { AppShell } from "@/features/auth/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "POSMOS 전산 시스템",
  description: "포스 설치 및 가입 대행 전산 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex h-dvh overflow-hidden">
        <ThemeProvider>
          <SnackbarProvider>
            <MswProvider>
              <AppShell>{children}</AppShell>
            </MswProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
