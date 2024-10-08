import React from "react";

interface ButtonProp {
  style: string;
  text: string;
  click: () => void;
}

function Button({ style, text, click }: ButtonProp) {
  return (
    <div
      className={`${style} backdrop-blur-md bg-opacity-30 hover:bg-opacity-50 hover:text-white px-10 py-2 w-full rounded-xl text-xl font-bold`}
      onClick={click}
    >
      {text}
    </div>
  );
}

export default Button;
