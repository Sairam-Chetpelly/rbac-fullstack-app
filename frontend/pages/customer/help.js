import CustomerLayout from '../../components/CustomerLayout';

export default function CustomerHelp() {
  return (
    <CustomerLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">1. How do I apply for a visa?</h3>
            <p className="text-gray-700 mb-2">To apply for a visa:</p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Go to the "Apply Visa" page.</li>
              <li>Select your visa type (Tourist, Business, Student, etc.).</li>
              <li>Fill in your personal and travel details.</li>
              <li>Upload required documents.</li>
              <li>Pay the application fee.</li>
              <li>Track your status on the "Applications" page.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">2. What documents are required?</h3>
            <p className="text-gray-700 mb-2">Commonly required documents:</p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Valid Passport (minimum 6 months validity)</li>
              <li>Passport-sized Photo</li>
              <li>Visa Application Form</li>
              <li>Proof of Travel (flight tickets, itinerary)</li>
              <li>Accommodation Details</li>
              <li>Supporting documents (bank statement, ID proof, etc.)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">3. How long does it take to process my visa?</h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Tourist Visa: 3–7 business days</li>
              <li>Business Visa: 5–10 business days</li>
              <li>Express Service (if available): 24–48 hours</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">4. How can I track my application?</h3>
            <p className="text-gray-700">You can track your application status by visiting the "My Applications" page in your dashboard. You'll see real-time updates on your application progress.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">5. What payment methods are accepted?</h3>
            <p className="text-gray-700">We accept payments through Razorpay, which supports credit cards, debit cards, net banking, UPI, and digital wallets.</p>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}