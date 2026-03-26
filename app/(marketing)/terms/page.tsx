import { LegalPageShell } from "../legal-page-shell";

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Use" lastUpdated="March 27, 2026">
      <section>
        <h2 className="text-2xl font-semibold text-white">1. Acceptance</h2>
        <p>By accessing or using FormAI, you agree to these terms. If you do not agree, do not use the service.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">2. Service description</h2>
        <p>FormAI is an AI-assisted form creation and publishing application. Features may change over time. Access can be limited, suspended, or revoked when necessary for maintenance, abuse prevention, legal compliance, or product changes.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">3. Fair use</h2>
        <p>FormAI does not currently operate on a paid subscription model. Instead, use of AI generation and related backend resources is governed by technical fair-use limits. These limits may be adjusted at any time to protect system reliability and prevent abuse.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">4. Your responsibilities</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>you are responsible for the forms you create and the data you collect</li>
          <li>you must not use the service for unlawful, abusive, deceptive, or harmful purposes</li>
          <li>you must not attempt to circumvent rate limits, access controls, or service protections</li>
          <li>you should not collect regulated or highly sensitive data unless you independently ensure legal compliance</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">5. Intellectual property</h2>
        <p>The application, brand, interface, and implementation remain the property of the operator unless explicitly stated otherwise. You retain responsibility for the content you submit and the forms you publish.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">6. No warranty</h2>
        <p>FormAI is provided on an “as is” and “as available” basis without warranties of any kind. AI-generated outputs may contain mistakes and should be reviewed before use.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">7. Limitation of liability</h2>
        <p>To the maximum extent permitted by law, the operator will not be liable for indirect, incidental, special, consequential, or business-interruption damages arising from use of the service.</p>
      </section>
    </LegalPageShell>
  );
}
