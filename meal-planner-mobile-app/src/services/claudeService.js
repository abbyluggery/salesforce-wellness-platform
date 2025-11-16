import axios from 'axios';
import { getUserPreferences } from '../database/db';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_VERSION = '2023-06-01';

export const generateMealPlan = async (preferences) => {
  try {
    const userPrefs = await getUserPreferences();
    const apiKey = userPrefs?.claude_api_key;

    if (!apiKey) {
      throw new Error('Claude API key not configured. Please add it in Settings.');
    }

    const prompt = `Generate a ${preferences.duration}-day meal plan for ${preferences.numberOfPeople} people.

Preferences:
- Dietary restrictions: ${preferences.dietaryRestrictions || 'None'}
- Allergies: ${preferences.allergies || 'None'}
- Preferred cuisines: ${preferences.preferredCuisines || 'Any'}
- Disliked ingredients: ${preferences.dislikedIngredients || 'None'}
- Budget per week: $${preferences.budgetPerWeek || 'Flexible'}
- Meal types needed: ${preferences.mealTypes?.join(', ') || 'Breakfast, Lunch, Dinner'}

Requirements:
1. Variety - no repeated meals within ${preferences.duration} days
2. Balanced nutrition across the week
3. Mix of quick weeknight meals (≤30 min) and weekend meals (can be longer)
4. Consider batch cooking opportunities
5. Seasonal ingredients when possible

Please provide a meal plan in JSON format:
{
  "weeklyPlan": [
    {
      "day": "Monday",
      "date": "2024-01-01",
      "breakfast": { "name": "...", "cookTime": 15, "prepTime": 5 },
      "lunch": { "name": "...", "cookTime": 20, "prepTime": 10 },
      "dinner": { "name": "...", "cookTime": 30, "prepTime": 15 }
    },
    ...
  ],
  "shoppingList": {
    "produce": ["item 1", "item 2"],
    "proteins": ["item 1"],
    "dairy": ["item 1"],
    "pantry": ["item 1"],
    "other": ["item 1"]
  },
  "batchCookingTips": ["tip 1", "tip 2"],
  "estimatedWeeklyCost": 120
}`;

    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': CLAUDE_VERSION
        }
      }
    );

    const contentText = response.data.content[0].text;
    const jsonMatch = contentText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const mealPlan = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        mealPlan
      };
    }

    return {
      success: false,
      error: 'Failed to parse meal plan from AI response'
    };
  } catch (error) {
    console.error('Error generating meal plan:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate meal plan'
    };
  }
};

export const suggestRecipeSubstitutions = async (recipe, restrictions) => {
  try {
    const userPrefs = await getUserPreferences();
    const apiKey = userPrefs?.claude_api_key;

    if (!apiKey) {
      throw new Error('Claude API key not configured.');
    }

    const prompt = `Suggest ingredient substitutions for this recipe based on dietary restrictions:

Recipe: ${recipe.name}
Ingredients: ${recipe.ingredients}

Restrictions:
${restrictions.join('\n')}

Provide substitutions in JSON format:
{
  "substitutions": [
    {
      "original": "ingredient name",
      "substitute": "replacement",
      "reason": "why this works"
    }
  ],
  "modifiedRecipe": "full recipe with substitutions",
  "nutritionalImpact": "how this changes nutrition"
}`;

    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': CLAUDE_VERSION
        }
      }
    );

    const contentText = response.data.content[0].text;
    const jsonMatch = contentText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return {
        success: true,
        ...JSON.parse(jsonMatch[0])
      };
    }

    return { success: false, error: 'Failed to parse substitutions' };
  } catch (error) {
    console.error('Error suggesting substitutions:', error);
    return { success: false, error: error.message };
  }
};

export const optimizeShoppingList = async (shoppingItems, store) => {
  try {
    const userPrefs = await getUserPreferences();
    const apiKey = userPrefs?.claude_api_key;

    if (!apiKey) {
      throw new Error('Claude API key not configured.');
    }

    const itemsList = shoppingItems.map(item =>
      `${item.item_name} (${item.quantity} ${item.unit || ''})`
    ).join('\n');

    const prompt = `Optimize this shopping list for ${store || 'a typical grocery store'}:

${itemsList}

Please provide:
1. Organized by store aisle/department
2. Grouped similar items
3. Suggest generic/store brands for cost savings
4. Flag items that might be on sale this time of year
5. Suggest bulk buying opportunities

Format as JSON:
{
  "organizedList": {
    "Produce": ["item 1", "item 2"],
    "Meat/Seafood": ["item 1"],
    "Dairy": ["item 1"],
    "Pantry": ["item 1"],
    "Frozen": ["item 1"],
    "Other": ["item 1"]
  },
  "costSavingTips": ["tip 1", "tip 2"],
  "seasonalItems": ["item 1"],
  "bulkOpportunities": ["item 1"]
}`;

    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': CLAUDE_VERSION
        }
      }
    );

    const contentText = response.data.content[0].text;
    const jsonMatch = contentText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return {
        success: true,
        ...JSON.parse(jsonMatch[0])
      };
    }

    return { success: false, error: 'Failed to parse optimization' };
  } catch (error) {
    console.error('Error optimizing shopping list:', error);
    return { success: false, error: error.message };
  }
};

