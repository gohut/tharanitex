export const metadata = {
  title: "Privacy Policy | Tharani Textiles",
  description: "Learn about how Tharani Textiles collects, uses, and protects your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="prose max-w-none text-[#2F2B27]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#E8DCC8] pb-6 mb-8 gap-4 font-sans">
        <div>
          <h2 className="text-3xl font-cormorant font-bold text-[#5A1F2F]">Privacy Policy</h2>
          <p className="text-xs uppercase tracking-wider text-[#8A8175] mt-1 font-medium">Tharani Textiles Store Policy</p>
        </div>
        <span className="text-xs text-gray-500 bg-[#F1E6D5] px-3 py-1.5 rounded-full font-medium">
          Last Updated: August 2026
        </span>
      </div>

      <p className="text-[#2F2B27]/80 text-[15px] leading-relaxed mb-6 font-sans">
        At Tharani Textiles, we are committed to safeguarding the privacy and security of our customers and site visitors. This Privacy Policy describes how we collect, use, and process your personal information when you visit, browse, or make a purchase from our store.
      </p>

      <h3 className="text-xl md:text-2xl font-cormorant font-bold text-[#5A1F2F] mt-8 mb-4 border-b border-[#E8DCC8]/60 pb-2">
        1. Personal Information We Collect
      </h3>
      <p className="text-[#2F2B27]/80 text-[15px] leading-relaxed mb-4 font-sans">
        When you visit the site, we collect certain information to provide a seamless shopping experience:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2 text-[#2F2B27]/80 text-[15px] font-sans">
        <li>
          <strong className="text-[#2F2B27] font-semibold">Identity & Contact Data:</strong> Includes your name, billing address, shipping address, phone number, and email address when you register an account or make a purchase.
        </li>
        <li>
          <strong className="text-[#2F2B27] font-semibold">Transaction Data:</strong> Details about payments made by you, products viewed, added to cart, and wishlist items.
        </li>
        <li>
          <strong className="text-[#2F2B27] font-semibold">Technical & Device Data:</strong> IP address, browser type, operating system, and data collected through cookies.
        </li>
      </ul>

      <h3 className="text-xl md:text-2xl font-cormorant font-bold text-[#5A1F2F] mt-8 mb-4 border-b border-[#E8DCC8]/60 pb-2">
        2. How We Use Your Information
      </h3>
      <p className="text-[#2F2B27]/80 text-[15px] leading-relaxed mb-4 font-sans">
        We use the collected information for various purposes, including:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2 text-[#2F2B27]/80 text-[15px] font-sans">
        <li>Processing your orders, payments, and shipping.</li>
        <li>Providing customer care, managing accounts, and resolving disputes.</li>
        <li>Sending order tracking notifications and marketing newsletters (which you can opt-out of at any time).</li>
        <li>Analyzing site traffic to optimize our products and site performance.</li>
      </ul>

      <h3 className="text-xl md:text-2xl font-cormorant font-bold text-[#5A1F2F] mt-8 mb-4 border-b border-[#E8DCC8]/60 pb-2">
        3. Sharing Your Personal Data
      </h3>
      <p className="text-[#2F2B27]/80 text-[15px] leading-relaxed mb-4 font-sans">
        We never sell your personal data to third parties. However, we share your data with trusted partners to perform service actions:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2 text-[#2F2B27]/80 text-[15px] font-sans">
        <li>
          <strong className="text-[#2F2B27] font-semibold">Logistics Partners:</strong> Sharing your name, delivery address, and contact number with blue-chip courier companies (like BlueDart, Delhivery, DTDC) to deliver your sarees.
        </li>
        <li>
          <strong className="text-[#2F2B27] font-semibold">Payment Gateways:</strong> Securely transferring payment details to process transactions without storing card details.
        </li>
        <li>
          <strong className="text-[#2F2B27] font-semibold">Analytics Services:</strong> Using anonymous usage data to study site navigation behavior.
        </li>
      </ul>

      <h3 className="text-xl md:text-2xl font-cormorant font-bold text-[#5A1F2F] mt-8 mb-4 border-b border-[#E8DCC8]/60 pb-2">
        4. Data Retention and Security
      </h3>
      <p className="text-[#2F2B27]/80 text-[15px] leading-relaxed mb-4 font-sans">
        We implement rigorous security measures, including SSL encryption, to ensure your information is safe. We retain customer data as long as necessary to process transactions, manage accounts, or comply with legal and taxation regulations.
      </p>

      <h3 className="text-xl md:text-2xl font-cormorant font-bold text-[#5A1F2F] mt-8 mb-4 border-b border-[#E8DCC8]/60 pb-2">
        5. Your Legal Rights
      </h3>
      <p className="text-[#2F2B27]/80 text-[15px] leading-relaxed mb-4 font-sans">
        Depending on your location, you have rights regarding your personal information, including the right to request access to the data we hold, correct any inaccuracies, or request the deletion of your personal account files.
      </p>

      <h3 className="text-xl md:text-2xl font-cormorant font-bold text-[#5A1F2F] mt-8 mb-4 border-b border-[#E8DCC8]/60 pb-2">
        6. Updates and Contacts
      </h3>
      <p className="text-[#2F2B27]/80 text-[15px] leading-relaxed mb-4 font-sans">
        We may update this Privacy Policy from time to time to reflect operational, legal, or regulatory changes. If you have any questions or require support regarding your data privacy, please email us at <a href="mailto:info@tharanitextiles.com" className="text-[#5A1F2F] font-semibold underline hover:text-[#C79A2B]">info@tharanitextiles.com</a>.
      </p>
    </div>
  );
}
