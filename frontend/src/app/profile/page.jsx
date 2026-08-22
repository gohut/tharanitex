"use client";

import { useEffect, useState } from "react";
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

const GREEN = "#00361F";
const GOLD = "#D4A437";

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [currentUser, setCurrentUser] =
    useState(null);

  const [isEditing, setIsEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [name, setName] =
    useState("");

  const [contact, setContact] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [pincode, setPincode] =
    useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/auth/profile",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        setCurrentUser(null);
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Failed to load profile"
        );
      }

      const result =
        await response.json();

      const user = result.data;

      if (!user) {
        setCurrentUser(null);
        return;
      }

      setCurrentUser(user);

      setName(user.name || "");

      setContact(
        user.phone ||
          user.contact ||
          ""
      );

      setAddress(
        user.address || ""
      );

      setPincode(
        user.pincode || ""
      );
    } catch (error) {
      console.error(
        "Profile loading error:",
        error
      );

      toast.error(
        "Unable to load your profile."
      );

      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();

    const handleAuthChange = () => {
      loadProfile();
    };

    window.addEventListener(
      "auth-change",
      handleAuthChange
    );

    return () => {
      window.removeEventListener(
        "auth-change",
        handleAuthChange
      );
    };
  }, []);

  const handleSave = async (
    event
  ) => {
    event.preventDefault();

    if (
      !name.trim() ||
      !contact.trim() ||
      !address.trim() ||
      !pincode.trim()
    ) {
      toast.error(
        "Please fill all profile fields."
      );

      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/auth/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: name.trim(),
            phone: contact.trim(),
            address: address.trim(),
            pincode: pincode.trim(),
          }),
        }
      );

      const result =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            "Failed to update profile"
        );
      }

      const updatedUser =
        result.data;

      setCurrentUser(
        updatedUser
      );

      setName(
        updatedUser.name || ""
      );

      setContact(
        updatedUser.phone ||
          updatedUser.contact ||
          ""
      );

      setAddress(
        updatedUser.address ||
          ""
      );

      setPincode(
        updatedUser.pincode ||
          ""
      );

      setIsEditing(false);

      window.dispatchEvent(
        new Event("auth-change")
      );

      toast.success(
        "Profile updated successfully!"
      );
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      toast.error(
        error.message ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
  try {
    const response = await fetch(
      "/api/auth/logout",
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      }
    );

    const result = await response
      .json()
      .catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        result.message ||
          result.error ||
          "Logout failed"
      );
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
  } catch (error) {
    console.error(
      "Logout failed:",
      error
    );

    toast.error(
      error.message ||
        "Unable to sign out. Please try again."
    );
  }
};

  const getInitials = (
    value
  ) => {
    if (!value) return "U";

    return value
      .split(/\s+/)
      .map(
        (part) => part[0]
      )
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FBF5EA]">
        <Navbar />

        <div className="flex items-center justify-center py-32">
          <p className="text-[#8A8175]">
            Loading your profile...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F2E8] font-sans pb-20">
      <Navbar />

      {/* HEADER */}
      <section className="bg-white border-b border-[#E8DCC8]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p
            className="
              uppercase
              tracking-[0.3em]
              text-[#D4A437]
              text-sm
              font-medium
            "
          >
            Tharani Textiles
          </p>

          <h1
            className="
              mt-3
              text-4xl
              md:text-5xl
              lg:text-6xl
              font-cormorant
              text-[#00361F]
              font-bold
              uppercase
            "
          >
            My Account
          </h1>

          <p className="mt-4 text-[#8A8175] text-[15px] max-w-2xl">
            Manage your personal information,
            shipping address, orders and
            wishlist.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 mt-8">

        {/* BREADCRUMB */}
        <div className="text-xs text-gray-500 mb-6 flex gap-2">
          <Link href="/home">
            Home
          </Link>

          <span>/</span>

          <span className="text-gray-800 font-medium">
            My Account
          </span>
        </div>

        {!currentUser ? (
          <div className="max-w-md mx-auto bg-white border border-[#E8DCC8] rounded-3xl p-8 text-center shadow-gold-sm mt-12">

            <div className="w-16 h-16 rounded-full bg-[#00361F]/10 flex items-center justify-center mx-auto mb-6">
              <User
                size={30}
                className="text-[#00361F]"
              />
            </div>

            <h2 className="text-2xl font-cormorant font-bold text-[#00361F] mb-3">
              Sign In Required
            </h2>

            <p className="text-[#2F2B27]/80 text-sm mb-8">
              Please sign in to view
              your profile.
            </p>

            <Link
              href="/login"
              className="
                block
                w-full
                bg-[#00361F]
                text-white
                rounded-xl
                py-3.5
                text-sm
                font-semibold
                hover:bg-[#002B19]
                transition
              "
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_2fr] gap-8 items-start">

            {/* LEFT CARD */}
            <div className="bg-white border border-[#E8DCC8] rounded-2xl p-6 shadow-gold-sm text-center">

              {/* GOOGLE AVATAR */}
              <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-2 border-[#D4A437] bg-[#00361F] flex items-center justify-center">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={`${currentUser.name}'s profile`}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-3xl font-bold font-cormorant text-[#F6ECD0]">
                    {getInitials(
                      currentUser.name
                    )}
                  </span>
                )}
              </div>

              <h2 className="mt-5 font-cormorant text-2xl font-bold text-[#00361F]">
                {currentUser.name}
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                {currentUser.email}
              </p>

              <div className="inline-block mt-4 px-3 py-1 bg-[#FDF5CC] text-[#7A5E10] text-[11px] font-semibold uppercase rounded-full">
                Verified Customer
              </div>

              <div className="mt-8 flex flex-col gap-2.5">

                <Link
                  href="/orders"
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    border
                    border-[#E8DCC8]
                    rounded-xl
                    py-3
                    text-sm
                    font-semibold
                    hover:border-[#D4A437]
                    hover:text-[#00361F]
                    transition
                  "
                >
                  <Package size={16} />
                  View Order History
                </Link>

                <Link
                  href="/wishlist"
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    border
                    border-[#E8DCC8]
                    rounded-xl
                    py-3
                    text-sm
                    font-semibold
                    hover:border-[#D4A437]
                    hover:text-[#00361F]
                    transition
                  "
                >
                  <Heart size={16} />
                  View Wishlist
                </Link>

                <Link
                  href="/cart"
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    border
                    border-[#E8DCC8]
                    rounded-xl
                    py-3
                    text-sm
                    font-semibold
                    hover:border-[#D4A437]
                    hover:text-[#00361F]
                    transition
                  "
                >
                  <ShoppingCart size={16} />
                  View Your Cart
                </Link>

                <Link
                  href="/home"
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    border
                    border-[#E8DCC8]
                    rounded-xl
                    py-3
                    text-sm
                    font-semibold
                    hover:border-[#D4A437]
                    hover:text-[#00361F]
                    transition
                  "
                >
                  <Home size={16} />
                  Continue Shopping
                </Link>

                <button
                  onClick={handleLogout}
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    bg-[#00361F]
                    text-white
                    rounded-xl
                    py-3.5
                    text-sm
                    font-semibold
                    mt-2
                    hover:bg-[#002B19]
                    transition
                  "
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>

            {/* RIGHT CARD */}
            <div className="bg-white border border-[#E8DCC8] rounded-2xl p-6 md:p-8 shadow-gold-sm">

              <div className="flex justify-between items-center border-b border-[#E8DCC8] pb-4 mb-6">

                <div>
                  <h3 className="font-cormorant text-2xl font-bold text-[#00361F]">
                    Account Details
                  </h3>

                  <p className="text-xs text-gray-400 mt-1">
                    Your details are loaded
                    from your account.
                  </p>
                </div>

                {!isEditing && (
                  <button
                    onClick={() =>
                      setIsEditing(true)
                    }
                    className="
                      flex
                      items-center
                      gap-1.5
                      text-xs
                      font-semibold
                      text-[#00361F]
                      border
                      border-[#E8DCC8]
                      px-3
                      py-1.5
                      rounded-lg
                      hover:border-[#D4A437]
                      transition
                    "
                  >
                    <Edit2 size={13} />
                    Edit
                  </button>
                )}
              </div>

              {!isEditing ? (
                <div className="space-y-5">

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                    <InfoCard
                      label="Full Name"
                      value={
                        currentUser.name
                      }
                      icon={
                        <User size={15} />
                      }
                    />

                    <InfoCard
                      label="Email Address"
                      value={
                        currentUser.email
                      }
                      icon={
                        <Mail size={15} />
                      }
                    />

                    <InfoCard
                      label="Contact Number"
                      value={
                        currentUser.phone ||
                        currentUser.contact ||
                        "Not provided"
                      }
                      icon={
                        <Phone size={15} />
                      }
                    />

                    <InfoCard
                      label="Delivery Pincode"
                      value={
                        currentUser.pincode ||
                        "Not provided"
                      }
                      icon={
                        <Hash size={15} />
                      }
                    />
                  </div>

                  <InfoCard
                    label="Shipping Address"
                    value={
                      currentUser.address ||
                      "Not provided"
                    }
                    icon={
                      <MapPin size={15} />
                    }
                  />
                </div>
              ) : (
                <form
                  onSubmit={handleSave}
                  className="space-y-5"
                >

                  <div>
                    <label className="text-xs font-semibold text-gray-500">
                      Full Name
                    </label>

                    <input
                      value={name}
                      onChange={(e) =>
                        setName(
                          e.target.value
                        )
                      }
                      required
                      className="mt-1 w-full bg-[#FDFBF7] border border-[#E8DCC8] rounded-lg px-4 py-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500">
                      Email Address
                    </label>

                    <input
                      value={
                        currentUser.email ||
                        ""
                      }
                      disabled
                      className="mt-1 w-full bg-gray-100 border border-[#E8DCC8] rounded-lg px-4 py-3 text-sm text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500">
                      Contact Number
                    </label>

                    <input
                      value={contact}
                      onChange={(e) =>
                        setContact(
                          e.target.value
                        )
                      }
                      required
                      className="mt-1 w-full bg-[#FDFBF7] border border-[#E8DCC8] rounded-lg px-4 py-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500">
                      Shipping Address
                    </label>

                    <textarea
                      value={address}
                      onChange={(e) =>
                        setAddress(
                          e.target.value
                        )
                      }
                      required
                      rows={4}
                      className="mt-1 w-full bg-[#FDFBF7] border border-[#E8DCC8] rounded-lg px-4 py-3 text-sm resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500">
                      Pincode
                    </label>

                    <input
                      value={pincode}
                      onChange={(e) =>
                        setPincode(
                          e.target.value
                        )
                      }
                      required
                      className="mt-1 w-full bg-[#FDFBF7] border border-[#E8DCC8] rounded-lg px-4 py-3 text-sm"
                    />
                  </div>

                  <div className="flex gap-3">

                    <button
                      type="submit"
                      disabled={saving}
                      className="
                        flex
                        items-center
                        gap-2
                        bg-[#00361F]
                        text-white
                        rounded-xl
                        px-5
                        py-3
                        text-sm
                        font-semibold
                        disabled:opacity-50
                        hover:bg-[#002B19]
                        transition
                      "
                    >
                      <Save size={15} />

                      {saving
                        ? "Saving..."
                        : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);

                        setName(
                          currentUser.name ||
                            ""
                        );

                        setContact(
                          currentUser.phone ||
                            currentUser.contact ||
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
                      className="
                        flex
                        items-center
                        gap-2
                        border
                        border-[#E8DCC8]
                        rounded-xl
                        px-5
                        py-3
                        text-sm
                        font-semibold
                        hover:border-[#D4A437]
                        transition
                      "
                    >
                      <X size={15} />
                      Cancel
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

function InfoCard({
  label,
  value,
  icon,
}) {
  return (
    <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#E8DCC8]/40">

      <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
        {label}
      </p>

      <p className="text-sm font-semibold text-[#2F2B27] flex items-start gap-2">
        <span className="text-[#D4A437] mt-0.5">
          {icon}
        </span>

        <span>{value}</span>
      </p>
    </div>
  );
}