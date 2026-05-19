export async function connectWallet() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed in this browser.");
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts"
  });

  if (!accounts?.length) {
    throw new Error("No wallet account was returned.");
  }

  return accounts[0];
}

export async function getConnectedWalletAddress() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed in this browser.");
  }

  const accounts = await window.ethereum.request({
    method: "eth_accounts"
  });

  return accounts?.[0] || "";
}
