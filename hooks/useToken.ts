import { useSession } from "next-auth/react";

export const useToken = () => {
  const { data: session } = useSession();
  return session?.user?.token;
};

export const useLoginUser = () => {
  const { data: session } = useSession();
  return session?.user;
};

export const useCompanies = () => {
  const { data: session } = useSession();
  return session?.user?.companies;
};
