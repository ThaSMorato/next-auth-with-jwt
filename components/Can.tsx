import { ReactNode } from "react";
import { useCan } from "../hooks/useCan";

type CanProps = {
  children: ReactNode;
  permissions?: string[];
  roles?: string[];
};

export const Can = ({ children, permissions, roles }: CanProps) => {
  const userCanSeeComponets = useCan({ permissions, roles });

  if (!userCanSeeComponets) {
    return null;
  }

  return <>{children}</>;
};
