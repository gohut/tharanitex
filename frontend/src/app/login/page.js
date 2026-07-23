"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, Lock } from "lucide-react";
import Button from "../../components/ui/Button";
import FormInput from "../../components/ui/FormInput";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-950 p-4">
      {/* Decorative background circles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-900 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-900 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="w-full max-w-md bg-green-900/80 backdrop-blur-md border border-green-800 rounded-3xl p-8 shadow-card-hover relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gold-600 flex items-center justify-center mx-auto mb-4 shadow-gold-sm">
            <span className="text-green-950 font-bold text-xl">AG</span>
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">Welcome Back</h1>
          <p className="text-green-400 text-sm">Sign in to Tharani Textiles Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-green-950/50 border border-green-700 text-white placeholder-green-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-green-950/50 border border-green-700 text-white placeholder-green-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-green-700 text-gold-600 focus:ring-gold-500 bg-green-950/50" />
              <span className="text-green-400 text-xs">Remember me</span>
            </label>
            <a href="#" className="text-gold-400 hover:text-gold-300 text-xs font-medium transition-colors">
              Forgot password?
            </a>
          </div>

          <Button type="submit" className="w-full justify-center py-3 text-base" size="lg">
            Sign In <ArrowRight size={16} className="ml-1" />
          </Button>
        </form>
      </div>
    </div>
  );
}
