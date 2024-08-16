import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { getAllContracts } from "~~/utils/scaffold-eth/contractsData";

export type AddressSuggestion = {
  address: Address;
  description?: string;
  timestamp?: number;
};

const CONNNECTED_WALLET = "Connected wallet";
const PREV_CONNECTED_WALLET = "Prev. connected wallet";

const DEFAULT_SUGGESTIONS_PRIORITIZED = [CONNNECTED_WALLET, PREV_CONNECTED_WALLET, undefined];

const shouldReplaceDescription = (newDesc?: string, oldDesc?: string) => {
  // NOTE: undefined is the lowest priority and custom descriptions are always prioritized (returning -1)
  return DEFAULT_SUGGESTIONS_PRIORITIZED.indexOf(newDesc) < DEFAULT_SUGGESTIONS_PRIORITIZED.indexOf(oldDesc);
};

export const getDesc = (suggestion: AddressSuggestion) => {
  if (!suggestion.description && suggestion.timestamp) {
    const diff = (Date.now() - suggestion.timestamp) / 1000;
    if (diff < 60) {
      return `added ${Math.floor(diff)}s ago`;
    }
    if (diff < 3600) {
      return `added ${Math.floor(diff / 60)}m ago`;
    }
    return `added ${Math.floor(diff / 3600)}h ago`;
  }
  return suggestion.description;
};

// TODO: extend above functionality to only give partial address book (depending on input-id)
export const useMagicAddressBook = () => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const { address: connectedAddress } = useAccount();
  const deployedContracts = useMemo(() => getAllContracts(), []);
  const addedContractsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (deployedContracts) {
      const newSuggestions = Object.entries(deployedContracts)
        .filter(([, contract]) => !addedContractsRef.current.has(contract.address))
        .map(([contractName, contract]) => ({
          address: contract.address,
          description: contractName,
        }));

      if (newSuggestions.length > 0) {
        setSuggestions(prev => [...prev, ...newSuggestions]);
        newSuggestions.forEach(suggestion => addedContractsRef.current.add(suggestion.address));
      }
    }
  }, [deployedContracts]);

  useEffect(() => {
    if (connectedAddress) {
      setSuggestions(prev => {
        const updatedSuggestions = prev
          .filter(suggestion => suggestion.address !== connectedAddress)
          .map(suggestion => ({
            ...suggestion,
            description: suggestion.description === CONNNECTED_WALLET ? PREV_CONNECTED_WALLET : suggestion.description,
          }));

        return [
          ...updatedSuggestions,
          {
            address: connectedAddress,
            description: CONNNECTED_WALLET,
          },
        ];
      });
    }
  }, [connectedAddress]);

  const addAddress = useCallback((address: Address, description?: string) => {
    console.log("addAddress", address, description);
    setSuggestions(prev => {
      const existingSuggestion = prev.find(suggestion => suggestion.address === address);
      if (existingSuggestion && !shouldReplaceDescription(description, existingSuggestion.description)) {
        return prev;
      }
      return [
        ...prev.filter(suggestion => suggestion.address !== address),
        {
          address,
          description,
          timestamp: Date.now(),
        },
      ];
    });
  }, []);

  return {
    suggestions,
    addAddress,
  };
};

