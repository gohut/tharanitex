"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/home/Navbar/Navbar";
import {
  ArrowRight,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Hash,
  X,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import { GOOGLE_CLIENT_ID } from "../../config/google";

export default function LoginPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("signin");
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [customClientId, setCustomClientId] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");

  /*
   * IMPORTANT:
   * Customer information is NOT stored in localStorage.
   *
   * Authentication is determined entirely by the HttpOnly cookie
   * created by /api/auth/login or /api/auth/register.
   */
  useEffect(() => {
    let cancelled = false;

    async function checkExistingSession() {
      try {
        const response = await fetch("/api/auth/profile", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (response.ok && !cancelled) {
          router.replace("/home");
          return;
        }
      } catch (error) {
        console.error("Session check failed:", error);
      }

      /*
       * Google OAuth returns an access token in the URL hash.
       * The token itself is never persisted in localStorage.
       */
      const hash = window.location.hash;

      if (!hash || !hash.includes("access_token=")) {
        return;
      }

      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");

      if (!accessToken) {
        return;
      }

      try {
        toast.loading("Authenticating with Google...");

        const authResponse = await fetch("/api/auth/google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            accessToken,
          }),
        });

        const authData = await authResponse.json().catch(() => ({}));

        if (!authResponse.ok) {
          throw new Error(
            authData.message ||
              authData.error ||
              "Google authentication failed"
          );
        }

        window.history.replaceState(
          null,
          "",
          window.location.pathname
        );

        window.dispatchEvent(new Event("auth-change"));

        toast.dismiss();
        toast.success("Successfully signed in with Google!");

        router.replace("/home");
      } catch (error) {
        toast.dismiss();
        toast.error(
          error.message || "Failed to authenticate with Google."
        );
        console.error("Google authentication error:", error);
      }
    }

    checkExistingSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSignIn = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(
          data.message ||
            data.error ||
            "Invalid email or password"
        );
        return;
      }

      /*
       * DO NOT save data.data to localStorage.
       * The server has already created the HttpOnly auth cookie.
       */
      window.dispatchEvent(new Event("auth-change"));

      toast.success(
        `Welcome back, ${data.data?.name || "Customer"}!`
      );

      router.replace("/home");
    } catch (error) {
      console.error("Login request error:", error);
      toast.error(
        "Unable to log in. Please check your connection and try again."
      );
    }
  };

  const handleSignUp = async (event) => {
    event.preventDefault();

    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !contact.trim() ||
      !address.trim() ||
      !pincode.trim()
    ) {
      toast.error("Please fill all the fields");
      return;
    }

    try {
      /*
       * Registration API accepts name/email/password/phone/address/pincode.
       * The backend creates the customer account and sets the HttpOnly cookie.
       */
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: contact.trim(),
          address: address.trim(),
          pincode: pincode.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(
          data.message ||
            data.error ||
            "Account creation failed"
        );
        return;
      }

      /*
       * No localStorage.
       * Registration response creates the HttpOnly authentication cookie.
       */
      window.dispatchEvent(new Event("auth-change"));

      toast.success("Account created successfully!");

      router.replace("/home");
    } catch (error) {
      console.error("Register request error:", error);
      toast.error(
        "Unable to create account. Please check your connection and try again."
      );
    }
  };

  const handleGoogleLogin = () => {
    /*
     * This setting is configuration, not customer information.
     * It may remain local temporarily.
     */
    const configuredClientId = GOOGLE_CLIENT_ID;

    const isPlaceholder =
      !configuredClientId ||
      configuredClientId.includes("YOUR_GOOGLE_CLIENT_ID");

    if (isPlaceholder) {
      setShowSetupModal(true);
      return;
    }

    const redirectUri = `${window.location.origin}/login`;
    const scope = "openid profile email";

    const oauthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${encodeURIComponent(configuredClientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=token` +
      `&scope=${encodeURIComponent(scope)}` +
      `&state=oauth_state`;

    window.location.href = oauthUrl;
  };

  const handleSaveCustomClientId = (event) => {
    event.preventDefault();

    if (!customClientId.trim()) {
      toast.error("Please enter a valid Client ID");
      return;
    }

    localStorage.setItem(
      "googleClientIdOverride",
      customClientId.trim()
    );

    toast.success("Client ID saved successfully!");
    setShowSetupModal(false);

    const redirectUri = `${window.location.origin}/login`;
    const scope = "openid profile email";

    const oauthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${encodeURIComponent(customClientId.trim())}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=token` +
      `&scope=${encodeURIComponent(scope)}` +
      `&state=oauth_state`;

    window.location.href = oauthUrl;
  };

  return (
    <main className="min-h-screen bg-[#FBF5EA]">
      <Navbar />

      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4 py-12 md:p-12 font-sans relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-48 -right-48 w-96 h-96 bg-[#5A1F2F]/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-[#C79A2B]/10 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-lg bg-white border border-[#E8DCC8] rounded-3xl p-5 sm:p-8 md:p-10 shadow-gold-md relative z-10">
          <div className="text-center mb-8">
            <Link href="/home" className="inline-block mb-4">
              <img
                src="/assets/logo.png"
                alt="Tharani Textiles"
                className="h-14 mx-auto object-contain"
              />
            </Link>

            <p className="text-xs uppercase tracking-[0.25em] text-[#B58A45] font-semibold">
              Tharani Textiles
            </p>
          </div>

          <div className="flex border-b border-[#E8DCC8] mb-8">
            <button
              onClick={() => setActiveTab("signin")}
              className={`flex-1 pb-4 text-sm font-semibold tracking-wide border-b-2 ${
                activeTab === "signin"
                  ? "border-[#5A1F2F] text-[#5A1F2F]"
                  : "border-transparent text-gray-400"
              }`}
            >
              Sign In
            </button>

            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 pb-4 text-sm font-semibold tracking-wide border-b-2 ${
                activeTab === "signup"
                  ? "border-[#5A1F2F] text-[#5A1F2F]"
                  : "border-transparent text-gray-400"
              }`}
            >
              Create Account
            </button>
          </div>

          {activeTab === "signin" ? (
            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B58A45]"
                  />

                  <input
                    type="email"
                    placeholder="Email Address"
                    value={loginEmail}
                    onChange={(e) =>
                      setLoginEmail(e.target.value)
                    }
                    required
                    className="w-full bg-[#FDFBF7] border border-[#E8DCC8] rounded-xl pl-12 pr-4 py-3.5 text-[15px] focus:outline-none focus:border-[#C79A2B]"
                  />
                </div>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B58A45]"
                  />

                  <input
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) =>
                      setLoginPassword(e.target.value)
                    }
                    required
                    className="w-full bg-[#FDFBF7] border border-[#E8DCC8] rounded-xl pl-12 pr-4 py-3.5 text-[15px] focus:outline-none focus:border-[#C79A2B]"
                  />
                </div>
              </div>

              <div className="flex justify-end text-xs">
                <Link
                  href="/forgot-password"
                  className="text-[#5A1F2F] font-semibold underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#5A1F2F] text-white rounded-xl py-3.5 text-[15px] font-semibold hover:bg-[#471825] transition"
              >
                Sign In
                <ArrowRight size={17} />
              </button>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 border border-[#E8DCC8] rounded-xl py-3.5 text-sm font-semibold text-[#2F2B27] hover:border-[#C79A2B] transition"
              >
                Continue with Google
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B58A45]" size={18} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-[#FDFBF7] border border-[#E8DCC8] rounded-xl pl-12 pr-4 py-3.5"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B58A45]" size={18} />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#FDFBF7] border border-[#E8DCC8] rounded-xl pl-12 pr-4 py-3.5"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B58A45]" size={18} />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#FDFBF7] border border-[#E8DCC8] rounded-xl pl-12 pr-4 py-3.5"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B58A45]" size={18} />
                <input
                  type="tel"
                  placeholder="Contact Number"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  required
                  className="w-full bg-[#FDFBF7] border border-[#E8DCC8] rounded-xl pl-12 pr-4 py-3.5"
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-[#B58A45]" size={18} />
                <textarea
                  placeholder="Delivery Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  rows={3}
                  className="w-full bg-[#FDFBF7] border border-[#E8DCC8] rounded-xl pl-12 pr-4 py-3.5 resize-none"
                />
              </div>

              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B58A45]" size={18} />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  required
                  className="w-full bg-[#FDFBF7] border border-[#E8DCC8] rounded-xl pl-12 pr-4 py-3.5"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#5A1F2F] text-white rounded-xl py-3.5 font-semibold hover:bg-[#471825] transition"
              >
                Create Account
                <ArrowRight size={17} />
              </button>
            </form>
          )}
        </div>
      </div>

      {showSetupModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-[#5A1F2F]">
                Google Client ID
              </h2>

              <button onClick={() => setShowSetupModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-3 bg-[#FBF5EA] p-4 rounded-xl mb-5">
              <Info size={18} className="text-[#B58A45] shrink-0" />
              <p className="text-sm text-gray-600">
                Enter your Google OAuth Client ID to continue.
              </p>
            </div>

            <form onSubmit={handleSaveCustomClientId}>
              <input
                value={customClientId}
                onChange={(e) =>
                  setCustomClientId(e.target.value)
                }
                placeholder="Google Client ID"
                className="w-full border border-[#E8DCC8] rounded-xl px-4 py-3 mb-4"
              />

              <button
                type="submit"
                className="w-full bg-[#5A1F2F] text-white rounded-xl py-3 font-semibold"
              >
                Save & Continue
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}