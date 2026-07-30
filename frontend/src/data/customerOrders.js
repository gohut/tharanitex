export const searchProducts = [
  {
    id: 1,
    name: "Kanchipuram Silk Saree",
    category: "Wedding Collections",
    price: "Rs. 15,990",
    image: "/assets/sarees/banaras1.png",
  },
  {
    id: 2,
    name: "Kanchipuram Silk Saree",
    category: "Wedding Collections",
    price: "Rs. 15,990",
    image: "/assets/sarees/kanchipuram.png",
  },
  {
    id: 3,
    name: "Kanchipuram Silk Saree",
    category: "Wedding Collections",
    price: "Rs. 15,990",
    image: "/assets/sarees/banaras2.png",
  },
  {
    id: 4,
    name: "Kanchipuram Silk Saree",
    category: "Wedding Collections",
    price: "Rs. 15,990",
    image: "/assets/sarees/thirubuvanam.png",
  },
  {
    id: 5,
    name: "Kanchipuram Silk Saree",
    category: "Wedding Collections",
    price: "Rs. 15,990",
    image: "/assets/sarees/banaras1.png",
  },
  {
    id: 6,
    name: "Kanchipuram Silk Saree",
    category: "Wedding Collections",
    price: "Rs. 15,990",
    image: "/assets/sarees/kanchipuram.png",
  },
  {
    id: 7,
    name: "Kanchipuram Silk Saree",
    category: "Wedding Collections",
    price: "Rs. 15,990",
    image: "/assets/sarees/banaras2.png",
  },
  {
    id: 8,
    name: "Kanchipuram Silk Saree",
    category: "Wedding Collections",
    price: "Rs. 15,990",
    image: "/assets/sarees/thirubuvanam.png",
  },
];

