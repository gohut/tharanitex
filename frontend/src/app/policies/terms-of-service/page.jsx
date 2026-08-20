export const metadata = {
  title: "Terms of Service | Tharani Textiles",
  description: "Read the Terms of Service and disclaimer rules governing the use of the Tharani Textiles website and purchase of our silk products.",
};

export default function TermsOfServicePage() {
  return (
    <div className="prose max-w-none text-[#2F2B27]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#E8DCC8] pb-6 mb-8 gap-4 font-sans">
        <div>
          <h2 className="text-3xl font-cormorant font-bold text-[#5A1F2F]">Terms of Service</h2>
          <p className="text-xs uppercase tracking-wider text-[#8A8175] mt-1 font-medium">Terms and Conditions for Tharani Textiles</p>
        </div>
        <span className="text-xs text-gray-500 bg-[#F1E6D5] px-3 py-1.5 rounded-full font-medium">
          Last Updated: August 2026
        </span>
      </div>

      <h3 className="text-xl md:text-2xl font-cormorant font-bold text-[#5A1F2F] mt-6 mb-4 border-b border-[#E8DCC8]/60 pb-2">
        Overview
      </h3>
      <p className="text-[#2F2B27]/80 text-[15px] leading-relaxed mb-4 font-sans">
        This website is operated by Tharani Textiles. Throughout the site, the terms &quot;we&quot;, &quot;us&quot; and &quot;our&quot; refer to Tharani Textiles. We offer this website, including all information, tools and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.
      </p>
      <p className="text-[#2F2B27]/80 text-[15px] leading-relaxed mb-4 font-sans">
        By visiting our site and/ or purchasing something from us, you engage in our &quot;Service&quot; and agree to be bound by the following terms and conditions (&quot;Terms of Service&quot;, &quot;Terms&quot;), including those additional terms and conditions and policies referenced herein and/or available by hyperlink.
      </p>

      <h3 className="text-xl md:text-2xl font-cormorant font-bold text-[#5A1F2F] mt-8 mb-4 border-b border-[#E8DCC8]/60 pb-2">
        SECTION 1 - Handloom & Silk Saree Disclaimer
      </h3>
      <p className="text-[#2F2B27]/80 text-[15px] leading-relaxed mb-4 font-sans">
        Our sarees represent the pinnacle of traditional hand-weaving craftsmanship. Due to the natural properties of handloom silk, please note the following:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2 text-[#2F2B27]/80 text-[15px] font-sans">
        <li>
          <strong className="text-[#2F2B27] font-semibold">Weaving Variations:</strong> Minor thread irregularities, tiny slubs in weaving, slight variations in border motifs, or small color variations in yarn dye are not defects. They are the signature marks of authentic handloom weaving and signify the artisanal process.
        </li>
        <li>
          <strong className="text-[#2F2B27] font-semibold">Color Representation:</strong> We capture our sarees in studio lighting. However, silk has dynamic sheen characteristics, meaning colors might shift slightly depending on your ambient room light and monitor screen settings.
        </li>
      </ul>

      <h3 className="text-xl md:text-2xl font-cormorant font-bold text-[#5A1F2F] mt-8 mb-4 border-b border-[#E8DCC8]/60 pb-2">
        SECTION 2 - Accuracy of Pricing and Availability
      </h3>
      <p className="text-[#2F2B27]/80 text-[15px] leading-relaxed mb-4 font-sans">
        All prices listed are in Indian Rupees (INR) and are inclusive of standard local taxes. We make every effort to ensure pricing accuracy. In the rare event that a product is listed at an incorrect price due to system error, we reserve the right to refuse or cancel any orders placed for that product, even after order confirmation.
      </p>
      <p className="text-[#2F2B27]/80 text-[15px] leading-relaxed mb-4 font-sans">
        Many of our hand-woven silk sarees are one-of-a-kind masterpieces. Stock levels are updated dynamically. If multiple customers order the same piece simultaneously due to concurrency, we will contact you and offer a similar alternative or a complete refund.
      </p>

      <h3 className="text-xl md:text-2xl font-cormorant font-bold text-[#5A1F2F] mt-8 mb-4 border-b border-[#E8DCC8]/60 pb-2">
        SECTION 3 - Online Store Terms
      </h3>
      <p className="text-[#2F2B27]/80 text-[15px] leading-relaxed mb-4 font-sans">
        By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, and you have given us your consent to allow any of your minor dependents to use this site. You may not use our products for any illegal or unauthorized purpose.
      </p>

      <h3 className="text-xl md:text-2xl font-cormorant font-bold text-[#5A1F2F] mt-8 mb-4 border-b border-[#E8DCC8]/60 pb-2">
        SECTION 4 - Intellectual Property Rights
      </h3>
      <p className="text-[#2F2B27]/80 text-[15px] leading-relaxed mb-4 font-sans">
        All content on this website, including but not limited to text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and saree designs are the exclusive property of Tharani Textiles or its content suppliers and protected by international copyright and trademark laws.
      </p>

      <h3 className="text-xl md:text-2xl font-cormorant font-bold text-[#5A1F2F] mt-8 mb-4 border-b border-[#E8DCC8]/60 pb-2">
        SECTION 5 - Governing Law
      </h3>
      <p className="text-[#2F2B27]/80 text-[15px] leading-relaxed mb-4 font-sans">
        These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of India, with jurisdiction in Salem district, Tamil Nadu.
      </p>

      <h3 className="text-xl md:text-2xl font-cormorant font-bold text-[#5A1F2F] mt-8 mb-4 border-b border-[#E8DCC8]/60 pb-2">
        SECTION 6 - Changes to Terms of Service
      </h3>
      <p className="text-[#2F2B27]/80 text-[15px] leading-relaxed mb-4 font-sans">
        You can review the most current version of the Terms of Service at any time on this page. We reserve the right, at our sole discretion, to update, change or replace any part of these Terms of Service by posting updates and changes to our website.
      </p>
    </div>
  );
}
