import { LegalPageShell } from "../legal-page-shell";

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" lastUpdated="March 27, 2026">
      <section>
        <h2 className="text-2xl font-semibold text-white">1. Controller</h2>
        <p>
          FormAI is operated by Ahmed Ashraf Yassen Aly. If you use this application, your data is processed by the operator for the purpose of running the service, authenticating users, generating forms, collecting submissions, and improving reliability and security.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">2. Data we collect</h2>
        <p>Depending on how you use FormAI, we may collect:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>account information provided through Clerk, such as name, email address, avatar, and workspace membership</li>
          <li>form metadata, prompts, field structures, and published form snapshots</li>
          <li>submission contents entered into published forms</li>
          <li>technical usage information such as page views, timestamps, browser sessions, and service logs</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">3. How we use data</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>to provide authentication, workspace access, and form management features</li>
          <li>to generate AI-assisted form drafts through Groq</li>
          <li>to store and deliver published forms and submissions</li>
          <li>to monitor abuse, apply fair-use limits, and protect service integrity</li>
          <li>to debug issues and improve product quality</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">4. Third-party processors</h2>
        <p>FormAI currently relies on third-party services including Clerk for authentication, Convex for backend/data infrastructure, and Groq for AI generation. These providers may process the minimum data required to perform their role in the service.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">5. Retention</h2>
        <p>We keep account data, forms, and submissions for as long as needed to operate the service, comply with legal obligations, resolve disputes, and maintain security. You can request deletion of your account-related data as described on the Data &amp; Deletion page.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">6. Security</h2>
        <p>Reasonable technical and organizational measures are used to protect data, but no system can be guaranteed perfectly secure. You should avoid collecting highly sensitive personal data through FormAI unless you have reviewed the risks and your own legal obligations.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">7. Contact</h2>
        <p>If you need to make a privacy or deletion request, contact the operator through the project contact details you publish with the deployed service.</p>
      </section>
    </LegalPageShell>
  );
}
