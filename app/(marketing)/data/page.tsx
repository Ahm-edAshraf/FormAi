import { LegalPageShell } from "../legal-page-shell";

export default function DataPage() {
  return (
    <LegalPageShell title="Data, retention, and deletion" lastUpdated="March 27, 2026">
      <section>
        <h2 className="text-2xl font-semibold text-white">1. What data exists in the product</h2>
        <p>FormAI stores user profile information from Clerk, workspace records, form drafts, published snapshots, submission payloads, analytics events, and operational logs needed to run the service.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">2. Workspace and form ownership</h2>
        <p>Forms and responses belong to the workspace in which they were created. If you manage a workspace, you are responsible for the data you collect from respondents and for any notices or consent that may be legally required.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">3. Deletion requests</h2>
        <p>If you need account-level deletion or a data access request, you should contact the operator of the deployed service. Requests may require identity verification before action is taken.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">4. Operational backups and logs</h2>
        <p>Deleted content may persist for a limited period in infrastructure backups, logs, or disaster-recovery systems before aging out according to platform retention practices.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">5. Sensitive data warning</h2>
        <p>Unless you have independently verified compliance and suitability, do not use FormAI to collect health data, payment card data, government identifiers, or other highly sensitive categories of personal information.</p>
      </section>
    </LegalPageShell>
  );
}
