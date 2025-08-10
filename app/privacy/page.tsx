export const metadata = {
  title: 'Privacy Policy • FormAI',
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-6 py-12 text-slate-300">
      <h1 className="text-3xl font-semibold text-white mb-6">Privacy Policy</h1>
      <p className="mb-4">Last updated: {new Date().toISOString().slice(0, 10)}</p>
      <p className="mb-4">
        FormAI respects your privacy. This policy explains what information we collect, how we use it, and your
        rights. By using FormAI, you agree to this policy.
      </p>
      <h2 className="text-xl text-white mt-8 mb-3">Information we collect</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Account information: name, email, and profile details you provide.</li>
        <li>Form content and submissions, including files uploaded by respondents.</li>
        <li>Usage data and analytics such as page views, submissions, and web vitals.</li>
      </ul>
      <h2 className="text-xl text-white mt-8 mb-3">How we use information</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Provide and improve the service, including AI-powered features.</li>
        <li>Secure accounts, prevent abuse, and enforce limits.</li>
        <li>Communicate product updates and support messages.</li>
      </ul>
      <h2 className="text-xl text-white mt-8 mb-3">Data sharing</h2>
      <p className="mb-4">
        We do not sell personal data. We share data with processors to operate the service (e.g., hosting,
        database, analytics), under appropriate agreements.
      </p>
      <h2 className="text-xl text-white mt-8 mb-3">Data retention</h2>
      <p className="mb-4">We retain data for as long as your account is active or as required by law.</p>
      <h2 className="text-xl text-white mt-8 mb-3">Your rights</h2>
      <p className="mb-4">
        You may access, export, or delete your data from the dashboard. Contact support for additional requests.
      </p>
      <h2 className="text-xl text-white mt-8 mb-3">Contact</h2>
      <p className="mb-4">For privacy inquiries, contact support@example.com.</p>
    </div>
  )
}


