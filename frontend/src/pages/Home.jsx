import { Link } from "react-router-dom";
import FreeUrlShortener from "../components/url/FreeUrlShortener";

const features = [
  {
    title: "Track every click",
    description: "See who clicked, from where, and on what device. Real analytics, not just counts.",
  },
  {
    title: "Password-protect links",
    description: "Add a password to any link. Only people with the right key get through.",
  },
  {
    title: "Set expiry dates",
    description: "Links that expire on their own. Perfect for time-sensitive campaigns.",
  },
];

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-4 py-20 sm:py-28">
        <div className="max-w-2xl mx-auto w-full text-center space-y-8 animate-slide-up">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight tracking-tight">
              Short links that{" "}
              <span className="text-accent-600">actually tell you something</span>
            </h1>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
              nanoURL turns long links into clean, trackable ones. See who clicks, block with passwords, or set them to expire — all from one simple dashboard.
            </p>
          </div>

          {/* Free shortener inline */}
          <div className="card p-5 text-left">
            <FreeUrlShortener />
          </div>

          {/* Auth links */}
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Want unlimited links and analytics?{" "}
            <Link to="/register" className="text-accent-600 hover:underline font-medium">
              Create a free account
            </Link>
            {" "}or{" "}
            <Link to="/login" className="text-accent-600 hover:underline font-medium">
              sign in
            </Link>
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8">
            {features.map((feat) => (
              <div key={feat.title} className="space-y-2">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {feat.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
