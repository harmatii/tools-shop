const CATEGORIES = [
  {
    name: "Новинки",
    href: "/new",
  },
  {
    name: "Чоловіче",
    href: "/category/men",
    items: [
      { name: "Кросівки", href: "/category/men/shoes" },
      { name: "Одяг", href: "/category/men/clothing" },
      { name: "Аксесуари", href: "/category/men/accessories" },
    ],
  },
  {
    name: "Жіноче",
    href: "/category/women",
    items: [
      { name: "Кросівки", href: "/category/women/shoes" },
      { name: "Одяг", href: "/category/women/clothing" },
      { name: "Аксесуари", href: "/category/women/accessories" },
    ],
  },
  {
    name: "Дитяче",
    href: "/category/kids",
    items: [
      { name: "Хлопчики", href: "/category/kids/boys" },
      { name: "Дівчатка", href: "/category/kids/girls" },
    ],
  },
  {
    name: "Аксесуари",
    href: "/category/accessories",
  },
  {
    name: "Бренди",
    href: "/brands",
  },
  {
    name: "Колекції",
    href: "/collections",
  },
  {
    name: "Розпродаж",
    href: "/sale",
  },
];

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const CategoryNav = () => {
  return (
    <nav className="w-full border-b bg-white">
      <div className="wrapper">
        <NavigationMenu>
          <NavigationMenuList className="flex-wrap">
            {CATEGORIES.map((category) => (
              <NavigationMenuItem key={category.name}>
                {category.items ? (
                  <>
                    <NavigationMenuTrigger className="bg-transparent">
                      {category.name}
                    </NavigationMenuTrigger>

                    <NavigationMenuContent>
                      <div className="grid min-w-[220px] gap-2 p-4">
                        {category.items.map((item) => (
                          <NavigationMenuLink asChild key={item.name}>
                            <Link
                              href={item.href}
                              className="rounded-md px-3 py-2 text-sm hover:bg-muted"
                            >
                              {item.name}
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink asChild>
                    <Link
                      href={category.href}
                      className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {category.name}
                    </Link>
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
};

export default CategoryNav;
