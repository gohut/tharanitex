export const metadata = {
  title: "Shipping Policy | Tharani Textiles",
  description: "Read about Tharani Textiles shipping rates, processing times, and domestic and international delivery times.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="prose max-w-none text-[#2F2B27]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#E8DCC8] pb-6 mb-8 gap-4 font-sans">
        <div>
          <h2 className="text-3xl font-cormorant font-bold text-[#5A1F2F]">Shipping Policy</h2>
          <p className="text-xs uppercase tracking-wider text-[#8A8175] mt-1 font-medium">Tharani Textiles Shipping Rates & Rules</p>
        </div>
        <span className="text-xs text-gray-500 bg-[#F1E6D5] px-3 py-1.5 rounded-full font-medium">
          Last Updated: August 2026
        </span>
      </div>

      <p className="text-[#2F2B27]/80 text-[15px] leading-relaxed mb-6 font-sans">
        At Tharani Textiles, we understand how important it is to receive your luxury silk sarees on time and in pristine condition. We partner with the most reliable shipping and courier services to guarantee a safe and smooth delivery.
      </p>

      <h3 className="text-xl md:text-2xl font-cormorant font-bold text-[#5A1F2F] mt-8 mb-4 border-b border-[#E8DCC8]/60 pb-2">
        1. Order Processing and Dispatch Times
      </h3>
      <p className="text-[#2F2B27]/80 text-[15px] leading-relaxed mb-4 font-sans">
        We handle each silk saree with absolute care. Please review our processing timelines:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2 text-[#2F2B27]/80 text-[15px] font-sans">
        <li>
          <strong className="text-[#2F2B27] font-semibold">Ready-to-Ship Sarees:</strong> Dispatched within 24 to 48 business hours after the order is confirmed.
        </li>
        <li>
          <strong className="text-[#2F2B27] font-semibold">Custom Additions (Fall & Picot, Blouse Stitching):</strong> Applying fall & picot or stitching custom blouses requires meticulous craftsmanship. This adds an additional 2 to 3 business days to the dispatch timeline.
        </li>
        <li>
          <strong className="text-[#2F2B27] font-semibold">Dispatches:</strong> All orders are dispatched from our warehouse in Elampillai, Tamil Nadu. No dispatches are made on Sundays or public holidays.
        </li>
      </ul>

      <h3 className="text-xl md:text-2xl font-cormorant font-bold text-[#5A1F2F] mt-8 mb-4 border-b border-[#E8DCC8]/60 pb-2">
        2. Delivery Timelines
      </h3>
      <p className="text-[#2F2B27]/80 text-[15px] leading-relaxed mb-4 font-sans">
        Once dispatched, here are the estimated delivery times:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2 text-[#2F2B27]/80 text-[15px] font-sans">
        <li>
          <strong className="text-[#2F2B27] font-semibold">Within India (Domestic):</strong> 3 to 7 business days depending on the state and region. Metro cities typically receive deliveries within 2 to 4 business days.
        </li>
        <li>
          <strong className="text-[#2F2B27] font-semibold">International Shipping:</strong> 7 to 15 business days depending on the destination country and customs clearance processes.
        </li>
      </ul>

      <h3 className="text-xl md:text-2xl font-cormorant font-bold text-[#5A1F2F] mt-8 mb-4 border-b border-[#E8DCC8]/60 pb-2">
        3. Shipping Charges
      </h3>
      <p className="text-[#2F2B27]/80 text-[15px] leading-relaxed mb-4 font-sans">
        We offer free delivery across India for all saree orders. For international orders, shipping charges are computed automatically at checkout based on package weight and destination country.
      </p>

      <h3 className="text-xl md:text-2xl font-cormorant font-bold text-[#5A1F2F] mt-8 mb-4 border-b border-[#E8DCC8]/60 pb-2">
        4. Logistics and Courier Partners
      </h3>
      <p className="text-[#2F2B27]/80 text-[15px] leading-relaxed mb-4 font-sans">
        To maintain reliability, we only ship orders using leading national and international courier companies including:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-1 text-[#2F2B27]/80 text-[15px] font-sans">
        <li>BlueDart</li>
        <li>Delhivery</li>
        <li>DTDC</li>
        <li>DHL / FedEx (for international deliveries)</li>
      </ul>

      <h3 className="text-xl md:text-2xl font-cormorant font-bold text-[#5A1F2F] mt-8 mb-4 border-b border-[#E8DCC8]/60 pb-2">
        5. Tracking Your Shipment
      </h3>
      <p className="text-[#2F2B27]/80 text-[15px] leading-relaxed mb-4 font-sans">
        As soon as your order is handed over to the courier partner, we will email you the tracking details, tracking number, and a direct link to follow your shipment's journey. You can also view shipment statuses in your Account Dashboard.
      </p>

      <h3 className="text-xl md:text-2xl font-cormorant font-bold text-[#5A1F2F] mt-8 mb-4 border-b border-[#E8DCC8]/60 pb-2">
        6. Customs, Duties & Taxes (International Orders)
      </h3>
      <p className="text-[#2F2B27]/80 text-[15px] leading-relaxed mb-4 font-sans">
        For orders shipped outside India, the buyer is responsible for paying import duties, custom fees, or local sales taxes imposed by the destination country's custom departments. Tharani Textiles is not liable for custom delays or duties.
      </p>

      <h3 className="text-xl md:text-2xl font-cormorant font-bold text-[#5A1F2F] mt-8 mb-4 border-b border-[#E8DCC8]/60 pb-2">
        7. Transit Insurance and Damaged Packages
      </h3>
      <p className="text-[#2F2B27]/80 text-[15px] leading-relaxed mb-4 font-sans">
        All Tharani Textiles shipments are fully insured during transit. In the rare case of a lost package or if the box is visibly damaged/tampered with upon arrival, please refuse the delivery and contact our customer care immediately at <a href="mailto:info@tharanitextiles.com" className="text-[#5A1F2F] font-semibold underline hover:text-[#C79A2B]">info@tharanitextiles.com</a>.
      </p>
    </div>
  );
}
