import { Resend } from "resend";

export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const MAIL_FROM_ADDRESS = process.env.MAIL_FROM_ADDRESS ?? "";
export const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME ?? "Immo Gest";
