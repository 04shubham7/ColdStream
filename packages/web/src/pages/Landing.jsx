import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Mail, Zap, Activity, Shield, Cloud, ArrowRight, LayoutDashboard, Terminal, CheckCircle } from "lucide-react";
import { Button } from "../components/ui/Button";

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="glass-card p-6 rounded-2xl border border-white/40 hover:border-white/80 transition-all hover:shadow-lg group bg-white/60"
  >
    <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      <Icon className="w-6 h-6 text-gray-800" />
    </div>
    <h3 className="text-xl font-bold mb-2 tracking-tight">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </motion.div>
);

export default function Landing() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#fafafa] overflow-hidden selection:bg-black selection:text-white">
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="fixed left-0 right-0 top-0 -z-10 m-auto h-[400px] w-[400px] rounded-full bg-blue-500/10 opacity-50 blur-[120px]"></div>

      <div className="relative z-10">
        {/* Navbar */}
        <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-md">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">ColdStream</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="ghost" className="font-semibold gap-2 border border-black/10 hover:bg-black/5">
                  Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="font-semibold hover:bg-black/5">Log in</Button>
                </Link>
                <Link to="/signup">
                  <Button className="font-semibold shadow-md hover:shadow-xl transition-all">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <main className="container mx-auto px-6 pt-16 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-black/10 text-sm font-medium mb-4 shadow-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              v1.0 is now live in production
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-[1.1] text-gray-900">
              Automate your outreach. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-600 to-gray-400">
                Never drop a lead.
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              An enterprise-grade asynchronous email dispatcher powered by Apache Kafka, Redis, and React. Send thousands of personalized emails with guaranteed delivery and visual tracking.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
                <Button size="lg" className="h-14 px-8 text-lg font-bold shadow-2xl hover:scale-105 transition-transform">
                  Start Dispatching
                </Button>
              </Link>
              <a href="https://github.com/04shubham7/ColdStream" target="_blank" rel="noreferrer">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold bg-white/50 backdrop-blur-sm border-2 hover:bg-white/80">
                  <Terminal className="w-5 h-5 mr-2" />
                  View Architecture
                </Button>
              </a>
            </div>
          </motion.div>
        </main>

        {/* Features Bento Grid */}
        <section className="container mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Engineered for Scale</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              ColdStream isn't just a beautiful UI. It's a robust backend infrastructure designed to handle massive email queues without breaking a sweat.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Zap}
              title="Kafka Engine"
              description="High-throughput asynchronous background worker using Apache Kafka for guaranteed, drop-free dispatching."
              delay={0.1}
            />
            <FeatureCard
              icon={Activity}
              title="Visual Tracking"
              description="Inline, real-time flowchart steppers on your dashboard to track exactly where your email is in the pipeline."
              delay={0.2}
            />
            <FeatureCard
              icon={Shield}
              title="Idempotency"
              description="Redis-powered idempotency locks and rate limiting prevent accidental double-sends and recruiter spam."
              delay={0.3}
            />
            <FeatureCard
              icon={Cloud}
              title="Cloud Storage"
              description="Seamless integration with Supabase for secure, fast, and reliable PDF resume attachment streaming."
              delay={0.4}
            />
          </div>
        </section>

        {/* Interactive Workflow Demo */}
        <section className="py-32 border-t border-black/5 bg-white/40 backdrop-blur-xl">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-16">The Event-Driven Workflow</h2>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 max-w-5xl mx-auto">
              {[
                { icon: LayoutDashboard, text: "UI Dispatch" },
                { icon: Zap, text: "Kafka Queue" },
                { icon: Terminal, text: "Node Worker" },
                { icon: CheckCircle, text: "Email Delivered" }
              ].map((step, i) => (
                <div key={i} className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-lg border border-black/5 flex items-center justify-center hover:scale-105 transition-transform cursor-default">
                      <step.icon className="w-8 h-8 text-gray-800" />
                    </div>
                    <span className="font-semibold text-sm tracking-tight text-gray-600">{step.text}</span>
                  </motion.div>

                  {i < 3 && (
                    <div className="hidden md:block w-12 h-[2px] bg-gradient-to-r from-gray-300 to-transparent relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                    </div>
                  )}
                  {i < 3 && (
                    <div className="md:hidden h-8 w-[2px] bg-gradient-to-b from-gray-300 to-transparent relative"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-black/5 py-12 text-center bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
              <Mail className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold tracking-tight">ColdStream</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ColdStream. Open Source software.
          </p>
        </footer>
      </div>
    </div>
  );
}
