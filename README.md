# 🪄 Magic Address Input for 🏗 Scaffold-ETH 2
Can replace any usage of `scaffold-eth/components/AddressInput`, adds suggestions-dropown with relevant addresses depending on user input.

## Features
- connected wallet
- previously connected wallets
- any valid address entered in field
- any successful lookup of ENS address
- hook to add custom suggestions

## Installation
```bash
npx create-eth@latest -e FilipHarald/MagicAddressInput
```

## Usage

### component
Replace any `AddressInput` for example in `packages/nextjs/app/debug/_components/contract/ContractInput.tsx` you can add the import and replace the `AddressInput` with `MagicAddressInput`:

```tsx
import { MagicAddressInput } from "~~/components/ext/MagicAddressInput"; // add this import
//...
export const ContractInput = ({ setForm, form, stateObjectKey, paramType }: ContractInputProps) => {
//...
  const renderInput = () => {
    switch (paramType.type) {
      case "address":
        return <MagicAddressInput {...inputProps} />; // replace `return <AddressInput {...inputProps} />;`
//...
```

### hook - add custom suggestions
Below you'll find an example of how you can add an address every time the user submits a successful write transaction in `packages/nextjs/app/debug/_components/contract/WriteOnlyFunctionForm.tsx`.

```tsx
import { useMagicAddressBook } from "~~/hooks/ext/useMagicAddressBook"; // add this import
// ...
export const WriteOnlyFunctionForm = ({
  abi,
  abiFunction,
  onChange,
  contractAddress,
  inheritedFrom,
}: WriteOnlyFunctionFormProps) => {
const { addAddress } = useMagicAddressBook(); // add this line
// ...
  const handleWrite = async () => {
// ...
        await writeTxn(makeWriteWithParams);
        // add below block
        Object.keys(form).forEach(key => {
          if (key.endsWith("_address")) {
            const [contractName, inputName] = key.split("_");
            addAddress(form[key], `${contractName} ${inputName} -`);
          }
        });
// ...
