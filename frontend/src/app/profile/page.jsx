"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/home/Navbar/Navbar";
import {
  User,
  Phone,
  MapPin,
  Mail,
  Hash,
  Edit2,
  Save,
  X,
  LogOut,
  Package,
  Heart,
  ShoppingCart,
  Home,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Edit fields
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");

  /*
   * ============================================================
   * LOAD PROFILE
   * ============================================================
   *
   * Customer information is loaded ONLY from the server.
   *
   * No customer information is read from localStorage.
   * Authentication is handled by the HttpOnly auth cookies.
   */
  useEffect(() => {
    let ignore = false;

    const loadProfile = async () => {
      try {
        const response = await fetch(
          "/api/auth/profile",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          if (!ignore) {
            setCurrentUser(null);
            setIsMounted(true);
          }

          return;
        }

        const json =
          await response.json().catch(() => ({}));

        const user = json?.data || null;

        if (ignore) {
          return;
        }

        if (!user) {
          setCurrentUser(null);
          setIsMounted(true);
          return;
        }

        setCurrentUser(user);

        setName(user.name || "");

        setContact(
          user.contact ||
            user.phone ||
            ""
        );

        setAddress(
          user.address || ""
        );

        setPincode(
          user.pincode || ""
        );

        setIsMounted(true);
      } catch (error) {
        console.error(
          "Failed to load profile:",
          error
        );

        if (!ignore) {
          setCurrentUser(null);
          setIsMounted(true);
        }
      }
    };

    loadProfile();

    /*
     * When another part of the application
     * changes authentication state, reload the
     * profile from the server.
     */
    const handleAuthChange = () => {
      loadProfile();
    };

    window.addEventListener(
      "auth-change",
      handleAuthChange
    );

    return () => {
      ignore = true;

      window.removeEventListener(
        "auth-change",
        handleAuthChange
      );
    };
  }, []);

  /*
   * ============================================================
   * SAVE PROFILE
   * ============================================================
   *
   * Profile changes are saved directly to the database through
   * the authenticated API.
   *
   * Nothing is stored in localStorage.
   */
  const handleSave = async (e) => {
    e.preventDefault();

    if (
      !name.trim() ||
      !contact.trim() ||
      !address.trim() ||
      !pincode.trim()
    ) {
      toast.error(
        "Please fill all editable fields"
      );

      return;
    }

    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        "/api/auth/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          cache: "no-store",
          body: JSON.stringify({
            name: name.trim(),
            contact: contact.trim(),
            address: address.trim(),
            pincode: pincode.trim(),
          }),
        }
      );

      const json =
        await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          json?.message ||
            json?.error ||
            "Unable to update profile."
        );
      }

      /*
       * The backend returns the updated user.
       * Use that as the new source of truth.
       */
      const updatedUser =
        json?.data || {
          ...currentUser,
          name: name.trim(),
          contact: contact.trim(),
          address: address.trim(),
          pincode: pincode.trim(),
        };

      setCurrentUser(updatedUser);

      setName(
        updatedUser.name || ""
      );

      setContact(
        updatedUser.contact ||
          updatedUser.phone ||
          ""
      );

      setAddress(
        updatedUser.address || ""
      );

      setPincode(
        updatedUser.pincode || ""
      );

      /*
       * Notify Navbar / other client components
       * that the authenticated profile changed.
       */
      window.dispatchEvent(
        new Event("auth-change")
      );

      toast.success(
        "Profile updated successfully!"
      );

      setIsEditing(false);
    } catch (error) {
      console.error(
        "Profile update failed:",
        error
      );

      toast.error(
        error?.message ||
          "Unable to update profile."
      );
    } finally {
      setIsSaving(false);
    }
  };

  /*
   * ============================================================
   * LOGOUT
   * ============================================================
   *
   * The server clears the HttpOnly authentication cookies.
   *
   * We also remove legacy localStorage values that may have
   * been created by the OLD implementation.
   *
   * New customer information is NEVER written there.
   */
  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Logout request failed."
        );
      }
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    } finally {
      /*
       * Remove legacy customer data from old
       * versions of the application.
       *
       * These keys should no longer be written
       * anywhere in the application.
       */
      if (
        typeof window !== "undefined"
      ) {
        localStorage.removeItem(
          "currentUser"
        );

        localStorage.removeItem(
          "registeredUsers"
        );

        /*
         * Remove any old cart/wishlist cache
         * created by previous versions.
         */
        Object.keys(
          localStorage
        ).forEach((key) => {
          if (
            key.startsWith("cart") ||
            key.startsWith("wishlist")
          ) {
            localStorage.removeItem(key);
          }
        });
      }

      setCurrentUser(null);

      window.dispatchEvent(
        new Event("auth-change")
      );

      toast.success(
        "Successfully logged out!"
      );

      router.replace("/home");
      router.refresh();

      setIsLoggingOut(false);
    }
  };

  if (!isMounted) {
    return (
      <main className="min-h-screen bg-[#FBF5EA] flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">
          Loading...
        </p>
      </main>
    );
  }

  // Get Initials for Avatar
  const getInitials = (nameStr) => {
    if (!nameStr) return "U";

    return nameStr
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <main className="min-h-screen bg-[#F8F2E8] font-sans pb-20">
      <Navbar />

      {/* Page Header */}
      <section className="bg-white border-b border-[#E8DCC8]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p className="uppercase tracking-[0.3em] text-[#B58A45] text-sm font-medium">
            Tharani Textiles
          </p>

          <h1 className="mt-3 text-4xl md:text-5xl lg:text-6xl font-cormorant text-[#5A1F2F] font-bold uppercase tracking-[0.02em]">
            My Account
          </h1>

          <p className="mt-4 text-[#8A8175] text-[15px] max-w-2xl leading-relaxed">
            Manage your personal profile information,
            shipping addresses, track your orders, and
            view your wishlist items.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 mt-8">

        {/* Breadcrumbs */}
        <div className="text-xs text-gray-500 mb-6 flex gap-2">
          <Link
            href="/home"
            className="hover:text-[#5A1F2F]"
          >
            Home
          </Link>

          <span>/</span>

          <span className="text-gray-800 font-medium">
            My Account
          </span>
        </div>

        {!currentUser ? (
          /* ================== LOGGED OUT STATE ================== */
          <div className="max-w-md mx-auto bg-white border border-[#E8DCC8] rounded-3xl p-8 text-center shadow-gold-sm mt-12 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#5A1F2F]/10 flex items-center justify-center mx-auto mb-6">
              <User
                size={30}
                className="text-[#5A1F2F]"
              />
            </div>

            <h2 className="text-2xl font-cormorant font-bold text-[#5A1F2F] mb-3">
              Sign In Required
            </h2>

            <p className="text-[#2F2B27]/80 text-sm leading-relaxed mb-8 max-w-sm mx-auto font-sans">
              Please sign in or create an account to
              view and manage your profile details,
              shipping addresses, and orders.
            </p>

            <Link
              href="/login"
              className="inline-block w-full bg-[#5A1F2F] text-white rounded-xl py-3.5 text-sm font-semibold shadow-md hover:bg-[#471825] active:scale-98 transition duration-300"
            >
              Go to Sign In Page
            </Link>
          </div>
        ) : (
          /* ================== LOGGED IN STATE ================== */
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_2fr] gap-8 items-start animate-fade-in">

            {/* Left Card - User Bio Summary */}
            <div className="bg-white border border-[#E8DCC8] rounded-2xl p-6 shadow-gold-sm text-center font-sans">

              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-24 h-24 rounded-full mx-auto object-cover border border-[#E8DCC8] shadow-gold-sm"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#5A1F2F] text-white flex items-center justify-center mx-auto text-3xl font-bold font-cormorant shadow-gold-sm">
                  {getInitials(
                    currentUser.name
                  )}
                </div>
              )}

              <h2 className="mt-5 font-cormorant text-2xl font-bold text-[#5A1F2F] leading-tight">
                {currentUser.name}
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                {currentUser.email}
              </p>

              <div className="inline-block mt-4 px-3 py-1 bg-[#FDF5CC] text-[#7A5E10] text-[11px] font-semibold tracking-wider uppercase rounded-full">
                Verified Customer
              </div>

              {currentUser.joinedDate && (
                <p className="text-xs text-gray-400 mt-4 border-t border-[#E8DCC8] pt-4">
                  Customer since{" "}
                  {currentUser.joinedDate}
                </p>
              )}

              {/* Action shortcuts */}
              <div className="mt-8 flex flex-col gap-2.5">

                <Link
                  href="/orders"
                  className="flex items-center justify-center gap-2.5 border border-[#E8DCC8] hover:border-[#5A1F2F] hover:text-[#5A1F2F] text-sm text-gray-700 font-semibold rounded-xl py-3 transition duration-300"
                >
                  <Package
                    size={16}
                    className="text-[#C79A2B]"
                  />
                  View Order History
                </Link>

                <Link
                  href="/wishlist"
                  className="flex items-center justify-center gap-2.5 border border-[#E8DCC8] hover:border-[#5A1F2F] hover:text-[#5A1F2F] text-sm text-gray-700 font-semibold rounded-xl py-3 transition duration-300"
                >
                  <Heart
                    size={16}
                    className="text-[#C79A2B]"
                  />
                  View Wishlist
                </Link>

                <Link
                  href="/cart"
                  className="flex items-center justify-center gap-2.5 border border-[#E8DCC8] hover:border-[#5A1F2F] hover:text-[#5A1F2F] text-sm text-gray-700 font-semibold rounded-xl py-3 transition duration-300"
                >
                  <ShoppingCart
                    size={16}
                    className="text-[#C79A2B]"
                  />
                  View Your Cart
                </Link>

                <Link
                  href="/home"
                  className="flex items-center justify-center gap-2.5 border border-[#E8DCC8] hover:border-[#5A1F2F] hover:text-[#5A1F2F] text-sm text-gray-700 font-semibold rounded-xl py-3 transition duration-300"
                >
                  <Home
                    size={16}
                    className="text-[#C79A2B]"
                  />
                  Continue Shopping
                </Link>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center justify-center gap-2 bg-[#5A1F2F] text-white text-sm font-semibold rounded-xl py-3.5 hover:bg-[#471825] active:scale-98 transition duration-300 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <LogOut size={16} />

                  {isLoggingOut
                    ? "Signing Out..."
                    : "Sign Out"}
                </button>
              </div>
            </div>

            {/* Right Card - Profile Details Form */}
            <div className="bg-white border border-[#E8DCC8] rounded-2xl p-6 md:p-8 shadow-gold-sm font-sans">

              <div className="flex justify-between items-center border-b border-[#E8DCC8] pb-4 mb-6">
                <div>
                  <h3 className="font-cormorant text-2xl font-bold text-[#5A1F2F]">
                    Account Details
                  </h3>

                  <p className="text-xs text-gray-400 mt-1">
                    Review and manage your contact
                    information
                  </p>
                </div>

                {!isEditing && (
                  <button
                    onClick={() =>
                      setIsEditing(true)
                    }
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#5A1F2F] hover:text-[#C79A2B] border border-[#E8DCC8] hover:border-[#C79A2B] px-3 py-1.5 rounded-lg transition"
                  >
                    <Edit2 size={13} />
                    Edit Profile
                  </button>
                )}
              </div>

              {!isEditing ? (
                /* ================= VIEW MODE ================= */
                <div className="space-y-6">

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                    <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#E8DCC8]/40">
                      <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                        Full Name
                      </p>

                      <p className="text-sm font-semibold text-[#2F2B27] flex items-center gap-2">
                        <User
                          size={15}
                          className="text-[#C79A2B]"
                        />

                        {currentUser.name}
                      </p>
                    </div>

                    <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#E8DCC8]/40">
                      <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                        Email Address
                      </p>

                      <p className="text-sm font-semibold text-[#2F2B27] flex items-center gap-2">
                        <Mail
                          size={15}
                          className="text-[#C79A2B]"
                        />

                        {currentUser.email}
                      </p>
                    </div>

                    <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#E8DCC8]/40">
                      <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                        Contact Number
                      </p>

                      <p className="text-sm font-semibold text-[#2F2B27] flex items-center gap-2">
                        <Phone
                          size={15}
                          className="text-[#C79A2B]"
                        />

                        {currentUser.contact ||
                          currentUser.phone ||
                          "Not provided"}
                      </p>
                    </div>

                    <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#E8DCC8]/40">
                      <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                        Delivery Pincode
                      </p>

                      <p className="text-sm font-semibold text-[#2F2B27] flex items-center gap-2">
                        <Hash
                          size={15}
                          className="text-[#C79A2B]"
                        />

                        {currentUser.pincode ||
                          "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#E8DCC8]/40">
                    <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                      Shipping Address
                    </p>

                    <div className="text-sm font-semibold text-[#2F2B27] flex items-start gap-2 leading-relaxed">
                      <MapPin
                        size={15}
                        className="text-[#C79A2B] shrink-0 mt-0.5"
                      />

                      <span>
                        {currentUser.address ||
                          "Not provided"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* ================= EDIT MODE ================= */
                <form
                  onSubmit={handleSave}
                  className="space-y-5 animate-fade-in"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">
                        Full Name
                      </label>

                      <div className="relative">
                        <User
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B58A45]"
                        />

                        <input
                          type="text"
                          value={name}
                          onChange={(e) =>
                            setName(
                              e.target.value
                            )
                          }
                          required
                          className="w-full bg-[#FDFBF7] border border-[#E8DCC8] text-[#2F2B27] placeholder-gray-400 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#C79A2B]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">
                        Email Address (Locked)
                      </label>

                      <div className="relative">
                        <Mail
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                          type="email"
                          value={
                            currentUser.email || ""
                          }
                          disabled
                          className="w-full bg-gray-50 border border-[#E8DCC8] text-gray-400 rounded-lg pl-9 pr-3 py-2 text-sm cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">
                        Contact Number
                      </label>

                      <div className="relative">
                        <Phone
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B58A45]"
                        />

                        <input
                          type="text"
                          value={contact}
                          onChange={(e) =>
                            setContact(
                              e.target.value
                            )
                          }
                          required
                          className="w-full bg-[#FDFBF7] border border-[#E8DCC8] text-[#2F2B27] placeholder-gray-400 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#C79A2B]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">
                        Pincode
                      </label>

                      <div className="relative">
                        <Hash
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B58A45]"
                        />

                        <input
                          type="text"
                          value={pincode}
                          onChange={(e) =>
                            setPincode(
                              e.target.value
                            )
                          }
                          required
                          className="w-full bg-[#FDFBF7] border border-[#E8DCC8] text-[#2F2B27] placeholder-gray-400 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#C79A2B]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">
                      Shipping Address
                    </label>

                    <div className="relative">
                      <MapPin
                        size={15}
                        className="absolute left-3 top-3 text-[#B58A45]"
                      />

                      <textarea
                        value={address}
                        onChange={(e) =>
                          setAddress(
                            e.target.value
                          )
                        }
                        required
                        rows={3}
                        className="w-full bg-[#FDFBF7] border border-[#E8DCC8] text-[#2F2B27] placeholder-gray-400 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#C79A2B] resize-none"
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 justify-end pt-4 border-t border-[#E8DCC8] mt-6">

                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => {
                        setIsEditing(false);

                        setName(
                          currentUser.name ||
                            ""
                        );

                        setContact(
                          currentUser.contact ||
                            currentUser.phone ||
                            ""
                        );

                        setAddress(
                          currentUser.address ||
                            ""
                        );

                        setPincode(
                          currentUser.pincode ||
                            ""
                        );
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-800 border border-gray-300 px-4 py-2.5 rounded-lg transition disabled:opacity-50"
                    >
                      <X size={14} />
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-[#5A1F2F] hover:bg-[#471825] text-white px-5 py-2.5 rounded-lg shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Save size={14} />

                      {isSaving
                        ? "Saving..."
                        : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}