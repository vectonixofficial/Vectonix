import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { firstName, lastName, email, subject, message } = body;

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your-google-app-password-here') {
            console.error('Email credentials are not properly configured.');
            return NextResponse.json(
                { message: "Server configuration error: Email credentials missing" },
                { status: 500 }
            );
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Save response to Supabase
        try {
            const { responsesService } = await import("@/lib/services/responsesService");
            await responsesService.createRegistration({
                full_name: `${firstName} ${lastName}`,
                email: email,
                type: "contact",
                answers: { subject, message },
                status: "received",
            });
        } catch (dbErr) {
            console.error("Saved to email, failed to store in Supabase:", dbErr);
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'vectonixofficial@gmail.com', // Explicitly send to this address
            subject: `New Contact Form Submission: ${subject}`,
            text: `
Name: ${firstName} ${lastName}
Email: ${email}
Subject: ${subject}

Message:
${message}
            `,
            html: `
<h3>New Contact Form Submission</h3>
<p><strong>Name:</strong> ${firstName} ${lastName}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Subject:</strong> ${subject}</p>
<p><strong>Message:</strong></p>
<p>${message.replace(/\n/g, '<br>')}</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json(
            { message: "Contact request submitted and stored successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json(
            { message: "Failed to send email" },
            { status: 500 }
        );
    }
}
