"use client";
import { ComponentProps, ReactNode } from "react";
import nav from "./Nav.module.css";
import navlink from "./NavLink.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Nav({ children }: { children: ReactNode }) {
  return <nav className={nav.container}>{children}</nav>;
}

export function NavLink(props: Omit<ComponentProps<typeof Link>, "className">) {
  const pathname = usePathname();
  const isActive = pathname === props.href;
  const className = `${navlink.link} ${isActive ? navlink.active : ""}`;
  return <Link {...props} className={className} />;
}
