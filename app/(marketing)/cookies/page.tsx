import { LegalPageShell } from "../legal-page-shell";

export default function CookiesPage() {
  return (
    <LegalPageShell title="Cookie Policy" lastUpdated="March 27, 2026">
      <section>
        <h2 className="text-2xl font-semibold text-white">1. What this covers</h2>
        <p>This page explains how FormAI may use cookies, local storage, and similar client-side technologies.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">2. Essential storage</h2>
        <p>FormAI uses essential browser storage for features such as authentication sessions, UI state, live-form session tracking, and basic product functionality. These items are necessary for the app to work correctly.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">3. Analytics and service integrity</h2>
        <p>We may use client-side storage and request metadata to understand product usage, count form views and submissions, enforce fair-use limits, and detect abuse.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">4. Third-party services</h2>
        <p>Third-party providers such as Clerk may also use cookies or similar storage as part of authentication and account management flows. Their policies apply to the storage they control.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">5. Your choices</h2>
        <p>You can manage cookies and storage through your browser settings, but disabling essential storage may break parts of the product.</p>
      </section>
    </LegalPageShell>
  );
}
