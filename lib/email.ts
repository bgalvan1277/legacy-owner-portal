import { Resend } from 'resend';

export async function sendApprovalEmail(userEmail: string, userName: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping email sending.');
        return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const { data, error } = await resend.emails.send({
            from: 'Legacy Business Advisors <onboarding@resend.dev>', // Update this with your verified domain if available, or use the testing domain
            to: [userEmail],
            subject: 'Welcome to Legacy Business Advisors - Account Approved',
            html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h1 style="color: #0d5f41;">Account Approved</h1>
            <p>Congratulations <strong>${userName}</strong>,</p>
            <p>Your account has been approved. You can now access the Owner Portal.</p>
            <p>
                <a href="${process.env.NEXTAUTH_URL}" style="display: inline-block; padding: 12px 24px; background-color: #0d5f41; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Go to Portal
                </a>
            </p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p><a href="${process.env.NEXTAUTH_URL}">${process.env.NEXTAUTH_URL}</a></p>
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
