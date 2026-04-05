
const PrivacyPolicy: React.FC = () => (
  <div className="container mx-auto px-4 py-12 max-w-3xl text-slate-800 dark:text-slate-200 mt-20">
    <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
    <p className="mb-4">Last updated: April 5, 2026</p>
    <p className="mb-4">Your privacy is critically important to us. This policy outlines how we handle your data.</p>
    <h2 className="text-xl font-semibold mt-8 mb-2">1. Information We Collect</h2>
    <p className="mb-4">We do not collect personally identifiable information (PII). When you use our service, the content you submit (text, images, audio) is sent for analysis and is not stored or associated with you.</p>
    <p className="mb-4">You may voluntarily consent to share your anonymized location data (country and, if applicable, state/province) for research purposes. This is opt-in and not required to use the service.</p>
    <h2 className="text-xl font-semibold mt-8 mb-2">2. How We Use Information</h2>
    <p className="mb-4">Submitted content is used solely for the purpose of providing the AI analysis. Anonymized location data, if you consent to provide it, is used to improve the accuracy and relevance of our legal and support resources for different regions.</p>
    <h2 className="text-xl font-semibold mt-8 mb-2">3. Data Security</h2>
    <p className="mb-4">We implement security measures to protect your data during transmission. Since we do not store your submitted content, the risk of data breaches related to your personal inputs is minimized.</p>
    <h2 className="text-xl font-semibold mt-8 mb-2">4. Third-Party Services</h2>
    <p className="mb-4">We use the Google Gemini API to perform content analysis. Their use of data is governed by their own privacy policies. We do not share your data with any other third parties.</p>
    <h2 className="text-xl font-semibold mt-8 mb-2">5. Changes to This Policy</h2>
    <p className="mb-4">We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
    <div className="flex justify-center mt-12">
      <a href="/" className="inline-block px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors">Home</a>
    </div>
  </div>
);

export default PrivacyPolicy;
