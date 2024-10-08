import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "POST") {
      const url = `${process.env.NEXT_PUBLIC_MARKET}/markets/status/${req.body.questionId}/${req.body.txnHash}`;
      const response = await axios.get(url);
      return res.status(response.status).send(response.data);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}
