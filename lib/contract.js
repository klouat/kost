import { ethers } from "ethers";
import { detectOrConnectWallet } from "@/lib/wallet";

export const contractAddress =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

export const contractABI = [
  {
    inputs: [{ internalType: "address payable", name: "_owner", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    inputs: [],
    name: "confirmOccupied",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "depositAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "occupied",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address payable", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "payDeposit",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "tenant",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  }
];

export async function getContract() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is required for contract interaction.");
  }

  await detectOrConnectWallet();

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(contractAddress, contractABI, signer);
}

export async function payRent(amountInEth) {
  const contract = await getContract();
  const tx = await contract.payDeposit({
    value: ethers.parseEther(amountInEth)
  });

  await tx.wait();

  return tx.hash;
}

export async function confirmOccupied() {
  const contract = await getContract();
  const tx = await contract.confirmOccupied();

  await tx.wait();

  return tx.hash;
}

export async function getContractState() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is required for contract interaction.");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  const [tenant, owner, occupied, depositAmount] = await Promise.all([
    contract.tenant(),
    contract.owner(),
    contract.occupied(),
    contract.depositAmount()
  ]);

  return {
    tenant,
    owner,
    occupied,
    depositAmount: ethers.formatEther(depositAmount)
  };
}
