export const adminUsers = [];

export const roles = ["Super Admin", "Manager", "Support Staff"];

export const permissions = {
  categories: ["Products", "Orders", "Customers", "Reviews", "CMS", "Users & Roles", "Settings"],
  matrix: {
    "Super Admin": {
      Products: { view: true, create: true, edit: true, delete: true },
      Orders: { view: true, create: true, edit: true, delete: true },
      Customers: { view: true, create: true, edit: true, delete: true },
      Reviews: { view: true, create: true, edit: true, delete: true },
      CMS: { view: true, create: true, edit: true, delete: true },
      "Users & Roles": { view: true, create: true, edit: true, delete: true },
      Settings: { view: true, create: true, edit: true, delete: true },
    },
    "Manager": {
      Products: { view: true, create: true, edit: true, delete: false },
      Orders: { view: true, create: true, edit: true, delete: false },
      Customers: { view: true, create: false, edit: true, delete: false },
      Reviews: { view: true, create: false, edit: true, delete: false },
      CMS: { view: true, create: true, edit: true, delete: false },
      "Users & Roles": { view: true, create: false, edit: false, delete: false },
      Settings: { view: true, create: false, edit: false, delete: false },
    },
    "Support Staff": {
      Products: { view: true, create: false, edit: false, delete: false },
      Orders: { view: true, create: false, edit: true, delete: false },
      Customers: { view: true, create: false, edit: false, delete: false },
      Reviews: { view: true, create: false, edit: true, delete: false },
      CMS: { view: false, create: false, edit: false, delete: false },
      "Users & Roles": { view: false, create: false, edit: false, delete: false },
      Settings: { view: false, create: false, edit: false, delete: false },
    },
  },
};
