"use client";

import { useState } from "react";
import styles from "./auth.module.css";
import Footer from "@/src/components/Footer/Footer";

import { signIn, signInSocial, signUp } from "@/lib/db/auth.action";
import { CircleX, LoaderCircleIcon } from "lucide-react";
import { SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export default function AuthClientPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSocialAuth = async (provider: "google" | "github") => {
    setIsLoading(true);
    setError("");

    try {
      await signInSocial(provider);

      setIsLoading(false);
    } catch (err) {
      if (isRedirectError(err)) {
        throw err;
      }

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
        const result = await signIn(email, password);
        if (!result.data?.user) {
          setError("Invalid Email or Password");
        }
      } else {
        const result = await signUp(email, password, name);
        if (!result.data?.user) {
          setError("Cannot create account");
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
                : "Sign up to get started with better-auth"}
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className={styles.errorContainer}>
              <div className={styles.flexBox}>
                <div className={styles.iconWrapper}>
                  <CircleX color="red" size={20} />
                </div>
                <div className={styles.textWrapper}>
                  <p className={styles.errorText}>{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Social Authentication */}
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

          {/* Email/Password Form */}
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

          {/* Toggle between Sign In and Sign Up */}
          <div className={styles.toggleContainer}>
            <button
              type="button"
              onClick={() => {
                setIsSignIn(!isSignIn);
                setError(""); // Clear any previous errors
                setName(""); // Clear name when switching modes
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
