import { createContext, ReactNode, useEffect, useState } from "react";
import Router from "next/router";

import { setCookie, parseCookies, destroyCookie } from "nookies";
import { api } from "../services/apiClient";

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>;
  isAuthenticated: boolean;
  user: User;
};

type AuthProviderProps = {
  children: ReactNode;
};

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

interface SessionsPostResponse {
  permissions: string[];
  roles: string[];
  token: string;
  refreshToken: string;
  email: string;
}

export const AuthContext = createContext({} as AuthContextData);

export const signOut = () => {
  destroyCookie(undefined, "NextAuth.token");
  destroyCookie(undefined, "NextAuth.refreshToken");
  Router.push("/");
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User>();

  const isAuthenticated = !!user;

  useEffect(() => {
    const { "NextAuth.token": token } = parseCookies();

    if (token) {
      api
        .get<SessionsPostResponse>("me")
        .then((response) => {
          const { email, permissions, roles } = response.data;

          setUser({
            email,
            permissions,
            roles,
          });
        })
        .catch(() => {
          signOut();
        });
    }
  }, []);

  const signIn = async ({ email, password }: SignInCredentials) => {
    try {
      const response = await api.post<SessionsPostResponse>("sessions", {
        email,
        password,
      });
      const { token, refreshToken, permissions, roles } = response.data;

      setCookie(undefined, "NextAuth.token", token, {
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });

      setCookie(undefined, "NextAuth.refreshToken", refreshToken, {
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });

      setUser({
        email,
        permissions,
        roles,
      });

      api.defaults.headers["Authorization"] = `Bearer ${token}`;

      Router.push("/dashboard");
    } catch (error) {
      console.log({ error });
    }
  };

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
};
