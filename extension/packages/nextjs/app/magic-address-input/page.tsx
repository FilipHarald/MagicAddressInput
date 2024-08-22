import type { NextPage } from "next";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { Demo } from "~~/app/magic-address-input/_components/Demo";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "🪄 Demo MagicAddressInput",
  description: "A demo of the MagicAddressInput component",
});

const randomAddress = privateKeyToAccount(generatePrivateKey()).address;

const MagicAddressInputDemo: NextPage = () => {
  return (
    <>
      <div className="text-center mt-8 bg-secondary p-10">
        <h1 className="text-4xl my-0">MagicAddressInput 🪄</h1>
        <p className="text-center text-lg">
          Below you will find a MagicAddressInput component and an example of how you can manually add addresses to it.
        </p>
        <p className="text-center text-lg">
          You can also refer to the{" "}
          <a href="https://github.com/FilipHarald/MagicAddressInput/blob/master/README.md" className="underline">
            project README
          </a>{" "}
          for an explanation of how to use it or replace existing{" "}
          <code className="italic bg-base-300 text-base font-bold px-1">AddressInput</code>
        </p>
        <p className="text-center text-lg">
          This page is located in{" "}
          <code className="italic bg-base-300 text-base font-bold [word-spacing:-0.5rem] px-1">
            packages / nextjs / app / magic-address-input / page.tsx
          </code>
        </p>
      </div>
      <Demo address={randomAddress} />
    </>
  );
};

export default MagicAddressInputDemo;
