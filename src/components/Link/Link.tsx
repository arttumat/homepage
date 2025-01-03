import { ReactNode } from "react";

export const Link = ({
  url,
  children,
}: {
  url?: string;
  children: ReactNode;
}) => {
  return (
    <a href={url || ""} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
};
