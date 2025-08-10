export const metadata = {
  title: 'Terms of Service • FormAI',
}

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-6 py-12 text-slate-300">
      <h1 className="text-3xl font-semibold text-white mb-6">Terms of Service</h1>
      <p className="mb-4">Last updated: {new Date().toISOString().slice(0, 10)}</p>
      <p className="mb-4">
        These Terms govern your use of FormAI. By using the service, you agree to these Terms.
      </p>
      <h2 className="text-xl text-white mt-8 mb-3">Use of service</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>You must comply with applicable laws and refrain from abusive or unlawful content.</li>
        <li>You are responsible for maintaining the security of your account.</li>
        <li>We may impose fair-use limits on AI generation, forms, and submissions for Free plans.</li>
      </ul>
      <h2 className="text-xl text-white mt-8 mb-3">Content and submissions</h2>
      <p className="mb-4">
        You retain ownership of your content. You grant us a license to process and host content to operate the
        service. Do not submit sensitive data unless you have appropriate legal basis and safeguards.
      </p>
      <h2 className="text-xl text-white mt-8 mb-3">Payments</h2>
      <p className="mb-4">Paid plans are billed in advance and are non-refundable unless required by law.</p>
      <h2 className="text-xl text-white mt-8 mb-3">Termination</h2>
      <p className="mb-4">We may suspend or terminate accounts that violate these Terms.</p>
      <h2 className="text-xl text-white mt-8 mb-3">Disclaimers</h2>
      <p className="mb-4">
        The service is provided “as is” without warranties. To the fullest extent permitted, we disclaim implied
        warranties of merchantability, fitness for a particular purpose, and non-infringement.
      </p>
      <h2 className="text-xl text-white mt-8 mb-3">Limitation of liability</h2>
      <p className="mb-4">Our aggregate liability is limited to fees paid in the 3 months prior to the event giving rise to the claim.</p>
      <h2 className="text-xl text-white mt-8 mb-3">Changes</h2>
      <p className="mb-4">We may update these Terms. Continued use constitutes acceptance of the updated Terms.</p>
      <h2 className="text-xl text-white mt-8 mb-3">Contact</h2>
      <p className="mb-4">For questions, contact support@example.com.</p>
    </div>
  )
}


