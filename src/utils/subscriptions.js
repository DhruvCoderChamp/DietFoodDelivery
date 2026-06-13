export const buildSubscriptionPayload = ({
  userId,
  selectedPlan,
  mealPlan,
  deliveryArea,
  address,
  deliverySlot,
}) => ({
  userId,
  planType: String(selectedPlan),
  status: 'ACTIVE',
  deliverySlot,
  deliveryArea,
  address: address.trim(),
  mealsJson: JSON.stringify(mealPlan),
  remainingDays: Number(selectedPlan),
});

export const formatMealsForReport = mealsJson => {
  if (!mealsJson) return '';

  try {
    const mealPlan = JSON.parse(mealsJson);
    return Object.entries(mealPlan)
      .map(([day, meals]) => `${day}: ${Array.isArray(meals) && meals.length ? meals.join(', ') : 'No selection'}`)
      .join('; ');
  } catch {
    return mealsJson;
  }
};
