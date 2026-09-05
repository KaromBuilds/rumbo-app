import "./globals.css";

export const metadata = {
  title: "Rumbo — find your direction",
  description:
    "A casual conversation that helps you see where you can point what you already know how to do.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
