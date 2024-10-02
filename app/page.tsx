"use client";
import Navbar from "@/components/Navbar";
import { useAppKit } from "@reown/appkit/react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

export default function Home() {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const router = useRouter();

  return (
    <main className="">
      <section className="flex h-screen w-full flex-col  justify-center items-center p-24">
        <div className=" bg-gray-400/20 px-5 py-7 rounded shadow-xl shadow-black">
          <h1 className=" text-2xl font-mono text-gray-50/20 font-bold">
            Sample Prediction Market
          </h1>
          <p className="mt-4 font-mono">
            Will the price of Bitcoin go up tomorrow?
          </p>

          <div className="flex w-full justify-between items-center mt-5 font-mono">
            <button
              className="bg-green-500 px-10 py-2 rounded-xl text-xl font-bold"
              onClick={() => router.push("/predict")}
            >
              Yes
            </button>
            <button
              className="bg-red-500 px-10 py-2 rounded-xl text-xl font-bold"
              onClick={() => open()}
            >
              No
            </button>
          </div>
          {isConnected && (
            <section className="mt-10">
              <h1 className="text-green-400 text-xl font-mono">
                Connected:{" "}
                <span className="px-4 ">{`${address?.slice(
                  0,
                  4
                )}....${address?.slice(-4)}`}</span>
              </h1>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
