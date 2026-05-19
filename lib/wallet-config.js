export const REMIX_TENANT_WALLET_ADDRESS = "0x1D9F2136CCD01f39a9c39BEB72Dc0D7514D08fe0";

export function getDefaultWalletAddressForRole(role) {
  if (role === "buyer") {
    return REMIX_TENANT_WALLET_ADDRESS;
  }

  return "";
}
