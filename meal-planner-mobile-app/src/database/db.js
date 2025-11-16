import * as SQLite from 'expo-sqlite';

let db = null;

export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync('mealplanner.db');

    // Create tables
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        cook_time INTEGER,
        prep_time INTEGER,
        servings INTEGER DEFAULT 4,
        calories INTEGER,
        protein REAL,
        sodium INTEGER,
        ingredients TEXT NOT NULL,
        instructions TEXT NOT NULL,
        image_url TEXT,
        is_favorite BOOLEAN DEFAULT 0,
        is_heart_healthy BOOLEAN DEFAULT 0,
        is_diabetic_friendly BOOLEAN DEFAULT 0,
        is_low_sodium BOOLEAN DEFAULT 0,
        is_low_carb BOOLEAN DEFAULT 0,
        cuisine_type TEXT,
        difficulty TEXT,
        last_used_date DATE,
        use_count INTEGER DEFAULT 0,
        notes TEXT,
        source TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS meal_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        number_of_people INTEGER DEFAULT 2,
        plan_type TEXT DEFAULT '2-week',
        is_active BOOLEAN DEFAULT 1,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS planned_meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        meal_plan_id INTEGER NOT NULL,
        recipe_id INTEGER NOT NULL,
        meal_date DATE NOT NULL,
        meal_type TEXT NOT NULL,
        is_completed BOOLEAN DEFAULT 0,
        servings INTEGER,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (meal_plan_id) REFERENCES meal_plans (id) ON DELETE CASCADE,
        FOREIGN KEY (recipe_id) REFERENCES recipes (id)
      );

      CREATE TABLE IF NOT EXISTS shopping_lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        meal_plan_id INTEGER,
        week_start_date DATE,
        is_completed BOOLEAN DEFAULT 0,
        total_estimated_cost REAL DEFAULT 0,
        total_savings REAL DEFAULT 0,
        store_preference TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (meal_plan_id) REFERENCES meal_plans (id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS shopping_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shopping_list_id INTEGER NOT NULL,
        recipe_id INTEGER,
        item_name TEXT NOT NULL,
        quantity TEXT,
        unit TEXT,
        category TEXT,
        estimated_price REAL,
        is_purchased BOOLEAN DEFAULT 0,
        aisle TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (shopping_list_id) REFERENCES shopping_lists (id) ON DELETE CASCADE,
        FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS coupons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        store TEXT NOT NULL,
        product_name TEXT NOT NULL,
        discount_type TEXT,
        discount_value REAL,
        description TEXT,
        category TEXT,
        expiration_date DATE,
        coupon_code TEXT,
        clip_url TEXT,
        is_clipped BOOLEAN DEFAULT 0,
        is_used BOOLEAN DEFAULT 0,
        min_purchase_amount REAL,
        max_discount_amount REAL,
        external_coupon_id TEXT,
        api_source TEXT,
        terms TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS coupon_matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shopping_item_id INTEGER NOT NULL,
        coupon_id INTEGER NOT NULL,
        match_score REAL DEFAULT 0,
        is_applied BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (shopping_item_id) REFERENCES shopping_items (id) ON DELETE CASCADE,
        FOREIGN KEY (coupon_id) REFERENCES coupons (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS user_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        household_size INTEGER DEFAULT 2,
        dietary_restrictions TEXT,
        allergies TEXT,
        preferred_cuisines TEXT,
        disliked_ingredients TEXT,
        budget_per_week REAL,
        preferred_stores TEXT,
        meal_prep_day TEXT DEFAULT 'Sunday',
        shopping_day TEXT DEFAULT 'Saturday',
        breakfast_enabled BOOLEAN DEFAULT 1,
        lunch_enabled BOOLEAN DEFAULT 1,
        dinner_enabled BOOLEAN DEFAULT 1,
        claude_api_key TEXT,
        notifications_enabled BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS recipe_ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER NOT NULL,
        rating INTEGER CHECK(rating >= 1 AND rating <= 5),
        review TEXT,
        would_make_again BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS pantry_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_name TEXT NOT NULL,
        quantity TEXT,
        unit TEXT,
        category TEXT,
        purchase_date DATE,
        expiration_date DATE,
        location TEXT,
        is_staple BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return db;
};

// Recipe queries
export const saveRecipe = async (recipeData) => {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO recipes (name, category, cook_time, prep_time, servings, calories, protein, sodium,
     ingredients, instructions, is_heart_healthy, is_diabetic_friendly, is_low_sodium, is_low_carb,
     cuisine_type, difficulty, image_url, source)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      recipeData.name,
      recipeData.category,
      recipeData.cookTime,
      recipeData.prepTime,
      recipeData.servings || 4,
      recipeData.calories,
      recipeData.protein,
      recipeData.sodium,
      recipeData.ingredients,
      recipeData.instructions,
      recipeData.isHeartHealthy ? 1 : 0,
      recipeData.isDiabeticFriendly ? 1 : 0,
      recipeData.isLowSodium ? 1 : 0,
      recipeData.isLowCarb ? 1 : 0,
      recipeData.cuisineType,
      recipeData.difficulty,
      recipeData.imageUrl,
      recipeData.source
    ]
  );
  return result.lastInsertRowId;
};

