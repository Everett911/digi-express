export type TabCategory = "Men" | "Women" | "Kids" | "Homewares";

export interface NavLink {
  name: string;
  href: string;
}

export interface CategoryConfig {
  essentialLabel: string;
  types: readonly NavLink[];
  brands: readonly string[];
}

export type CategoryConfigMap = Record<TabCategory, CategoryConfig>;
