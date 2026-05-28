import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createTransactionRecord, getUserTransactions } from "@/lib/data";
import { isValidEthAddress, isValidEthAmount, normalizeEthInput } from "@/lib/eth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const transactions = await getUserTransactions(user.id);

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Failed to fetch transactions", {
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json(
      { error: "Failed to load transactions." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const propertySlug = typeof body.propertySlug === "string" ? body.propertySlug.trim() : "";
    const txHash = typeof body.txHash === "string" ? body.txHash.trim() : "";
    const status = typeof body.status === "string" ? body.status.trim() : "";
    const amountEth = normalizeEthInput(body.amountEth);
    const walletAddress = typeof body.walletAddress === "string" ? body.walletAddress.trim() : "";

    if (!propertySlug || !txHash || !walletAddress || !status || !isValidEthAmount(amountEth) || !isValidEthAddress(walletAddress)) {
      return NextResponse.json(
        { error: "Invalid transaction payload." },
        { status: 400 }
      );
    }

    await createTransactionRecord({
      propertySlug,
      tenantUserId: user.id,
      status,
      amountEth,
      walletAddress,
      txHash
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save transaction", {
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json(
      { error: "Failed to save transaction." },
      { status: 500 }
    );
  }
}
