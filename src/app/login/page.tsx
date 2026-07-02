"use client";
import React, { useState } from "react";
import { Header } from "../../components/Header";
import Link from "next/link";
import styles from "./login.module.css";
import Footer from "../../components/Footer";

type Props = {
  totalQuantity: number;
};

function LoginPage({ totalQuantity }: Props) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      setError("Wrong Email or Email Not Found");
    } else if (!password) {
      setError("Wrong Password or Did match with the Email");
    }
    setError(null);
  };
  return (
    <>
      <Header totalQuantity={totalQuantity} />
      <div className={styles["login-container"]}>
        <h1 className={styles["login-title"]}>Login</h1>
        <div className={styles["login-form"]}>
          <form onSubmit={handleSubmit}>
            <div className={styles["form-container"]}>
              <label className={styles["label-form"]} htmlFor="email">
                Email
              </label>
              <input
                className={styles["input-form"]}
                type="email"
                id="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                required
              />
              {error && <p>{error}</p>}
              <label className={styles["label-form"]} htmlFor="password">
                Password
              </label>
              <input
                className={styles["input-form"]}
                type="password"
                id="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                required
              />
              {error && <p>{error}</p>}
              <div className={styles["button-link-form"]}>
                <button className={styles["submit-button"]} type="submit">
                  Sign In
                </button>
                <Link className={styles["create-link"]} href="/create">
                  <span>Create Account</span>
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default LoginPage;
