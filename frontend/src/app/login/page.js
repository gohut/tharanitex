
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/home/Navbar/Navbar";
import { ArrowRight, Mail, Lock, User, Phone, MapPin, Hash, X, Info } from "lucide-react";
import toast from "react-hot-toast";
import { GOOGLE_CLIENT_ID } from "../../config/google";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("signin");
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [customClientId, setCustomClientId] = useState("");
  const router = useRouter();

  // Sign In States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign Up States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");

  // Redirect if already logged in or process incoming Google hash redirect
  useEffect(() => {
    // Local storage only drives UI state; require a server-verified cookie
    // before treating the browser as signed in.
    const loggedInUser = localStorage.getItem("currentUser");
    if (loggedInUser) {
      fetch("/api/auth/profile")
        .then((response) => {
          if (response.ok) router.push("/profile");
          else localStorage.removeItem("currentUser");
        })
        .catch(() => localStorage.removeItem("currentUser"));
      return;
    }

    // Process hash from Google OAuth callback redirect
    const hash = window.location.hash;
    if (hash && hash.includes("access_token=")) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");

      if (accessToken) {
        toast.loading("Authenticating with Google...");

        fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
          .then((res) => {
            if (!res.ok) throw new Error("Authentication failed");
            return res.json();
          })
          .then(async (data) => {
            // Save user details
            const googleUser = {
              name: data.name || "Google User",
              email: data.email,
              avatar: data.picture,
              contact: "", // Customer can edit on Profile page
              address: "", // Customer can edit on Profile page
              pincode: "", // Customer can edit on Profile page
              joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
              provider: "google",
            };

            try {
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

              const authenticatedUser =
                authData.data || {
                  name: data.name || "Google User",
                  email: data.email,
                  avatar: data.picture,
                  provider: "google",
                };

              localStorage.setItem(
                "currentUser",
                JSON.stringify(authenticatedUser)
              );

              window.dispatchEvent(new Event("auth-change"));

              toast.dismiss();
              toast.success(
                `Successfully signed in as ${
                  data.name || data.email
                }!`
              );

              window.history.replaceState(
                null,
                null,
                window.location.pathname
              );

              router.push("/profile");
              router.refresh();
            } catch (error) {
              toast.dismiss();
              toast.error(
                error.message || "Failed to authenticate with Google."
              );
              console.error("Google authentication error:", error);
            }

            // Save user session
            localStorage.setItem("currentUser", JSON.stringify(googleUser));

            // Save to registeredUsers list
            const savedUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
            if (!savedUsers.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
              savedUsers.push(googleUser);
              localStorage.setItem("registeredUsers", JSON.stringify(savedUsers));
            }

            // Sync layout states
            window.dispatchEvent(new Event("auth-change"));
            toast.dismiss();
            toast.success(`Successfully signed in as ${data.name || data.email}!`);
            
            // Clean up hash parameter from URL bar
            window.history.replaceState(null, null, window.location.pathname);
            
            router.push("/profile");
          })
          .catch((err) => {
            toast.dismiss();
            toast.error("Failed to authenticate with Google. Try again.");
            console.error(err);
          });
      }
    }
  }, [router]);

  const handleSignIn = async (e) => {
    e.preventDefault();

    // Check for admin
    if (loginEmail === "admin@tharanitextiles.com") {
      try {
        const res = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          toast.error(json.message || json.error || "Admin login failed");
          return;
        }
      } catch (err) {
        toast.error("Admin login failed");
        return;
      }
      localStorage.setItem("currentUser", JSON.stringify({
        name: "Admin User",
        email: "admin@tharanitextiles.com",
        role: "admin"
      }));
      window.dispatchEvent(new Event("auth-change"));
      toast.success("Welcome back, Admin!");
      router.push("/admin");
      return;
    }

    // Normal customer login via server API ONLY
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      if (res.ok) {
        const json =
          await res.json().catch(() => ({}));

        const user =
          json?.data || {
            name: "Customer",
            email: loginEmail,
          };

        window.dispatchEvent(
          new Event("auth-change")
        );

        toast.success(
          `Welcome back, ${
            user.name || "Customer"
          }!`
        );

        router.push("/profile");
        router.refresh();

        return;
      } else {
        const json = await res.json().catch(() => ({}));
        toast.error(json.message || json.error || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login request error:", err);
      toast.error("Unable to log in. Please check your connection and try again.");
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !contact || !address || !pincode) {
      toast.error("Please fill all the fields");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone: contact }),
      });

      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        const registeredUser = json.data || {
          name,
          email,
          contact,
          address,
          pincode,
          joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        };

        const newUser = {
          ...registeredUser,
          contact,
          address,
          pincode,
          joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        };

        window.dispatchEvent(new Event("auth-change"));
        toast.success("Account created successfully!");
        router.push("/profile");
        router.refresh();
        return;
      } else {
        const json = await res.json().catch(() => ({}));
        toast.error(json.message || json.error || "Account creation failed");
      }
    } catch (err) {
      console.error("Register request error:", err);
      toast.error("Unable to create account. Please check your connection and try again.");
    }
  };

  const handleGoogleLogin = () => {
    // Get client id from config or custom override
    const configuredClientId = GOOGLE_CLIENT_ID;
    const clientOverride = localStorage.getItem("googleClientIdOverride");
    
    // If configured client ID is NOT placeholder, prefer it and clear override
    const isConfiguredPlaceholder = !configuredClientId || configuredClientId.includes("YOUR_GOOGLE_CLIENT_ID");
    if (!isConfiguredPlaceholder && clientOverride) {
      localStorage.removeItem("googleClientIdOverride");
    }

    const activeClientId = isConfiguredPlaceholder ? (clientOverride || configuredClientId) : configuredClientId;

    const isPlaceholder = !activeClientId || activeClientId.includes("YOUR_GOOGLE_CLIENT_ID");

    if (isPlaceholder) {
      // Trigger developer assistance setup modal
      setShowSetupModal(true);
    } else {
      // Execute OAuth Redirect
      const redirectUri = `${window.location.origin}/login`;
      const scope = "openid profile email";
      const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(activeClientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}&state=oauth_state`;
      
      window.location.href = oauthUrl;
    }
  };

  const handleSaveCustomClientId = (e) => {
    e.preventDefault();
    if (!customClientId || customClientId.trim() === "") {
      toast.error("Please enter a valid Client ID");
      return;
    }

    localStorage.setItem("googleClientIdOverride", customClientId.trim());
    toast.success("Client ID saved successfully!");
    setShowSetupModal(false);
    
    // Execute redirect immediately
    const redirectUri = `${window.location.origin}/login`;
    const scope = "openid profile email";
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(customClientId.trim())}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}&state=oauth_state`;
    
    window.location.href = oauthUrl;
  };

  return (
    <main className="min-h-screen bg-[#FBF5EA]">
      <Navbar />
      <div className="flex items-center justify-center p-4 py-12 md:p-12 font-sans relative overflow-hidden">
      {/* Decorative saree-like wave gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-48 -right-48 w-96 h-96 bg-[#5A1F2F]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-[#C79A2B]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-lg bg-white border border-[#E8DCC8] rounded-3xl p-5 sm:p-8 md:p-10 shadow-gold-md relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/home" className="inline-block mb-4">
            <img src="/assets/logo.png" alt="Tharani Textiles" className="h-14 mx-auto object-contain" />
          </Link>
          <p className="text-xs uppercase tracking-[0.25em] text-[#B58A45] font-semibold">Tharani Textiles</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-[#E8DCC8] mb-8">
          <button
            onClick={() => setActiveTab("signin")}
            className={`flex-1 pb-4 text-sm font-semibold tracking-wide border-b-2 transition-all duration-300 ${
              activeTab === "signin"
                ? "border-[#5A1F2F] text-[#5A1F2F]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab("signup")}
            className={`flex-1 pb-4 text-sm font-semibold tracking-wide border-b-2 transition-all duration-300 ${
              activeTab === "signup"
                ? "border-[#5A1F2F] text-[#5A1F2F]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Create Account
          </button>
        </div>

        {activeTab === "signin" ? (
          /* ================== SIGN IN FORM ================== */
          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B58A45]" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="w-full bg-[#FDFBF7] border border-[#E8DCC8] text-[#2F2B27] placeholder-gray-400 rounded-xl pl-12 pr-4 py-3.5 text-[15px] focus:outline-none focus:border-[#C79A2B] focus:ring-1 focus:ring-[#C79A2B] transition-colors"
                />
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B58A45]" />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="w-full bg-[#FDFBF7] border border-[#E8DCC8] text-[#2F2B27] placeholder-gray-400 rounded-xl pl-12 pr-4 py-3.5 text-[15px] focus:outline-none focus:border-[#C79A2B] focus:ring-1 focus:ring-[#C79A2B] transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-gray-500">
                <input type="checkbox" className="rounded border-[#E8DCC8] text-[#5A1F2F] focus:ring-[#5A1F2F] bg-[#FDFBF7]" />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-[#5A1F2F] hover:text-[#471825] font-semibold underline transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#5A1F2F] text-white rounded-xl py-3.5 text-[15px] font-semibold shadow-md hover:bg-[#471825] active:scale-98 transition duration-300"
            >
              Sign In <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          /* ================== SIGN UP FORM ================== */
          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B58A45]" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-[#FDFBF7] border border-[#E8DCC8] text-[#2F2B27] placeholder-gray-400 rounded-xl pl-12 pr-4 py-3.5 text-[15px] focus:outline-none focus:border-[#C79A2B] focus:ring-1 focus:ring-[#C79A2B] transition-colors"
                />
              </div>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B58A45]" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#FDFBF7] border border-[#E8DCC8] text-[#2F2B27] placeholder-gray-400 rounded-xl pl-12 pr-4 py-3.5 text-[15px] focus:outline-none focus:border-[#C79A2B] focus:ring-1 focus:ring-[#C79A2B] transition-colors"
                />
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B58A45]" />
                <input
                  type="password"
                  placeholder="Create Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#FDFBF7] border border-[#E8DCC8] text-[#2F2B27] placeholder-gray-400 rounded-xl pl-12 pr-4 py-3.5 text-[15px] focus:outline-none focus:border-[#C79A2B] focus:ring-1 focus:ring-[#C79A2B] transition-colors"
                />
              </div>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B58A45]" />
                <input
                  type="tel"
                  placeholder="Contact Number"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  required
                  className="w-full bg-[#FDFBF7] border border-[#E8DCC8] text-[#2F2B27] placeholder-gray-400 rounded-xl pl-12 pr-4 py-3.5 text-[15px] focus:outline-none focus:border-[#C79A2B] focus:ring-1 focus:ring-[#C79A2B] transition-colors"
                />
              </div>
              <div className="relative sm:col-span-2">
                <MapPin size={18} className="absolute left-4 top-5 text-[#B58A45]" />
                <textarea
                  placeholder="Delivery Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  rows={2}
                  className="w-full bg-[#FDFBF7] border border-[#E8DCC8] text-[#2F2B27] placeholder-gray-400 rounded-xl pl-12 pr-4 py-3 text-[15px] focus:outline-none focus:border-[#C79A2B] focus:ring-1 focus:ring-[#C79A2B] transition-colors resize-none"
                />
              </div>
              <div className="relative sm:col-span-2">
                <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B58A45]" />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  required
                  className="w-full bg-[#FDFBF7] border border-[#E8DCC8] text-[#2F2B27] placeholder-gray-400 rounded-xl pl-12 pr-4 py-3.5 text-[15px] focus:outline-none focus:border-[#C79A2B] focus:ring-1 focus:ring-[#C79A2B] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#5A1F2F] text-white rounded-xl py-3.5 text-[15px] font-semibold shadow-md hover:bg-[#471825] active:scale-98 transition duration-300"
            >
              Sign Up <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative flex py-5 items-center my-4">
          <div className="flex-grow border-t border-[#E8DCC8]"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-xs font-semibold uppercase tracking-wider font-sans">Or Continue With</span>
          <div className="flex-grow border-t border-[#E8DCC8]"></div>
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center border border-[#E8DCC8] hover:bg-gray-50 bg-white text-gray-700 rounded-xl py-3 text-sm font-semibold shadow-gold-sm transition duration-300 active:scale-98 font-sans"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.6-4.53-6.16-4.53z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </div>

      {/* ================== DEVELOPER GOOGLE CLIENT ID SETUP MODAL ================== */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 md:p-8 animate-slide-up relative border border-[#E8DCC8]">
            <button
              onClick={() => setShowSetupModal(false)}
              className="absolute right-5 top-5 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 text-[#5A1F2F] border-b border-[#E8DCC8] pb-4 mb-5">
              <Info size={22} />
              <h3 className="text-lg font-cormorant font-bold uppercase tracking-wider">Configure Google Login</h3>
            </div>

            <div className="space-y-4 text-xs text-gray-600 leading-relaxed font-sans mb-6">
              <p>To integrate Google Login (like YouTube and Gmail OAuth) for this website, follow these simple steps:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-[#5A1F2F] underline font-bold">Google Cloud Console</a>.</li>
                <li>Create a project and go to <strong>APIs & Services &gt; Credentials</strong>.</li>
                <li>Click <strong>Create Credentials</strong> and select <strong>OAuth client ID</strong>.</li>
                <li>Configure the OAuth consent screen and choose <strong>Web application</strong> as application type.</li>
                <li>Add <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">http://localhost:3000</code> to <strong>Authorized JavaScript origins</strong>.</li>
                <li>Add <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">http://localhost:3000/login</code> to <strong>Authorized redirect URIs</strong>.</li>
                <li>Copy the generated <strong>Client ID</strong>.</li>
              </ol>
              <p className="bg-[#FDF5CC] text-[#7A5E10] p-3 rounded-lg border border-[#FAE89A]">
                <strong>Developer Note:</strong> You can paste your Client ID below to test it instantly on this browser tab, or save it permanently in <code className="font-mono text-black font-semibold">src/config/google.js</code>.
              </p>
            </div>

            <form onSubmit={handleSaveCustomClientId} className="space-y-4 font-sans">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Google Client ID</label>
                <input
                  type="text"
                  placeholder="pasted-id.apps.googleusercontent.com"
                  value={customClientId}
                  onChange={(e) => setCustomClientId(e.target.value)}
                  required
                  className="w-full bg-[#FDFBF7] border border-[#E8DCC8] text-[#2F2B27] placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C79A2B]"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#5A1F2F] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#471825] transition duration-300"
              >
                Save & Authenticate with Google
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  </main>
);
}
