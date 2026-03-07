import nodemailer from "nodemailer";

export async function sendOTPEmail(toEmail, otpCode) {
    try {
        let transporter;

        // Use actual SMTP in production or if SMTP_HOST is explicitly provided
        if (process.env.SMTP_HOST) {
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        } else {
            // Fallback for local development WITHOUT SMTP configured
            console.log("No SMTP Config found in .env, falling back to Ethereal Email for testing.");
            let testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        }

        const fromEmail = process.env.SMTP_FROM || '"Shortify Security" <no-reply@shortify.com>';

        const info = await transporter.sendMail({
            from: fromEmail,
            to: toEmail,
            subject: "Your Shortify Verification Code",
            text: `Your Shortify verification code is: ${otpCode}. It expires in 5 minutes.`,
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h2>Welcome to Shortify!</h2>
          <p>Please use the following One-Time Password to verify your email address:</p>
          <h1 style="font-size: 40px; letter-spacing: 5px; color: #7c3aed; background: #f3f4f6; padding: 20px; border-radius: 10px; display: inline-block;">${otpCode}</h1>
          <p>This code will expire in <strong>5 minutes</strong>.</p>
        </div>
      `,
        });

        console.log("Message sent: %s", info.messageId);

        // Only print preview URL if using Ethereal
        if (!process.env.SMTP_HOST) {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }

        return true;
    } catch (error) {
        console.error("Error sending OTP email:", error);
        return false;
    }
}
