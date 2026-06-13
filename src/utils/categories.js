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
  
  if (normalized.includes('bowl')) return 'bowls';
  if (normalized.includes('smoothie') || normalized.includes('shake')) return 'smoothies';
  if (normalized.includes('combo') || normalized.includes('mix') || normalized.includes('platter')) return 'combos';
  if (normalized.includes('egg')) return 'eggitarian';
  if (
    normalized.includes('breakfast') || 
    normalized.includes('juice') || 
    normalized.includes('drink') || 
    normalized.includes('beverage') || 
    normalized.includes('morning') || 
    normalized.includes('tea') || 
    normalized.includes('coffee')
  ) {
    return 'breakfast';
  }

  return CATEGORY_ALIASES[normalized] || normalized;
};

export const isProductInCategory = (product, categoryId) => {
  const normalizedCat = normalizeCategory(product.category);
  if (normalizedCat === categoryId) return true;

  if (product.tags && Array.isArray(product.tags)) {
    const hasMatchingTag = product.tags.some(tag => {
      const normalizedTag = normalizeCategory(tag);
      return normalizedTag === categoryId || (categoryId === 'eggitarian' && tag.toLowerCase().includes('egg'));
    });
    if (hasMatchingTag) return true;
  }

  if (categoryId === 'eggitarian') {
    const hasEggName = product.name.toLowerCase().includes('egg');
    const hasEggDesc = product.description && product.description.toLowerCase().includes('egg');
    if (hasEggName || hasEggDesc) return true;
  }

  return false;
};

export const groupProductsByCategory = (products, searchTerm = '') => {
  const search = searchTerm.trim().toLowerCase();
  
  // Start with default definitions
  const categories = [
    { id: 'bowls', label: 'Bowls' },
    { id: 'smoothies', label: 'Smoothies' },
    { id: 'combos', label: 'Combos' },
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'eggitarian', label: 'Eggitarian' },
  ];

  // Collect other categories dynamically from products
  products.forEach(product => {
    if (!product.category) return;
    const norm = normalizeCategory(product.category);
    // If the category is not already in our definitions list, add it dynamically!
    if (!categories.some(cat => cat.id === norm)) {
      const label = product.category.trim().charAt(0).toUpperCase() + product.category.trim().slice(1);
      categories.push({ id: norm, label });
    }
  });

  return categories.map(category => ({
    ...category,
    items: products.filter(product => {
      const isAvailable = product.isAvailable !== false;
      const isMatchingSearch = !search || product.name.toLowerCase().includes(search);
      const isInCategory = isProductInCategory(product, category.id);
      return isAvailable && isMatchingSearch && isInCategory;
    }),
  })).filter(group => group.items.length > 0);
};

export const selectedCountForCategory = (categoryId, products, mealPlan) => {
  const productNames = new Set(
    products
      .filter(product => isProductInCategory(product, categoryId))
      .map(product => product.name),
  );

  return Object.values(mealPlan)
    .flat()
    .filter(meal => productNames.has(meal))
    .length;
};
