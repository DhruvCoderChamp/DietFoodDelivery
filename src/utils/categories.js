export const CATEGORY_DEFINITIONS = [
  { id: 'bowls', label: 'Bowls' },
  { id: 'smoothies', label: 'Smoothies' },
  { id: 'combos', label: 'Combos' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'eggitarian', label: 'Eggitarian' },
];

const CATEGORY_ALIASES = {
  bowl: 'bowls',
  bowls: 'bowls',
  'protein bowl': 'bowls',
  smoothie: 'smoothies',
  smoothies: 'smoothies',
  combo: 'combos',
  combos: 'combos',
  breakfast: 'breakfast',
  eggitarian: 'eggitarian',
};

export const normalizeCategory = value => {
  const normalized = String(value || '').trim().toLowerCase();
  return CATEGORY_ALIASES[normalized] || normalized;
};

export const groupProductsByCategory = (products, searchTerm = '') => {
  const search = searchTerm.trim().toLowerCase();
  return CATEGORY_DEFINITIONS.map(category => ({
    ...category,
    items: products.filter(product => (
      product.isAvailable !== false
      && normalizeCategory(product.category) === category.id
      && (!search || product.name.toLowerCase().includes(search))
    )),
  })).filter(group => group.items.length > 0);
};

export const selectedCountForCategory = (categoryId, products, mealPlan) => {
  const productNames = new Set(
    products
      .filter(product => normalizeCategory(product.category) === categoryId)
      .map(product => product.name),
  );

  return Object.values(mealPlan)
    .flat()
    .filter(meal => productNames.has(meal))
    .length;
};
