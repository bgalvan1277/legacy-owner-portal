
const { Resend } = require('resend');
require('dotenv').config();

async function testEmail() {
    console.log('Testing with verified domain...');
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Using a generic email to test if we can send outside of the account owner
    // This proves the domain is fully verified and working
    const testRecipient = 'test-recipient@example.com';

    try {
        const { data, error } = await resend.emails.send({
            from: 'Legacy Business Advisors <noreply@notifications.ownerportal.ai>',
            to: testRecipient,
            subject: 'Test Email - Domain Verification Check',
            html: '<p>If this sends without error, the domain configuration is correct and you can send to anyone.</p>'
        });

        if (error) {
            console.error('Still failing:', error);
        } else {
            console.log('SUCCESS! Email sent successfully to external address:', data);
        }
    } catch (e) {
        console.error('Exception:', e);
    }
}

testEmail();
