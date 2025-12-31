
const { Resend } = require('resend');

// Manually load env if needed, or just paste key for testing
// But better to use dotenv to simulate app environment
require('dotenv').config();

async function testEmail() {
    console.log('Checking API Key...');
    if (!process.env.RESEND_API_KEY) {
        console.error('ERROR: RESEND_API_KEY is missing from .env');
        return;
    }
    console.log('API Key found (starts with):', process.env.RESEND_API_KEY.substring(0, 5) + '...');

    const resend = new Resend(process.env.RESEND_API_KEY);

    console.log('Attempting to send test email...');
    // IMPORTANT: In test mode, this MUST be the email you signed up to Resend with.
    // We'll try to send to the admin/signup email if we knew it, but for now we'll ask the user.

    // We will default to a placeholder and ask user to edit if it fails, 
    // OR we can just try to send to "delivered@resend.dev" which is a sink? 
    // No, better to try getting the key working.

    const userEmail = 'test@example.com'; // This will likely fail in test mode if not the owner's email

    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: userEmail,
            subject: 'Test Email from Owner Portal',
            html: '<p>If you see this, email sending is working!</p>'
        });

        if (error) {
            console.error('Resend Error:', error);
        } else {
            console.log('Success!', data);
            console.warn('NOTE: If you are in Resend "Introduction" mode, you can ONLY send to your own email address.');
        }
    } catch (e) {
        console.error('Exception:', e);
    }
}

testEmail();
