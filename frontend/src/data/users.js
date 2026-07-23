export const adminUsers = [
  {
    id: "U001", name: "Gowtham Raj", email: "gowtham@aeux.com", role: "Super Admin",
    status: "Active", avatar: "GR", lastLogin: "2025-07-17 09:00",
  },
  {
    id: "U002", name: "Anitha Krishnan", email: "anitha@aeux.com", role: "Manager",
    status: "Active", avatar: "AK", lastLogin: "2025-07-17 08:30",
  },
  {
    id: "U003", name: "Ramesh Kumar", email: "ramesh@aeux.com", role: "Support Staff",
    status: "Active", avatar: "RK", lastLogin: "2025-07-16 17:45",
  },
  {
    id: "U004", name: "Suma Devi", email: "suma@aeux.com", role: "Manager",
    status: "Inactive", avatar: "SD", lastLogin: "2025-07-10 11:20",
  },
  {
    id: "U005", name: "Vikram Nair", email: "vikram@aeux.com", role: "Support Staff",
    status: "Active", avatar: "VN", lastLogin: "2025-07-17 10:15",
  },
];

export const roles = ["Super Admin", "Manager", "Support Staff"];

export const permissions = {
  categories: ["Products", "Orders", "Customers", "Shipping", "Reviews", "CMS", "Users & Roles", "Settings"],
  matrix: {
    "Super Admin": {
      Products: { view: true, create: true, edit: true, delete: true },
      Orders: { view: true, create: true, edit: true, delete: true },
      Customers: { view: true, create: true, edit: true, delete: true },
      Shipping: { view: true, create: true, edit: true, delete: true },
      Reviews: { view: true, create: true, edit: true, delete: true },
      CMS: { view: true, create: true, edit: true, delete: true },
      "Users & Roles": { view: true, create: true, edit: true, delete: true },
      Settings: { view: true, create: true, edit: true, delete: true },
    },
    "Manager": {
      Products: { view: true, create: true, edit: true, delete: false },
      Orders: { view: true, create: true, edit: true, delete: false },
      Customers: { view: true, create: false, edit: true, delete: false },
      Shipping: { view: true, create: true, edit: true, delete: false },
      Reviews: { view: true, create: false, edit: true, delete: false },
      CMS: { view: true, create: true, edit: true, delete: false },
      "Users & Roles": { view: true, create: false, edit: false, delete: false },
      Settings: { view: true, create: false, edit: false, delete: false },
    },
    "Support Staff": {
      Products: { view: true, create: false, edit: false, delete: false },
      Orders: { view: true, create: false, edit: true, delete: false },
      Customers: { view: true, create: false, edit: false, delete: false },
      Shipping: { view: true, create: false, edit: false, delete: false },
      Reviews: { view: true, create: false, edit: true, delete: false },
      CMS: { view: false, create: false, edit: false, delete: false },
      "Users & Roles": { view: false, create: false, edit: false, delete: false },
      Settings: { view: false, create: false, edit: false, delete: false },
    },
  },
};
