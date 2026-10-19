// The public demo account, so anyone (a recruiter, say) can look around the
// admin dashboard without signing up. These details are meant to be public:
// they're on the sign-in page and in the README. What keeps that safe is the
// "demo" role, not the password:
// - admin pages show data, but every admin server action rejects the role
// - customer names and emails are masked on admin pages
// - lib/auth.ts blocks changing the account's password, email or name
// Run `npx prisma db seed` to create the account.

export const DEMO_ACCOUNT = {
  email: "demo@digi-express.dev",
  password: "demo-admin-2026",
  name: "Demo Admin",
} as const;

export const DEMO_ROLE = "demo";

// Admins can change things; the demo role can only look.
export function canViewAdmin(role: string | null | undefined) {
  return role === "admin" || role === DEMO_ROLE;
}

export function isDemoRole(role: string | null | undefined) {
  return role === DEMO_ROLE;
}

// "jane.doe@gmail.com" -> "j•••@gmail.com". The domain stays, so the demo
// still looks like real data without showing who the customer is.
export function maskEmail(email: string) {
  const at = email.lastIndexOf("@");
  if (at < 1) return "•••";
  return `${email[0]}•••${email.slice(at)}`;
}

// "Jane Doe" -> "Jane D."
export function maskName(name: string) {
  const [first, ...rest] = name.trim().split(/\s+/);
  const last = rest.at(-1);
  return last ? `${first} ${last[0].toUpperCase()}.` : first;
}

export function maskCustomer<T extends { name: string; email: string }>(customer: T): T {
  return { ...customer, name: maskName(customer.name), email: maskEmail(customer.email) };
}
