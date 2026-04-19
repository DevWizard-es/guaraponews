import nodemailer from 'nodemailer';
import { Article } from './db';

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error('Gmail SMTP credentials are not configured in environment variables.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

export async function sendDailyNewsletter(to: string, userName: string, articles: Article[]) {
  const transporter = getTransporter();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://guaraponews.vercel.app';
  const fromEmail = process.env.GMAIL_USER;

  const articlesHtml = articles.map(article => `
    <div style="margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px;">
      <div style="display: flex; gap: 15px; align-items: flex-start;">
        <div style="flex: 1;">
          <small style="color: #10b981; font-weight: 800; font-family: 'Outfit', Helvetica, Arial, sans-serif; text-transform: uppercase; letter-spacing: 1px; font-size: 10px;">
            ${article.category} | ${article.source}
          </small>
          <h2 style="margin: 8px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; line-height: 1.3; color: #000;">
            <a href="${article.link}" style="color: #000; text-decoration: none;">${article.title}</a>
          </h2>
          <ul style="padding-left: 18px; margin: 10px 0; color: #555; font-size: 14px; font-family: 'Outfit', Helvetica, Arial, sans-serif;">
            ${article.bullets.slice(0, 2).map(b => `<li>${b}</li>`).join('')}
          </ul>
          <a href="${article.link}" style="display: inline-block; margin-top: 10px; color: #10b981; font-weight: 700; text-decoration: none; font-size: 13px; font-family: 'Outfit', Helvetica, Arial, sans-serif;">
            LEER MÁS →
          </a>
        </div>
      </div>
    </div>
  `).join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu resumen diario en GuarapoNews</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Outfit', Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f6f9fc; padding: 20px 0;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #000000; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; font-family: 'Playfair Display', Georgia, serif; font-size: 32px; font-weight: 900; margin: 0; letter-spacing: -1px;">
                Guarapo<span style="color: #10b981;">News</span>
              </h1>
              <p style="color: #8899aa; font-size: 12px; margin-top: 5px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                Resumen Diario Inteligente
              </p>
            </td>
          </tr>

          <!-- Welcome -->
          <tr>
            <td style="padding: 40px 40px 20px;">
              <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 24px; color: #000; margin: 0 0 10px;">¡Hola, ${userName}!</h2>
              <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0;">
                Aquí tienes las historias que están marcando tendencia hoy en el mundo de la tecnología e innovación.
              </p>
            </td>
          </tr>

          <!-- Articles -->
          <tr>
            <td style="padding: 20px 40px;">
              ${articlesHtml}
            </td>
          </tr>

          <!-- Footer CTA -->
          <tr>
            <td style="padding: 20px 40px 40px; text-align: center;">
              <a href="${appUrl}" style="display: inline-block; background-color: #10b981; color: #000; padding: 16px 40px; border-radius: 50px; font-weight: 900; text-decoration: none; font-size: 16px; letter-spacing: -0.5px;">
                VER TODAS LAS NOTICIAS
              </a>
              <p style="margin-top: 30px; color: #8899aa; font-size: 12px;">
                &copy; ${new Date().getFullYear()} GuarapoNews. Diseñado por Backend Engineers.<br>
                Recibes este correo porque te suscribiste a Guarapo News XTRA.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return transporter.sendMail({
    from: `"GuarapoNews" <${fromEmail}>`,
    to,
    subject: `📰 Tu resumen diario: ${articles[0]?.title.substring(0, 50)}...`,
    html,
  });
}
