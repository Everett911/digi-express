import { betterAuth, BetterAuthOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const authOptions = {
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github", "credential"],
      requireLocalEmailVerified: false,
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Welcome to Digi Express! Please verify your email by visiting: ${url}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2>Verify your email</h2>
            <p>Welcome to Digi Express! Please confirm your email address to activate your account.</p>
            <p>
              <a href="${url}" style="display:inline-block; padding:10px 16px; background:#1a3263; color:#ffffff; border-radius:6px; text-decoration:none;">
                Verify Email
              </a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p>${url}</p>
          </div>
        `,
      });
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        returned: true,
        defaultValue: "customer",
      },
    },
  },
  session: {
    additionalFields: {
      cartId: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
} satisfies BetterAuthOptions;

export const auth = betterAuth({
  ...authOptions,
  trustedOrigins: async (request) => {
    const origins = [
      process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    ];
    if (request?.url) {
      try {
        const url = new URL(request.url);
        const hostOrigin = `${url.protocol}//${url.host}`;
        if (!origins.includes(hostOrigin)) origins.push(hostOrigin);
      } catch {
        // ignore malformed request url
      }
    }
    return origins;
  },
});