export const orderTabs = [
  "All Orders",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export const customerOrders = [
  {
    id: "ORD-240512-101",
    orderDate: "12 May 2024",
    placedOn: "Placed On 12 May 2024",
    productName: "Brocode Soft Silk Saree",
    variant: "Violet Kanchipuram",
    quantity: 1,
    itemPrice: "Rs. 3,450",
    totalAmount: "Rs. 3,450",
    image: "/assets/sarees/banaras2.png",
    status: "Delivered",
    statusLabel: "Delivered on 18 May 2024",
    cancellationLabel: "",
    trackingSteps: [
      {
        id: 1,
        title: "Order Placed",
        timestamp: "12 May 2024, 10:30 AM",
        complete: true,
      },
      {
        id: 2,
        title: "Order Confirmed",
        timestamp: "12 May 2024, 12:05 PM",
        complete: true,
      },
      {
        id: 3,
        title: "Shipped",
        timestamp: "14 May 2024, 09:15 AM",
        complete: true,
      },
      {
        id: 4,
        title: "Delivered",
        timestamp: "18 May 2024, 04:20 PM",
        complete: true,
      },
    ],
    shippingAddress: {
      name: "Sangeetha R",
      lines: [
        "7/21, Manjal pattinam, paramakudi",
        "Ramanathapuram - 623701",
        "Tamilnadu, India",
      ],
      phone: "+91 9344474088",
    },
    summary: {
      subtotal: "Rs. 1,320",
      shipping: "Rs. 100",
      discount: "-Rs. 200",
      total: "Rs. 1,220",
    },
  },
  {
    id: "ORD-240628-143",
    orderDate: "28 Jun 2024",
    placedOn: "Placed On 28 Jun 2024",
    productName: "Kanchipuram Bridal Saree",
    variant: "Ruby Gold Border",
    quantity: 1,
    itemPrice: "Rs. 15,990",
    totalAmount: "Rs. 15,990",
    image: "/assets/sarees/banaras1.png",
    status: "Processing",
    statusLabel: "Expected dispatch by 02 Jul 2024",
    cancellationLabel: "",
    trackingSteps: [
      {
        id: 1,
        title: "Order Placed",
        timestamp: "28 Jun 2024, 08:45 AM",
        complete: true,
      },
      {
        id: 2,
        title: "Processing",
        timestamp: "28 Jun 2024, 01:15 PM",
        complete: true,
      },
      {
        id: 3,
        title: "Packed",
        timestamp: "Pending",
        complete: false,
      },
      {
        id: 4,
        title: "Shipped",
        timestamp: "Pending",
        complete: false,
      },
    ],
    shippingAddress: {
      name: "Anitha M",
      lines: [
        "14, South Car Street",
        "Kumbakonam - 612001",
        "Tamilnadu, India",
      ],
      phone: "+91 9002233557",
    },
    summary: {
      subtotal: "Rs. 15,990",
      shipping: "Free",
      discount: "-Rs. 500",
      total: "Rs. 15,490",
    },
  },
  {
    id: "ORD-240701-204",
    orderDate: "01 Jul 2024",
    placedOn: "Placed On 01 Jul 2024",
    productName: "Pure Zari Wedding Saree",
    variant: "Temple Border Green",
    quantity: 2,
    itemPrice: "Rs. 8,250",
    totalAmount: "Rs. 16,500",
    image: "/assets/sarees/kanchipuram.png",
    status: "Shipped",
    statusLabel: "Arriving by 05 Jul 2024",
    cancellationLabel: "",
    trackingSteps: [
      {
        id: 1,
        title: "Order Placed",
        timestamp: "01 Jul 2024, 07:40 PM",
        complete: true,
      },
      {
        id: 2,
        title: "Confirmed",
        timestamp: "01 Jul 2024, 09:05 PM",
        complete: true,
      },
      {
        id: 3,
        title: "Shipped",
        timestamp: "03 Jul 2024, 11:35 AM",
        complete: true,
      },
      {
        id: 4,
        title: "Out for Delivery",
        timestamp: "Pending",
        complete: false,
      },
    ],
    shippingAddress: {
      name: "Priya S",
      lines: [
        "33, East Masi Street",
        "Madurai - 625001",
        "Tamilnadu, India",
      ],
      phone: "+91 9788899001",
    },
    summary: {
      subtotal: "Rs. 16,500",
      shipping: "Rs. 150",
      discount: "-Rs. 650",
      total: "Rs. 16,000",
    },
  },
  {
    id: "ORD-240415-088",
    orderDate: "15 Apr 2024",
    placedOn: "Placed On 15 Apr 2024",
    productName: "Festive Banarasi Silk Saree",
    variant: "Deep Maroon",
    quantity: 1,
    itemPrice: "Rs. 9,990",
    totalAmount: "Rs. 9,990",
    image: "/assets/sarees/banaras1.png",
    status: "Cancelled",
    statusLabel: "",
    cancellationLabel: "Cancelled on 16 Apr 2024",
    trackingSteps: [
      {
        id: 1,
        title: "Order Placed",
        timestamp: "15 Apr 2024, 02:20 PM",
        complete: true,
      },
      {
        id: 2,
        title: "Cancelled",
        timestamp: "16 Apr 2024, 09:10 AM",
        complete: true,
      },
    ],
    shippingAddress: {
      name: "Lakshmi V",
      lines: [
        "5, Rajaji Road",
        "Salem - 636007",
        "Tamilnadu, India",
      ],
      phone: "+91 9340011223",
    },
    summary: {
      subtotal: "Rs. 9,990",
      shipping: "Free",
      discount: "Rs. 0",
      total: "Rs. 9,990",
    },
  },
];

export function getOrdersByTab(tab) {
  if (!tab || tab === "All Orders") {
    return customerOrders;
  }

  return customerOrders.filter(
    (order) => order.status.toLowerCase() === tab.toLowerCase()
  );
}

export function getOrderById(orderId) {
  return customerOrders.find((order) => order.id === orderId);
}
