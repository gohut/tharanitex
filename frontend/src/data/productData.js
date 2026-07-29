import sareeModel1 from "../../public/assets/products/saree_model1.jpg";
import sareeModel2 from "../../public/assets/products/saree_model2.jpg";
import sareeModel3 from "../../public/assets/products/saree_model3.jpg";
import sareeModel4 from "../../public/assets/products/saree_model4.jpg";
import sareeModel5 from "../../public/assets/products/saree_model5.jpg";

export const productData = {
  id: 1,

  name: "UNSTITCHED HALF SAREE MATERIAL GOLDEN BEIGE WITH PINK",

  category: "Wedding Collections",

  price: 1910,

  originalPrice: 2490,

  rating: 4.5,

  totalReviews: 83,

  sku: "TH-HSM-001",

  description:
    "Beautiful unstitched half saree material crafted with premium quality fabric, perfect for weddings and festive occasions.",

  images: [
    sareeModel1,
    sareeModel2,
    sareeModel3,
    sareeModel4,
    sareeModel5
  ],

  specifications: {
    Fabric: "Art Silk",
    Border: "Zari Woven",
    Blouse: "Included",
    Occasion: "Wedding",
    Color: "Golden Beige with Pink",
    Wash: "Dry Clean Only",
  },

  reviews: [
    {
      id: 1,
      name: "Sangeetha R",
      rating: 5,
      date: "2 days ago",
      comment:
        "Absolutely loved the material! The fabric is soft and the colour work is outstanding.",
    },
    {
      id: 2,
      name: "Anitha M",
      rating: 5,
      date: "5 days ago",
      comment:
        "Exactly as shown in the photos. Premium quality and elegant finish.",
    },
    {
      id: 3,
      name: "Priya S",
      rating: 4,
      date: "1 week ago",
      comment:
        "Beautiful collection. Delivery was quick and the packaging was excellent.",
    },
    {
      id: 4,
      name: "Lakshmi V",
      rating: 5,
      date: "2 weeks ago",
      comment:
        "Perfect for wedding functions. Highly recommended.",
    },
  ],
  relatedProducts: [
  {
    id: 2,
    name: "Royal Banarasi Silk Saree",
    price: 2490,
    rating: 4.8,
    image: sareeModel2,
  },
  {
    id: 3,
    name: "Kanchipuram Wedding Saree",
    price: 3290,
    rating: 4.9,
    image: sareeModel3,
  },
  {
    id: 4,
    name: "Soft Silk Designer Saree",
    price: 2790,
    rating: 4.7,
    image: sareeModel4,
  },
  {
    id: 5,
    name: "Traditional Cotton Saree",
    price: 1990,
    rating: 4.6,
    image: sareeModel1,
  },
]
};