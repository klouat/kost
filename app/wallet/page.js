import { WalletPanel } from "@/components/wallet-panel";
import { SectionTitle } from "@/components/section-title";
import { requireUser } from "@/lib/auth";

export const metadata = {
  title: "Wallet | Kos Escrow"
};

export default async function WalletPage() {
  await requireUser();

  return (
    <div className="shell py-10">
      <SectionTitle
        eyebrow="Wallet"
        title="Connect the fixed buyer MetaMask account"
        description="This demo uses one fixed buyer wallet. MetaMask is still required because the browser must sign the blockchain payment transaction."
      />
      <div className="mt-8 max-w-2xl">
        <WalletPanel />
      </div>
    </div>
  );
}