export const getRecipes = async (filters = {}) => {
  const db = getDatabase();
  let query = 'SELECT * FROM recipes WHERE 1=1';
  const params = [];

  if (filters.category) {
    query += ' AND category = ?';
    params.push(filters.category);
  }

  if (filters.maxCookTime) {
    query += ' AND cook_time <= ?';
    params.push(filters.maxCookTime);
  }

  if (filters.isHeartHealthy) {
    query += ' AND is_heart_healthy = 1';
  }

  if (filters.isDiabeticFriendly) {
    query += ' AND is_diabetic_friendly = 1';
  }

  if (filters.isLowSodium) {
    query += ' AND is_low_sodium = 1';
  }

  if (filters.isFavorite) {
    query += ' AND is_favorite = 1';
  }

  if (filters.cuisineType) {
    query += ' AND cuisine_type = ?';
    params.push(filters.cuisineType);
  }

  query += ' ORDER BY name ASC';

  const result = await db.getAllAsync(query, params);
  return result;
};

export const updateRecipe = async (id, updates) => {
  const db = getDatabase();
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(updates), id];

  await db.runAsync(
    `UPDATE recipes SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    values
  );
};

export const toggleFavorite = async (id) => {
  const db = getDatabase();
  await db.runAsync(
    'UPDATE recipes SET is_favorite = NOT is_favorite WHERE id = ?',
    [id]
  );
};

// Meal Plan queries
export const createMealPlan = async (planData) => {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO meal_plans (name, start_date, end_date, number_of_people, plan_type, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      planData.name,
      planData.startDate,
      planData.endDate,
      planData.numberOfPeople || 2,
      planData.planType || '2-week',
      planData.notes
    ]
  );
  return result.lastInsertRowId;
};

export const getMealPlans = async () => {
  const db = getDatabase();
  const result = await db.getAllAsync(
    'SELECT * FROM meal_plans ORDER BY start_date DESC'
  );
  return result;
};

export const getActiveMealPlan = async () => {
  const db = getDatabase();
  const result = await db.getFirstAsync(
    'SELECT * FROM meal_plans WHERE is_active = 1 ORDER BY start_date DESC LIMIT 1'
  );
  return result;
};

export const addPlannedMeal = async (mealData) => {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO planned_meals (meal_plan_id, recipe_id, meal_date, meal_type, servings, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      mealData.mealPlanId,
      mealData.recipeId,
      mealData.mealDate,
      mealData.mealType,
      mealData.servings,
      mealData.notes
    ]
  );
  return result.lastInsertRowId;
};

export const getPlannedMeals = async (mealPlanId) => {
  const db = getDatabase();
  const result = await db.getAllAsync(
    `SELECT pm.*, r.name as recipe_name, r.cook_time, r.category, r.image_url
     FROM planned_meals pm
     JOIN recipes r ON pm.recipe_id = r.id
     WHERE pm.meal_plan_id = ?
     ORDER BY pm.meal_date, pm.meal_type`,
    [mealPlanId]
  );
  return result;
};

export const getPlannedMealsByDateRange = async (startDate, endDate) => {
  const db = getDatabase();
  const result = await db.getAllAsync(
    `SELECT pm.*, r.name as recipe_name, r.cook_time, r.category, r.image_url
     FROM planned_meals pm
     JOIN recipes r ON pm.recipe_id = r.id
     JOIN meal_plans mp ON pm.meal_plan_id = mp.id
     WHERE mp.is_active = 1 AND pm.meal_date BETWEEN ? AND ?
     ORDER BY pm.meal_date, pm.meal_type`,
    [startDate, endDate]
  );
  return result;
};

// Shopping List queries
export const createShoppingList = async (listData) => {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO shopping_lists (name, meal_plan_id, week_start_date, store_preference, notes)
     VALUES (?, ?, ?, ?, ?)`,
    [
      listData.name,
      listData.mealPlanId,
      listData.weekStartDate,
      listData.storePreference,
      listData.notes
    ]
  );
  return result.lastInsertRowId;
};

export const getShoppingLists = async () => {
  const db = getDatabase();
  const result = await db.getAllAsync(
    'SELECT * FROM shopping_lists ORDER BY created_at DESC'
  );
  return result;
};

