const ETH_DECIMAL_PATTERN = /^\d+(\.\d{1,18})?$/;
const ETH_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

export function normalizeEthInput(value) {
  return String(value || "").trim().replace(",", ".");
}

export function isValidEthAmount(value) {
  const normalizedValue = normalizeEthInput(value);

  if (!ETH_DECIMAL_PATTERN.test(normalizedValue)) {
    return false;
  }

  return Number(normalizedValue) > 0;
}

export function isValidEthAddress(value) {
  return ETH_ADDRESS_PATTERN.test(String(value || "").trim());
}

export function formatEthAmount(value) {
  const normalizedValue = normalizeEthInput(value);

  if (!normalizedValue || !ETH_DECIMAL_PATTERN.test(normalizedValue)) {
    return "0";
  }

  const [wholePart, decimalPart = ""] = normalizedValue.split(".");
  const trimmedDecimalPart = decimalPart.replace(/0+$/, "");

  return trimmedDecimalPart ? `${wholePart}.${trimmedDecimalPart}` : wholePart;
}
