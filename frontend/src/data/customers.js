export const customers = [
  {
    id: "C001", name: "Priya Sharma", email: "priya@example.com", phone: "+91 98765 43210",
    orders: 12, totalSpend: 68420, segment: "VIP", joined: "2023-03-15", status: "Active",
    address: "12, MG Road, Bangalore, Karnataka 560001",
    tickets: [
      { id: "T001", subject: "Delayed delivery for ORD-1001", status: "Resolved", date: "2025-07-10" },
      { id: "T002", subject: "Wrong size in kurti order", status: "Open", date: "2025-07-16" },
    ],
    orderHistory: ["ORD-1001", "ORD-1005", "ORD-1009"],
  },
  {
    id: "C002", name: "Ananya Mehta", email: "ananya@example.com", phone: "+91 87654 32109",
    orders: 3, totalSpend: 36799, segment: "New", joined: "2025-06-01", status: "Active",
    address: "45, Linking Road, Mumbai, Maharashtra 400054",
    tickets: [],
    orderHistory: ["ORD-1002"],
  },
  {
    id: "C003", name: "Divya Patel", email: "divya@example.com", phone: "+91 76543 21098",
    orders: 8, totalSpend: 28940, segment: "Regular", joined: "2024-01-22", status: "Active",
    address: "8, Satellite Road, Ahmedabad, Gujarat 380015",
    tickets: [
      { id: "T003", subject: "Return request for saree", status: "Resolved", date: "2025-05-20" },
    ],
    orderHistory: ["ORD-1003"],
  },
  {
    id: "C004", name: "Ritu Singh", email: "ritu@example.com", phone: "+91 65432 10987",
    orders: 5, totalSpend: 14200, segment: "Regular", joined: "2024-08-10", status: "Active",
    address: "23, Hazratganj, Lucknow, UP 226001",
    tickets: [],
    orderHistory: ["ORD-1004"],
  },
  {
    id: "C005", name: "Kavitha Nair", email: "kavitha@example.com", phone: "+91 54321 09876",
    orders: 18, totalSpend: 127500, segment: "VIP", joined: "2022-11-05", status: "Active",
    address: "67, MG Road, Kochi, Kerala 682011",
    tickets: [
      { id: "T004", subject: "Item missing from order", status: "Open", date: "2025-07-17" },
    ],
    orderHistory: ["ORD-1005", "ORD-1009"],
  },
  {
    id: "C006", name: "Sneha Reddy", email: "sneha@example.com", phone: "+91 43210 98765",
    orders: 6, totalSpend: 19800, segment: "Regular", joined: "2024-04-12", status: "Active",
    address: "11, Jubilee Hills, Hyderabad, Telangana 500033",
    tickets: [],
    orderHistory: ["ORD-1006"],
  },
  {
    id: "C007", name: "Meera Iyer", email: "meera@example.com", phone: "+91 32109 87654",
    orders: 2, totalSpend: 5400, segment: "New", joined: "2025-05-28", status: "Inactive",
    address: "34, Anna Nagar, Chennai, Tamil Nadu 600040",
    tickets: [
      { id: "T005", subject: "Product quality issue", status: "Resolved", date: "2025-06-14" },
    ],
    orderHistory: ["ORD-1007"],
  },
  {
    id: "C008", name: "Pooja Gupta", email: "pooja@example.com", phone: "+91 21098 76543",
    orders: 22, totalSpend: 245600, segment: "VIP", joined: "2022-01-15", status: "Active",
    address: "56, Connaught Place, Delhi 110001",
    tickets: [],
    orderHistory: ["ORD-1008"],
  },
  {
    id: "C009", name: "Lakshmi Rao", email: "lakshmi@example.com", phone: "+91 10987 65432",
    orders: 9, totalSpend: 52100, segment: "Regular", joined: "2023-09-20", status: "Active",
    address: "78, Indiranagar, Bangalore, Karnataka 560038",
    tickets: [],
    orderHistory: ["ORD-1009"],
  },
  {
    id: "C010", name: "Sunita Verma", email: "sunita@example.com", phone: "+91 09876 54321",
    orders: 14, totalSpend: 89300, segment: "VIP", joined: "2023-02-08", status: "Active",
    address: "90, Civil Lines, Jaipur, Rajasthan 302006",
    tickets: [
      { id: "T006", subject: "Refund not processed", status: "Open", date: "2025-07-12" },
    ],
    orderHistory: ["ORD-1010"],
  },
];
