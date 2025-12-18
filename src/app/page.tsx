import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0c0a15] dark:bg-[#0c0a15] light-bg-main">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e1830] via-[#14101f] to-[#0c0a15]" />
        {/* Colorful accent glows */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-[#a855f7]/10 blur-[150px] rounded-full" />
        <div className="absolute top-20 right-1/4 w-[500px] h-[300px] bg-[#14b8a6]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[#f43f5e]/8 blur-[100px] rounded-full" />
        
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 sm:py-32">
          <div className="text-center">
            <p className="text-[#14b8a6] text-sm font-medium tracking-widest uppercase mb-6">
              AI-Powered Lead Generation
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-[#f0eef5] dark:text-[#f0eef5] light-text-primary tracking-tight leading-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              <span className="block">Find Your Dream Clients</span>
              <span className="block mt-4 text-gradient-multi">
                On Autopilot
              </span>
            </h1>
            <p className="mt-8 max-w-2xl mx-auto text-xl text-[#a9a4b8] leading-relaxed">
              Stop chasing leads. Let our AI agents find, qualify, and deliver ready-to-book clients directly to your inbox while you focus on what you love — capturing beautiful moments.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link
                href="/signup"
                className="w-full sm:w-auto btn-primary px-10 py-4 rounded-xl text-lg shadow-lg shadow-[#14b8a6]/20"
              >
                Start Free Trial
              </Link>
              <Link
                href="#how-it-works"
                className="w-full sm:w-auto px-10 py-4 rounded-xl bg-transparent text-[#f0eef5] dark:text-[#f0eef5] light-text-primary font-semibold text-lg border border-[#2d2640] dark:border-[#2d2640] light-border hover:border-[#a855f7]/50 hover:text-[#a855f7] transition-all duration-300"
              >
                See How It Works
              </Link>
            </div>
            <p className="mt-6 text-sm text-[#6b6480]">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-24 bg-[#0c0a15] relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0a15] via-[#14101f] to-[#0c0a15]" />
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <p className="text-[#f43f5e] text-sm font-medium tracking-widest uppercase mb-4">
              The Process
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold text-[#f0eef5] dark:text-[#f0eef5] light-text-primary" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              How Lotus Photo Leads Works
            </h2>
            <p className="mt-6 text-lg text-[#a9a4b8] max-w-2xl mx-auto">
              Our AI works 24/7 to find your ideal clients so you can focus on your craft.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card card-hover p-10 group feature-card">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center mb-8 shadow-lg shadow-[#14b8a6]/20 group-hover:shadow-[#14b8a6]/40 group-hover:scale-110 transition-all duration-300">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#f0eef5] dark:text-[#f0eef5] light-text-primary mb-4" style={{ fontFamily: 'var(--font-playfair), serif' }}>AI-Powered Discovery</h3>
              <p className="text-[#a9a4b8] leading-relaxed">
                Our agents scan venues, planners, and event businesses to find leads actively looking for photographers in your area.
              </p>
            </div>
            
            <div className="card card-hover p-10 group feature-card">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#9333ea] flex items-center justify-center mb-8 shadow-lg shadow-[#a855f7]/20 group-hover:shadow-[#a855f7]/40 group-hover:scale-110 transition-all duration-300">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#f0eef5] dark:text-[#f0eef5] light-text-primary mb-4" style={{ fontFamily: 'var(--font-playfair), serif' }}>Smart Qualification</h3>
              <p className="text-[#a9a4b8] leading-relaxed">
                Each lead is scored based on their profile, location, and potential to ensure they match your ideal client profile.
              </p>
            </div>
            
            <div className="card card-hover p-10 group feature-card">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#f43f5e] to-[#e11d48] flex items-center justify-center mb-8 shadow-lg shadow-[#f43f5e]/20 group-hover:shadow-[#f43f5e]/40 group-hover:scale-110 transition-all duration-300">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#f0eef5] dark:text-[#f0eef5] light-text-primary mb-4" style={{ fontFamily: 'var(--font-playfair), serif' }}>Automated Outreach</h3>
              <p className="text-[#a9a4b8] leading-relaxed">
                Get qualified leads delivered to your dashboard with personalized outreach emails sent automatically on your behalf.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-[#0c0a15] relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <p className="text-[#a855f7] text-sm font-medium tracking-widest uppercase mb-4">
              Pricing
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold text-[#f0eef5] dark:text-[#f0eef5] light-text-primary" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              Simple, Transparent Pricing
            </h2>
            <p className="mt-6 text-lg text-[#a9a4b8]">
              Choose the plan that fits your photography business.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="card card-hover p-10">
              <h3 className="text-lg font-medium text-[#a9a4b8]">Free</h3>
              <div className="mt-4">
                <span className="text-5xl font-bold text-[#f0eef5]" style={{ fontFamily: 'var(--font-playfair), serif' }}>$0</span>
                <span className="text-[#6b6480] ml-2">/month</span>
              </div>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center text-[#a9a4b8]">
                  <svg className="h-5 w-5 text-[#14b8a6] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  10 leads/month
                </li>
                <li className="flex items-center text-[#a9a4b8]">
                  <svg className="h-5 w-5 text-[#14b8a6] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Basic lead scoring
                </li>
                <li className="flex items-center text-[#a9a4b8]">
                  <svg className="h-5 w-5 text-[#14b8a6] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Email notifications
                </li>
              </ul>
              <Link
                href="/signup"
                className="mt-10 block w-full py-4 px-6 rounded-xl bg-[#1e1830] text-[#f0eef5] font-semibold text-center border border-[#2d2640] hover:border-[#14b8a6]/50 transition-all duration-300"
              >
                Get Started Free
              </Link>
            </div>
            
            {/* Pro Plan */}
            <div className="relative p-10 rounded-2xl bg-gradient-to-b from-[#a855f7]/20 via-[#1a1528] to-[#14101f] border border-[#a855f7]/50 shadow-2xl shadow-[#a855f7]/10 transform md:scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#14b8a6] via-[#a855f7] to-[#f43f5e] text-white text-xs font-bold px-4 py-1.5 rounded-full">
                MOST POPULAR
              </div>
              <h3 className="text-lg font-medium text-[#a855f7]">Pro</h3>
              <div className="mt-4">
                <span className="text-5xl font-bold text-[#f0eef5]" style={{ fontFamily: 'var(--font-playfair), serif' }}>$29</span>
                <span className="text-[#a9a4b8] ml-2">/month</span>
              </div>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center text-[#f0eef5]">
                  <svg className="h-5 w-5 text-[#14b8a6] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  200 leads/month
                </li>
                <li className="flex items-center text-[#f0eef5]">
                  <svg className="h-5 w-5 text-[#a855f7] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Priority AI scanning
                </li>
                <li className="flex items-center text-[#f0eef5]">
                  <svg className="h-5 w-5 text-[#f43f5e] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Advanced lead scoring
                </li>
                <li className="flex items-center text-[#f0eef5]">
                  <svg className="h-5 w-5 text-[#14b8a6] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Outreach templates
                </li>
                <li className="flex items-center text-[#f0eef5]">
                  <svg className="h-5 w-5 text-[#a855f7] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Email support
                </li>
              </ul>
              <Link
                href="/signup"
                className="mt-10 block w-full btn-accent py-4 px-6 rounded-xl text-center"
              >
                Start Pro Trial
              </Link>
            </div>
            
            {/* Premium Plan */}
            <div className="card card-hover p-10">
              <h3 className="text-lg font-medium text-[#a9a4b8]">Premium</h3>
              <div className="mt-4">
                <span className="text-5xl font-bold text-[#f0eef5]" style={{ fontFamily: 'var(--font-playfair), serif' }}>$79</span>
                <span className="text-[#6b6480] ml-2">/month</span>
              </div>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center text-[#a9a4b8]">
                  <svg className="h-5 w-5 text-[#f43f5e] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Unlimited leads
                </li>
                <li className="flex items-center text-[#a9a4b8]">
                  <svg className="h-5 w-5 text-[#a855f7] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Priority AI scanning
                </li>
                <li className="flex items-center text-[#a9a4b8]">
                  <svg className="h-5 w-5 text-[#14b8a6] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Multi-location support
                </li>
                <li className="flex items-center text-[#a9a4b8]">
                  <svg className="h-5 w-5 text-[#f43f5e] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Priority support
                </li>
              </ul>
              <Link
                href="/signup"
                className="mt-10 block w-full py-4 px-6 rounded-xl bg-[#1e1830] text-[#f0eef5] font-semibold text-center border border-[#2d2640] hover:border-[#f43f5e]/50 transition-all duration-300"
              >
                Go Premium
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#14101f] via-[#1e1830] to-[#14101f]" />
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-[#a855f7]/15 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-[#14b8a6]/15 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#f43f5e]/10 blur-[150px] rounded-full" />
        
        <div className="relative max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-[#f0eef5] dark:text-[#f0eef5] light-text-primary" style={{ fontFamily: 'var(--font-playfair), serif' }}>
            Ready to Fill Your Calendar?
          </h2>
          <p className="mt-6 text-xl text-[#a9a4b8]">
            Join photographers who are growing their business with AI-powered lead generation.
          </p>
          <Link
            href="/signup"
            className="mt-10 inline-block btn-primary px-12 py-5 rounded-xl text-lg shadow-xl shadow-[#14b8a6]/30"
          >
            Start Your Free Trial Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#080610] border-t border-[#1e1830] py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#14b8a6] via-[#a855f7] to-[#f43f5e] flex items-center justify-center">
                <span className="text-white font-bold">L</span>
              </div>
              <span className="text-[#f0eef5] font-semibold text-lg" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                Lotus <span className="text-gradient-primary">Photo Leads</span>
              </span>
            </div>
            <p className="text-sm text-[#6b6480]">
              &copy; 2024 Lotus Photo Leads. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
