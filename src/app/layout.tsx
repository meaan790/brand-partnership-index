import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SignInModalProvider } from "@/components/SignInModalProvider";

export const metadata: Metadata = {
  title: "Brand Partnership Index",
  description:
    "How the wholesale channel reviews its brand partners. Transparent, independent ratings across five partnership standards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="light" lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Source+Serif+4:wght@600;700&display=swap"
        />
      </head>
      <body className="bg-background-paper text-text-main font-body-md antialiased min-h-screen flex flex-col">
        <SignInModalProvider>
          <Nav />
          <main className="flex-grow">{children}</main>
          <Footer />
        </SignInModalProvider>
      </body>
    </html>
  );
}
