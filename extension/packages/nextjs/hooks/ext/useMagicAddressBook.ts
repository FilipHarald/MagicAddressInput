import { useEffect, useState } from "react";
import { Address } from "viem";
import { useAccount } from "wagmi";

export type AddressSuggestion = {
  address: Address;
  description?: string;
};

// TODO: extend above functionality to only give partial address book (depending on input-id)

export const useMagicAddressBook = () => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const { address: connectedAddress } = useAccount();

  useEffect(() => {
    if (connectedAddress) {
      setSuggestions(prev => {
        return [
          ...prev
            .filter(suggestion => suggestion.address !== connectedAddress)
            .map(suggestion => ({
              ...suggestion,
              description: "Prev. connected wallet",
            })),
          {
            address: connectedAddress,
            description: "Connected wallet",
          },
        ];
      });
    }
  }, [connectedAddress]);

  const addAddress = (address: Address, description?: string) => {
    setSuggestions(prev => {
      if (prev.find(suggestion => suggestion.address === address)) {
        return prev;
      }
      return [
        ...prev.filter(suggestion => suggestion.address !== address),
        {
          address,
          description,
        },
      ];
    });
  };

  return {
    suggestions,
    addAddress,
  };
};
