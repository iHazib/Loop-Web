/* Sends email through whichever provider is configured.
   RESEND_API_KEY (resend.com) or POSTMARK_TOKEN (postmarkapp.com), from EMAIL_FROM.
   With neither set nothing is sent and callers are told so. */

export const mailConfigured = () => Boolean(process.env.RESEND_API_KEY || process.env.POSTMARK_TOKEN);
const from = () => process.env.EMAIL_FROM || 'Loopretail <alerts@loopretail.io>';

export async function sendMail(to: string, subject: string, html: string): Promise<{ ok: boolean; detail: string }> {
  try {
    if (process.env.RESEND_API_KEY) {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: from(), to: [to], subject, html, reply_to: process.env.EMAIL_REPLY_TO || undefined }),
      });
      const j = await r.json().catch(() => ({}));
      return r.ok ? { ok: true, detail: `Resend ${j.id ?? ''}`.trim() } : { ok: false, detail: `Resend ${r.status}: ${j.message ?? 'error'}` };
    }
    if (process.env.POSTMARK_TOKEN) {
      const r = await fetch('https://api.postmarkapp.com/email', {
        method: 'POST',
        headers: { 'X-Postmark-Server-Token': process.env.POSTMARK_TOKEN, Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ From: from(), To: to, Subject: subject, HtmlBody: html, ReplyTo: process.env.EMAIL_REPLY_TO || undefined, MessageStream: 'outbound' }),
      });
      const j = await r.json().catch(() => ({}));
      return r.ok ? { ok: true, detail: `Postmark ${j.MessageID ?? ''}`.trim() } : { ok: false, detail: `Postmark ${r.status}: ${j.Message ?? 'error'}` };
    }
    return { ok: false, detail: 'No email provider set up' };
  } catch (e) {
    return { ok: false, detail: (e as Error).message };
  }
}
