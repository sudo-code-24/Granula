import React from "react";

interface ProductTitleProps {
  title: string;
  description: string;
}

export default function ProductTitle({ title, description }: ProductTitleProps) {
  return (
    <>
      <h3 className="text-lg font-semibold mb-2 text-gray-100 line-clamp-2">
        {title}
      </h3>
      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{description}</p>
    </>
  );
}
