import Link from "next/link";

const sections = [
  {
    title: "Information we collect",
    body: "WARDEN collects the information you provide directly, such as account details, profile information, reports, comments and any content you submit through the platform. We also process technical data needed to operate the service, including device, browser and log information.",
  },
  {
    title: "Location and map data",
    body: "Some features use approximate or precise location data when you choose to share it, for example while reporting incidents or exploring location-based content. We only use this data to provide the requested feature, improve relevance and support safety-related workflows.",
  },
  {
    title: "Cookies and similar technologies",
    body: "We use cookies and similar storage technologies to keep you signed in, remember preferences, protect accounts, understand service usage and support site functionality. Some cookies are strictly necessary, while others are used only when you give consent where required by law.",
  },
  {
    title: "Advertising and Google AdSense",
    body: "WARDEN uses Google AdSense to display advertising. Google and its partners may use cookies, local storage and similar technologies to serve ads, measure performance, limit repetition and prevent fraud. For visitors in regions where consent is required, advertising choices are managed through a certified consent management platform before eligible ad processing takes place.",
  },
  {
    title: "Push notifications",
    body: "If you enable browser notifications, we store the information required to deliver those notifications and send service-related updates that you have opted in to receive. You can disable notifications at any time in your browser or device settings.",
  },
  {
    title: "How we use information",
    body: "We use personal information to create and manage accounts, deliver core platform features, respond to support requests, moderate content, improve reliability, detect abuse, comply with legal obligations and maintain the security of the service.",
  },
  {
    title: "Sharing of information",
    body: "We may share information with service providers that help us operate the platform, including hosting, authentication, notifications, analytics and advertising partners. We may also disclose information when required by law, to protect users or to enforce our terms.",
  },
  {
    title: "Your choices",
    body: "You can review or update certain account information from your profile, manage cookie and advertising choices through available consent tools, and control browser permissions such as location and notifications. You may also contact us to request privacy-related assistance.",
  },
];

export default function PrivacyPage() {
  return (
    <section className="min-h-screen bg-slate-50 py-10 text-slate-900">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#a50034] via-rose-700 to-slate-900 px-6 py-10 text-white shadow-xl sm:px-10">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/75">
            Privacy Policy
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            How WARDEN handles your data
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/85 sm:text-base">
            This policy explains what information we collect, how we use it and
            how advertising, cookies, notifications and location-related
            features are handled on WARDEN.
          </p>
          <p className="mt-4 text-sm text-white/70">Last updated: March 15, 2026</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-6">
            {sections.map((section) => (
              <article
                key={section.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <h2 className="text-xl font-semibold text-slate-900">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-700 sm:text-base">
                  {section.body}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-slate-900">Contact</h2>
          <p className="mt-2 text-sm leading-7 text-slate-700 sm:text-base">
            For privacy-related questions, contact us at
            {" "}
            <a
              className="font-medium text-rose-700 underline underline-offset-4"
              href="mailto:habibur.web04@gmail.com"
            >
              habibur.web04@gmail.com
            </a>
            .
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-700 sm:text-base">
            You can also return to the
            {" "}
            <Link
              className="font-medium text-rose-700 underline underline-offset-4"
              href="/"
            >
              homepage
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}