import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Kos Escrow",
  description: "Next.js escrow marketplace for kos and full-rent ETH payments with MetaMask and Sepolia."
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
