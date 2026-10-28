import { ShieldCheck, Users, Megaphone, LifeBuoy } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Account security",
    text: "Register, verify your email and recover your password whenever you need to.",
  },
  {
    icon: Users,
    title: "Roles and access",
    text: "Users and administrators each get the tools that match their role.",
  },
  {
    icon: Megaphone,
    title: "Announcements",
    text: "Stay up to date with news and updates published by administrators.",
  },
  {
    icon: LifeBuoy,
    title: "Support requests",
    text: "Send a request, follow its status and read the replies in one place.",
  },
];

function FeaturesSection() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <h2 className="text-2xl font-bold text-slate-900">
        What you can do here
      </h2>
      <p className="mt-1 text-slate-600">
        Everything you need to manage your account.
      </p>

      {/* 1 column on phones, 2 on tablets, 4 on wide screens.
          "xl" (not "lg") because the sidebar takes space from the page when signed in. */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {features.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <Icon size={20} aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturesSection;
