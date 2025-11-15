/**
 * @description REST API for PWA sync of Daily_Routine__c data
 * Handles bidirectional sync between NeuroThrive PWA and Salesforce
 *
 * @endpoint /services/apexrest/routine/daily/*
 * @author Abby Luggery / Claude Code Assistant
 * @date 2025-11-13
 */
@RestResource(urlMapping='/routine/daily/*')
global with sharing class DailyRoutineAPI {

    /**
     * @description Response wrapper for API calls
     */
    global class APIResponse {
        public Boolean success;
        public String message;
        public Object data;
        public String error;

        public APIResponse(Boolean success, String message, Object data) {
            this.success = success;
            this.message = message;
            this.data = data;
        }

        public APIResponse(Boolean success, String error) {
            this.success = success;
            this.error = error;
        }
    }

    /**
     * @description Daily routine data structure for API
     */
    global class RoutineData {
        public String id;
        public String routineDate; // Use String for ISO date format
        public String mood;
        public String stressLevel;
        public String gratitude;
        public Boolean morningRoutineComplete;
        public Boolean exerciseCompleted;
        public String accomplishedToday;
        public String tomorrowPriorities;
        public String challenges;
        public DateTime lastModifiedDate;
        public List<MoodEntryData> moodEntries;
        public List<WinEntryData> wins;
    }

    /**
     * @description Mood entry data structure
     */
    global class MoodEntryData {
        public String id;
        public String timeOfDay;
        public Integer moodScore;
        public Integer energyScore;
        public String notes;
        public DateTime timestamp;
    }

    /**
     * @description Win entry data structure
     */
    global class WinEntryData {
        public String id;
        public String winText;
        public String category;
        public DateTime timestamp;
    }

    /**
     * @description Gratitude entry data structure
     */
    global class GratitudeData {
        public String id;
        public String gratitudeText;
        public String category; // Personal, Family, Health, Work, Achievement, Other
        public Integer intensity; // 1-10
        public String dateRecorded; // ISO date format
        public Id dailyRoutineId;
    }

    /**
     * @description Mood data structure for standalone mood creation
     */
    global class MoodData {
        public Integer mood;
        public String moodTrigger;
        public String notes;
        public DateTime timestamp;
        public Id dailyRoutineId;
    }

    /**
     * @description Therapy protocol data structure
     */
    global class TherapyProtocol {
        public String therapyType; // CBT, DBT, ACT, Mindfulness, Grounding
        public List<TherapyProtocolStep> steps;
    }

    /**
     * @description Therapy protocol step
     */
    global class TherapyProtocolStep {
        public Integer stepNumber;
        public String stepName;
        public String instructions;
    }

    /**
     * @description GET endpoint - Fetch daily routine for specific date
     * @example GET /services/apexrest/routine/daily/2025-11-13
     */
    @HttpGet
    global static void getDailyRoutine() {
        RestResponse res = RestContext.response;
        try {
            // Extract date from URL
            RestRequest req = RestContext.request;
            String requestUri = req.requestURI;
            String dateString = requestUri.substring(requestUri.lastIndexOf('/') + 1);

            // Validate date format
            Date routineDate;
            try {
                routineDate = Date.valueOf(dateString);
            } catch (Exception e) {
                APIResponse response = new APIResponse(false, 'Invalid date format. Use YYYY-MM-DD');
                res.responseBody = Blob.valueOf(JSON.serialize(response));
                res.statusCode = 400;
                return;
            }

            // Query Daily_Routine__c
            List<Daily_Routine__c> routines = [
                SELECT Id, Date__c, Mood__c, Stress_Level__c, Gratitude__c,
                       Morning_Routine_Complete__c, Exercise_Completed__c,
                       Accomplished_Today__c, Tomorrow_Priorities__c, Challenges__c,
                       LastModifiedDate,
                       (SELECT Id, Time_of_Day__c, Mood_Score__c, Energy_Score__c,
                               Notes__c, Timestamp__c
                        FROM Mood_Entries__r
                        ORDER BY Timestamp__c ASC),
                       (SELECT Id, Win_Text__c, Category__c, Timestamp__c
                        FROM Win_Entries__r
                        ORDER BY Timestamp__c ASC)
                FROM Daily_Routine__c
                WHERE Date__c = :routineDate
                LIMIT 1
            ];

            RoutineData routineData;

            if (routines.isEmpty()) {
                // No routine found - return empty structure
                routineData = new RoutineData();
                routineData.routineDate = dateString;
                routineData.moodEntries = new List<MoodEntryData>();
                routineData.wins = new List<WinEntryData>();
                APIResponse response = new APIResponse(true, 'No routine found for this date', routineData);
                res.responseBody = Blob.valueOf(JSON.serialize(response));
                res.statusCode = 200;
            } else {
                // Routine exists - populate data
                Daily_Routine__c routine = routines[0];
                routineData = mapRoutineToData(routine);
                APIResponse response = new APIResponse(true, 'Routine fetched successfully', routineData);
                res.responseBody = Blob.valueOf(JSON.serialize(response));
                res.statusCode = 200;
            }

        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'DailyRoutineAPI.getDailyRoutine error: ' + e.getMessage());
            APIResponse response = new APIResponse(false, 'Error fetching routine: ' + e.getMessage());
            res.responseBody = Blob.valueOf(JSON.serialize(response));
            res.statusCode = 500;
        }
    }

    /**
     * @description POST endpoint - Create or update daily routine
     * @example POST /services/apexrest/routine/daily
     */
    @HttpPost
    global static void upsertDailyRoutine(RoutineData routineData) {
        RestResponse res = RestContext.response;
        try {
            // Validate input
            if (routineData == null || String.isBlank(routineData.routineDate)) {
                APIResponse response = new APIResponse(false, 'routineDate is required');
                res.responseBody = Blob.valueOf(JSON.serialize(response));
                res.statusCode = 400;
                return;
            }

            Date routineDate;
            try {
                routineDate = Date.valueOf(routineData.routineDate);
            } catch (Exception e) {
                APIResponse response = new APIResponse(false, 'Invalid date format. Use YYYY-MM-DD');
                res.responseBody = Blob.valueOf(JSON.serialize(response));
                res.statusCode = 400;
                return;
            }

            // Check if routine already exists
            List<Daily_Routine__c> existingRoutines = [
                SELECT Id FROM Daily_Routine__c
                WHERE Date__c = :routineDate
                LIMIT 1
            ];

            Daily_Routine__c routine;
            if (existingRoutines.isEmpty()) {
                // Create new routine
                routine = new Daily_Routine__c();
                routine.Date__c = routineDate;
            } else {
                // Update existing routine
                routine = existingRoutines[0];
            }

            // Map data to Salesforce object
            if (routineData.mood != null) routine.Mood__c = routineData.mood;
            if (routineData.stressLevel != null) routine.Stress_Level__c = routineData.stressLevel;
            if (routineData.gratitude != null) routine.Gratitude__c = routineData.gratitude;
            if (routineData.morningRoutineComplete != null) routine.Morning_Routine_Complete__c = routineData.morningRoutineComplete;
            if (routineData.exerciseCompleted != null) routine.Exercise_Completed__c = routineData.exerciseCompleted;
            if (routineData.accomplishedToday != null) routine.Accomplished_Today__c = routineData.accomplishedToday;
            if (routineData.tomorrowPriorities != null) routine.Tomorrow_Priorities__c = routineData.tomorrowPriorities;
            if (routineData.challenges != null) routine.Challenges__c = routineData.challenges;

            upsert routine;

            // Handle mood entries if provided
            if (routineData.moodEntries != null && !routineData.moodEntries.isEmpty()) {
                upsertMoodEntries(routine.Id, routineData.moodEntries);
            }

            // Handle win entries if provided
            if (routineData.wins != null && !routineData.wins.isEmpty()) {
                upsertWinEntries(routine.Id, routineData.wins);
            }

            // Return updated routine
            RoutineData responseData = new RoutineData();
            responseData.id = routine.Id;
            responseData.routineDate = String.valueOf(routine.Date__c);

            APIResponse response = new APIResponse(true, 'Routine saved successfully', responseData);
            res.responseBody = Blob.valueOf(JSON.serialize(response));
            res.statusCode = 200;

        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'DailyRoutineAPI.upsertDailyRoutine error: ' + e.getMessage());
            APIResponse response = new APIResponse(false, 'Error saving routine: ' + e.getMessage());
            res.responseBody = Blob.valueOf(JSON.serialize(response));
            res.statusCode = 500;
        }
    }

    /**
     * @description Helper method to map Daily_Routine__c to RoutineData
     */
    private static RoutineData mapRoutineToData(Daily_Routine__c routine) {
        RoutineData data = new RoutineData();
        data.id = routine.Id;
        data.routineDate = String.valueOf(routine.Date__c);
        data.mood = routine.Mood__c;
        data.stressLevel = routine.Stress_Level__c;
        data.gratitude = routine.Gratitude__c;
        data.morningRoutineComplete = routine.Morning_Routine_Complete__c;
        data.exerciseCompleted = routine.Exercise_Completed__c;
        data.accomplishedToday = routine.Accomplished_Today__c;
        data.tomorrowPriorities = routine.Tomorrow_Priorities__c;
        data.challenges = routine.Challenges__c;
        data.lastModifiedDate = routine.LastModifiedDate;

        // Map mood entries
        data.moodEntries = new List<MoodEntryData>();
        if (routine.Mood_Entries__r != null) {
            for (Mood_Entry__c entry : routine.Mood_Entries__r) {
                MoodEntryData moodData = new MoodEntryData();
                moodData.id = entry.Id;
                moodData.timeOfDay = entry.Time_of_Day__c;
                moodData.moodScore = entry.Mood_Score__c != null ? entry.Mood_Score__c.intValue() : null;
                moodData.energyScore = entry.Energy_Score__c != null ? entry.Energy_Score__c.intValue() : null;
                moodData.notes = entry.Notes__c;
                moodData.timestamp = entry.Timestamp__c;
                data.moodEntries.add(moodData);
            }
        }

        // Map win entries
        data.wins = new List<WinEntryData>();
        if (routine.Win_Entries__r != null) {
            for (Win_Entry__c entry : routine.Win_Entries__r) {
                WinEntryData winData = new WinEntryData();
                winData.id = entry.Id;
                winData.winText = entry.Win_Text__c;
                winData.category = entry.Category__c;
                winData.timestamp = entry.Timestamp__c;
                data.wins.add(winData);
            }
        }

        return data;
    }

    /**
     * @description Helper method to upsert mood entries
     */
    private static void upsertMoodEntries(Id routineId, List<MoodEntryData> moodEntries) {
        List<Mood_Entry__c> entriesToUpsert = new List<Mood_Entry__c>();

        for (MoodEntryData moodData : moodEntries) {
            Mood_Entry__c entry = new Mood_Entry__c();

            // If ID provided, update existing
            if (String.isNotBlank(moodData.id)) {
                entry.Id = moodData.id;
            }

            entry.Daily_Routine__c = routineId;
            entry.Time_of_Day__c = moodData.timeOfDay;
            entry.Mood_Score__c = moodData.moodScore;
            entry.Energy_Score__c = moodData.energyScore;
            entry.Notes__c = moodData.notes;
            entry.Timestamp__c = moodData.timestamp != null ? moodData.timestamp : System.now();

            entriesToUpsert.add(entry);
        }

        if (!entriesToUpsert.isEmpty()) {
            upsert entriesToUpsert;
        }
    }

    /**
     * @description Helper method to upsert win entries
     */
    private static void upsertWinEntries(Id routineId, List<WinEntryData> wins) {
        List<Win_Entry__c> entriesToUpsert = new List<Win_Entry__c>();

        for (WinEntryData winData : wins) {
            Win_Entry__c entry = new Win_Entry__c();

            // If ID provided, update existing
            if (String.isNotBlank(winData.id)) {
                entry.Id = winData.id;
            }

            entry.Daily_Routine__c = routineId;
            entry.Win_Text__c = winData.winText;
            entry.Category__c = winData.category;
            entry.Timestamp__c = winData.timestamp != null ? winData.timestamp : System.now();

            entriesToUpsert.add(entry);
        }

        if (!entriesToUpsert.isEmpty()) {
            upsert entriesToUpsert;
        }
    }

    /**
     * @description POST endpoint - Create gratitude entry
     * @param gratitudeData Gratitude entry data
     * @return APIResponse with created entry ID
     */
    public static APIResponse createGratitudeEntry(GratitudeData gratitudeData) {
        try {
            // Validate input
            if (gratitudeData == null || String.isBlank(gratitudeData.gratitudeText)) {
                return new APIResponse(false, 'gratitudeText is required');
            }

            // Get or create daily routine
            Id routineId = gratitudeData.dailyRoutineId;
            if (routineId == null && String.isNotBlank(gratitudeData.dateRecorded)) {
                Date recordDate = Date.valueOf(gratitudeData.dateRecorded);
                List<Daily_Routine__c> routines = [
                    SELECT Id FROM Daily_Routine__c
                    WHERE Date__c = :recordDate
                    LIMIT 1
                ];

                if (routines.isEmpty()) {
                    Daily_Routine__c routine = new Daily_Routine__c(Date__c = recordDate);
                    insert routine;
                    routineId = routine.Id;
                } else {
                    routineId = routines[0].Id;
                }
            }

            // Create gratitude entry
            Gratitude_Entry__c entry = new Gratitude_Entry__c();
            entry.Gratitude_Text__c = gratitudeData.gratitudeText;
            entry.Category__c = gratitudeData.category;
            entry.Intensity__c = gratitudeData.intensity;
            entry.Date_Recorded__c = String.isNotBlank(gratitudeData.dateRecorded) ?
                Date.valueOf(gratitudeData.dateRecorded) : Date.today();
            if (routineId != null) {
                entry.Daily_Routine__c = routineId;
            }

            insert entry;

            GratitudeData responseData = new GratitudeData();
            responseData.id = entry.Id;
            responseData.dateRecorded = String.valueOf(entry.Date_Recorded__c);

            return new APIResponse(true, 'Gratitude entry created successfully', responseData);

        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'DailyRoutineAPI.createGratitudeEntry error: ' + e.getMessage());
            return new APIResponse(false, 'Error creating gratitude entry: ' + e.getMessage());
        }
    }

    /**
     * @description POST endpoint - Create mood entry
     * @param moodData Mood entry data
     * @return APIResponse with created entry ID
     */
    public static APIResponse createMoodEntry(MoodData moodData) {
        try {
            // Validate input
            if (moodData == null || moodData.mood == null) {
                return new APIResponse(false, 'mood score is required');
            }

            // Get or create daily routine
            Id routineId = moodData.dailyRoutineId;
            if (routineId == null) {
                Date today = Date.today();
                List<Daily_Routine__c> routines = [
                    SELECT Id FROM Daily_Routine__c
                    WHERE Date__c = :today
                    LIMIT 1
                ];

                if (routines.isEmpty()) {
                    Daily_Routine__c routine = new Daily_Routine__c(Date__c = today);
                    insert routine;
                    routineId = routine.Id;
                } else {
                    routineId = routines[0].Id;
                }
            }

            // Create mood entry
            Mood_Entry__c entry = new Mood_Entry__c();
            entry.Daily_Routine__c = routineId;
            entry.Mood_Score__c = moodData.mood;
            entry.Notes__c = moodData.notes;
            entry.Timestamp__c = moodData.timestamp != null ? moodData.timestamp : System.now();

            // Store trigger in notes if provided
            if (String.isNotBlank(moodData.moodTrigger)) {
                String noteText = 'Trigger: ' + moodData.moodTrigger;
                if (String.isNotBlank(moodData.notes)) {
                    noteText += '\n' + moodData.notes;
                }
                entry.Notes__c = noteText;
            }

            insert entry;

            Map<String, Object> responseData = new Map<String, Object>();
            responseData.put('id', entry.Id);
            responseData.put('dailyRoutineId', routineId);

            return new APIResponse(true, 'Mood entry created successfully', responseData);

        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'DailyRoutineAPI.createMoodEntry error: ' + e.getMessage());
            return new APIResponse(false, 'Error creating mood entry: ' + e.getMessage());
        }
    }

    /**
     * @description GET endpoint - Fetch available therapy protocols
     * @return APIResponse with therapy protocol list
     */
    public static APIResponse getTherapyProtocols() {
        try {
            List<TherapyProtocol> protocols = new List<TherapyProtocol>();

            // Get all therapy types
            List<String> therapyTypes = new List<String>{'CBT', 'DBT', 'ACT', 'Grounding', 'Mindfulness'};

            for (String therapyType : therapyTypes) {
                TherapyProtocol protocol = new TherapyProtocol();
                protocol.therapyType = therapyType;
                protocol.steps = new List<TherapyProtocolStep>();

                // Get steps from TherapySessionManager
                List<TherapySessionManager.TherapyStep> managerSteps =
                    TherapySessionManager.getProtocolSteps(therapyType);

                for (TherapySessionManager.TherapyStep step : managerSteps) {
                    TherapyProtocolStep protocolStep = new TherapyProtocolStep();
                    protocolStep.stepNumber = step.stepNumber;
                    protocolStep.stepName = step.stepName;
                    protocolStep.instructions = step.instructions;
                    protocol.steps.add(protocolStep);
                }

                protocols.add(protocol);
            }

            return new APIResponse(true, 'Therapy protocols fetched successfully', protocols);

        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'DailyRoutineAPI.getTherapyProtocols error: ' + e.getMessage());
            return new APIResponse(false, 'Error fetching therapy protocols: ' + e.getMessage());
        }
    }
}
