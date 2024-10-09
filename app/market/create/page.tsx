"use client";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useAccount, useConnect } from "wagmi";
import { useEthersSigner } from "@/hooks/ethers";
import { useRouter } from "next/navigation";
import { ApiResponse, CreateMarketBody, Data } from "@/utils/Interfaces/market";
import { prepareTxn } from "@/utils/common/prepareTx";

function Page() {
  const [title, setTitle] = useState("");
  const [fundingAmount, setFundingAmount] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [sourceOfTruth, setSourceOfTruth] = useState("");
  const { address } = useAccount();
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();

  const router = useRouter();

  const signer = useEthersSigner();

  const sendTransaction = async ({
    data,
  }: {
    data: Data;
  }): Promise<
    | { txnHash: string | undefined; questionId: string | undefined }
    | null
    | undefined
  > => {
    try {
      if (!isConnected) {
        const connector = connectors[0];
        connect({ connector });
      }
      const transactionData = data?.txns?.[0];
      const approveBody = prepareTxn(transactionData);
      const sentTx = await signer?.sendTransaction(approveBody);

      const confirm = await signer?.provider.waitForTransaction(
        sentTx?.hash || "",
        1
      );



      if (confirm) {
        const fundData = data?.txns?.[1];
        const fundTxBody = prepareTxn(fundData);
        const fundTxHx = await signer?.sendTransaction(fundTxBody);
        return { txnHash: fundTxHx?.hash || "", questionId: data?.questionId };
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const mutation = useMutation({
    mutationFn: async (createMarketBody: CreateMarketBody) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/create-market`,
        createMarketBody
      );
      return response.data;
    },
    onSuccess: async (data: ApiResponse) => {
      const approval = await sendTransaction({ data: data?.data });

      if (approval) {
        const { txnHash, questionId } = approval;
        const updateTxnHash = async () => {
          try {
            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_API}/update-txn`,
              { txnHash, questionId }
            );
            return response.data;
          } catch (error) {
            console.error("Failed to update TxnHash", error);
          }
        };
        const status = await updateTxnHash();

        if (status.success) {
          toast.success("Market created successfully!");
          router.push("/");
        }
      } else {
        toast.error("Transaction failed. Please try again.");
      }
    },
    onError: () => {
      toast.error("Error creating market. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      return toast.info("Please connect your wallet!😳");
    }

    const formattedDate = new Date(expiryDate).toISOString();

    const createMarketBody = {
      fromAddress: address,
      market: {
        title,
        image,
        options: [
          {
            option: "Yes",
            optionId: 0,
          },
          {
            option: "No",
            optionId: 1,
          },
        ],
        description,
        expiryDate: formattedDate,
        sourceOfTruth,
      },
      fundingAmount,
    };

    mutation.mutate(createMarketBody);
  };

  return (
    <div className="flex items-center justify-center h-screen w-full">
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col md:w-1/2 gap-3 px-2 py"
      >
        <input
          type="text"
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          required
          className="bg-gray-700 py-2 px-4 rounded-md w-full outline-none"
        />
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="bg-gray-700 py-2 px-4 rounded-md w-full outline-none"
        />
        <input
          type="text"
          placeholder="Stake Amount"
          value={fundingAmount}
          onChange={(e) => setFundingAmount(e.target.value)}
          required
          className="bg-gray-700 py-2 px-4 rounded-md w-full outline-none"
        />
        <input
          type="date"
          placeholder="End Date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          required
          className="bg-gray-700 py-2 px-4 rounded-md w-full outline-none"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="bg-gray-700 py-2 px-4 rounded-md w-full outline-none"
        />
        <input
          type="text"
          placeholder="Source of Truth"
          value={sourceOfTruth}
          onChange={(e) => setSourceOfTruth(e.target.value)}
          required
          className="bg-gray-700 py-2 px-4 rounded-md w-full outline-none"
        />
        <button type="submit" className="bg-blue-500 py-2 px-3 rounded-md">
          Submit
        </button>
      </form>
    </div>
  );
}

export default Page;
