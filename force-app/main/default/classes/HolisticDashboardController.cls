/**
 * @description Apex controller for Holistic Life Dashboard
 * @author Abby Luggery / Claude Code Assistant
 * @date November 12, 2025
 */
public with sharing class HolisticDashboardController {

    /**
     * @description Main method to retrieve all dashboard data
     * @return DashboardData wrapper containing all platform statistics
     */
    @AuraEnabled(cacheable=true)
    public static DashboardData getDashboardData() {
        DashboardData data = new DashboardData();

        try {
            data.jobSearch = getJobSearchStats();
            data.upcomingInterviews = getUpcomingInterviews();
            data.mealPlanning = getMealPlanningStats();
            data.thisWeekMeals = getThisWeekMeals();
            data.shopping = getShoppingStats();
            data.wellness = getWellnessStats();
        } catch (Exception e) {
            System.debug('HolisticDashboardController: Error retrieving dashboard data: ' + e.getMessage());
            throw new AuraHandledException('Error loading dashboard: ' + e.getMessage());
        }

        return data;
    }

    /**
     * @description Get Job Search platform statistics
     */
    private static JobSearchStats getJobSearchStats() {
        JobSearchStats stats = new JobSearchStats();

        // Total jobs
        stats.totalJobs = [SELECT COUNT() FROM Job_Posting__c];

        // Applications this week
        Date weekStart = Date.today().toStartOfWeek();
        stats.applicationsThisWeek = [
            SELECT COUNT()
            FROM Job_Posting__c
            WHERE Application_Status__c IN ('Applied', 'Interview Scheduled', 'Interviewing')
            AND CreatedDate >= :weekStart
        ];

        // Jobs by stage
        AggregateResult[] statusCounts = [
            SELECT Application_Status__c, COUNT(Id) cnt
            FROM Job_Posting__c
            GROUP BY Application_Status__c
        ];

        for (AggregateResult ar : statusCounts) {
            String status = (String)ar.get('Application_Status__c');
            Integer count = (Integer)ar.get('cnt');

            if (status == 'Discovered') stats.jobsDiscovered = count;
            else if (status == 'Researching') stats.jobsResearching = count;
            else if (status == 'Applied' || status == 'Application Submitted') stats.jobsApplied = count;
            else if (status == 'Interview Scheduled' || status == 'Interviewing') stats.jobsInterviewing = count;
            else if (status == 'Offer' || status == 'Offer Received') stats.jobsOffers = count;
        }

        return stats;
    }

    /**
     * @description Get upcoming interviews
     */
    private static List<InterviewInfo> getUpcomingInterviews() {
        List<InterviewInfo> interviews = new List<InterviewInfo>();

        List<Job_Posting__c> upcomingJobs = [
            SELECT Id, Name, Company__c, Interview_Date__c
            FROM Job_Posting__c
            WHERE Interview_Date__c >= TODAY
            AND Application_Status__c IN ('Interview Scheduled', 'Interviewing')
            ORDER BY Interview_Date__c ASC
            LIMIT 5
        ];

        for (Job_Posting__c job : upcomingJobs) {
            InterviewInfo info = new InterviewInfo();
            info.id = job.Id;
            info.position = job.Name;
            info.company = job.Company__c;
            info.interviewDate = job.Interview_Date__c != null ?
                job.Interview_Date__c.format() : '';
            interviews.add(info);
        }

        return interviews;
    }

    /**
     * @description Get Meal Planning platform statistics
     */
    private static MealPlanningStats getMealPlanningStats() {
        MealPlanningStats stats = new MealPlanningStats();

        // Total recipes in system
        stats.totalMeals = [SELECT COUNT() FROM Meal__c];

        // Get active meal plan
        List<Weekly_Meal_Plan__c> activePlans = [
            SELECT Id, Week_Start_Date__c, Week_End_Date__c
            FROM Weekly_Meal_Plan__c
            WHERE Status__c = 'Active'
            ORDER BY Week_Start_Date__c DESC
            LIMIT 1
        ];

        if (!activePlans.isEmpty()) {
            Weekly_Meal_Plan__c activePlan = activePlans[0];
            stats.activePlanId = activePlan.Id;

            // Count meals for this week
            List<Planned_Meal__c> plannedMeals = [
                SELECT Id, Is_Completed__c
                FROM Planned_Meal__c
                WHERE Weekly_Meal_Plan__c = :activePlan.Id
            ];

            stats.plannedMealsThisWeek = plannedMeals.size();
            stats.totalMealsThisWeek = 21; // 7 days × 3 meals

            Integer completed = 0;
            for (Planned_Meal__c pm : plannedMeals) {
                if (pm.Is_Completed__c == true) {
                    completed++;
                }
            }
            stats.completedMealsThisWeek = completed;
        }

        return stats;
    }

    /**
     * @description Get this week's meal preview
     */
    private static List<MealInfo> getThisWeekMeals() {
        List<MealInfo> meals = new List<MealInfo>();

        // Get active meal plan
        List<Weekly_Meal_Plan__c> activePlans = [
            SELECT Id
            FROM Weekly_Meal_Plan__c
            WHERE Status__c = 'Active'
            ORDER BY Week_Start_Date__c DESC
            LIMIT 1
        ];

        if (!activePlans.isEmpty()) {
            List<Planned_Meal__c> plannedMeals = [
                SELECT Id, Meal__r.Name, Day_of_Week__c, Meal_Time__c, Is_Completed__c
                FROM Planned_Meal__c
                WHERE Weekly_Meal_Plan__c = :activePlans[0].Id
                ORDER BY Day_of_Week__c, Meal_Time__c
                LIMIT 21
            ];

            for (Planned_Meal__c pm : plannedMeals) {
                MealInfo info = new MealInfo();
                info.id = pm.Id;
                info.mealName = pm.Meal__r.Name;
                info.dayOfWeek = pm.Day_of_Week__c;
                info.mealTime = pm.Meal_Time__c;
                info.isCompleted = pm.Is_Completed__c != null ? pm.Is_Completed__c : false;
                meals.add(info);
            }
        }

        return meals;
    }

    /**
     * @description Get Shopping platform statistics
     */
    private static ShoppingStats getShoppingStats() {
        ShoppingStats stats = new ShoppingStats();

        // Lists with status Ready
        stats.listsReady = [
            SELECT COUNT()
            FROM Shopping_List__c
            WHERE Status__c = 'Ready'
        ];

        // Active coupons (not expired)
        stats.activeCoupons = [
            SELECT COUNT()
            FROM Store_Coupon__c
            WHERE Valid_To__c >= TODAY
        ];

        // Calculate estimated savings and items
        List<Shopping_List__c> readyLists = [
            SELECT Estimated_Cost__c, Savings_Amount__c,
                   Coupons_Applied_Count__c,
                   (SELECT Id FROM Shopping_List_Items__r)
            FROM Shopping_List__c
            WHERE Status__c = 'Ready'
        ];

        Decimal totalSavings = 0;
        Integer totalItems = 0;
        Boolean hasHighValue = false;
        Integer highValueCount = 0;
        Decimal highValueSavings = 0;

        for (Shopping_List__c sl : readyLists) {
            if (sl.Savings_Amount__c != null) {
                totalSavings += sl.Savings_Amount__c;

                // Check for high-value coupons
                if (sl.Savings_Amount__c >= 3.0 || sl.Coupons_Applied_Count__c >= 5) {
                    hasHighValue = true;
                    highValueCount += sl.Coupons_Applied_Count__c != null ?
                        Integer.valueOf(sl.Coupons_Applied_Count__c) : 0;
                    highValueSavings += sl.Savings_Amount__c;
                }
            }
            totalItems += sl.Shopping_List_Items__r.size();
        }

        stats.estimatedSavings = totalSavings;
        stats.itemsOnLists = totalItems;
        stats.hasHighValueCoupons = hasHighValue;
        stats.highValueCouponCount = highValueCount;
        stats.highValueSavings = highValueSavings;

        return stats;
    }

    /**
     * @description Get Wellness platform statistics
     */
    private static WellnessStats getWellnessStats() {
        WellnessStats stats = new WellnessStats();
        Date weekStart = Date.today().toStartOfWeek();

        // Today's wellness data
        List<Daily_Routine__c> todayRoutine = [
            SELECT Mood__c, Energy_Level_Morning__c, Energy_Level_Afternoon__c,
                   Energy_Level_Evening__c, Stress_Level__c,
                   Morning_Routine_Complete__c, Exercise_Completed__c
            FROM Daily_Routine__c
            WHERE Date__c = TODAY
            LIMIT 1
        ];

        if (!todayRoutine.isEmpty()) {
            Daily_Routine__c dr = todayRoutine[0];
            stats.todayMood = dr.Mood__c;
            // Use afternoon energy if available, otherwise morning, otherwise 0
            stats.todayEnergy = dr.Energy_Level_Afternoon__c != null ?
                Integer.valueOf(dr.Energy_Level_Afternoon__c) :
                (dr.Energy_Level_Morning__c != null ?
                    Integer.valueOf(dr.Energy_Level_Morning__c) : 0);
            stats.todayStress = dr.Stress_Level__c != null ?
                Integer.valueOf(dr.Stress_Level__c) : 0;
            stats.morningRoutineComplete = dr.Morning_Routine_Complete__c != null ?
                dr.Morning_Routine_Complete__c : false;
        }

        // This week's routines
        List<Daily_Routine__c> thisWeekRoutines = [
            SELECT Energy_Level_Morning__c, Energy_Level_Afternoon__c,
                   Energy_Level_Evening__c, Exercise_Completed__c
            FROM Daily_Routine__c
            WHERE Date__c >= :weekStart
        ];

        stats.routinesThisWeek = thisWeekRoutines.size();

        Integer exerciseDays = 0;
        Integer totalEnergyScore = 0;
        Integer energyReadings = 0;

        for (Daily_Routine__c dr : thisWeekRoutines) {
            if (dr.Exercise_Completed__c == true) {
                exerciseDays++;
            }
            // Average all available energy levels for the day
            if (dr.Energy_Level_Morning__c != null) {
                totalEnergyScore += Integer.valueOf(dr.Energy_Level_Morning__c);
                energyReadings++;
            }
            if (dr.Energy_Level_Afternoon__c != null) {
                totalEnergyScore += Integer.valueOf(dr.Energy_Level_Afternoon__c);
                energyReadings++;
            }
            if (dr.Energy_Level_Evening__c != null) {
                totalEnergyScore += Integer.valueOf(dr.Energy_Level_Evening__c);
                energyReadings++;
            }
        }

        stats.exerciseDaysThisWeek = exerciseDays;
        stats.avgMoodScore = energyReadings > 0 ?
            totalEnergyScore / energyReadings : 0;

        // Mood tracking metrics (new)
        List<Mood_Entry__c> weekMoodEntries = [
            SELECT Mood_Score__c, Energy_Score__c
            FROM Mood_Entry__c
            WHERE CreatedDate >= :weekStart
        ];

        stats.moodEntriesThisWeek = weekMoodEntries.size();

        if (!weekMoodEntries.isEmpty()) {
            Decimal totalMood = 0;
            Decimal totalEnergy = 0;
            Integer moodCount = 0;
            Integer energyCount = 0;

            for (Mood_Entry__c entry : weekMoodEntries) {
                if (entry.Mood_Score__c != null) {
                    totalMood += entry.Mood_Score__c;
                    moodCount++;
                }
                if (entry.Energy_Score__c != null) {
                    totalEnergy += entry.Energy_Score__c;
                    energyCount++;
                }
            }

            stats.avgMoodThisWeek = moodCount > 0 ? (totalMood / moodCount).setScale(1) : null;
            stats.avgEnergyThisWeek = energyCount > 0 ? (totalEnergy / energyCount).setScale(1) : null;
        }

        // Gratitude entries this week
        stats.gratitudeEntriesThisWeek = [
            SELECT COUNT()
            FROM Gratitude_Entry__c
            WHERE CreatedDate >= :weekStart
        ];

        // Win entries this week
        stats.winEntriesThisWeek = [
            SELECT COUNT()
            FROM Win_Entry__c
            WHERE CreatedDate >= :weekStart
        ];

        // Therapy sessions this week
        stats.therapySessionsThisWeek = [
            SELECT COUNT()
            FROM Therapy_Step_Completion__c
            WHERE CreatedDate >= :weekStart
        ];

        // Negative thought analyses this week
        stats.thoughtAnalysesThisWeek = [
            SELECT COUNT()
            FROM Negative_Thought_Analysis__c
            WHERE CreatedDate >= :weekStart
        ];

        // Evening routines tracked this week
        stats.eveningRoutinesThisWeek = [
            SELECT COUNT()
            FROM Evening_Routine_Tracking__c
            WHERE Date__c >= :weekStart
        ];

        // Routine task timers this week
        stats.routineTasksTrackedThisWeek = [
            SELECT COUNT()
            FROM Routine_Task_Timer__c
            WHERE CreatedDate >= :weekStart
        ];

        // Mood trend analysis
        try {
            String moodTrend = MoodTrackerService.analyzeMoodTrend(UserInfo.getUserId(), 7);
            stats.moodTrend = moodTrend;
        } catch (Exception e) {
            stats.moodTrend = 'Unknown';
        }

        // Get recent wins for display
        List<Win_Entry__c> recentWins = [
            SELECT Win_Text__c, Category__c, CreatedDate
            FROM Win_Entry__c
            WHERE CreatedDate >= :weekStart
            ORDER BY CreatedDate DESC
            LIMIT 3
        ];

        stats.recentWins = new List<String>();
        for (Win_Entry__c win : recentWins) {
            stats.recentWins.add(win.Win_Text__c);
        }

        // Get recent gratitude entries
        List<Gratitude_Entry__c> recentGratitude = [
            SELECT Gratitude_Text__c, Category__c, Intensity__c
            FROM Gratitude_Entry__c
            WHERE CreatedDate >= :weekStart
            ORDER BY CreatedDate DESC
            LIMIT 3
        ];

        stats.recentGratitude = new List<String>();
        for (Gratitude_Entry__c entry : recentGratitude) {
            stats.recentGratitude.add(entry.Gratitude_Text__c);
        }

        return stats;
    }

    // ============================================
    // WRAPPER CLASSES
    // ============================================

    public class DashboardData {
        @AuraEnabled public JobSearchStats jobSearch { get; set; }
        @AuraEnabled public List<InterviewInfo> upcomingInterviews { get; set; }
        @AuraEnabled public MealPlanningStats mealPlanning { get; set; }
        @AuraEnabled public List<MealInfo> thisWeekMeals { get; set; }
        @AuraEnabled public ShoppingStats shopping { get; set; }
        @AuraEnabled public WellnessStats wellness { get; set; }
    }

    public class JobSearchStats {
        @AuraEnabled public Integer totalJobs { get; set; }
        @AuraEnabled public Integer applicationsThisWeek { get; set; }
        @AuraEnabled public Integer jobsDiscovered { get; set; }
        @AuraEnabled public Integer jobsResearching { get; set; }
        @AuraEnabled public Integer jobsApplied { get; set; }
        @AuraEnabled public Integer jobsInterviewing { get; set; }
        @AuraEnabled public Integer jobsOffers { get; set; }

        public JobSearchStats() {
            this.totalJobs = 0;
            this.applicationsThisWeek = 0;
            this.jobsDiscovered = 0;
            this.jobsResearching = 0;
            this.jobsApplied = 0;
            this.jobsInterviewing = 0;
            this.jobsOffers = 0;
        }
    }

    public class InterviewInfo {
        @AuraEnabled public String id { get; set; }
        @AuraEnabled public String position { get; set; }
        @AuraEnabled public String company { get; set; }
        @AuraEnabled public String interviewDate { get; set; }
    }

    public class MealPlanningStats {
        @AuraEnabled public Integer totalMeals { get; set; }
        @AuraEnabled public String activePlanId { get; set; }
        @AuraEnabled public Integer plannedMealsThisWeek { get; set; }
        @AuraEnabled public Integer totalMealsThisWeek { get; set; }
        @AuraEnabled public Integer completedMealsThisWeek { get; set; }

        public MealPlanningStats() {
            this.totalMeals = 0;
            this.plannedMealsThisWeek = 0;
            this.totalMealsThisWeek = 21;
            this.completedMealsThisWeek = 0;
        }
    }

    public class MealInfo {
        @AuraEnabled public String id { get; set; }
        @AuraEnabled public String mealName { get; set; }
        @AuraEnabled public String dayOfWeek { get; set; }
        @AuraEnabled public String mealTime { get; set; }
        @AuraEnabled public Boolean isCompleted { get; set; }
    }

    public class ShoppingStats {
        @AuraEnabled public Integer listsReady { get; set; }
        @AuraEnabled public Integer activeCoupons { get; set; }
        @AuraEnabled public Decimal estimatedSavings { get; set; }
        @AuraEnabled public Integer itemsOnLists { get; set; }
        @AuraEnabled public Boolean hasHighValueCoupons { get; set; }
        @AuraEnabled public Integer highValueCouponCount { get; set; }
        @AuraEnabled public Decimal highValueSavings { get; set; }

        public ShoppingStats() {
            this.listsReady = 0;
            this.activeCoupons = 0;
            this.estimatedSavings = 0;
            this.itemsOnLists = 0;
            this.hasHighValueCoupons = false;
            this.highValueCouponCount = 0;
            this.highValueSavings = 0;
        }
    }

    public class WellnessStats {
        // Existing fields
        @AuraEnabled public String todayMood { get; set; }
        @AuraEnabled public Integer todayEnergy { get; set; }
        @AuraEnabled public Integer todayStress { get; set; }
        @AuraEnabled public Boolean morningRoutineComplete { get; set; }
        @AuraEnabled public Integer routinesThisWeek { get; set; }
        @AuraEnabled public Integer exerciseDaysThisWeek { get; set; }
        @AuraEnabled public Integer avgMoodScore { get; set; }

        // New wellness tracking fields
        @AuraEnabled public Integer moodEntriesThisWeek { get; set; }
        @AuraEnabled public Decimal avgMoodThisWeek { get; set; }
        @AuraEnabled public Decimal avgEnergyThisWeek { get; set; }
        @AuraEnabled public Integer gratitudeEntriesThisWeek { get; set; }
        @AuraEnabled public Integer winEntriesThisWeek { get; set; }
        @AuraEnabled public Integer therapySessionsThisWeek { get; set; }
        @AuraEnabled public Integer thoughtAnalysesThisWeek { get; set; }
        @AuraEnabled public Integer eveningRoutinesThisWeek { get; set; }
        @AuraEnabled public Integer routineTasksTrackedThisWeek { get; set; }
        @AuraEnabled public String moodTrend { get; set; }
        @AuraEnabled public List<String> recentWins { get; set; }
        @AuraEnabled public List<String> recentGratitude { get; set; }

        public WellnessStats() {
            this.todayEnergy = 0;
            this.todayStress = 0;
            this.morningRoutineComplete = false;
            this.routinesThisWeek = 0;
            this.exerciseDaysThisWeek = 0;
            this.avgMoodScore = 0;
            this.moodEntriesThisWeek = 0;
            this.gratitudeEntriesThisWeek = 0;
            this.winEntriesThisWeek = 0;
            this.therapySessionsThisWeek = 0;
            this.thoughtAnalysesThisWeek = 0;
            this.eveningRoutinesThisWeek = 0;
            this.routineTasksTrackedThisWeek = 0;
            this.recentWins = new List<String>();
            this.recentGratitude = new List<String>();
        }
    }
}
