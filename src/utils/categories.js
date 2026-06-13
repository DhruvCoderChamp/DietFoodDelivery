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
    items: products.filter(product => {
      const isAvailable = product.isAvailable !== false;
      const isMatchingSearch = !search || product.name.toLowerCase().includes(search);
      
      const normalizedCat = normalizeCategory(product.category);
      let isInCategory = normalizedCat === category.id;
      
      if (category.id === 'eggitarian') {
        const hasEggName = product.name.toLowerCase().includes('egg');
        const hasEggTag = product.tags && product.tags.some(t => t.toLowerCase().includes('egg') || t.toLowerCase() === 'eggitarian');
        const hasEggDesc = product.description && product.description.toLowerCase().includes('egg');
        if (hasEggName || hasEggTag || hasEggDesc) {
          isInCategory = true;
        }
      }
      
      return isAvailable && isMatchingSearch && isInCategory;
    }),
  })).filter(group => group.items.length > 0);
};

export const selectedCountForCategory = (categoryId, products, mealPlan) => {
  const productNames = new Set(
    products
      .filter(product => {
        const normalizedCat = normalizeCategory(product.category);
        let isInCategory = normalizedCat === categoryId;
        if (categoryId === 'eggitarian') {
          const hasEggName = product.name.toLowerCase().includes('egg');
          const hasEggTag = product.tags && product.tags.some(t => t.toLowerCase().includes('egg') || t.toLowerCase() === 'eggitarian');
          const hasEggDesc = product.description && product.description.toLowerCase().includes('egg');
          if (hasEggName || hasEggTag || hasEggDesc) {
            isInCategory = true;
          }
        }
        return isInCategory;
      })
      .map(product => product.name),
  );

  return Object.values(mealPlan)
    .flat()
    .filter(meal => productNames.has(meal))
    .length;
};
