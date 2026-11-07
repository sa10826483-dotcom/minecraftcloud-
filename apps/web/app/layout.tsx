import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MinecraftCloud - 24/7 Java & Bedrock Cloud Server Hosting',
  description:
    'Production-ready cloud hosting platform for Minecraft Java and Bedrock cross-play servers with automated crash recovery and persistent Docker containers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#050811] text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
