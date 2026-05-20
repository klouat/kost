export async function connectWallet() {
  const accounts = await requestWalletAccounts("eth_requestAccounts");

  return getFirstWalletAddress(accounts, true);
}

export async function getConnectedWalletAddress() {
  const accounts = await requestWalletAccounts("eth_accounts");

  return getFirstWalletAddress(accounts, false);
}

export async function detectOrConnectWallet() {
  const connectedWalletAddress = await getConnectedWalletAddress();

  if (connectedWalletAddress) {
    return connectedWalletAddress;
  }

  return connectWallet();
}

function getEthereumProvider() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed in this browser.");
  }

  return window.ethereum;
}

async function requestWalletAccounts(method) {
  return getEthereumProvider().request({ method });
}

function getFirstWalletAddress(accounts, shouldRequireAccount) {
  if (!accounts?.length) {
    if (shouldRequireAccount) {
      throw new Error("No wallet account was returned.");
    }

    return "";
  }

  return accounts[0];
}
