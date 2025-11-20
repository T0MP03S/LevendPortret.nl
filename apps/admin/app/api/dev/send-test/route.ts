import { NextResponse } from 'next/server';
import { getTransport, FROM } from '../../../../lib/mailer';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

const WEB_BASE = (process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000').replace(/\/$/, '');

function baseTemplate({ title, intro, body, cta, logoCid, preheader }: { title: string; intro?: string; body: string; cta?: { href: string; label: string }, logoCid?: string, preheader?: string }) {
  const navy = '#191970';
  const coral = '#ff546b';
  return `<!doctype html>
<html lang="nl">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" content="yes" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <meta charSet="utf-8" />
    <title>${title}</title>
  </head>
  <body bgcolor="#f7f7fb" style="margin:0;padding:0;background:#f7f7fb;font-family:Montserrat,Segoe UI,Arial,sans-serif;color:#111;">
    ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div>` : ''}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#f7f7fb" style="background:#f7f7fb;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td bgcolor="${navy}" style="background:${navy};padding:16px 20px;color:#fff;">
                <table width="100%">
                  <tr>
                    <td style="vertical-align:middle"><img src="${logoCid ? `cid:${logoCid}` : `${WEB_BASE}/logo.svg`}" alt="Levend Portret" height="28" style="display:block;border:0;outline:none;text-decoration:none;"></td>
                    <td align="right" style="font-weight:700">${title}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="background:#ffffff;padding:24px 24px 8px 24px;">
                ${intro ? `<p style=\"margin:0 0 12px 0;color:#334155;\">${intro}</p>` : ''}
                <div style="color:#111827;line-height:1.55;font-size:15px">${body}</div>
                ${cta ? `<div style=\"margin-top:20px\"><a href=\"${cta.href}\" style=\"display:inline-block;background:${coral};color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600\">${cta.label}</a></div>` : ''}
              </td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="background:#ffffff;padding:16px 24px;color:#64748b;font-size:12px;border-top:1px solid #e5e7eb;">
                © ${new Date().getFullYear()} Levend Portret · <a href="${WEB_BASE}" style="color:#64748b;text-decoration:underline">levendportret.nl</a>
                <div style="margin-top:4px">Contact: <a href="mailto:info@levendportret.nl" style="color:#64748b;text-decoration:underline">info@levendportret.nl</a></div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function getTemplate(type: string, baseUrl: string): { subject: string; html: string; text: string } {
  switch (type) {
    case 'magic-link': {
      const url = `${baseUrl}/api/auth/callback/email?token=demo-token`;
      return {
        subject: 'Verifieer je e-mailadres',
        html: baseTemplate({
          title: 'Inloggen',
          intro: 'Klik op de knop hieronder om in te loggen.',
          body: `<p>Deze link is tijdelijk geldig. Als je deze e-mail niet hebt aangevraagd, kun je deze negeren.</p>`,
          cta: { href: url, label: 'Log in' },
          preheader: 'Log in met één klik via je e-mail'
        }),
        text: `Inloggen\n\nKlik om in te loggen: ${url}\n\nDeze link is tijdelijk geldig. Als je dit niet hebt aangevraagd, kun je deze e-mail negeren.`
      };
    }
    case 'registration-received':
      return {
        subject: 'Aanmelding ontvangen',
        html: baseTemplate({ title: 'Aanmelding ontvangen', body: '<p>We hebben je aanmelding ontvangen. We nemen snel contact op.</p>', preheader: 'We hebben je aanmelding ontvangen' }),
        text: 'We hebben je aanmelding ontvangen. We nemen snel contact op.'
      };
    case 'approved':
      return {
        subject: 'Je account is geactiveerd',
        html: baseTemplate({ title: 'Account geactiveerd', body: '<p>Je account is geactiveerd. Je kunt nu inloggen en aan de slag.</p>', preheader: 'Je account is nu actief' }),
        text: 'Je account is geactiveerd. Je kunt nu inloggen en aan de slag.'
      };
    case 'rejected':
      return {
        subject: 'Aanmelding niet goedgekeurd',
        html: baseTemplate({ title: 'Niet goedgekeurd', body: '<p>Je aanmelding is helaas niet goedgekeurd. Neem contact op bij vragen.</p>', preheader: 'Je aanmelding is niet goedgekeurd' }),
        text: 'Je aanmelding is helaas niet goedgekeurd. Neem contact op bij vragen.'
      };
    default:
      return {
        subject: 'Testmail',
        html: baseTemplate({ title: 'Test', body: '<p>Dit is een testbericht.</p>', preheader: 'Testbericht' }),
        text: 'Dit is een testbericht.'
      };
  }
}

export async function POST(req: Request) {
  try {
    const { to, type } = await req.json();
    if (!to) return NextResponse.json({ ok: false, error: 'Missing `to`' }, { status: 400 });
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    // Resolve logo from the admin app's public folder (prefer PNG for email clients)
    const pngPath = path.join(process.cwd(), 'public', 'logo-email.png');
    const whitePngPath = path.join(process.cwd(), 'public', 'Logo Wit.png');
    const svgPath = path.join(process.cwd(), 'public', 'logo.svg');
    const logoPath = fs.existsSync(pngPath) ? pngPath : (fs.existsSync(whitePngPath) ? whitePngPath : svgPath);
    const hasLogo = fs.existsSync(logoPath);
    const logoCid = hasLogo ? 'lp-logo' : undefined;
    const { subject, html, text } = ((): { subject: string; html: string; text: string } => {
      const t = getTemplate(type, baseUrl);
      // Replace header logo URL with CID when we have a local file
      return logoCid ? { subject: t.subject, html: t.html.replace(`${WEB_BASE}/logo.svg`, `cid:${logoCid}`), text: t.text } : t;
    })();
    const transport = getTransport();
    const filename = hasLogo ? path.basename(logoPath) : undefined;
    const isPng = hasLogo ? filename!.toLowerCase().endsWith('.png') : false;
    if (process.env.NODE_ENV !== 'production' && hasLogo) {
      console.log(`[email-test] Attaching logo via CID: ${filename}`);
    }
    await transport.sendMail({
      to,
      from: FROM,
      replyTo: process.env.EMAIL_REPLY_TO || 'Levend Portret <info@levendportret.nl>',
      subject,
      html,
      text,
      ...(hasLogo ? { attachments: [{ filename: filename!, path: logoPath, cid: logoCid, contentType: isPng ? 'image/png' : 'image/svg+xml' }] } : {})
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Send failed' }, { status: 500 });
  }
}
