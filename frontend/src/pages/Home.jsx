import { Link } from "react-router-dom";
import { Rocket, TrendingUp, Shield, Zap } from "lucide-react";
import FreeUrlShortener from "../components/url/FreeUrlShortener";

const Home = () => {
  return (
    <div className="min-h-[calc(100vh-52px)] lg:h-[calc(100vh-52px)] bg-gray-50 dark:bg-gray-950 flex flex-col overflow-y-auto lg:overflow-hidden transition-colors duration-300">

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 lg:py-3 w-full">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Text Content */}
            <div className="space-y-6 lg:space-y-4 text-center lg:text-left order-2 lg:order-1">
              {/* Main Heading */}
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-3 text-gray-900 dark:text-white">
                  Shorten URLs.
                  <br />
                  <span className="text-purple-600 dark:text-purple-400">
                    Amplify Results.
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Transform endless URLs into powerful, trackable links.
                  <br className="hidden sm:block" />
                  Built for marketers, developers, and creators.
                </p>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full shadow-sm">
                  <Zap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Fast</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full shadow-sm">
                  <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Secure</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full shadow-sm">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Analytics</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 w-full sm:w-auto">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all"
                >
                  Start Free
                  <Rocket className="w-4 h-4" />
                </Link>
                
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold text-base hover:border-purple-500 dark:hover:border-purple-500 transition-all text-center"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* URL Shortener Form */}
            <div className="w-full order-1 lg:order-2 mb-8 lg:mb-0">
              <FreeUrlShortener />
            </div>

          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-4 px-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-3 text-xs font-semibold tracking-wide uppercase">
              Trusted by professionals at
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              <div className="text-lg md:text-xl font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">Google</div>
              <div className="text-lg md:text-xl font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">Microsoft</div>
              <div className="text-lg md:text-xl font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">Amazon</div>
              <div className="text-lg md:text-xl font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">Meta</div>
              <div className="text-lg md:text-xl font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">Netflix</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
