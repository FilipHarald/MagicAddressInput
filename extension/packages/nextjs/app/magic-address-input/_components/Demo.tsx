"use client";

import { useState } from "react";
import { Address, generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { MagicAddressInput } from "~~/components/ext/MagicAddressInput";
import { Address as AddressComponent, CommonInputProps, InputBase } from "~~/components/scaffold-eth";
import { useMagicAddressBook } from "~~/hooks/ext/useMagicAddressBook";

export const Demo = ({ address: adr }: { address: Address }) => {
  const [value, setValue] = useState("");
  const inputProps: CommonInputProps = {
    placeholder: "Type an address or ENS name",
    value,
    onChange: setValue,
  };

  const { addAddress } = useMagicAddressBook();
  const [address, setAddress] = useState(adr);
  const [customDescription, setCustomDescription] = useState("");
  const onGenerateNewRandomAddress = () => setAddress(privateKeyToAccount(generatePrivateKey()).address);
  const onAddAddressClick = () => {
    addAddress(address, customDescription);
  };

  return (
    <>
      <div className="text-center mt-8 bg-base-100 p-20 m-5">
        <h1 className="text-4xl">1. MagicAddressInput Component</h1>
        <div className="flex items-center space-y-2 flex-col">
          <p className="text-center text-lg">
            Try typing in a valid address or ENS name. The component will automatically add it to the address book.
          </p>
          <MagicAddressInput {...inputProps} />

          <p className="text-center text-lg">
            You can also hide the address text by setting the{" "}
            <code className="italic bg-base-300 text-base font-bold px-1">hideAddressText</code> prop to true.
          </p>
          <MagicAddressInput {...inputProps} hideAddressText />
        </div>
      </div>

      <div className="text-center mt-8 bg-base-100 p-20 m-5">
        <h1 className="text-4xl">2. Add address manually</h1>
        <p className="text-center text-lg">
          Click the button to add the address to the MagicAddressInput component. If you want, you can change the
          description. If you leave it empty, it will default to{" "}
          <code className="italic bg-base-300 text-base font-bold px-1">"added [x_time] ago"</code>.
        </p>
        <div className="flex items-center space-y-4 flex-col">
          <div className="flex items-center space-x-4">
            <AddressComponent address={address} disableAddressLink />
            <button className="btn btn-primary" onClick={onGenerateNewRandomAddress}>
              ↻
            </button>
          </div>
          <InputBase
            placeholder="Type a custom description"
            value={customDescription}
            onChange={setCustomDescription}
          />
          <button className="btn btn-primary" onClick={onAddAddressClick}>
            Add address
          </button>
        </div>
      </div>
    </>
  );
};
