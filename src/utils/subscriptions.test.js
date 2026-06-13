import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSubscriptionPayload, formatMealsForReport } from './subscriptions.js';

test('builds the subscription API payload', () => {
  const payload = buildSubscriptionPayload({
    userId: 9,
    selectedPlan: 14,
    mealPlan: { Monday: ['Fruit Bowl'] },
    deliveryArea: 'Whitefield',
    address: '12 Main Road',
    deliverySlot: '7:00 AM - 8:00 AM',
  });

  assert.deepEqual(payload, {
    userId: 9,
    planType: '14',
    status: 'ACTIVE',
    deliverySlot: '7:00 AM - 8:00 AM',
    deliveryArea: 'Whitefield',
    address: '12 Main Road',
    mealsJson: '{"Monday":["Fruit Bowl"]}',
    remainingDays: 14,
  });
});

test('formats meals JSON for spreadsheet reports', () => {
  assert.equal(
    formatMealsForReport('{"Monday":["Fruit Bowl","Smoothie"],"Tuesday":[]}'),
    'Monday: Fruit Bowl, Smoothie; Tuesday: No selection',
  );
});

test('keeps malformed historical meal data readable', () => {
  assert.equal(formatMealsForReport('legacy meal notes'), 'legacy meal notes');
  assert.equal(formatMealsForReport(''), '');
});
