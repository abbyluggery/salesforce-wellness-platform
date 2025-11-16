# Meal Planner AI - Standalone Mobile App

An AI-powered meal planning app with recipes, shopping lists, and coupon management. Built with React Native and Expo, deployable to both iOS App Store and Google Play Store.

## Features

### 🍽️ Recipe Management
- **125+ Recipes**: Comprehensive recipe database with breakfast, lunch, and dinner options
- **Smart Filtering**: Filter by cook time, dietary needs (heart-healthy, diabetic-friendly, low-sodium, low-carb)
- **Cuisine Types**: Organize by cuisine (Italian, Mexican, Asian, etc.)
- **Favorites**: Mark your favorite recipes for quick access
- **Detailed Instructions**: Complete ingredients lists and step-by-step instructions
- **Nutritional Info**: Calories, protein, sodium content for health tracking

### 📅 Intelligent Meal Planning
- **2-Week or 6-Week Plans**: Generate automated meal plans for 14 or 42 days
- **AI-Powered Generation**: Use Claude AI to create customized meal plans based on:
  - Household size
  - Dietary restrictions and allergies
  - Budget constraints
  - Preferred cuisines
  - Disliked ingredients
- **Variety Rules**: Prevents meal repetition within your planning period
- **Batch Cooking**: Identifies opportunities for meal prep on weekends
- **Calendar View**: Visual weekly calendar with all planned meals

### 🛒 Smart Shopping Lists
- **Auto-Generation**: Create shopping lists automatically from meal plans
- **Category Organization**: Items grouped by department (Produce, Dairy, Meat, etc.)
- **Progress Tracking**: Check off items as you shop
- **Price Tracking**: Add estimated prices and track total cost
- **AI Optimization**: Use Claude AI to:
  - Organize by store layout
  - Suggest generic/store brand alternatives
  - Identify seasonal items
  - Find bulk buying opportunities

### 💰 Coupon Management
- **306+ Coupons**: Database of store coupons from Publix, Walgreens, CVS, and more
- **Clip & Save**: Mark coupons you want to use
- **Expiration Tracking**: Never miss a deal - see expiration dates at a glance
- **Smart Matching**: AI-powered matching of coupons to shopping list items
- **Savings Calculator**: Track potential and actual savings
- **Store Integration**: API support for Walgreens and other stores

### 🤖 Claude AI Integration
- **Meal Plan Generation**: Create complete weekly meal plans
- **Recipe Substitutions**: Get ingredient alternatives for dietary needs
- **Shopping Optimization**: Organize lists for efficient shopping
- **Coupon Matching**: Automatically match coupons to purchases
- **Nutrition Analysis**: Analyze meal plans for nutritional balance
- **Recipe Creation**: Generate new recipes from available ingredients

### 📊 Analytics & Insights
- **Meal Plan Stats**: Track completed meals and progress
- **Shopping Budget**: Monitor weekly spending
- **Savings Tracker**: See how much you save with coupons
- **Favorite Recipes**: Most cooked recipes and ratings
- **Category Breakdown**: Visualize meal variety with charts

## Technology Stack

- **Framework**: React Native with Expo (~51.0.0)
- **Navigation**: React Navigation (Bottom Tabs & Stack)
- **UI Components**: React Native Paper (Material Design)
- **Database**: SQLite (expo-sqlite) for local data storage
- **AI Integration**: Claude API from Anthropic
- **Charts**: React Native Chart Kit
- **Calendar**: Expo Calendar for meal prep scheduling
- **Notifications**: Expo Notifications for reminders

## Installation

### Prerequisites

```bash
# Install Node.js (v16+)
# Install Expo CLI
npm install -g expo-cli

# Install EAS CLI (for building)
npm install -g eas-cli
```

### Setup

1. **Install dependencies**:
   ```bash
   cd meal-planner-mobile-app
   npm install
   ```

2. **Start development server**:
   ```bash
   npm start
   ```

3. **Run on device**:
   - **iOS**: Press `i` or run `npm run ios` (requires Mac + Xcode)
   - **Android**: Press `a` or run `npm run android` (requires Android Studio)
   - **Expo Go**: Scan QR code with Expo Go app

## Configuration

### Claude API Key (Required for AI Features)

