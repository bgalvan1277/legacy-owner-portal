import { Resend } from 'resend';

export async function sendApprovalEmail(userEmail: string, userName: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping email sending.');
        return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const { data, error } = await resend.emails.send({
            from: 'Legacy Business Advisors <noreply@notifications.ownerportal.ai>',
            to: [userEmail],
            subject: 'Welcome to Legacy Business Advisors - Account Approved',
            html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h1 style="color: #0d5f41;">Account Approved</h1>
            <p>Congratulations <strong>${userName}</strong>,</p>
            <p>Your account has been approved. You can now access the Owner Portal.</p>
            <p>
                <a href="https://ownerportal.ai" style="display: inline-block; padding: 12px 24px; background-color: #0d5f41; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Go to Portal
                </a>
            </p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p><a href="https://ownerportal.ai">https://ownerportal.ai</a></p>
            <br/>
            <p>Best regards,<br/>The Legacy Business Advisors Team</p>
        </div>
      `,
        });

        if (error) {
            console.error('Error sending approval email:', error);
            return { success: false, error };
        }

        console.log('Approval email sent successfully:', data);
        return { success: true, data };

    } catch (error) {
        console.error('Exception sending approval email:', error);
        return { success: false, error };
    }
}

export async function sendPasswordResetEmail(email: string, token: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping password reset email.');
        return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const baseUrl = 'https://ownerportal.ai';
    const link = `${baseUrl}/reset-password?token=${token}`;

    try {
        await resend.emails.send({
            from: 'Legacy Business Advisors <noreply@notifications.ownerportal.ai>',
            to: email,
            subject: 'Reset Your Password',
            html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h1 style="color: #0d5f41;">Password Reset Request</h1>
            <p>We received a request to reset your password. Click the link below to choose a new password:</p>
            <p>
                 <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #0d5f41; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Reset Password
                </a>
            </p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
             <p><small>Link: <a href="${link}">${link}</a></small></p>
        </div>
      `,
        });
        console.log(`Password reset email sent to ${email}`);
    } catch (error) {
        console.error('Failed to send password reset email:', error);
    }
}
