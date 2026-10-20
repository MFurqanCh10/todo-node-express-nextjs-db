
import "./globals.css";

export const metadata = {
  title: "Taskly — Plan your day",
  description: "A simple, beautiful and secure task manager.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
