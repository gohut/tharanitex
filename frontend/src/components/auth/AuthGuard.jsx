"use client";

import { useCallback, useEffect, useState } from "react";
import AuthRequiredModal from "./AuthRequiredModal";

const CUSTOMER_PATHS = [
  "/cart",
  "/orders",
  "/wishlist",
  "/profile",
  "/checkout",
  "/payment",
];

function isCustomerPath(pathname) {
  if (!pathname) {
    return false;
  }

  return CUSTOMER_PATHS.some((path) => {
    return (
      pathname === path ||
      pathname.startsWith(`${path}/`)
    );
  });
}

export default function AuthGuard() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("Please sign in to continue.");

  const checkAuthentication = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/profile", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const authenticated = response.ok;
      setIsAuthenticated(authenticated);
      return authenticated;
    } catch {
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  useEffect(() => {
    const handleAuthChange = () => {
      checkAuthentication();
    };

    const handleAuthRequired = (event) => {
      setIsAuthenticated(false);
      const customMessage = event?.detail?.message || "Please sign in to continue.";
      setModalMessage(customMessage);
      setShowModal(true);
    };

    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("tharani-auth-required", handleAuthRequired);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("tharani-auth-required", handleAuthRequired);
    };
  }, [checkAuthentication]);

  useEffect(() => {
    const handleDocumentClick = async (event) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      /*
       * Explicitly protected elements (e.g. Add to Cart, Buy Now, Wishlist buttons)
       */
      const protectedElement = target.closest("[data-requires-auth='true']");

      /*
       * Customer-only navigation links (e.g. /cart, /orders, /wishlist, /profile)
       */
      const anchor = target.closest("a[href]");
      let customerNavigation = false;

      if (anchor) {
        const href = anchor.getAttribute("href");
        if (href) {
          try {
            const url = new URL(href, window.location.origin);
            customerNavigation =
              url.origin === window.location.origin &&
              isCustomerPath(url.pathname);
          } catch {
            customerNavigation = false;
          }
        }
      }

      if (!protectedElement && !customerNavigation) {
        return;
      }

      /*
       * Already confirmed authenticated
       */
      if (isAuthenticated === true) {
        return;
      }

      /*
       * Stop navigation/action immediately while checking
       */
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();

      const authenticated = await checkAuthentication();

      if (authenticated) {
        if (anchor) {
          const href = anchor.getAttribute("href");
          if (href) {
            window.location.assign(href);
          }
        }
        return;
      }

      setShowModal(true);
    };

    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [isAuthenticated, checkAuthentication]);

  return (
    <AuthRequiredModal
      open={showModal}
      onClose={() => setShowModal(false)}
      message={modalMessage}
    />
  );
}