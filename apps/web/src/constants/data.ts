export interface NavItem {
  id?: number;
  _id?: string;
  title: string;
  href: string;
  subItems?: NavItem[];
  isMega?: boolean;
  megaData?: MegaMenuColumn[];
}

export interface MegaMenuColumn {
  id?: number;
  _id?: string;
  title: string;
  items: {
    id?: number;
    _id?: string;
    title: string;
    href: string;
  }[];
}

export const navData: NavItem[] = [
  {
    id: 1,
    title: "Home",
    href: "/",
    subItems: [
      { id: 11, title: "Home 1", href: "/" },
      { id: 12, title: "Home 2", href: "/home-2" },
    ],
  },
  {
    id: 2,
    title: "About Us",
    href: "/about",
  },
  {
    id: 3,
    title: "Shop",
    href: "#",
    subItems: [
      {
        id: 31,
        title: "Product Details",
        href: "#",
        subItems: [
          { id: 311, title: "Product Details 1", href: "#" },
          { id: 312, title: "Product Details 2", href: "#" },
          { id: 313, title: "Product Details 3", href: "#" },
        ],
      },
      {
        id: 32,
        title: "Shop - Wishlist",
        href: "#",
        subItems: [
          { id: 321, title: "Wishlist 1", href: "#" },
          { id: 322, title: "Wishlist 2", href: "#" },
        ],
      },
      {
        id: 33,
        title: "Shop - Cart",
        href: "#",
        subItems: [
          { id: 331, title: "Cart 1", href: "#" },
          { id: 332, title: "Cart 2", href: "#" },
        ],
      },
      { id: 34, title: "Shop - Checkout", href: "#" },
      { id: 35, title: "Shop - Order Success", href: "/order-successful" },
      { id: 36, title: "Shop - Compare", href: "/compare" },
    ],
  },
  {
    id: 4,
    title: "Sellers",
    href: "#",
  },
  {
    id: 5,
    title: "Mega Menu",
    href: "#",
    isMega: true,
    megaData: [
      {
        id: 51,
        title: "SHOP GRID",
        items: [
          { id: 511, title: "3 Columns (Left Filter)", href: "#" },
          { id: 512, title: "4 Columns (Left Filter)", href: "#" },
          { id: 513, title: "5 Columns (Left Filter)", href: "#" },
        ],
      },
      {
        id: 52,
        title: "GRID WITH BANNER",
        items: [
          { id: 521, title: "3 Columns (Left Filter)", href: "#" },
          { id: 522, title: "4 Columns (Left Filter)", href: "#" },
          { id: 523, title: "5 Columns (Left Filter)", href: "#" },
        ],
      },
      {
        id: 53,
        title: "FULL WIDTH LAYOUT",
        items: [
          { id: 531, title: "Grid - 3 Columns (Banner)", href: "#" },
          { id: 532, title: "Grid - 4 Columns (Banner)", href: "#" },
          { id: 533, title: "Grid - 5 Columns (Banner)", href: "#" },
          { id: 534, title: "Grid - 6 Columns (Banner)", href: "#" },
        ],
      },
      {
        id: 54,
        title: "Horizontal filter",
        items: [
          { id: 541, title: "Grid - 3 Columns (Banner)", href: "#" },
          { id: 542, title: "Grid - 4 Columns (Banner)", href: "#" },
          { id: 543, title: "Grid - 5 Columns (Banner)", href: "#" },
          { id: 544, title: "Grid - 6 Columns (Banner)", href: "#" },
        ],
      },
      {
        id: 55,
        title: "Top Banner",
        items: [
          { id: 551, title: "Grid - 3 Columns (Left Filter)", href: "#" },
          { id: 552, title: "Grid - 4 Columns (Left Filter)", href: "#" },
          { id: 553, title: "Grid - 5 Columns (Left Filter)", href: "#" },
          { id: 554, title: "List - 1 Column (Left Filter)", href: "#" },
          { id: 555, title: "List - 2 Columns (Left Filter)", href: "#" },
        ],
      },
      {
        id: 56,
        title: "Banner with filter",
        items: [
          { id: 561, title: "Grid - 3 Columns (Banner)", href: "#" },
          { id: 562, title: "Grid - 4 Columns (Banner)", href: "#" },
          { id: 563, title: "Grid - 5 Columns (Banner)", href: "#" },
          { id: 564, title: "Grid - 6 Columns (Banner)", href: "#" },
        ],
      },
    ],
  },
  {
    id: 6,
    title: "Blog",
    href: "#",
    subItems: [
      { id: 61, title: "Blog Grid", href: "#" },
      { id: 62, title: "Blog List", href: "#" },
      { id: 63, title: "Blog Details", href: "#" },
    ],
  },
  {
    id: 7,
    title: "Pages",
    href: "#",
    subItems: [
      { id: 71, title: "404 Page", href: "/404" },
      { id: 72, title: "Coming Soon", href: "/coming-soon" },
      { id: 73, title: "FAQ", href: "/faq" },
      { id: 74, title: "My Account", href: "/my-account" },
    ],
  },
  {
    id: 8,
    title: "Contact Us",
    href: "/contact",
  },
];
