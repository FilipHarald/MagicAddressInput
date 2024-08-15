# 🪄 Magic Address Input for 🏗 Scaffold-ETH 2
Can replace any usage of `scaffold-eth/components/AddressInput` but adds suggestions depending on user input.

## Features
TODO

## Installation
```bash
npx create-eth@latest -e FilipHarald/MagicAddressInput
```

## Usage
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

### Add suggestions
TODO
