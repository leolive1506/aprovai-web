/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from "react";
import { createContext, useState } from "react";

interface TitleProps {
  title: string;
  description?: string;
}

interface PageTitleContextType {
  title: TitleProps;
  setTitle: (props: TitleProps) => void;
}

export const PageTitleContext = createContext<PageTitleContextType | undefined>(
  undefined,
);

interface PageTitleProviderProps {
  children: ReactNode;
}

export function PageTitleProvider({ children }: PageTitleProviderProps) {
  const [title, setTitle] = useState<TitleProps>({
    title: "Dashboard",
  });

  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}
