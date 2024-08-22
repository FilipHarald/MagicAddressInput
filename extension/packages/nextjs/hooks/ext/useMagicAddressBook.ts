import { useEffect, useMemo } from "react";
import { Address } from "viem";
import { useAccount } from "wagmi";
import create from "zustand";
import { getAllContracts } from "~~/utils/scaffold-eth/contractsData";

export type AddressSuggestion = {
  address: Address;
  description?: string;
  timestamp?: number;
};

// TODO: allow for custom address book during init

const CONNNECTED_WALLET = "Connected wallet";
const PREV_CONNECTED_WALLET = "Prev. connected wallet";
const NO_DESCRIPTION = undefined;

const DEFAULT_SUGGESTIONS_PRIORITIZED = [CONNNECTED_WALLET, PREV_CONNECTED_WALLET, NO_DESCRIPTION];

const shouldReplaceDescription = (newDesc?: string, oldDesc?: string) => {
  // NOTE: undefined is the lowest priority and custom descriptions are always prioritized (returning -1)
  return DEFAULT_SUGGESTIONS_PRIORITIZED.indexOf(newDesc) < DEFAULT_SUGGESTIONS_PRIORITIZED.indexOf(oldDesc);
};

const getDefaultDescription = (time: string) => `added ${time} ago`;
export const getDesc = (suggestion: AddressSuggestion) => {
  let time = "";
  if (suggestion.timestamp) {
    const diff = (Date.now() - suggestion.timestamp) / 1000;
    if (diff < 60) {
      time = `${Math.floor(diff)}s`;
    } else if (diff < 3600) {
      time = `${Math.floor(diff / 60)}m`;
    } else time = `${Math.floor(diff / 3600)}h`;
  }
  if (suggestion.description && !suggestion.timestamp) return suggestion.description;
  if ((!suggestion.description || suggestion.description === "") && suggestion.timestamp)
    return getDefaultDescription(time);
  const suffix = time ? `(used ${time} ago)` : "";
  return `${suggestion.description} ${suffix}`;
};

type AddressBookStore = {
  suggestions: AddressSuggestion[];
  addDeployedContracts: (deployedContracts: Record<string, { address: Address }>) => void;
  addSuggestion: (address: Address, description?: string) => void;
  setConnectedWallet: (address: Address) => void;
};

const useAddressBookStore = create<AddressBookStore>(set => ({
  suggestions: [],
  addDeployedContracts: deployedContracts => {
    const newSuggestions = Object.entries(deployedContracts).map(([contractName, contract]) => ({
      address: contract.address,
      description: contractName,
    }));
    return set(state => ({
      suggestions: [
        ...state.suggestions,
        ...newSuggestions.filter(suggestion => !state.suggestions.some(s => s.address === suggestion.address)),
      ],
    }));
  },
  addSuggestion: (address, description) =>
    set(state => {
      const existingSuggestion = state.suggestions.find(s => s.address === address);
      if (!existingSuggestion || shouldReplaceDescription(description, existingSuggestion.description)) {
        return {
          suggestions: [
            ...state.suggestions.filter(s => s.address !== address),
            {
              address,
              description: description || NO_DESCRIPTION,
              timestamp: Date.now(),
            },
          ],
        };
      }
      return state;
    }),
  setConnectedWallet: address =>
    set(state => {
      const existingConnectedWallet = state.suggestions.find(s => s.description === CONNNECTED_WALLET);
      if (existingConnectedWallet && existingConnectedWallet.address === address) {
        return state;
      }

      const updatedSuggestions = state.suggestions
        .filter(suggestion => suggestion.address !== address)
        .map(suggestion => ({
          ...suggestion,
          description: suggestion.description === CONNNECTED_WALLET ? PREV_CONNECTED_WALLET : suggestion.description,
        }));

      return {
        suggestions: [
          ...updatedSuggestions,
          {
            address,
            description: CONNNECTED_WALLET,
          },
        ],
      };
    }),
}));

export const useMagicAddressBook = () => {
  const { address: connectedAddress } = useAccount();
  const deployedContracts = useMemo(() => getAllContracts(), []);
  const { suggestions, addDeployedContracts, addSuggestion, setConnectedWallet } = useAddressBookStore();

  useEffect(() => {
    if (deployedContracts) {
      addDeployedContracts(deployedContracts);
    }
  }, [deployedContracts, addDeployedContracts]);

  useEffect(() => {
    if (connectedAddress) {
      setConnectedWallet(connectedAddress);
    }
  }, [connectedAddress, setConnectedWallet]);

  return {
    suggestions,
    addAddress: addSuggestion,
  };
}; // TODO: extend above functionality to only give partial address book (depending on input-id)
