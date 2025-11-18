import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

export function getTransport() {
  const server: SMTPTransport.Options = {
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT ? Number(process.env.EMAIL_SERVER_PORT) : undefined,
    secure: process.env.EMAIL_SERVER_SECURE === 'true',
    auth: process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD ? {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    } : undefined,
  };
  return nodemailer.createTransport(server);
}

export const FROM = process.env.EMAIL_FROM || 'Levend Portret <noreply@example.com>';
