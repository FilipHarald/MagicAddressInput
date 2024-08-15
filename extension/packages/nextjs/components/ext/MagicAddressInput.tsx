import { useCallback, useEffect, useRef, useState } from "react";
import { blo } from "blo";
import { useDebounceValue } from "usehooks-ts";
import { Address, isAddress } from "viem";
import { normalize } from "viem/ens";
import { useEnsAddress, useEnsAvatar, useEnsName } from "wagmi";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { CommonInputProps, InputBase, isENS } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { AddressSuggestion, useMagicAddressBook } from "~~/hooks/ext/useMagicAddressBook";

export const MagicAddressInput = ({
  value,
  name,
  placeholder,
  onChange,
  disabled,
}: CommonInputProps<Address | string>) => {
  const { addAddress, suggestions } = useMagicAddressBook();
  // Debounce the input to keep clean RPC calls when resolving ENS names
  // If the input is an address, we don't need to debounce it
  const [_debouncedValue] = useDebounceValue(value, 500);
  const debouncedValue = isAddress(value) ? value : _debouncedValue;
  const isDebouncedValueLive = debouncedValue === value;

  // If the user changes the input after an ENS name is already resolved, we want to remove the stale result
  const settledValue = isDebouncedValueLive ? debouncedValue : undefined;

  const {
    data: ensAddress,
    isLoading: isEnsAddressLoading,
    isError: isEnsAddressError,
    isSuccess: isEnsAddressSuccess,
  } = useEnsAddress({
    name: settledValue,
    chainId: 1,
    query: {
      gcTime: 30_000,
      enabled: isDebouncedValueLive && isENS(debouncedValue),
    },
  });

  const [enteredEnsName, setEnteredEnsName] = useState<string>();
  const {
    data: ensName,
    isLoading: isEnsNameLoading,
    isError: isEnsNameError,
    isSuccess: isEnsNameSuccess,
  } = useEnsName({
    address: settledValue as Address,
    chainId: 1,
    query: {
      enabled: isAddress(debouncedValue),
      gcTime: 30_000,
    },
  });

  const { data: ensAvatar, isLoading: isEnsAvtarLoading } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
    chainId: 1,
    query: {
      enabled: Boolean(ensName),
      gcTime: 30_000,
    },
  });

  useEffect(() => {
    if (!ensAddress) return;

    // ENS resolved successfully
    setEnteredEnsName(debouncedValue);
    onChange(ensAddress);
    if (debouncedValue) {
      addAddress(ensAddress, debouncedValue);
    }
  }, [ensAddress, onChange, debouncedValue, addAddress]);

  useEffect(() => {
    if (isAddress(value)) {
      addAddress(value as Address, "Auto-added");
    }
  }, [value, addAddress]);

  const handleChange = useCallback(
    (newValue: Address) => {
      setEnteredEnsName(undefined);
      onChange(newValue);
      setShowSuggestions(false);
    },
    [onChange],
  );

  // Address suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick(dropdownRef, () => setShowSuggestions(false));

  const handleInputChange = useCallback(
    (newValue: string) => {
      onChange(newValue as Address);
    },
    [onChange],
  );

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    handleChange(suggestion.address);
  };

  const toggleSuggestions = () => {
    setShowSuggestions(!showSuggestions);
  };

  const reFocus =
    isEnsAddressError ||
    isEnsNameError ||
    isEnsNameSuccess ||
    isEnsAddressSuccess ||
    ensName === null ||
    ensAddress === null;

  return (
    <div className="relative flex flex-col gap-2" ref={dropdownRef}>
      <InputBase<Address>
        name={name}
        placeholder={placeholder}
        error={ensAddress === null}
        value={value as Address}
        onChange={handleInputChange}
        disabled={isEnsAddressLoading || isEnsNameLoading || disabled}
        reFocus={reFocus}
        prefix={
          ensName ? (
            <div className="flex bg-base-300 rounded-l-full items-center">
              {isEnsAvtarLoading && (
                <div className="skeleton bg-base-200 w-[35px] h-[35px] rounded-full shrink-0"></div>
              )}
              {ensAvatar ? (
                <span className="w-[35px]">
                  {
                    // eslint-disable-next-line
                    <img className="w-full rounded-full" src={ensAvatar} alt={`${ensAddress} avatar`} />
                  }
                </span>
              ) : null}
              <span className="text-accent px-2">{enteredEnsName ?? ensName}</span>
            </div>
          ) : (
            (isEnsNameLoading || isEnsAddressLoading) && (
              <div className="flex bg-base-300 rounded-l-full items-center gap-2 pr-2">
                <div className="skeleton bg-base-200 w-[35px] h-[35px] rounded-full shrink-0"></div>
                <div className="skeleton bg-base-200 h-3 w-20"></div>
              </div>
            )
          )
        }
        suffix={
          <div className="flex items-center">
            <button onClick={toggleSuggestions} className="p-1">
              <BookOpenIcon className="h-4 w-4 cursor-pointer" aria-hidden="true" />
            </button>
            {value && (
              // eslint-disable-next-line
              <img alt="" className="!rounded-full" src={blo(value as `0x${string}`)} width="35" height="35" />
            )}
          </div>
        }
      />
      {showSuggestions && (
        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto top-full left-0 mt-1">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="cursor-pointer px-4 py-2 hover:bg-gray-100 flex justify-between items-center"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <span>
                {suggestion.address.slice(0, 6)}...{suggestion.address.slice(-4)}
              </span>
              {suggestion.description && <span className="text-gray-500 italic ml-2">{suggestion.description}</span>}
              {/* eslint-disable-next-line */}
              <img
                alt=""
                className="!rounded-full"
                src={blo(suggestion.address as `0x${string}`)}
                width="35"
                height="35"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
