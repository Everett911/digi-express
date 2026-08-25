"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./auth.module.css";
import Footer from "@/src/components/Footer/Footer";
import { authClient } from "@/lib/auth-client";
import { CircleX, LoaderCircleIcon } from "lucide-react";
import { SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  account_not_linked:
    "This email is already registered with a different sign-in method. Sign in with that method, or use email & password.",
  access_denied: "Authentication was cancelled.",
  verification_failed: "Email verification failed or the link has expired.",
};

export default function AuthClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState("");

  const urlError = searchParams.get("error");
  const urlErrorMessage = urlError
    ? AUTH_ERROR_MESSAGES[urlError] ??
      "Something went wrong during authentication. Please try again."
    : "";
  const displayedError = error || urlErrorMessage;

  const handleResendVerification = async () => {
    if (!email) {
      setError("Enter your email address first to resend the verification link.");
      return;
    }
    setIsLoading(true);
    setError("");
    setResendStatus("");
    try {
      await authClient.sendVerificationEmail({
        email,
        callbackURL: "/auth",
      });
      setResendStatus("Verification email sent. Check your inbox.");
    } catch (err) {
      setError(
        `Could not resend verification email: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: "google" | "github") => {
    setIsLoading(true);
    setError("");

    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });
    } catch (err) {
      setError(
        `Error authenticating with ${provider}: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
      );
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isSignIn) {
        const { error: authError } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/",
        });

        if (authError) {
          setError(authError.message || "Invalid Email or Password");
        } else {
          router.push("/");
        }
      } else {
        const { error: authError } = await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: "/",
        });

        if (authError) {
          setError(authError.message || "Cannot create account");
        } else {
          setNeedsVerification(true);
        }
      }
    } catch (err) {
      setError(
        `Authentication error: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.screenContainer}>
      <div className={styles.flexWrapper}>
        <div className={styles.contentBox}>
          <div className={styles.textCenter}>
            <h1 className={styles.title}>
              {isSignIn ? "Welcome Back" : "Create Account"}
            </h1>
            <p className={styles.subtitle}>
              {isSignIn
                ? "Sign in to your account to continue"
                : "Sign up to get started with shopping"}
            </p>
          </div>

          {displayedError && (
            <div className={styles.errorContainer}>
              <div className={styles.flexBox}>
                <div className={styles.iconWrapper}>
                  <CircleX color="red" size={20} />
                </div>
                <div className={styles.textWrapper}>
                  <p className={styles.errorText}>{displayedError}</p>
                </div>
              </div>
            </div>
          )}

          {needsVerification && !error && (
            <div className={styles.noticeContainer}>
              <p className={styles.noticeText}>
                We&apos;ve sent a verification link to{" "}
                <strong>{email}</strong>. Please check your inbox (and spam
                folder) to activate your account.
              </p>
              {resendStatus && (
                <p className={styles.noticeText}>{resendStatus}</p>
              )}
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isLoading}
                className={styles.resendButton}
              >
                Resend verification email
              </button>
            </div>
          )}

          <div className={styles.socialContainer}>
            <button
              onClick={() => handleSocialAuth("google")}
              disabled={isLoading}
              className={styles.googleButton}
            >
              <SiGoogle size={20} className={styles.iconButton} />
              Continue with Google
            </button>
            <button
              onClick={() => handleSocialAuth("github")}
              disabled={isLoading}
              className={styles.githubButton}
            >
              <SiGithub color="white" size={20} className={styles.iconButton} />
              Continue with GitHub
            </button>
          </div>
          <div className={styles.dividerContainer}>
            <div className={styles.lineWrapper}>
              <div className={styles.horizontalLine} />
            </div>
            <div className={styles.textWrapper}>
              <span className={styles.dividerText}>Or continue with</span>
            </div>
          </div>
          <form onSubmit={handleEmailAuth} className={styles.formContainer}>
            {!isSignIn && (
              <div className={styles.inputGroup}>
                <label htmlFor="name" className={styles.inputLabel}>
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required={!isSignIn}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.textInput}
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.inputLabel}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.textInput}
                placeholder="Enter your email"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.inputLabel}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignIn ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.textInput}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading ? (
                <div className={styles.loadingFlex}>
                  <LoaderCircleIcon className={styles.spinnerIcon} />
                  {isSignIn ? "Signing in..." : "Creating account..."}
                </div>
              ) : isSignIn ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className={styles.toggleContainer}>
            <button
              type="button"
              onClick={() => {
                setIsSignIn(!isSignIn);
                setError("");
                setName("");
              }}
              className={styles.toggleButton}
            >
              {isSignIn
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
