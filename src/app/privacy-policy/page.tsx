import React from 'react';

export const metadata = {
  title: 'Privacy Policy | EPL Connect',
  description: 'Privacy Policy and Data Collection statement for EPL Connect.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 shadow-sm rounded-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p>
              Welcome to EPL Connect. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you as to how we look after your personal data when you visit our website 
              (and use our enterprise service management systems.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. The Data We Collect About You</h2>
            <p className="mb-4">
              We may collect, use, store, and transfer different kinds of personal data about you to provide our enterprise 
              HVAC management and maintenance services. The personal data we collect includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Identity Data:</strong> Full name, username, title, and profile pictures (avatars).</li>
              <li><strong>Contact Data:</strong> Email address, telephone numbers, and company address.</li>
              <li><strong>Biometric & Verification Data:</strong> Facial reference photos and digital signatures used strictly for verifying technician/vendor attendance at project sites.</li>
              <li><strong>Location Data:</strong> GPS coordinates (latitude and longitude) used for geo-fencing to validate technician attendance at customer locations.</li>
              <li><strong>Technical Data:</strong> Internet protocol (IP) address, your login data, browser type and version, and operating system used for security auditing and logging.</li>
              <li><strong>Business Data:</strong> Company name, business field, and business relationships.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Personal Data</h2>
            <p className="mb-4">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To register you as a new user (employee, technician, vendor, or customer).</li>
              <li>To manage and coordinate technical services, project schedules, and maintenance work orders.</li>
              <li>To verify the physical presence of engineers/technicians at client sites via location tracking and facial verification for service reports and SLAs.</li>
              <li>To securely authenticate your access to our system (including OTP/2FA delivery).</li>
              <li>To monitor system security, detect unauthorized access, and maintain comprehensive audit logs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, 
              used, or accessed in an unauthorized way, altered, or disclosed. In addition, we limit access to your personal data 
              to those employees, agents, contractors, and other third parties who have a business need to know.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Retention</h2>
            <p>
              We will only retain your personal data for as long as reasonably necessary to fulfill the purposes we collected it for, 
              including for the purposes of satisfying any legal, regulatory, tax, accounting, or reporting requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our privacy practices, please contact our administrative team 
              or your project person-in-charge (PIC) directly.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