export const matchCouponsToItems = async (shoppingItems, availableCoupons) => {
  try {
    const userPrefs = await getUserPreferences();
    const apiKey = userPrefs?.claude_api_key;

    if (!apiKey) {
      throw new Error('Claude API key not configured.');
    }

    const itemsList = shoppingItems.map(item => item.item_name).join(', ');
    const couponsList = availableCoupons.map(c =>
      `${c.product_name}: ${c.discount_type} ${c.discount_value}`
    ).join('\n');

    const prompt = `Match these shopping items with available coupons:

Shopping Items:
${itemsList}

Available Coupons:
${couponsList}

Provide matches with confidence scores in JSON:
{
  "matches": [
    {
      "itemName": "shopping item",
      "couponProduct": "coupon product name",
      "matchConfidence": 0.95,
      "potentialSavings": 2.50,
      "reason": "why this matches"
    }
  ],
  "totalPotentialSavings": 15.50,
  "unusedCoupons": ["coupon 1", "coupon 2"]
}`;

    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': CLAUDE_VERSION
        }
      }
    );

    const contentText = response.data.content[0].text;
    const jsonMatch = contentText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return {
        success: true,
        ...JSON.parse(jsonMatch[0])
      };
    }

    return { success: false, error: 'Failed to parse coupon matches' };
  } catch (error) {
    console.error('Error matching coupons:', error);
    return { success: false, error: error.message };
  }
};

export const generateRecipeFromIngredients = async (availableIngredients) => {
  try {
    const userPrefs = await getUserPreferences();
    const apiKey = userPrefs?.claude_api_key;

    if (!apiKey) {
      throw new Error('Claude API key not configured.');
    }

    const prompt = `Create a recipe using these available ingredients:

${availableIngredients.join('\n')}

Generate a complete recipe in JSON format:
{
  "name": "Recipe Name",
  "description": "Brief description",
  "servings": 4,
  "prepTime": 10,
  "cookTime": 20,
  "difficulty": "Easy",
  "ingredients": [
    { "item": "ingredient 1", "amount": "1 cup", "fromAvailable": true },
    { "item": "ingredient 2", "amount": "2 tbsp", "fromAvailable": false }
  ],
  "instructions": [
    "Step 1",
    "Step 2"
  ],
  "tips": ["tip 1", "tip 2"],
  "nutrition": {
    "calories": 350,
    "protein": "25g",
    "carbs": "30g",
    "fat": "12g"
  }
}`;

    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': CLAUDE_VERSION
        }
      }
    );

    const contentText = response.data.content[0].text;
    const jsonMatch = contentText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return {
        success: true,
        recipe: JSON.parse(jsonMatch[0])
      };
    }

    return { success: false, error: 'Failed to parse recipe' };
  } catch (error) {
    console.error('Error generating recipe:', error);
    return { success: false, error: error.message };
  }
};

export const analyzeMealNutrition = async (meals) => {
  try {
    const userPrefs = await getUserPreferences();
    const apiKey = userPrefs?.claude_api_key;

    if (!apiKey) {
      throw new Error('Claude API key not configured.');
    }

    const mealsList = meals.map(m =>
      `${m.meal_type}: ${m.recipe_name}`
    ).join('\n');

    const prompt = `Analyze the nutritional balance of this day's meals:

${mealsList}

Provide analysis in JSON format:
{
  "overallRating": "Good/Fair/Needs Improvement",
  "strengths": ["strength 1", "strength 2"],
  "concerns": ["concern 1"],
  "recommendations": ["recommendation 1"],
  "macroBalance": {
    "protein": "adequate/low/high",
    "carbs": "adequate/low/high",
    "fats": "adequate/low/high"
  },
  "micronutrients": {
    "vitamins": ["vitamin A: good", "vitamin C: excellent"],
    "minerals": ["iron: adequate", "calcium: low"]
  },
  "suggestions": ["Add more vegetables", "Include a calcium source"]
}`;

    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': CLAUDE_VERSION
        }
      }
    );

    const contentText = response.data.content[0].text;
    const jsonMatch = contentText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return {
        success: true,
        analysis: JSON.parse(jsonMatch[0])
      };
    }

    return { success: false, error: 'Failed to parse nutrition analysis' };
  } catch (error) {
    console.error('Error analyzing nutrition:', error);
    return { success: false, error: error.message };
  }
};
