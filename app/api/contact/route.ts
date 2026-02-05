import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// POST handler
export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: "eduard@elviajeropr.com", // Your destination email
      subject: `New Message from ${name}`,
      text: message,
    });

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { message: 'Failed to send message' },
      { status: 500 }
    );
  }
}
