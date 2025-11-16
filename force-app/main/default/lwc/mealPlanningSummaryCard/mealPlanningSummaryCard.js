import { LightningElement, api, wire, track } from 'lwc';
import getDashboardData from '@salesforce/apex/HolisticDashboardController.getDashboardData';

export default class MealPlanningSummaryCard extends LightningElement {
    @api dateRange;
    @track isLoading = false;
    @track error;
    @track mealsPlanned = 0;
    @track mealsCompleted = 0;
    @track savingsAmount = 0;
    @track shoppingItems = 0;
    @track progressPercent = 0;
    @track weekMealHighlights = [];

    @wire(getDashboardData)
    wiredDashboardData({ error, data }) {
        this.isLoading = false;

        if (data) {
            this.error = null;
            this.processMealPlanningData(data.mealPlanning, data.shopping);
            this.processWeekMeals(data.thisWeekMeals);
        } else if (error) {
            this.error = error.body ? error.body.message : 'Error loading meal planning data';
            console.error('Error loading dashboard data:', error);
        }
    }

    connectedCallback() {
        this.isLoading = true;
    }

    processMealPlanningData(mealData, shoppingData) {
        if (!mealData) return;

        this.mealsPlanned = mealData.plannedMealsThisWeek || 0;
        this.mealsCompleted = mealData.completedMealsThisWeek || 0;

        if (shoppingData) {
            this.savingsAmount = (shoppingData.estimatedSavings || 0).toFixed(2);
            this.shoppingItems = shoppingData.itemsOnLists || 0;
        }

        // Calculate progress
        const total = mealData.totalMealsThisWeek || 21;
        this.progressPercent = total > 0 ? Math.round((this.mealsCompleted / total) * 100) : 0;
    }

    processWeekMeals(meals) {
        if (!meals || meals.length === 0) return;

        // Get first 3 meals as highlights
        this.weekMealHighlights = meals.slice(0, 3).map(meal => ({
            id: meal.id,
            name: meal.mealName,
            day: meal.dayOfWeek,
            mealTime: meal.mealTime
        }));
    }

    get showProgress() {
        return this.mealsPlanned > 0;
    }

    get hasMealsThisWeek() {
        return this.weekMealHighlights && this.weekMealHighlights.length > 0;
    }
}
