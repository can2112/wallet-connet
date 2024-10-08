interface Price {
  optionId: number;
  cost: number;
}
export interface ActionProps {
  setCurrentState: (arg: string) => void;
  currentState: string;
  price: Price[];
  questionId: string | undefined | null;
}

export interface LogicProps {
  questionId: string | null | undefined;
  currentState: string;
}

export interface QuoteData {
  formattedQuote: string;
  quote: string;
}
export interface OrderBody {
  questionId: string | undefined | null;
  side: number;
  outcomeIndex: number;
  amount: string;
  fromAddress: string;
}
