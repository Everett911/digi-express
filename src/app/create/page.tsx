"use client";
import React, { useState } from "react";
import { Header } from "@/components/Header";
import style from "./create.module.css";
import Link from "next/link";
import Footer from "@/components/Footer";

type Props = {
  totalQuantity: number;
};
function CreateAccountPage({ totalQuantity }: Props) {
  const [firstname, setFirstname] = useState<string>("");
  const [lastname, setLastname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!firstname || !lastname || !email || !password) {
      setError("Please fill all the fields");
    }
    setError(null);
  };
  return (
    <>
      <Header totalQuantity={totalQuantity} />
      <div className={style["login-container"]}>
        <h1 className={style["login-title"]}>Create Account</h1>
        <div className={style["login-form"]}>
          <form onSubmit={handleSubmit}>
            <div className={style["form-container"]}>
              <label className={style["label-form"]} htmlFor="email">
                First Name
              </label>
              <input
                className={style["input-form"]}
                type="text"
                id="firstname"
                value={firstname}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFirstname(e.target.value)
                }
                required
              />
              <label className={style["label-form"]} htmlFor="email">
                Last Name
              </label>
              <input
                className={style["input-form"]}
                type="text"
                id="lastname"
                value={lastname}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setLastname(e.target.value)
                }
                required
              />
              <label className={style["label-form"]} htmlFor="email">
                Email
              </label>
              <input
                className={style["input-form"]}
                type="email"
                id="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                required
              />
              {error && <p>{error}</p>}
              <label className={style["label-form"]} htmlFor="email">
                Password
              </label>
              <input
                className={style["input-form"]}
                type="password"
                id="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                required
              />
              {error && <p>{error}</p>}
              <div className={style["button-link-form"]}>
                <button className={style["submit-button"]} type="submit">
                  Create Account
                </button>
              </div>
              <div className={style["link-form"]}>
                <span>Already have account?</span>
                <Link href="/login">
                  <span>Log in</span>
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

export default CreateAccountPage;
