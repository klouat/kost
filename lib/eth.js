const ETH_DECIMAL_PATTERN = /^\d+(\.\d{1,18})?$/;

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

export function formatEthAmount(value) {
  const normalizedValue = normalizeEthInput(value);

  if (!normalizedValue || !ETH_DECIMAL_PATTERN.test(normalizedValue)) {
    return "0";
  }

  const [wholePart, decimalPart = ""] = normalizedValue.split(".");
  const trimmedDecimalPart = decimalPart.replace(/0+$/, "");

  return trimmedDecimalPart ? `${wholePart}.${trimmedDecimalPart}` : wholePart;
}
