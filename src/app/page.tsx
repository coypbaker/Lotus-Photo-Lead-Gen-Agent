import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
              <span className="block">Autonomous AI Lead Generation</span>
              <span className="block mt-2 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                for Wedding & Portrait Photographers
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              Stop chasing leads. Let our AI agents find, qualify, and deliver ready-to-book clients directly to your inbox while you focus on what you love — capturing beautiful moments.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold text-lg shadow-lg hover:from-purple-700 hover:to-blue-600 transition-all transform hover:scale-105"
              >
                Start Free Trial
              </Link>
              <Link
                href="#how-it-works"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-gray-700 font-semibold text-lg border-2 border-gray-200 hover:border-purple-300 hover:text-purple-600 transition-all"
              >
                See How It Works
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              How PhotoLeadAgent Works
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI works 24/7 to find your ideal clients so you can focus on your craft.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 border border-purple-100">
              <div className="h-12 w-12 rounded-xl bg-purple-600 flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Discovery</h3>
              <p className="text-gray-600">
                Our agents scan social media, wedding directories, and engagement announcements to find couples actively looking for photographers.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border border-blue-100">
              <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Qualification</h3>
              <p className="text-gray-600">
                Each lead is scored based on budget, timeline, location, and style preferences to ensure they match your ideal client profile.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-100">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Delivered to You</h3>
              <p className="text-gray-600">
                Get qualified leads delivered to your dashboard with contact info, wedding details, and personalized outreach suggestions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Choose the plan that fits your photography business.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Free</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center text-gray-600">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  10 leads/month
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Basic lead scoring
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Email notifications
                </li>
              </ul>
              <Link
                href="/signup"
                className="mt-8 block w-full py-3 px-4 rounded-lg bg-gray-100 text-gray-900 font-semibold text-center hover:bg-gray-200 transition-colors"
              >
                Get Started Free
              </Link>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-500 rounded-2xl p-8 shadow-xl transform scale-105 relative">
              <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">
                POPULAR
              </div>
              <h3 className="text-lg font-semibold text-white">Pro</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">$29</span>
                <span className="text-purple-200">/month</span>
              </div>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center text-white">
                  <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  200 leads/month
                </li>
                <li className="flex items-center text-white">
                  <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Priority AI scanning
                </li>
                <li className="flex items-center text-white">
                  <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Advanced lead scoring
                </li>
                <li className="flex items-center text-white">
                  <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Outreach templates
                </li>
                <li className="flex items-center text-white">
                  <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Email support
                </li>
              </ul>
              <Link
                href="/signup"
                className="mt-8 block w-full py-3 px-4 rounded-lg bg-white text-purple-600 font-semibold text-center hover:bg-gray-100 transition-colors"
              >
                Start Pro Trial
              </Link>
            </div>
            
            {/* Premium Plan */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Premium</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">$79</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center text-gray-600">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Unlimited leads
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Priority AI scanning
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Multi-location support
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Priority support
                </li>
              </ul>
              <Link
                href="/signup"
                className="mt-8 block w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold text-center hover:from-purple-700 hover:to-blue-600 transition-colors"
              >
                Go Premium
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to Fill Your Calendar with Dream Clients?
          </h2>
          <p className="mt-4 text-xl text-purple-100">
            Join hundreds of photographers who are growing their business with AI-powered lead generation.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block px-8 py-4 rounded-xl bg-white text-purple-600 font-semibold text-lg shadow-lg hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            Start Your Free Trial Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">PL</span>
              </div>
              <span className="text-white font-bold">PhotoLeadAgent</span>
            </div>
            <p className="text-sm">
              &copy; 2024 PhotoLeadAgent. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
