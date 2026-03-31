const nodemailer = require('nodemailer');

// Manually verify the credentials provided by the user
const transportConfig = {
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: 'no-reply@daikin-connect.com',
    pass: 'Doda4244@#',
  },
  // Add TLS options for broader compatibility
  tls: {
    rejectUnauthorized: false
  }
};

const transporter = nodemailer.createTransport(transportConfig);

async function testConnection() {
  console.log('Testing SMTP connection...');
  try {
    await transporter.verify();
    console.log('✅ Connection successful!');
    
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: '"EPL Connect Test" <no-reply@daikin-connect.com>',
      to: 'no-reply@daikin-connect.com', // Sending to self for test
      subject: 'EPL Connect SMTP Test',
      text: 'If you receive this, the SMTP configuration is working correctly.',
      html: '<b>If you receive this, the SMTP configuration is working correctly.</b>'
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ SMTP Error:', error.message);
    if (error.code) console.error('Error Code:', error.code);
    if (error.command) console.error('Last Command:', error.command);
  }
}

testConnection();
