export const CATEGORY_DEFINITIONS = [
  { id: 'veg', label: 'Veg' },
  { id: 'non-veg', label: 'Non veg' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'juices', label: 'Juices' },
  { id: 'protein-shakes', label: 'Protein shakes' },
  { id: 'oatmeal-bowls', label: 'Oatmeal bowls' },
  { id: 'salad-bowls', label: 'Salad bowls' },
  { id: 'rice-bowls', label: 'Rice bowls' },
  { id: 'combos', label: 'Combos' },
  { id: 'bowls', label: 'Bowls' },
  { id: 'smoothies', label: 'Smoothies' },
  { id: 'eggitarian', label: 'Eggitarian' },
];

export const PRETTY_LABELS = {
  'veg': 'Veg',
  'non-veg': 'Non veg',
  'eggs': 'Eggs',
  'breakfast': 'Breakfast',
  'lunch': 'Lunch',
  'dinner': 'Dinner',
  'juices': 'Juices',
  'protein-shakes': 'Protein shakes',
  'oatmeal-bowls': 'Oatmeal bowls',
  'salad-bowls': 'Salad bowls',
  'rice-bowls': 'Rice bowls',
  'combos': 'Combos',
  'bowls': 'Bowls',
  'smoothies': 'Smoothies',
  'eggitarian': 'Eggitarian'
};

const CATEGORY_ALIASES = {
  veg: 'veg',
  'non-veg': 'non-veg',
  non_veg: 'non-veg',
  eggs: 'eggs',
  egg: 'eggs',
  breakfast: 'breakfast',
  lunch: 'lunch',
  dinner: 'dinner',
  juices: 'juices',
  juice: 'juices',
  'protein shakes': 'protein-shakes',
  'protein-shakes': 'protein-shakes',
  'oatmeal bowls': 'oatmeal-bowls',
  'oatmeal-bowls': 'oatmeal-bowls',
  'salad bowls': 'salad-bowls',
  'salad-bowls': 'salad-bowls',
  'rice bowls': 'rice-bowls',
  'rice-bowls': 'rice-bowls',
  combos: 'combos',
  combo: 'combos',
  bowls: 'bowls',
  bowl: 'bowls',
  smoothies: 'smoothies',
  smoothie: 'smoothies',
  eggitarian: 'eggitarian',
};

export const normalizeCategory = value => {
  const normalized = String(value || '').trim().toLowerCase();
  
  // 1. Check direct aliases first to preserve specific categories
  if (CATEGORY_ALIASES[normalized]) {
    return CATEGORY_ALIASES[normalized];
  }
  
  // 2. Generic fallback rules for custom inputs
  if (normalized.includes('oatmeal') && normalized.includes('bowl')) return 'oatmeal-bowls';
  if (normalized.includes('salad') && normalized.includes('bowl')) return 'salad-bowls';
  if (normalized.includes('rice') && normalized.includes('bowl')) return 'rice-bowls';
  if (normalized.includes('bowl')) return 'bowls';
  
  if (normalized.includes('protein') && normalized.includes('shake')) return 'protein-shakes';
  if (normalized.includes('smoothie') || normalized.includes('shake')) return 'smoothies';
  
  if (normalized.includes('combo') || normalized.includes('mix') || normalized.includes('platter')) return 'combos';
  if (normalized.includes('egg')) return 'eggs';
  if (normalized.includes('juice')) return 'juices';
  
  if (
    normalized.includes('breakfast') || 
    normalized.includes('drink') || 
    normalized.includes('beverage') || 
    normalized.includes('morning') || 
    normalized.includes('tea') || 
    normalized.includes('coffee')
  ) {
    return 'breakfast';
  }

  return normalized;
};

export const isProductInCategory = (product, categoryId) => {
  const normalizedCat = normalizeCategory(product.category);
  if (normalizedCat === categoryId) return true;

  if (product.tags && Array.isArray(product.tags)) {
    const hasMatchingTag = product.tags.some(tag => {
      const normalizedTag = normalizeCategory(tag);
      return normalizedTag === categoryId || (categoryId === 'eggs' && tag.toLowerCase().includes('egg'));
    });
    if (hasMatchingTag) return true;
  }

  if (categoryId === 'eggs' || categoryId === 'eggitarian') {
    const hasEggName = product.name.toLowerCase().includes('egg');
    const hasEggDesc = product.description && product.description.toLowerCase().includes('egg');
    if (hasEggName || hasEggDesc) return true;
  }

  return false;
};

export const groupProductsByCategory = (products, searchTerm = '') => {
  const search = searchTerm.trim().toLowerCase();
  
  // Start with default definitions
  const categories = [...CATEGORY_DEFINITIONS];

  // Collect other categories dynamically from products
  products.forEach(product => {
    if (!product.category) return;
    const norm = normalizeCategory(product.category);
    if (!categories.some(cat => cat.id === norm)) {
      const label = PRETTY_LABELS[norm] || (product.category.trim().charAt(0).toUpperCase() + product.category.trim().slice(1));
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

  return Object.values(mealPlan || {})
    .flat()
    .filter(meal => productNames.has(meal))
    .length;
};
