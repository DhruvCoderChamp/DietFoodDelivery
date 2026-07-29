import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CATEGORY_DEFINITIONS,
  groupProductsByCategory,
  normalizeCategory,
  selectedCountForCategory,
} from './categories.js';

test('normalizes legacy category values', () => {
  assert.equal(normalizeCategory('Protein Bowl'), 'bowls');
  assert.equal(normalizeCategory('Smoothie'), 'smoothies');
  assert.equal(normalizeCategory('Eggitarian'), 'eggitarian');
});

test('groups only available products in the approved order', () => {
  const groups = groupProductsByCategory([
    { id: 1, name: 'Combo', category: 'combos', isAvailable: true },
    { id: 2, name: 'Bowl', category: 'Protein Bowl', isAvailable: true },
    { id: 3, name: 'Hidden', category: 'Breakfast', isAvailable: false },
  ]);

  assert.deepEqual(groups.map(group => group.id), ['combos', 'bowls']);
  assert.deepEqual(groups.find(group => group.id === 'bowls').items.map(item => item.name), ['Bowl']);
  assert.deepEqual(CATEGORY_DEFINITIONS.map(category => category.id), [
    'veg',
    'non-veg',
    'eggs',
    'breakfast',
    'lunch',
    'dinner',
    'juices',
    'protein-shakes',
    'oatmeal-bowls',
    'salad-bowls',
    'rice-bowls',
    'combos',
    'bowls',
    'smoothies',
    'eggitarian',
  ]);
});

test('counts selected items for a category including quantities', () => {
  const products = [
    { name: 'Fruit Bowl', category: 'bowls' },
    { name: 'Protein Bowl', category: 'Protein Bowl' },
  ];
  const mealPlan = {
    Monday: ['Fruit Bowl', 'Fruit Bowl'],
    Tuesday: ['Protein Bowl'],
  };

  assert.equal(selectedCountForCategory('bowls', products, mealPlan), 3);
});

test('groups egg-related items under eggitarian category regardless of main category', () => {
  const products = [
    { name: 'Oatmeal & Eggs', category: 'combos', tags: ['high-protein'] },
    { name: 'Plain Toast', category: 'breakfast', tags: ['veg'] },
    { name: 'Egg White Omelette', category: 'breakfast', tags: ['eggitarian'] },
  ];
  
  const groups = groupProductsByCategory(products);
  const eggitarianGroup = groups.find(g => g.id === 'eggitarian');
  
  assert.ok(eggitarianGroup);
  assert.deepEqual(
    eggitarianGroup.items.map(i => i.name),
    ['Oatmeal & Eggs', 'Egg White Omelette']
  );
});

test('groups products based on tags for bowls and smoothies', () => {
  const products = [
    { name: 'Oatmeal Bowl', category: 'breakfast', tags: ['bowl'] },
    { name: 'Green Mix', category: 'breakfast', tags: ['smoothie'] },
  ];

  const groups = groupProductsByCategory(products);
  const bowlsGroup = groups.find(g => g.id === 'bowls');
  const smoothiesGroup = groups.find(g => g.id === 'smoothies');

  assert.ok(bowlsGroup);
  assert.ok(smoothiesGroup);
  assert.deepEqual(bowlsGroup.items.map(i => i.name), ['Oatmeal Bowl']);
  assert.deepEqual(smoothiesGroup.items.map(i => i.name), ['Green Mix']);
});