export const addShoppingItem = async (itemData) => {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO shopping_items (shopping_list_id, recipe_id, item_name, quantity, unit, category, estimated_price, aisle)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      itemData.shoppingListId,
      itemData.recipeId,
      itemData.itemName,
      itemData.quantity,
      itemData.unit,
      itemData.category,
      itemData.estimatedPrice,
      itemData.aisle
    ]
  );
  return result.lastInsertRowId;
};

export const getShoppingItems = async (shoppingListId) => {
  const db = getDatabase();
  const result = await db.getAllAsync(
    `SELECT * FROM shopping_items
     WHERE shopping_list_id = ?
     ORDER BY category, item_name`,
    [shoppingListId]
  );
  return result;
};

export const toggleItemPurchased = async (itemId) => {
  const db = getDatabase();
  await db.runAsync(
    'UPDATE shopping_items SET is_purchased = NOT is_purchased WHERE id = ?',
    [itemId]
  );
};

// Coupon queries
export const saveCoupon = async (couponData) => {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO coupons (store, product_name, discount_type, discount_value, description, category,
     expiration_date, coupon_code, clip_url, min_purchase_amount, external_coupon_id, api_source)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      couponData.store,
      couponData.productName,
      couponData.discountType,
      couponData.discountValue,
      couponData.description,
      couponData.category,
      couponData.expirationDate,
      couponData.couponCode,
      couponData.clipUrl,
      couponData.minPurchaseAmount,
      couponData.externalCouponId,
      couponData.apiSource
    ]
  );
  return result.lastInsertRowId;
};

export const getCoupons = async (filters = {}) => {
  const db = getDatabase();
  let query = 'SELECT * FROM coupons WHERE expiration_date >= date("now")';
  const params = [];

  if (filters.store) {
    query += ' AND store = ?';
    params.push(filters.store);
  }

  if (filters.category) {
    query += ' AND category = ?';
    params.push(filters.category);
  }

  if (filters.isClipped !== undefined) {
    query += ' AND is_clipped = ?';
    params.push(filters.isClipped ? 1 : 0);
  }

  query += ' ORDER BY expiration_date ASC';

  const result = await db.getAllAsync(query, params);
  return result;
};

export const toggleCouponClipped = async (id) => {
  const db = getDatabase();
  await db.runAsync(
    'UPDATE coupons SET is_clipped = NOT is_clipped WHERE id = ?',
    [id]
  );
};

// User Preferences
export const getUserPreferences = async () => {
  const db = getDatabase();
  const result = await db.getFirstAsync('SELECT * FROM user_preferences LIMIT 1');
  return result;
};

export const saveUserPreferences = async (prefData) => {
  const db = getDatabase();
  const existing = await getUserPreferences();

  if (existing) {
    const fields = Object.keys(prefData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(prefData), existing.id];
    await db.runAsync(
      `UPDATE user_preferences SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
  } else {
    const fields = Object.keys(prefData).join(', ');
    const placeholders = Object.keys(prefData).map(() => '?').join(', ');
    await db.runAsync(
      `INSERT INTO user_preferences (${fields}) VALUES (${placeholders})`,
      Object.values(prefData)
    );
  }
};

// Analytics
export const getMealPlanStats = async (mealPlanId) => {
  const db = getDatabase();

  const totalMeals = await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM planned_meals WHERE meal_plan_id = ?',
    [mealPlanId]
  );

  const completedMeals = await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM planned_meals WHERE meal_plan_id = ? AND is_completed = 1',
    [mealPlanId]
  );

  const byCategory = await db.getAllAsync(
    `SELECT r.category, COUNT(*) as count
     FROM planned_meals pm
     JOIN recipes r ON pm.recipe_id = r.id
     WHERE pm.meal_plan_id = ?
     GROUP BY r.category`,
    [mealPlanId]
  );

  return {
    total: totalMeals?.count || 0,
    completed: completedMeals?.count || 0,
    byCategory: byCategory || []
  };
};

export const getShoppingListStats = async (shoppingListId) => {
  const db = getDatabase();

  const totalItems = await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM shopping_items WHERE shopping_list_id = ?',
    [shoppingListId]
  );

  const purchasedItems = await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM shopping_items WHERE shopping_list_id = ? AND is_purchased = 1',
    [shoppingListId]
  );

  const totalCost = await db.getFirstAsync(
    'SELECT SUM(estimated_price) as total FROM shopping_items WHERE shopping_list_id = ?',
    [shoppingListId]
  );

  return {
    totalItems: totalItems?.count || 0,
    purchasedItems: purchasedItems?.count || 0,
    totalCost: totalCost?.total || 0
  };
};
