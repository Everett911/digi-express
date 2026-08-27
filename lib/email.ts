import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

const DEFAULT_FROM = "Digi Express <onboarding@resend.dev>";

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
};

export async function sendEmail({ to, subject, html, text, from }: SendEmailArgs) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY is not set; skipping email to", to);
    return;
  }

  const { error } = await resend.emails.send({
    from: from ?? process.env.EMAIL_FROM ?? DEFAULT_FROM,
    to,
    subject,
    html,
    ...(text ? { text } : {}),
  });

  if (error) {
    console.error("[email] Failed to send email to", to, error);
  }
}
