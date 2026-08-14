import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PANJOS - Autodiagnóstico",
  description: "Servicio Mecánico Multimarca - Autodiagnóstico Panjos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#060606] text-white selection:bg-red-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
