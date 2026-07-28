import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTPEmail(toEmail, otpCode) {
    try {
        const fromEmail = process.env.RESEND_FROM_EMAIL || "nanoURL <nanoURL@resend.dev>";

        const data = await resend.emails.send({
            from: fromEmail,
            to: toEmail,
            subject: "Your nanoURL Verification Code",
            text: `Your nanoURL verification code is: ${otpCode}. It expires in 5 minutes.`,
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h2>Welcome to nanoURL!</h2>
          <p>Please use the following One-Time Password to verify your email address:</p>
          <h1 style="font-size: 40px; letter-spacing: 5px; color: #7c3aed; background: #f3f4f6; padding: 20px; border-radius: 10px; display: inline-block;">${otpCode}</h1>
          <p>This code will expire in <strong>5 minutes</strong>.</p>
        </div>
      `,
        });

        if (data.error) {
            console.error("Resend error:", data.error);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Error sending OTP email:", error);
        return false;
    }
}
