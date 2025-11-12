import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// --- Get configurations from Environment Variables ---
const SMTP_HOST = process.env.EMAIL_HOST;
const SMTP_PORT = process.env.EMAIL_PORT;
const SMTP_USER = process.env.EMAIL_USER;
const SMTP_PASS = process.env.EMAIL_PASS;
const SENDER_EMAIL = process.env.EMAIL_FROM;
// We use the variable set in .env for TO address
const RECEIVER_EMAIL = process.env.TO_EMAIL_SUBMISSIONS; 

// Configure NodeMailer transporter
const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587'),
    secure: false, // Use false for port 587 (STARTTLS)
    auth: {
        user: SMTP_USER, 
        pass: SMTP_PASS, 
    },
});

export async function POST(request: Request) {
    // Check if configuration is loaded
    if (!SENDER_EMAIL || !RECEIVER_EMAIL || !SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        console.error("DEBUG: MISSING CONFIG - Check EMAIL_HOST/USER/PASS and TO_EMAIL_SUBMISSIONS in .env file!");
        return NextResponse.json(
            { message: 'Server configuration error. Please check your .env file.' }, 
            { status: 500 }
        );
    }
    
    try {
        const data = await request.json();
        const { name, lastName, subject, message } = data;

        if (!name || !lastName || !subject || !message) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const mailOptions = {
            from: SENDER_EMAIL, // marketing@athlekt.com
            to: RECEIVER_EMAIL,   // muhammadharis2213@gmail.com
            subject: `New Contact Form Submission: ${subject}`,
            html: `
                <p><strong>Name:</strong> ${name} ${lastName}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap; border: 1px solid #ccc; padding: 10px; background-color: #f9f9f9;">${message}</p>
                <hr>
                <p>This message was automatically sent from the Athlekt website Contact Us page.</p>
            `,
        };

        // Attempt to send email
        const info = await transporter.sendMail(mailOptions);
        console.log("DEBUG: Email sent successfully. Message ID:", info.messageId);

        return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
        
    } catch (error) {
        // --- CRITICAL DEBUG LOG ---
        console.error('DEBUG: ERROR SENDING EMAIL. Full Error Object:', error);
        
        return NextResponse.json(
            { message: 'Internal Server Error. Could not send email. Check server logs for details.' },
            { status: 500 }
        );
    }
}