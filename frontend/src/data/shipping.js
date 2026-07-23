export const shippingZones = [
  {
    id: "Z001", name: "Metro Cities", states: ["Maharashtra", "Karnataka", "Delhi", "Tamil Nadu"],
    baseRate: 50, perKgRate: 20, freeShippingAbove: 999, estimatedDays: "1-2",
  },
  {
    id: "Z002", name: "Tier 2 Cities", states: ["Gujarat", "Rajasthan", "Madhya Pradesh", "Andhra Pradesh"],
    baseRate: 80, perKgRate: 25, freeShippingAbove: 1499, estimatedDays: "3-5",
  },
  {
    id: "Z003", name: "Remote Areas", states: ["Northeast States", "Jammu & Kashmir", "Himachal Pradesh"],
    baseRate: 150, perKgRate: 40, freeShippingAbove: 2499, estimatedDays: "7-10",
  },
  {
    id: "Z004", name: "International", states: ["USA", "UK", "UAE", "Singapore", "Australia"],
    baseRate: 1500, perKgRate: 200, freeShippingAbove: 15000, estimatedDays: "10-15",
  },
];

export const couriers = [
  {
    id: "CR001", name: "BlueDart", logo: "https://placehold.co/80x40/145C3E/D4AF37?text=BD",
    status: true, coverage: "Pan India", avgDeliveryDays: 2, trackingSupport: true,
  },
  {
    id: "CR002", name: "Delhivery", logo: "https://placehold.co/80x40/145C3E/D4AF37?text=DLV",
    status: true, coverage: "Pan India + International", avgDeliveryDays: 3, trackingSupport: true,
  },
  {
    id: "CR003", name: "Ekart Logistics", logo: "https://placehold.co/80x40/145C3E/D4AF37?text=EK",
    status: true, coverage: "Pan India", avgDeliveryDays: 4, trackingSupport: true,
  },
  {
    id: "CR004", name: "DTDC", logo: "https://placehold.co/80x40/145C3E/D4AF37?text=DTDC",
    status: false, coverage: "Pan India", avgDeliveryDays: 5, trackingSupport: true,
  },
  {
    id: "CR005", name: "India Post", logo: "https://placehold.co/80x40/145C3E/D4AF37?text=IP",
    status: false, coverage: "Pan India + Remote", avgDeliveryDays: 7, trackingSupport: false,
  },
  {
    id: "CR006", name: "FedEx", logo: "https://placehold.co/80x40/145C3E/D4AF37?text=FDX",
    status: true, coverage: "International", avgDeliveryDays: 10, trackingSupport: true,
  },
];

export const trackingUpdates = [
  { id: "TRK001", orderId: "ORD-1001", courier: "BlueDart", status: "Delivered", lastUpdate: "2025-07-15 14:32", location: "Bangalore" },
  { id: "TRK002", orderId: "ORD-1003", courier: "Ekart", status: "In Transit", lastUpdate: "2025-07-16 09:15", location: "Ahmedabad Hub" },
  { id: "TRK003", orderId: "ORD-1005", courier: "DTDC", status: "Out for Delivery", lastUpdate: "2025-07-17 08:00", location: "Kochi" },
  { id: "TRK004", orderId: "ORD-1006", courier: "BlueDart", status: "Delivered", lastUpdate: "2025-07-14 16:45", location: "Hyderabad" },
  { id: "TRK005", orderId: "ORD-1009", courier: "BlueDart", status: "Packed", lastUpdate: "2025-07-16 11:20", location: "Warehouse" },
  { id: "TRK006", orderId: "ORD-1010", courier: "Delhivery", status: "Delivered", lastUpdate: "2025-07-15 17:30", location: "Jaipur" },
];

export const deliveryPartners = [
  { id: "DP001", name: "SpeedWings Logistics", contact: "info@speedwings.in", phone: "+91 80001 23456", activeZones: 3, status: "Active" },
  { id: "DP002", name: "QuickMile Express", contact: "ops@quickmile.com", phone: "+91 90001 34567", activeZones: 2, status: "Active" },
  { id: "DP003", name: "CityHop Deliveries", contact: "partner@cityhop.in", phone: "+91 70001 45678", activeZones: 1, status: "Inactive" },
];