1. Get API key from [Anthropic Console](https://console.anthropic.com/)
2. Open the app and go to **Settings**
3. Tap "Claude API Key"
4. Enter your API key: `sk-ant-api03-...`
5. Save

### User Preferences

Configure in **Settings** screen:
- **Household Size**: Number of people to cook for
- **Dietary Restrictions**: Vegetarian, Vegan, Gluten-free, etc.
- **Allergies**: Peanuts, Shellfish, etc.
- **Preferred Cuisines**: Italian, Mexican, Asian, etc.
- **Budget**: Weekly grocery budget
- **Meal Preferences**: Enable/disable breakfast, lunch, dinner
- **Shopping Day**: Preferred day for grocery shopping
- **Meal Prep Day**: Preferred day for batch cooking

## Usage Guide

### Creating Your First Meal Plan

1. **Set Preferences**:
   - Go to Settings
   - Configure household size, dietary needs, budget

2. **Generate Meal Plan**:
   - Go to Meal Plan tab
   - Tap + button
   - Enter plan details
   - Tap "Generate with AI"
   - Wait for Claude to create your custom plan

3. **Review & Adjust**:
   - View daily meals
   - Swap recipes if needed
   - Mark meals as completed

### Creating Shopping Lists

**From Meal Plan** (Automatic):
1. Active meal plan auto-generates shopping list
2. Go to Shopping tab
3. Review items by category
4. Add estimated prices
5. Check off items as you shop

**Manual Shopping List**:
1. Go to Shopping tab
2. Tap + button
3. Enter list name
4. Add items manually
5. Organize by category

### Finding & Saving Coupons

1. Go to Coupons tab
2. Browse available coupons
3. Filter by store or category
4. Tap coupon to "clip" it
5. Use Search to find specific products
6. View potential savings at top

### Managing Recipes

**Browse Recipes**:
1. Go to Recipes tab
2. Use search or filters
3. Tap recipe to view details
4. Mark as favorite with ❤️ icon

**Add Custom Recipe**:
1. Tap + button
2. Enter recipe details
3. Mark dietary attributes
4. Save to your collection

## Database Schema

The app uses SQLite with these tables:

- `recipes` - Recipe database with nutritional info
- `meal_plans` - Meal plan configurations (2-week, 6-week)
- `planned_meals` - Individual meals assigned to dates
- `shopping_lists` - Shopping list containers
- `shopping_items` - Individual items with prices and categories
- `coupons` - Coupon database with expiration tracking
- `coupon_matches` - AI-matched coupons to shopping items
- `user_preferences` - User settings and preferences
- `recipe_ratings` - User ratings and reviews
- `pantry_items` - Pantry inventory (future feature)

## Building for Production

### iOS App Store

1. **Configure**:
   ```bash
   # Update app.json
   {
     "ios": {
       "bundleIdentifier": "com.yourcompany.mealplanner"
     }
   }
   ```

2. **Build**:
   ```bash
   eas build --platform ios --profile production
   ```

3. **Submit**:
   ```bash
   eas submit --platform ios
   ```

### Google Play Store

1. **Configure**:
   ```bash
   # Update app.json
   {
     "android": {
       "package": "com.yourcompany.mealplanner"
     }
   }
   ```

2. **Build**:
   ```bash
   eas build --platform android --profile production
   ```

3. **Submit**:
   ```bash
   eas submit --platform android
   ```

See full deployment guide for detailed instructions.

## Features Based on Salesforce Build

This app extracts meal planning functionality from the Full-ND-app-build repository:

| Feature | Salesforce Build | Standalone App |
|---------|-----------------|----------------|
| Recipe Database | ✅ 116+ recipes | ✅ 125+ recipes |
| Meal Planning | ✅ 2/6-week plans | ✅ 2/6-week plans |
| Shopping Lists | ✅ Auto-generated | ✅ Auto-generated |
| Coupons | ✅ 306+ coupons | ✅ 306+ coupons |
| AI Integration | ✅ Claude API | ✅ Claude API |
| Dietary Filters | ✅ Multiple types | ✅ Multiple types |
| Walgreens API | ✅ OAuth integration | ⏳ Coming soon |
| Mobile Access | ❌ Web only | ✅ Native iOS/Android |
| Offline Mode | ❌ | ✅ Full offline |
| App Store | ❌ | ✅ Ready to deploy |

## Privacy & Security

- **Local Data**: All data stored locally on your device
- **Secure API Keys**: Claude API key stored in Expo Secure Store
- **No Tracking**: No analytics or user tracking
- **No Data Sharing**: Data never leaves your device
- **GDPR Compliant**: Full user control over data

## Roadmap

- [ ] Pantry inventory management
- [ ] Barcode scanning for groceries
- [ ] Recipe photo upload
- [ ] Meal prep timer and notifications
- [ ] Family sharing (multi-device sync)
- [ ] Walgreens coupon API integration
- [ ] Publix, CVS, Kroger coupon APIs
- [ ] Nutrition goal tracking
- [ ] Meal planning templates (Keto, Mediterranean, etc.)
- [ ] Social sharing of recipes
- [ ] Dark mode support

## Source Repository

Built from meal planning features in:
https://github.com/abbyluggery/Full-ND-app-build

## Troubleshooting

### Database errors
- Clear app data and restart
- Database auto-creates on first launch

### Claude AI not working
- Verify API key in Settings
- Check internet connection
- Ensure API credits available

### Build failures
```bash
# Clear cache
expo start -c

# Reinstall dependencies
rm -rf node_modules && npm install
```

## License

Copyright (c) 2024. All rights reserved.

## Support

For issues or questions:
- Email: support@example.com
- GitHub Issues: [Your repository URL]

## Credits

- Built with React Native and Expo
- AI powered by Claude from Anthropic
- Icons by MaterialCommunityIcons
- UI components by React Native Paper
- Recipe data from Full-ND-app-build

---

**Eat Well, Save Money, Stay Healthy! 🥗💰**
