import "./globals.css";
import Head from "next/head";

export const metadata = {
  title: "CODEX AI",
  description: "A multifunctional WhatsApp bot experience built with CODEX AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
