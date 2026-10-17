import { Theme } from "@radix-ui/themes";
import Image from "next/image";
import Link from "next/link";
import { Store } from "lucide-react";
import AdminNav from "./_components/AdminNav";
import { requireAdminPage } from "./_lib/auth";
import styles from "./layout.module.css";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdminPage();
  const displayName = user.name || user.email;

  return (
    <Theme accentColor="blue" hasBackground={false}>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <Link href="/admin" className={styles.brand}>
            <Image
              src="/logo.png"
              alt="Digi Express admin"
              height={40}
              width={120}
              style={{ objectFit: "contain" }}
              priority
            />
          </Link>

          <AdminNav />

          <div className={styles.sidebarFooter}>
            <div className={styles.user}>
              <span className={styles.avatar} aria-hidden>
                {displayName.charAt(0).toUpperCase()}
              </span>
              <div className={styles.userText}>
                <span className={styles.userName}>{displayName}</span>
                <span className={styles.userRole}>Administrator</span>
              </div>
            </div>
            <Link href="/" className={styles.storeLink}>
              <Store size={16} aria-hidden />
              <span>View store</span>
            </Link>
          </div>
        </aside>

        <main className={styles.main}>{children}</main>
      </div>
    </Theme>
  );
}
