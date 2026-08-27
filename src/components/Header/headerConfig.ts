import type { CategoryConfig, CategoryConfigMap, TabCategory } from "./types";

export const STATIC_LINKS = [
  { name: "Personal Care", href: "personalcare" },
  { name: "Clothing", href: "clothing" },
  { name: "Accessories", href: "accessories" },
  { name: "Health, Fitness & Wellness", href: "other" },
  { name: "Tech & Gadgets", href: "gadgets" },
] as const;

export const HOME_LINKS = [
  { name: "Soft Furnishings and Textiles", href: "furniture" },
  { name: "Decorative Accessories", href: "decoration" },
  { name: "Kitchen and Diningware", href: "accessories" },
  { name: "Appliances", href: "appliances" },
] as const;

export const CATEGORY_CONFIG: CategoryConfigMap = {
  Men: {
    essentialLabel: "MEN'S ESSENTIAL",
    types: STATIC_LINKS,
    brands: ["Nike", "Adidas", "Zara", "Uniqlo", "New Balance"],
  },
  Women: {
    essentialLabel: "WOMEN'S ESSENTIAL",
    types: STATIC_LINKS,
    brands: ["Nike", "Adidas", "Zara", "Uniqlo", "New Balance"],
  },
  Kids: {
    essentialLabel: "KID'S ESSENTIAL",
    types: STATIC_LINKS,
    brands: ["Nike", "Adidas", "Zara", "Uniqlo", "New Balance"],
  },
  Homewares: {
    essentialLabel: "HOMEWARE'S ESSENTIAL",
    types: HOME_LINKS,
    brands: ["Midea", "Panasonic", "Haier", "Whirlpool", "Breville"],
  },
};

export function getCategoryConfig(category: TabCategory): CategoryConfig {
  return CATEGORY_CONFIG[category];
}
