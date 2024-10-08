import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_MARKET}/markets`
    );
    return res.status(response.status).send(response.data);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
}
