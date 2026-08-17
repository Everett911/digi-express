"use server";

import { redirect } from "next/navigation";
import { auth } from "../auth";
import { headers } from "next/headers";

export const signUp = async (email: string, password: string, name: string) => {
  try {
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
        callbackURL: "/checkout",
      },
    });
    return { success: true, data: result };
  } catch {
    return { success: false, error: "Failed to sign up" };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
        callbackURL: "/checkout",
      },
    });
    return { success: true, data: result };
  } catch {
    return { success: false, error: "Invalid credentials" };
  }
};

export const signOut = async () => {
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect("/");
};

export const signInSocial = async (provider: "github" | "google") => {
  const result = await auth.api.signInSocial({
    body: {
      provider,
      callbackURL: "/",
    },
  });

  if (result?.url) {
    redirect(result.url as any);
  }
};
