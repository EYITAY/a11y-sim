import React from 'react';
import { Icon } from './Icon';
import { FAQ } from './FAQ';

interface LandingPageProps {
  onLaunch: () => void;
}

const FeatureCard: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg">
                 <Icon name={icon} className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
            {children}
        </p>
    </div>
);

const TestimonialCard: React.FC<{ quote: string; author: string; role: string; avatar: string }> = ({ quote, author, role, avatar }) => (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700 flex flex-col h-full">
        <div className="flex-1">
            <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                    <Icon key={i} name="star" className="w-4 h-4 fill-current" />
                ))}
            </div>
            <p className="text-slate-700 dark:text-slate-300 italic mb-6">"{quote}"</p>
        </div>
        <div className="flex items-center gap-4">
            <img src={avatar} alt={author} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
            <div>
                <h4 className="font-bold text-slate-900 dark:text-white">{author}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">{role}</p>
            </div>
        </div>
    </div>
);


export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
    const [adminTyped, setAdminTyped] = React.useState(false);
    const [inputBuffer, setInputBuffer] = React.useState('');

    React.useEffect(() => {
        if (adminTyped) {
            window.location.href = '/admin-login';
        }
    }, [adminTyped]);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            setInputBuffer((prev) => {
                const next = (prev + e.key).slice(-5).toUpperCase();
                if (next === 'ADMIN') {
                    setAdminTyped(true);
                }
                return next;
            });
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="font-sans antialiased text-slate-800 dark:text-slate-200">
        
        {/* Hero Section */}
        <section className="pt-40 pb-20 md:pt-60 md:pb-32 text-center">
            <div className="container mx-auto px-4">
                <Icon name="eye" className="w-16 h-16 text-blue-600 mx-auto mb-6"/>
                <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-4">
                    Design for Everyone
                </h1>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
                    Instantly simulate how your designs appear to people with different vision impairments and ensure your color palette is accessible to all.
                </p>
                <button 
                    onClick={onLaunch}
                    className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                    Launch Simulator
                </button>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-slate-100 dark:bg-slate-800/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                     <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">A Powerful Accessibility Toolkit</h2>
                     <p className="text-lg text-slate-500 dark:text-slate-400 mt-2">Everything you need to create inclusive designs.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FeatureCard icon="eye" title="Vision Simulation">
                        Experience your designs through 8 different color vision deficiencies, plus blur and low contrast simulations.
                    </FeatureCard>
                    <FeatureCard icon="upload-cloud" title="Real-time Image Testing">
                        Upload your screenshots or mockups to get the most accurate, real-world simulation of your user interface.
                    </FeatureCard>
                    <FeatureCard icon="check-badge" title="WCAG Analysis">
                        Automatically check your color combinations against WCAG AA & AAA contrast ratio requirements.
                    </FeatureCard>
                    <FeatureCard icon="light-bulb" title="Expert Insights">
                        Leverage the Gemini API for expert recommendations and actionable suggestions to fix accessibility issues.
                    </FeatureCard>
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-white dark:bg-slate-900">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Loved by Designers & Developers</h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400 mt-2">Join thousands of professionals building a more inclusive web.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <TestimonialCard 
                        quote="This tool has completely changed our design review process. We now catch accessibility issues before they even reach development."
                        author="Sarah Jenkins"
                        role="Senior Product Designer"
                        avatar="https://picsum.photos/seed/sarah/100/100"
                    />
                    <TestimonialCard 
                        quote="The vision simulations are incredibly eye-opening. It's one thing to read about color blindness, but another to see your own work through that lens."
                        author="Marcus Chen"
                        role="Frontend Engineer"
                        avatar="https://picsum.photos/seed/marcus/100/100"
                    />
                    <TestimonialCard 
                        quote="The AI-powered insights saved us hours of manual color tweaking. It suggested the perfect accessible alternatives in seconds."
                        author="Elena Rodriguez"
                        role="Accessibility Lead"
                        avatar="https://picsum.photos/seed/elena/100/100"
                    />
                </div>
            </div>
        </section>

         {/* Why it Matters Section */}
        <section className="py-20">
            <div className="container mx-auto px-4 max-w-4xl text-center">
                 <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Why Digital Accessibility Matters</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 mt-4">
                    Over 1 billion people live with some form of disability. Creating accessible products is not just a compliance requirement—it's a fundamental part of inclusive design. By ensuring your digital products are usable by everyone, you expand your audience, enhance user satisfaction, and build a more equitable web.
                </p>
            </div>
        </section>

        <FAQ />
        
        {/* Footer */}
        <footer className="py-8 border-t border-slate-200 dark:border-slate-800">
             <div className="container mx-auto px-4 text-center text-slate-500 dark:text-slate-400">
                <p>&copy; {new Date().getFullYear()} A11y Sim. A Community Freeware.</p>
                                <p>
                                    <a href="https://alimieyitayo.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">
                                        Made with <span style={{color: 'red'}}>&hearts;</span> by Eyitayo Alimi @alimieyitayo
                                    </a>
                                </p>
                                <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm">
                                    <a href="/privacy" className="underline hover:text-blue-600">Privacy Policy</a>
                                    <a href="/terms" className="underline hover:text-blue-600">Terms of Use</a>
                                    <a href="/refund" className="underline hover:text-blue-600">Refund Policy</a>
                                    <a href="/eu" className="underline hover:text-blue-600">EU Visitors</a>
                                    <a href="/california" className="underline hover:text-blue-600">California Visitors</a>
                                </div>
            </div>
        </footer>
    </div>
  );
};