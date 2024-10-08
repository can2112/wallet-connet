import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const url = `${process.env.NEXT_PUBLIC_MARKET}/markets/fetch/${req?.query?.questionId}`;

    const response = await axios.get(url);
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}
