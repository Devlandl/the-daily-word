import Link from "next/link";

const features = [
  { emoji: "📖", title: "Scripture Passages", description: "Each day starts with carefully selected verses that build on the theme of your plan." },
  { emoji: "💭", title: "Daily Reflections", description: "Short devotional reflections that bring the scripture to life with real-world application." },
  { emoji: "❓", title: "Thought Questions", description: "A question to carry with you throughout the day and reflect on." },
  { emoji: "🙏", title: "Prayer Prompts", description: "Guided prayer tied to the day's reading. Pray aloud or use as a starting point." },
  { emoji: "🎯", title: "Daily Challenges", description: "A practical action step to live out what you've read. Faith in action." },
  { emoji: "🔥", title: "Streak Tracking", description: "Track your reading streak day by day. Build the habit. Stay consistent." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "The Daily Word", applicationCategory: "ReligiousApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: "AI-powered devotional reading plan creator." }) }} />

      <header className="relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <span className="text-6xl mb-6 block">📖</span>
          <h1 className="text-4xl md:text-5xl font-bold text-brand-white mb-4">The Daily Word</h1>
          <p className="text-xl text-brand-muted mb-2 max-w-2xl mx-auto">AI-powered devotional reading plans.</p>
          <p className="text-lg text-brand-gold mb-8">Enter a topic, verse, or book. Get a complete reading plan.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up" className="px-8 py-4 bg-brand-gold text-brand-black font-bold rounded-xl text-lg hover:bg-brand-gold-light transition-colors">Get Started - It&apos;s Free</Link>
            <Link href="/sign-in" className="px-8 py-4 border border-brand-border text-brand-white font-medium rounded-xl text-lg hover:border-brand-gold/30 transition-colors">Sign In</Link>
          </div>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-brand-white mb-8">How It Works</h2>
        <div className="flex flex-col md:flex-row gap-8 justify-center">
          <div className="flex-1">
            <span className="text-4xl mb-3 block">1️⃣</span>
            <h3 className="font-semibold text-brand-white mb-1">Pick a topic</h3>
            <p className="text-brand-muted text-sm">Type &quot;gratitude&quot;, &quot;Psalm 23&quot;, or &quot;the book of James&quot;</p>
          </div>
          <div className="flex-1">
            <span className="text-4xl mb-3 block">2️⃣</span>
            <h3 className="font-semibold text-brand-white mb-1">Choose your length</h3>
            <p className="text-brand-muted text-sm">7, 14, 21, or 30 days</p>
          </div>
          <div className="flex-1">
            <span className="text-4xl mb-3 block">3️⃣</span>
            <h3 className="font-semibold text-brand-white mb-1">Read daily</h3>
            <p className="text-brand-muted text-sm">Scripture, reflection, prayer, and a daily challenge</p>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-brand-white text-center mb-12">Every Day Includes</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="bg-brand-card border border-brand-border rounded-xl p-6">
              <span className="text-3xl mb-3 block">{feature.emoji}</span>
              <h3 className="text-lg font-semibold text-brand-white mb-2">{feature.title}</h3>
              <p className="text-brand-muted text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-brand-card border border-brand-gold/30 rounded-2xl p-8 max-w-sm mx-auto">
          <p className="text-brand-gold text-sm font-medium mb-2">ALWAYS FREE</p>
          <p className="text-5xl font-bold text-brand-white mb-2">$0</p>
          <p className="text-brand-muted mb-6">Free forever. A gift for those who seek.</p>
          <Link href="/sign-up" className="block w-full py-3 bg-brand-gold text-brand-black font-semibold rounded-xl hover:bg-brand-gold-light transition-colors">Start Your Plan</Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-brand-muted text-sm">Available on the{" "}<a href="https://tvrapp.app" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:text-brand-gold-light">TVR App Store</a></p>
      </section>

      <footer className="border-t border-brand-border py-8 text-center">
        <p className="text-brand-muted text-sm">&copy; {new Date().getFullYear()} The Daily Word. A TVR App Store Product.</p>
      </footer>
    </div>
  );
}
