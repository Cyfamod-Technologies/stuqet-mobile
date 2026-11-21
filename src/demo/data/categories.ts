import type { CategoryNode } from "~/features/seller-products/types";

function node(
  id: number,
  name: string,
  parent: CategoryNode | null,
): CategoryNode {
  const created: CategoryNode = {
    id,
    parent_id: parent?.id ?? 0,
    level: parent ? parent.level + 1 : 0,
    name,
    child: [],
  };
  parent?.child.push(created);
  return created;
}

function build(): CategoryNode[] {
  const roots: CategoryNode[] = [];
  const root = (id: number, name: string) => {
    const created = node(id, name, null);
    roots.push(created);
    return created;
  };

  const electronics = root(1, "Electronics");
  node(11, "Phones & accessories", electronics);
  node(12, "Audio", electronics);
  node(13, "Power & chargers", electronics);

  const fashion = root(2, "Fashion");
  node(21, "Shoes", fashion);
  node(22, "Bags", fashion);
  node(23, "Clothing", fashion);

  const school = root(3, "School & office");
  node(31, "Notebooks & stationery", school);
  node(32, "Study supplies", school);

  const home = root(4, "Home & living");
  node(41, "Lighting", home);
  node(42, "Kitchen & drinkware", home);

  const food = root(5, "Food & drinks");
  node(51, "Rice dishes", food);
  node(52, "Soups & swallow", food);
  node(53, "Grills & suya", food);
  node(54, "Snacks & pastries", food);
  node(55, "Drinks & smoothies", food);

  const services = root(6, "Services");
  node(61, "Repairs", services);
  node(62, "Tutoring & lessons", services);
  node(63, "Photography", services);
  node(64, "Printing", services);
  node(65, "Tailoring", services);
  node(66, "Laundry", services);

  return roots;
}

/** Category tree of GET /seller/products/categories. */
export const CATEGORY_TREE: CategoryNode[] = build();

function flat(nodes: CategoryNode[]): CategoryNode[] {
  return nodes.flatMap((n) => [n, ...flat(n.child)]);
}

export function categoryName(id: number): string {
  return flat(CATEGORY_TREE).find((n) => n.id === id)?.name ?? "Uncategorised";
}
