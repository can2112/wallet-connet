import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";
import useTransaction from "@/utils/hooks/transaction";
import { LogicProps, OrderBody, QuoteData } from "./types";

const useLogic = ({ questionId, currentState }: LogicProps) => {
  const [selected, setSelected] = useState("yes");
  const [isChecked, setIsChecked] = useState(false);
  const [amount, setAmount] = useState("");
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [quoteErr, setQuoteErr] = useState("");
  const [prevVal, setPrevVal] = useState({
    amount: "",
    selected: "",
    currentState: "",
  });
  const { address, isConnected } = useAccount();
  const { sendTransaction } = useTransaction();

  const toggleCheckbox = () => {
    setIsChecked(!isChecked);
  };

  const fetchQuotation = async () => {
    setQuoteErr("");
    const body = {
      questionId: questionId,
      side: currentState == "Buy" ? 0 : 1,
      outcomeIndex: selected == "yes" ? 0 : 1,
      amount: amount,
    };
    const url = `${process.env.NEXT_PUBLIC_API}/quote`;
    const response = await axios.post(url, body);

    return response.data;
  };

  const mutation = useMutation({
    mutationFn: fetchQuotation,
    onSuccess: (data) => {
      setQuoteData(data?.data);
    },
    onError: (err) => {
      console.log(err);
      setQuoteErr("Unable to fetch quotation");
      toast.error("Unable to fetch quotation");
    },
  });
  useEffect(() => {
    if (amount) {
      if (
        prevVal?.amount != amount ||
        prevVal.currentState != currentState ||
        prevVal.selected != selected
      ) {
        mutation.mutate();
        setPrevVal({ amount, currentState, selected });
      }
      const interval = setInterval(() => {
        mutation.mutate();
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [amount, selected, currentState]);

  const orderMutation = useMutation({
    mutationFn: async (body: OrderBody) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/create-order`,
        { body }
      );
      return response.data;
    },

    onSuccess: async (data) => {
      const txnStatus = await sendTransaction({
        data: data.data,
      });

      if (txnStatus) {
        toast.success("Transaction successful");
      } else {
        toast.error("Something went wrong");
      }
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const handleOrder = async () => {
    if (!address || !isConnected)
      return toast.warning("Please connect your wallet");
    if (!amount) return toast.warning("Please enter amount");

    const orderBody = {
      questionId: questionId,
      side: currentState == "Buy" ? 0 : 1,
      outcomeIndex: selected == "yes" ? 0 : 1,
      amount: amount,
      fromAddress: address,
    };

    orderMutation.mutate(orderBody);
  };

  return {
    handleOrder,
    selected,
    setSelected,
    isChecked,
    toggleCheckbox,
    amount,
    setAmount,
    quoteErr,
    quoteData,
  };
};

export default useLogic;
