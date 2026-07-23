export const products = [
  {
    id: "P001", name: "Silk Saree - Royal Blue", category: "Sarees", subcategory: "Silk",
    price: 4999, stock: 23, status: "Active", image: "https://placehold.co/80x80/145C3E/D4AF37?text=SS",
    description: "Elegant royal blue silk saree with golden border.", rating: 4.5, reviews: 34,
    variants: [{ color: "Royal Blue" }, { color: "Maroon" }, { color: "Emerald" }],
  },
  {
    id: "P002", name: "Cotton Kurti - Floral", category: "Kurtis", subcategory: "Cotton",
    price: 899, stock: 5, status: "Low Stock", image: "https://placehold.co/80x80/145C3E/D4AF37?text=CK",
    description: "Breathable cotton kurti with floral print.", rating: 4.2, reviews: 18,
    variants: [{ size: "S" }, { size: "M" }, { size: "L" }, { size: "XL" }],
  },
  {
    id: "P003", name: "Banarasi Saree - Gold", category: "Sarees", subcategory: "Banarasi",
    price: 8500, stock: 12, status: "Active", image: "https://placehold.co/80x80/145C3E/D4AF37?text=BS",
    description: "Authentic Banarasi saree with intricate gold weaving.", rating: 4.8, reviews: 62,
    variants: [{ color: "Gold" }, { color: "Red" }],
  },
  {
    id: "P004", name: "Chiffon Dupatta - Pink", category: "Dupattas", subcategory: "Chiffon",
    price: 499, stock: 0, status: "Out of Stock", image: "https://placehold.co/80x80/145C3E/D4AF37?text=CD",
    description: "Light chiffon dupatta in pastel pink.", rating: 3.9, reviews: 11,
    variants: [{ color: "Pink" }, { color: "Lavender" }],
  },
  {
    id: "P005", name: "Lehenga Set - Bridal", category: "Lehengas", subcategory: "Bridal",
    price: 24999, stock: 7, status: "Active", image: "https://placehold.co/80x80/145C3E/D4AF37?text=LS",
    description: "Bridal lehenga with embroidered choli and dupatta.", rating: 4.9, reviews: 89,
    variants: [{ color: "Red & Gold" }, { size: "S-XL custom" }],
  },
  {
    id: "P006", name: "Anarkali Suit - Emerald", category: "Suits", subcategory: "Anarkali",
    price: 3200, stock: 18, status: "Active", image: "https://placehold.co/80x80/145C3E/D4AF37?text=AS",
    description: "Flowing emerald green anarkali with gold detailing.", rating: 4.4, reviews: 27,
    variants: [{ size: "S" }, { size: "M" }, { size: "L" }],
  },
  {
    id: "P007", name: "Georgette Saree - Purple", category: "Sarees", subcategory: "Georgette",
    price: 2100, stock: 3, status: "Low Stock", image: "https://placehold.co/80x80/145C3E/D4AF37?text=GS",
    description: "Soft georgette saree in deep purple with sequin border.", rating: 4.1, reviews: 15,
    variants: [{ color: "Purple" }, { color: "Navy" }],
  },
  {
    id: "P008", name: "Designer Blouse - Embroidered", category: "Blouses", subcategory: "Designer",
    price: 1499, stock: 31, status: "Active", image: "https://placehold.co/80x80/145C3E/D4AF37?text=DB",
    description: "Heavily embroidered designer blouse for special occasions.", rating: 4.6, reviews: 43,
    variants: [{ size: "32" }, { size: "34" }, { size: "36" }, { size: "38" }],
  },
  {
    id: "P009", name: "Palazzo Set - Rayon", category: "Kurtis", subcategory: "Palazzo Set",
    price: 1299, stock: 22, status: "Active", image: "https://placehold.co/80x80/145C3E/D4AF37?text=PS",
    description: "Comfortable rayon palazzo set with printed top.", rating: 4.0, reviews: 9,
    variants: [{ size: "S" }, { size: "M" }, { size: "L" }, { size: "XL" }],
  },
  {
    id: "P010", name: "Sharara Set - Festive", category: "Sharara", subcategory: "Festive",
    price: 5800, stock: 9, status: "Active", image: "https://placehold.co/80x80/145C3E/D4AF37?text=SH",
    description: "Festive sharara set with mirror work and tassels.", rating: 4.7, reviews: 38,
    variants: [{ color: "Yellow" }, { color: "Peach" }],
  },
  {
    id: "P011", name: "Net Saree - Party Wear", category: "Sarees", subcategory: "Net",
    price: 3600, stock: 14, status: "Active", image: "https://placehold.co/80x80/145C3E/D4AF37?text=NS",
    description: "Glittery net saree perfect for parties.", rating: 4.3, reviews: 22,
    variants: [{ color: "Silver" }, { color: "Gold" }, { color: "Rose" }],
  },
  {
    id: "P012", name: "Linen Kurti - Casual", category: "Kurtis", subcategory: "Linen",
    price: 699, stock: 0, status: "Out of Stock", image: "https://placehold.co/80x80/145C3E/D4AF37?text=LK",
    description: "Casual linen kurti for everyday wear.", rating: 3.8, reviews: 7,
    variants: [{ size: "M" }, { size: "L" }, { size: "XL" }],
  },
];

export const categories = [
  {
    id: "C001", name: "Sarees", count: 4,
    subcategories: ["Silk", "Banarasi", "Georgette", "Net", "Chiffon"],
  },
  {
    id: "C002", name: "Kurtis", count: 3,
    subcategories: ["Cotton", "Palazzo Set", "Linen", "Printed"],
  },
  {
    id: "C003", name: "Lehengas", count: 1,
    subcategories: ["Bridal", "Party Wear", "Kids"],
  },
  {
    id: "C004", name: "Suits", count: 1,
    subcategories: ["Anarkali", "Salwar Kameez", "Patiala"],
  },
  {
    id: "C005", name: "Dupattas", count: 1,
    subcategories: ["Chiffon", "Cotton", "Silk"],
  },
  {
    id: "C006", name: "Blouses", count: 1,
    subcategories: ["Designer", "Plain", "Printed"],
  },
  {
    id: "C007", name: "Sharara", count: 1,
    subcategories: ["Festive", "Casual"],
  },
];
