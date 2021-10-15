import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../errors/AuthTokenError";

export const withSSRAuth = <P>(fn: GetServerSideProps<P>) => {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);

    if (!cookies["NextAuth.token"]) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    try {
      return await fn(ctx);
    } catch (error) {
      if (error instanceof AuthTokenError) {
        destroyCookie(ctx, "NextAuth.token");
        destroyCookie(ctx, "NextAuth.refreshToken");

        return {
          redirect: {
            destination: "/",
            permanent: false,
          },
        };
      }
    }
  };
};
