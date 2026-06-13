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

  assert.deepEqual(groups.map(group => group.id), ['bowls', 'combos']);
  assert.deepEqual(groups[0].items.map(item => item.name), ['Bowl']);
  assert.deepEqual(CATEGORY_DEFINITIONS.map(category => category.id), [
    'bowls',
    'smoothies',
    'combos',
    'breakfast',
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
