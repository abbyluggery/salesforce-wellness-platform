# GitHub Issues for Claude Code - Salesforce Wellness Platform

**Repository:** https://github.com/abbyluggery/salesforce-wellness-platform

**Total Issues:** 18 (organized by priority and day)

---

## DAY 1: Database Objects (Priority: HIGH)

### Issue #1: Create Gratitude_Entry__c Custom Object

**Labels:** `claude-code`, `priority: high`, `backend`, `day-1`

**Description:**
Create a custom object to store daily gratitude entries with timestamp and categorization support.

**Acceptance Criteria:**
- [ ] Custom object `Gratitude_Entry__c` created with all required fields
- [ ] Object is related to `Daily_Routine__c` via lookup field
- [ ] Page layouts configured for mobile and desktop
- [ ] List views created (Today's Gratitudes, This Week's Gratitudes)
- [ ] Sharing settings configured (Private)

**Technical Requirements:**

**Fields to Create:**
- `Gratitude_Text__c` (Long Text Area, 1000 chars, required)
- `Category__c` (Picklist: Personal, Family, Health, Work, Achievement, Other)
- `Intensity__c` (Number: 1-10 scale)
- `Daily_Routine__c` (Lookup to Daily_Routine__c)
- `Date_Recorded__c` (Date, required, defaults to TODAY())
- `Time_Recorded__c` (DateTime, required, defaults to NOW())

**Validation Rules:**
- Intensity must be between 1-10
- Date_Recorded cannot be future date

**Testing Requirements:**
- [ ] Create test data with all field combinations
- [ ] Verify lookup relationship to Daily_Routine__c
- [ ] Test validation rules
- [ ] Test page layouts on mobile simulator

**Files to Create:**
- `force-app/main/default/objects/Gratitude_Entry__c/Gratitude_Entry__c.object-meta.xml`
- `force-app/main/default/objects/Gratitude_Entry__c/fields/*.field-meta.xml`
- `force-app/main/default/objects/Gratitude_Entry__c/listViews/*.listView-meta.xml`

**Estimated Effort:** Small (1-2 hours)

---

### Issue #2: Create Therapy_Step_Completion__c Custom Object

**Labels:** `claude-code`, `priority: high`, `backend`, `day-1`

**Description:**
Track completion of structured therapy exercises (CBT steps, DBT skills, mindfulness exercises).

**Acceptance Criteria:**
- [ ] Custom object `Therapy_Step_Completion__c` created with all required fields
- [ ] Related to `Imposter_Syndrome_Session__c` via lookup
- [ ] Related to `Daily_Routine__c` via lookup
- [ ] Page layouts configured
- [ ] List views created (Recent Completions, By Therapy Type)

**Technical Requirements:**

**Fields to Create:**
- `Therapy_Type__c` (Picklist: CBT, DBT, ACT, Mindfulness, Grounding, Other)
- `Step_Name__c` (Text, 255 chars, required) - e.g., "Identify Negative Thought"
- `Step_Number__c` (Number, 0 decimals) - sequence in therapy protocol
- `Completion_Time__c` (DateTime, required)
- `Duration_Minutes__c` (Number, 0 decimals)
- `Effectiveness_Rating__c` (Number: 1-10)
- `Notes__c` (Long Text Area, 2000 chars)
- `Imposter_Syndrome_Session__c` (Lookup, optional)
- `Daily_Routine__c` (Lookup, required)
- `Was_Helpful__c` (Checkbox)

**Validation Rules:**
- Effectiveness_Rating must be 1-10
- Duration_Minutes must be positive
- Step_Number must be positive

**Testing Requirements:**
- [ ] Test all therapy type picklist values
- [ ] Verify dual lookup relationships
- [ ] Test validation rules
- [ ] Create sample therapy protocols

**Files to Create:**
- `force-app/main/default/objects/Therapy_Step_Completion__c/Therapy_Step_Completion__c.object-meta.xml`
- `force-app/main/default/objects/Therapy_Step_Completion__c/fields/*.field-meta.xml`

**Estimated Effort:** Medium (3-4 hours)

---

### Issue #3: Create Negative_Thought_Analysis__c Custom Object

**Labels:** `claude-code`, `priority: high`, `backend`, `day-1`

**Description:**
Store AI-powered analysis of negative thoughts with cognitive distortion detection and reframing suggestions.

**Acceptance Criteria:**
- [ ] Custom object `Negative_Thought_Analysis__c` created
- [ ] Related to `Mood_Entry__c` via lookup
- [ ] AI analysis fields for cognitive distortions
- [ ] Reframing suggestions stored
- [ ] Page layouts configured

**Technical Requirements:**

**Fields to Create:**
- `Original_Thought__c` (Long Text Area, 2000 chars, required)
- `Mood_Entry__c` (Lookup to Mood_Entry__c, required)
- `Analysis_Date__c` (DateTime, required, defaults to NOW())
- `Detected_Distortions__c` (Multi-Select Picklist: All-or-Nothing Thinking, Overgeneralization, Mental Filter, Disqualifying Positives, Jumping to Conclusions, Magnification, Emotional Reasoning, Should Statements, Labeling, Personalization)
- `Primary_Distortion__c` (Picklist: same values as above)
- `Severity_Score__c` (Number: 1-10)
- `Reframe_Suggestion__c` (Long Text Area, 2000 chars) - AI-generated
- `User_Reframe__c` (Long Text Area, 2000 chars) - User's own reframe
- `Helpfulness_Rating__c` (Number: 1-10)
- `AI_Confidence__c` (Percent: 0-100)
- `Processed_By_AI__c` (Checkbox, defaults TRUE)

**Validation Rules:**
- Severity_Score must be 1-10
- Helpfulness_Rating must be 1-10
- AI_Confidence must be 0-100

**Testing Requirements:**
- [ ] Test with various negative thought patterns
- [ ] Verify AI field placeholders work
- [ ] Test multi-select picklist behavior
- [ ] Verify relationship to Mood_Entry__c

**Files to Create:**
- `force-app/main/default/objects/Negative_Thought_Analysis__c/Negative_Thought_Analysis__c.object-meta.xml`
- `force-app/main/default/objects/Negative_Thought_Analysis__c/fields/*.field-meta.xml`

**Estimated Effort:** Medium (3-4 hours)

---

### Issue #4: Create Routine_Task_Timer__c Custom Object

**Labels:** `claude-code`, `priority: medium`, `backend`, `day-1`

**Description:**
Track time spent on individual routine tasks (morning routine steps, evening routine, etc.) to identify bottlenecks.

**Acceptance Criteria:**
- [ ] Custom object `Routine_Task_Timer__c` created
- [ ] Related to `Daily_Routine__c` via lookup
- [ ] Duration calculation fields
- [ ] Page layouts configured

**Technical Requirements:**

**Fields to Create:**
- `Task_Name__c` (Picklist: Wake Up, Shower, Breakfast, Meds, Exercise, Meditation, Journaling, Planning, Other)
- `Daily_Routine__c` (Lookup to Daily_Routine__c, required)
- `Start_Time__c` (DateTime, required)
- `End_Time__c` (DateTime)
- `Duration_Minutes__c` (Formula: Number) - calculate from start/end
- `Expected_Duration_Minutes__c` (Number) - baseline for comparison
- `Delay_Minutes__c` (Formula: Number) - Duration_Minutes - Expected_Duration_Minutes
- `Was_Skipped__c` (Checkbox)
- `Skip_Reason__c` (Text, 255 chars)
- `Energy_Before__c` (Number: 1-10)
- `Energy_After__c` (Number: 1-10)
- `Notes__c` (Long Text Area, 500 chars)

**Formula Fields:**
- `Duration_Minutes__c`: `(End_Time__c - Start_Time__c) * 24 * 60`
- `Delay_Minutes__c`: `Duration_Minutes__c - Expected_Duration_Minutes__c`

**Validation Rules:**
- End_Time must be after Start_Time
- Energy ratings must be 1-10
- Expected_Duration must be positive

**Testing Requirements:**
- [ ] Test formula calculations
- [ ] Verify duration tracking
- [ ] Test skip functionality
- [ ] Verify relationship to Daily_Routine__c

**Files to Create:**
- `force-app/main/default/objects/Routine_Task_Timer__c/Routine_Task_Timer__c.object-meta.xml`
- `force-app/main/default/objects/Routine_Task_Timer__c/fields/*.field-meta.xml`

**Estimated Effort:** Small (2-3 hours)

---

### Issue #5: Create Evening_Routine_Tracking__c Custom Object

**Labels:** `claude-code`, `priority: medium`, `backend`, `day-1`

**Description:**
Track evening routine completion, wind-down activities, and sleep preparation to improve sleep quality.

**Acceptance Criteria:**
- [ ] Custom object `Evening_Routine_Tracking__c` created
- [ ] Related to `Daily_Routine__c` via lookup
- [ ] Sleep quality correlation fields
- [ ] Page layouts configured

**Technical Requirements:**

**Fields to Create:**
- `Daily_Routine__c` (Lookup to Daily_Routine__c, required)
- `Date__c` (Date, required, defaults to TODAY())
- `Routine_Start_Time__c` (DateTime, required)
- `Routine_End_Time__c` (DateTime)
- `Total_Duration_Minutes__c` (Formula: Number)
- `Target_Bedtime__c` (Time)
- `Actual_Bedtime__c` (Time)
- `Bedtime_Variance_Minutes__c` (Formula: Number)
- `Activities_Completed__c` (Multi-Select Picklist: Dinner, Dishes, Shower, Skincare, Teeth, Medications, Prep Tomorrow, Read, Journal, Meditate, Stretch, Other)
- `Screen_Time_Minutes__c` (Number)
- `Caffeine_After_2pm__c` (Checkbox)
- `Exercise_After_6pm__c` (Checkbox)
- `Stress_Level__c` (Number: 1-10)
- `Sleep_Quality__c` (Number: 1-10) - filled next morning
- `Notes__c` (Long Text Area, 1000 chars)

**Formula Fields:**
- `Total_Duration_Minutes__c`: `(Routine_End_Time__c - Routine_Start_Time__c) * 24 * 60`
- `Bedtime_Variance_Minutes__c`: Calculate difference between target and actual bedtime

**Validation Rules:**
- Routine_End_Time must be after Routine_Start_Time
- Screen_Time_Minutes must be non-negative
- Stress_Level must be 1-10
- Sleep_Quality must be 1-10

**Testing Requirements:**
- [ ] Test formula calculations
- [ ] Verify multi-select picklist
- [ ] Test bedtime variance calculation
- [ ] Verify relationship to Daily_Routine__c

**Files to Create:**
- `force-app/main/default/objects/Evening_Routine_Tracking__c/Evening_Routine_Tracking__c.object-meta.xml`
- `force-app/main/default/objects/Evening_Routine_Tracking__c/fields/*.field-meta.xml`

**Estimated Effort:** Small (2-3 hours)

---

## DAY 2: Apex Service Classes (Priority: HIGH)

### Issue #6: Build WinParserService Apex Class

**Labels:** `claude-code`, `priority: high`, `backend`, `day-2`

**Description:**
AI-powered service to extract wins/accomplishments from journal entries and categorize them by type (career, personal, health, social).

**Acceptance Criteria:**
- [ ] Apex class `WinParserService` created with AI integration
- [ ] Method to parse journal text and extract wins
- [ ] Automatic categorization of wins
- [ ] Test class with 75%+ coverage
- [ ] Integration with Claude AI API

**Technical Requirements:**

**Methods to Implement:**
```apex
public class WinParserService {
    // Parse journal entry and extract wins
    public static List<WinData> extractWins(String journalText) {}

    // Categorize a single win
    public static String categorizeWin(String winText) {}

    // Create Win_Entry__c records from parsed data
    public static List<Win_Entry__c> createWinRecords(List<WinData> wins, Id dailyRoutineId) {}

    // Batch process multiple journal entries
    public static void batchProcessJournals(List<Id> dailyRoutineIds) {}
}

public class WinData {
    public String winText;
    public String category;
    public Integer impactScore; // 1-10
}
```

**AI Integration:**
- Use existing `ClaudeAPIService` class
- Prompt engineering for win extraction
- Return structured JSON with wins array
- Handle API errors gracefully

**Testing Requirements:**
- [ ] Test with various journal entry formats
- [ ] Test categorization accuracy
- [ ] Test batch processing
- [ ] Mock Claude API responses
- [ ] Test error handling

**Implementation Notes:**
- Reference existing `JobPostingAnalyzer` for Claude API patterns
- Use regex patterns as fallback if AI unavailable
- Store raw AI response for debugging

**Files to Create:**
- `force-app/main/default/classes/WinParserService.cls`
- `force-app/main/default/classes/WinParserService.cls-meta.xml`
- `force-app/main/default/classes/WinParserServiceTest.cls`
- `force-app/main/default/classes/WinParserServiceTest.cls-meta.xml`

**Estimated Effort:** Large (6-8 hours)

---

### Issue #7: Build MoodTrackerService Apex Class

**Labels:** `claude-code`, `priority: high`, `backend`, `day-2`

**Description:**
Service class to analyze mood patterns, detect trends, and provide insights on mood triggers.

**Acceptance Criteria:**
- [ ] Apex class `MoodTrackerService` created
- [ ] Calculate mood trends over time
- [ ] Detect mood triggers from activities/events
- [ ] Generate mood insights
- [ ] Test class with 75%+ coverage

**Technical Requirements:**

**Methods to Implement:**
```apex
public class MoodTrackerService {
    // Calculate 7-day mood average
    public static Decimal getWeeklyMoodAverage(Id userId) {}

    // Detect mood trend (improving, declining, stable)
    public static String analyzeMoodTrend(Id userId, Integer days) {}

    // Find correlation between activities and mood
    public static Map<String, Decimal> findMoodTriggers(Id userId) {}

    // Generate personalized insights
    public static String generateMoodInsights(Id userId) {}

    // Get mood entries for date range
    public static List<Mood_Entry__c> getMoodHistory(Id userId, Date startDate, Date endDate) {}
}
```

**Calculations:**
- 7-day rolling average
- Standard deviation for volatility
- Correlation analysis between mood and activities

**Testing Requirements:**
- [ ] Test with 30 days of mock mood data
- [ ] Test trend detection accuracy
- [ ] Test correlation calculations
- [ ] Test date range queries
- [ ] Test edge cases (no data, single entry)

**Files to Create:**
- `force-app/main/default/classes/MoodTrackerService.cls`
- `force-app/main/default/classes/MoodTrackerService.cls-meta.xml`
- `force-app/main/default/classes/MoodTrackerServiceTest.cls`
- `force-app/main/default/classes/MoodTrackerServiceTest.cls-meta.xml`

**Estimated Effort:** Medium (4-5 hours)

---

### Issue #8: Build ImposterSyndromeAnalyzer Apex Class

**Labels:** `claude-code`, `priority: high`, `backend`, `day-2`

**Description:**
AI-powered analyzer to detect imposter syndrome patterns in journal entries and mood data, with evidence-based counter-narratives.

**Acceptance Criteria:**
- [ ] Apex class `ImposterSyndromeAnalyzer` created
- [ ] Detect imposter syndrome indicators
- [ ] Generate evidence-based rebuttals
- [ ] Track imposter syndrome frequency
- [ ] Test class with 75%+ coverage
- [ ] Claude AI integration

**Technical Requirements:**

**Methods to Implement:**
```apex
public class ImposterSyndromeAnalyzer {
    // Analyze text for imposter syndrome patterns
    public static ImposterAnalysisResult analyzeText(String text) {}

    // Generate evidence-based counter-narrative
    public static String generateRebuttal(String imposterThought, Id userId) {}

    // Get historical wins as evidence
    public static List<Win_Entry__c> getRelevantWins(String imposterThought, Id userId) {}

    // Track frequency of imposter thoughts
    public static Map<String, Integer> getImposterFrequency(Id userId, Integer days) {}

    // Create Imposter_Syndrome_Session__c record
    public static Imposter_Syndrome_Session__c createSession(ImposterAnalysisResult analysis, Id userId) {}
}

public class ImposterAnalysisResult {
    public Boolean isImposterThought;
    public String primaryPattern; // e.g., "Discount Success", "Fear of Exposure"
    public Integer severityScore; // 1-10
    public List<String> detectedPatterns;
    public String suggestedReframe;
}
```

**AI Integration:**
- Use Claude API for pattern detection
- Prompt includes psychology research on imposter syndrome
- Generate personalized rebuttals using user's win history

**Pattern Detection:**
- "I just got lucky"
- "Anyone could have done this"
- "They'll find out I'm a fraud"
- "I don't deserve this"
- Minimize accomplishments

**Testing Requirements:**
- [ ] Test with known imposter syndrome phrases
- [ ] Test rebuttal generation
- [ ] Test win retrieval for evidence
- [ ] Test frequency tracking
- [ ] Mock Claude API responses

**Files to Create:**
- `force-app/main/default/classes/ImposterSyndromeAnalyzer.cls`
- `force-app/main/default/classes/ImposterSyndromeAnalyzer.cls-meta.xml`
- `force-app/main/default/classes/ImposterSyndromeAnalyzerTest.cls`
- `force-app/main/default/classes/ImposterSyndromeAnalyzerTest.cls-meta.xml`

**Estimated Effort:** Large (6-8 hours)

---

### Issue #9: Build NegativeThoughtDetector Apex Class

**Labels:** `claude-code`, `priority: medium`, `backend`, `day-2`

**Description:**
Service to detect cognitive distortions in journal entries and suggest CBT-based reframes.

**Acceptance Criteria:**
- [ ] Apex class `NegativeThoughtDetector` created
- [ ] Detect 10 common cognitive distortions
- [ ] Generate CBT-based reframes
- [ ] Create Negative_Thought_Analysis__c records
- [ ] Test class with 75%+ coverage

**Technical Requirements:**

**Methods to Implement:**
```apex
public class NegativeThoughtDetector {
    // Detect cognitive distortions in text
    public static List<DistortionResult> detectDistortions(String text) {}

    // Generate CBT reframe for specific distortion
    public static String generateReframe(String thought, String distortionType) {}

    // Create analysis records
    public static Negative_Thought_Analysis__c createAnalysis(String thought, Id moodEntryId) {}

    // Batch analyze multiple mood entries
    public static void batchAnalyzeMoodEntries(List<Id> moodEntryIds) {}
}

public class DistortionResult {
    public String distortionType;
    public String extractedThought;
    public Integer severityScore;
    public String suggestedReframe;
}
```

**Cognitive Distortions to Detect:**
1. All-or-Nothing Thinking
2. Overgeneralization
3. Mental Filter
4. Disqualifying Positives
5. Jumping to Conclusions
6. Magnification/Minimization
7. Emotional Reasoning
8. Should Statements
9. Labeling
10. Personalization

**AI Integration:**
- Use Claude API with CBT prompt
- Include CBT techniques in prompt
- Return structured JSON

**Testing Requirements:**
- [ ] Test each distortion type detection
- [ ] Test reframe generation quality
- [ ] Test batch processing
- [ ] Test record creation
- [ ] Mock AI responses

**Files to Create:**
- `force-app/main/default/classes/NegativeThoughtDetector.cls`
- `force-app/main/default/classes/NegativeThoughtDetector.cls-meta.xml`
- `force-app/main/default/classes/NegativeThoughtDetectorTest.cls`
- `force-app/main/default/classes/NegativeThoughtDetectorTest.cls-meta.xml`

**Estimated Effort:** Large (6-7 hours)

---

### Issue #10: Build TherapySessionManager Apex Class

**Labels:** `claude-code`, `priority: medium`, `backend`, `day-2`

**Description:**
Manage guided therapy exercises, track completion of therapy steps, and measure effectiveness.

**Acceptance Criteria:**
- [ ] Apex class `TherapySessionManager` created
- [ ] Load therapy protocols (CBT, DBT, ACT)
- [ ] Track step completion
- [ ] Calculate effectiveness metrics
- [ ] Test class with 75%+ coverage

**Technical Requirements:**

**Methods to Implement:**
```apex
public class TherapySessionManager {
    // Load therapy protocol steps
    public static List<TherapyStep> getProtocolSteps(String therapyType) {}

    // Create session from protocol
    public static Imposter_Syndrome_Session__c createTherapySession(String therapyType, Id userId) {}

    // Record step completion
    public static Therapy_Step_Completion__c completeStep(Id sessionId, Integer stepNumber, String notes) {}

    // Calculate session effectiveness
    public static Decimal calculateEffectiveness(Id sessionId) {}

    // Get recommended therapy type based on mood/patterns
    public static String recommendTherapy(Id userId) {}
}

public class TherapyStep {
    public Integer stepNumber;
    public String stepName;
    public String instructions;
    public String therapyType;
}
```

**Therapy Protocols:**

**CBT Protocol (6 steps):**
1. Identify the situation
2. Identify automatic thoughts
3. Identify emotions
4. Find evidence for/against thought
5. Generate alternative thought
6. Re-rate emotion intensity

**DBT Protocol (4 steps):**
1. Observe emotion without judgment
2. Describe emotion factually
3. Practice opposite action
4. Use distress tolerance skills

**Grounding Protocol (5 steps):**
1. 5 things you can see
2. 4 things you can touch
3. 3 things you can hear
4. 2 things you can smell
5. 1 thing you can taste

**Testing Requirements:**
- [ ] Test protocol loading
- [ ] Test session creation
- [ ] Test step completion tracking
- [ ] Test effectiveness calculation
- [ ] Test recommendation engine

**Files to Create:**
- `force-app/main/default/classes/TherapySessionManager.cls`
- `force-app/main/default/classes/TherapySessionManager.cls-meta.xml`
- `force-app/main/default/classes/TherapySessionManagerTest.cls`
- `force-app/main/default/classes/TherapySessionManagerTest.cls-meta.xml`

**Estimated Effort:** Large (7-8 hours)

---

### Issue #11: Build RoutineTaskTimerService Apex Class

**Labels:** `claude-code`, `priority: low`, `backend`, `day-2`

**Description:**
Service to manage routine task timing, identify bottlenecks, and optimize morning/evening routines.

**Acceptance Criteria:**
- [ ] Apex class `RoutineTaskTimerService` created
- [ ] Start/stop timer functionality
- [ ] Calculate baseline task durations
- [ ] Identify bottleneck tasks
- [ ] Test class with 75%+ coverage

**Technical Requirements:**

**Methods to Implement:**
```apex
public class RoutineTaskTimerService {
    // Start task timer
    public static Routine_Task_Timer__c startTask(Id dailyRoutineId, String taskName) {}

    // Stop task timer
    public static Routine_Task_Timer__c stopTask(Id timerId) {}

    // Calculate average duration for task
    public static Decimal getAverageTaskDuration(String taskName, Integer days) {}

    // Identify bottleneck tasks
    public static List<TaskBottleneck> findBottlenecks(Id userId) {}

    // Generate routine optimization suggestions
    public static String optimizeRoutine(Id userId) {}
}

public class TaskBottleneck {
    public String taskName;
    public Decimal avgDuration;
    public Decimal expectedDuration;
    public Decimal avgDelay;
    public String suggestion;
}
```

**Testing Requirements:**
- [ ] Test timer start/stop
- [ ] Test duration calculations
- [ ] Test bottleneck detection
- [ ] Test optimization suggestions
- [ ] Test with 30 days of data

**Files to Create:**
- `force-app/main/default/classes/RoutineTaskTimerService.cls`
- `force-app/main/default/classes/RoutineTaskTimerService.cls-meta.xml`
- `force-app/main/default/classes/RoutineTaskTimerServiceTest.cls`
- `force-app/main/default/classes/RoutineTaskTimerServiceTest.cls-meta.xml`

**Estimated Effort:** Medium (4-5 hours)

---

## DAY 3: Scheduled Flows & Integration (Priority: MEDIUM)

### Issue #12: Create Weekly Mood Summary Scheduled Flow

**Labels:** `claude-code`, `priority: medium`, `backend`, `day-3`, `flow`

**Description:**
Scheduled flow that runs every Sunday to generate weekly mood summary with trends, insights, and recommendations.

**Acceptance Criteria:**
- [ ] Scheduled Flow `Weekly_Mood_Summary` created
- [ ] Runs every Sunday at 8 AM
- [ ] Queries last 7 days of mood data
- [ ] Calls MoodTrackerService for analysis
- [ ] Sends summary email/creates record
- [ ] Flow is activated and scheduled

**Technical Requirements:**

**Flow Type:** Scheduled-Triggered Flow

**Schedule:** Every Sunday at 8:00 AM

**Flow Steps:**
1. Get Records: Query Mood_Entry__c for last 7 days
2. Decision: Check if any mood entries exist
3. Apex Action: Call `MoodTrackerService.getWeeklyMoodAverage()`
4. Apex Action: Call `MoodTrackerService.analyzeMoodTrend()`
5. Apex Action: Call `MoodTrackerService.generateMoodInsights()`
6. Create Record: Create summary record (or send email)
7. (Optional) Send Email: Email summary to user

**Variables:**
- `varStartDate` (Date): 7 days ago
- `varEndDate` (Date): Today
- `varMoodEntries` (Record Collection): Mood_Entry__c records
- `varWeeklyAverage` (Number): From Apex
- `varTrend` (Text): From Apex
- `varInsights` (Text): From Apex

**Testing Requirements:**
- [ ] Test with various data scenarios (0 entries, 1 entry, 7+ entries)
- [ ] Verify email formatting
- [ ] Test scheduled execution
- [ ] Verify Apex callouts work

**Files to Create:**
- `force-app/main/default/flows/Weekly_Mood_Summary.flow-meta.xml`

**Estimated Effort:** Small (2-3 hours)

---

### Issue #13: Create Daily Win Reminder Scheduled Flow

**Labels:** `claude-code`, `priority: medium`, `backend`, `day-3`, `flow`

**Description:**
Scheduled flow that runs every evening at 8 PM to remind users to log their daily wins.

**Acceptance Criteria:**
- [ ] Scheduled Flow `Daily_Win_Reminder` created
- [ ] Runs every day at 8:00 PM
- [ ] Checks if user has logged wins today
- [ ] Sends reminder if no wins logged
- [ ] Flow is activated and scheduled

**Technical Requirements:**

**Flow Type:** Scheduled-Triggered Flow

**Schedule:** Every day at 8:00 PM

**Flow Steps:**
1. Get Records: Query Win_Entry__c for today
2. Decision: Check if count > 0
3. If no wins: Send reminder email/notification
4. If wins exist: Do nothing (exit flow)

**Variables:**
- `varToday` (Date): TODAY()
- `varWinEntries` (Record Collection): Win_Entry__c records
- `varWinCount` (Number): Count of records

**Testing Requirements:**
- [ ] Test with 0 wins logged
- [ ] Test with 1+ wins logged
- [ ] Verify email content
- [ ] Test scheduled execution

**Files to Create:**
- `force-app/main/default/flows/Daily_Win_Reminder.flow-meta.xml`

**Estimated Effort:** Small (1-2 hours)

---

### Issue #14: Enhance DailyRoutineAPI with New Endpoints

**Labels:** `claude-code`, `priority: high`, `backend`, `day-3`, `api`

**Description:**
Extend existing DailyRoutineAPI to support gratitude entries, win entries, mood entries, and therapy sessions.

**Acceptance Criteria:**
- [ ] New endpoints added to DailyRoutineAPI
- [ ] POST /gratitude endpoint
- [ ] POST /wins endpoint
- [ ] POST /mood endpoint
- [ ] GET /therapy/protocols endpoint
- [ ] Test class updated with 75%+ coverage
- [ ] API documentation updated

**Technical Requirements:**

**New Methods to Add:**
```apex
@RestResource(urlMapping='/routine/daily/*')
global with sharing class DailyRoutineAPI {

    // Existing methods remain...

    @HttpPost
    global static void createGratitudeEntry(GratitudeData data) {
        // POST /services/apexrest/routine/daily/gratitude
    }

    @HttpPost
    global static void createWinEntry(WinData data) {
        // POST /services/apexrest/routine/daily/wins
    }

    @HttpPost
    global static void createMoodEntry(MoodData data) {
        // POST /services/apexrest/routine/daily/mood
    }

    @HttpGet
    global static List<TherapyProtocol> getTherapyProtocols() {
        // GET /services/apexrest/routine/daily/therapy/protocols
    }
}
```

**Request/Response Classes:**
```apex
global class GratitudeData {
    public String gratitudeText;
    public String category;
    public Integer intensity;
    public Date dateRecorded;
}

global class WinData {
    public String winText;
    public String category;
    public Integer impactScore;
}

global class MoodData {
    public Integer mood;
    public String trigger;
    public String notes;
    public DateTime timestamp;
}
```

**Testing Requirements:**
- [ ] Test all new endpoints
- [ ] Test request validation
- [ ] Test error handling
- [ ] Test with invalid data
- [ ] Update API coverage to 80%+

**Files to Modify:**
- `force-app/main/default/classes/DailyRoutineAPI.cls`
- `force-app/main/default/classes/DailyRoutineAPITest.cls` (update)

**Estimated Effort:** Medium (4-5 hours)

---

## DAY 4: Final Objects & Polish (Priority: MEDIUM-LOW)

### Issue #15: Add Trigger Support for Auto-Analysis

**Labels:** `claude-code`, `priority: medium`, `backend`, `day-4`, `trigger`

**Description:**
Create triggers to automatically analyze journal entries, detect negative thoughts, and extract wins when records are created/updated.

**Acceptance Criteria:**
- [ ] Trigger on Mood_Entry__c to detect negative thoughts
- [ ] Trigger on Daily_Routine__c to extract wins from journal
- [ ] Trigger on Win_Entry__c to categorize uncategorized wins
- [ ] Async processing for AI calls
- [ ] Test class with 75%+ coverage

**Technical Requirements:**

**Triggers to Create:**

1. **MoodEntryTrigger** (on Mood_Entry__c):
```apex
trigger MoodEntryTrigger on Mood_Entry__c (after insert, after update) {
    if (Trigger.isAfter && Trigger.isInsert) {
        MoodEntryTriggerHandler.analyzeNegativeThoughts(Trigger.new);
    }
}
```

2. **DailyRoutineTrigger** (enhance existing or create):
```apex
// Add to existing trigger or create new handler method
public static void extractWinsFromJournal(List<Daily_Routine__c> routines) {
    // Call WinParserService async
}
```

3. **WinEntryTrigger** (on Win_Entry__c):
```apex
trigger WinEntryTrigger on Win_Entry__c (before insert) {
    if (Trigger.isBefore && Trigger.isInsert) {
        WinEntryTriggerHandler.autoCategorize(Trigger.new);
    }
}
```

**Handler Classes:**
```apex
public class MoodEntryTriggerHandler {
    @future(callout=true)
    public static void analyzeNegativeThoughts(Set<Id> moodEntryIds) {
        // Call NegativeThoughtDetector
    }
}

public class WinEntryTriggerHandler {
    public static void autoCategorize(List<Win_Entry__c> wins) {
        // Call WinParserService.categorizeWin()
    }
}
```

**Testing Requirements:**
- [ ] Test trigger firing
- [ ] Test async processing
- [ ] Test bulk operations (200 records)
- [ ] Test error handling
- [ ] Verify governor limits

**Files to Create:**
- `force-app/main/default/triggers/MoodEntryTrigger.trigger`
- `force-app/main/default/triggers/MoodEntryTrigger.trigger-meta.xml`
- `force-app/main/default/triggers/WinEntryTrigger.trigger`
- `force-app/main/default/triggers/WinEntryTrigger.trigger-meta.xml`
- `force-app/main/default/classes/MoodEntryTriggerHandler.cls`
- `force-app/main/default/classes/MoodEntryTriggerHandlerTest.cls`
- `force-app/main/default/classes/WinEntryTriggerHandler.cls`
- `force-app/main/default/classes/WinEntryTriggerHandlerTest.cls`

**Estimated Effort:** Medium (5-6 hours)

---

### Issue #16: Create Wellness Dashboard Reports & List Views

**Labels:** `claude-code`, `priority: low`, `frontend`, `day-4`

**Description:**
Create reports and list views for wellness data visualization (mood trends, wins, therapy progress).

**Acceptance Criteria:**
- [ ] 5+ reports created for wellness metrics
- [ ] List views for each custom object
- [ ] Reports use charts/graphs
- [ ] Reports available on dashboard

**Reports to Create:**

1. **Mood Trend Report** (Last 30 Days)
   - Chart: Line chart of daily mood
   - Grouping: By date
   - Filters: Last 30 days

2. **Weekly Wins Report**
   - Chart: Bar chart by category
   - Grouping: By category
   - Summary: Count of wins

3. **Therapy Effectiveness Report**
   - Chart: Scatter plot of effectiveness ratings
   - Grouping: By therapy type
   - Summary: Average effectiveness

4. **Cognitive Distortion Frequency**
   - Chart: Donut chart of distortion types
   - Grouping: By primary distortion
   - Summary: Count

5. **Routine Task Duration Report**
   - Chart: Bar chart of avg duration by task
   - Grouping: By task name
   - Comparison: Expected vs actual

**List Views to Create:**

For each object:
- All Records
- Today's Records
- This Week's Records
- Recent Activity (sorted by Last Modified)

**Testing Requirements:**
- [ ] Verify reports display data correctly
- [ ] Test chart rendering
- [ ] Test filtering
- [ ] Verify list view sorting

**Files to Create:**
- `force-app/main/default/reports/Wellness_Reports/*.report-meta.xml`
- `force-app/main/default/objects/*/listViews/*.listView-meta.xml`

**Estimated Effort:** Small (2-3 hours)

---

### Issue #17: Add Field Tracking & History for Key Fields

**Labels:** `claude-code`, `priority: low`, `backend`, `day-4`

**Description:**
Enable field history tracking on key wellness fields to track changes over time.

**Acceptance Criteria:**
- [ ] Field history enabled on all wellness objects
- [ ] Track 20 most important fields per object
- [ ] Configure field history retention
- [ ] Test history tracking

**Objects to Configure:**

1. **Mood_Entry__c:**
   - Mood__c
   - Trigger__c
   - Notes__c

2. **Win_Entry__c:**
   - Win_Text__c
   - Category__c
   - Impact_Score__c

3. **Daily_Routine__c:**
   - Energy_Level_Morning__c
   - Energy_Level_Afternoon__c
   - Stress_Level__c
   - Mood__c

4. **Imposter_Syndrome_Session__c:**
   - Session_Type__c
   - Effectiveness_Rating__c

5. **Gratitude_Entry__c:**
   - Intensity__c
   - Category__c

**Testing Requirements:**
- [ ] Create record and update tracked field
- [ ] Verify history appears on record detail
- [ ] Test history reports

**Files to Modify:**
- `force-app/main/default/objects/*/fields/*.field-meta.xml` (add trackHistory: true)

**Estimated Effort:** Small (1 hour)

---

### Issue #18: Update HolisticDashboard to Include Wellness Metrics

**Labels:** `claude-code`, `priority: high`, `frontend`, `day-4`, `lwc`

**Description:**
Enhance existing holisticDashboard LWC to display wellness metrics alongside job search and meal planning.

**Acceptance Criteria:**
- [ ] Add wellness section to dashboard
- [ ] Display mood trend chart
- [ ] Show weekly wins count
- [ ] Display therapy session count
- [ ] Show gratitude entries
- [ ] Update HolisticDashboardController with wellness queries
- [ ] Test class updated

**Technical Requirements:**

**Controller Updates (HolisticDashboardController.cls):**

Add new inner class:
```apex
public class WellnessStats {
    @AuraEnabled public Decimal weeklyMoodAvg;
    @AuraEnabled public Integer winsThisWeek;
    @AuraEnabled public Integer therapySessionsCompleted;
    @AuraEnabled public Integer gratitudeEntriesThisWeek;
    @AuraEnabled public String moodTrend;
    @AuraEnabled public List<MoodDataPoint> moodHistory;
}

public class MoodDataPoint {
    @AuraEnabled public Date dateRecorded;
    @AuraEnabled public Integer mood;
}
```

Add method:
```apex
@AuraEnabled(cacheable=true)
public static WellnessStats getWellnessStats() {
    WellnessStats stats = new WellnessStats();

    // Query mood entries for last 7 days
    List<Mood_Entry__c> moods = [SELECT Mood__c, CreatedDate
                                   FROM Mood_Entry__c
                                   WHERE CreatedDate = LAST_N_DAYS:7
                                   ORDER BY CreatedDate];

    // Calculate weekly average
    if (!moods.isEmpty()) {
        Decimal sum = 0;
        for (Mood_Entry__c m : moods) {
            sum += m.Mood__c;
        }
        stats.weeklyMoodAvg = sum / moods.size();
    }

    // Query wins
    stats.winsThisWeek = [SELECT COUNT() FROM Win_Entry__c WHERE CreatedDate = THIS_WEEK];

    // Query therapy sessions
    stats.therapySessionsCompleted = [SELECT COUNT() FROM Imposter_Syndrome_Session__c WHERE CreatedDate = THIS_WEEK];

    // Query gratitude
    stats.gratitudeEntriesThisWeek = [SELECT COUNT() FROM Gratitude_Entry__c WHERE CreatedDate = THIS_WEEK];

    // Get trend
    stats.moodTrend = MoodTrackerService.analyzeMoodTrend(UserInfo.getUserId(), 7);

    return stats;
}
```

**LWC Updates (holisticDashboard.html):**

Add wellness section after existing sections:
```html
<!-- Wellness Section -->
<lightning-card title="Wellness Tracking" icon-name="custom:custom63">
    <div class="slds-p-horizontal_small">
        <div class="metric-grid">
            <div class="metric">
                <div class="metric-label">Weekly Mood Average</div>
                <div class="metric-value">{wellnessStats.weeklyMoodAvg}</div>
                <div class="metric-trend">{wellnessStats.moodTrend}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Wins This Week</div>
                <div class="metric-value">{wellnessStats.winsThisWeek}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Therapy Sessions</div>
                <div class="metric-value">{wellnessStats.therapySessionsCompleted}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Gratitude Entries</div>
                <div class="metric-value">{wellnessStats.gratitudeEntriesThisWeek}</div>
            </div>
        </div>
    </div>
</lightning-card>
```

**Testing Requirements:**
- [ ] Test with various data scenarios
- [ ] Verify chart rendering
- [ ] Test responsive layout
- [ ] Update controller test class

**Files to Modify:**
- `force-app/main/default/classes/HolisticDashboardController.cls`
- `force-app/main/default/classes/HolisticDashboardControllerTest.cls`
- `force-app/main/default/lwc/holisticDashboard/holisticDashboard.html`
- `force-app/main/default/lwc/holisticDashboard/holisticDashboard.js`

**Estimated Effort:** Medium (4-5 hours)

---

## Summary

**Total Issues:** 18

**By Priority:**
- High: 10 issues
- Medium: 6 issues
- Low: 2 issues

**By Day:**
- Day 1: 5 issues (Database objects)
- Day 2: 6 issues (Apex classes)
- Day 3: 3 issues (Flows & API)
- Day 4: 4 issues (Triggers, reports, polish)

**By Type:**
- Backend: 13 issues
- Frontend: 2 issues
- Flow: 2 issues
- Mixed: 1 issue

**Total Estimated Hours:** 60-75 hours

**Expected Completion with Claude Code:** 70-85% in 4 days (15-20 features)

---

## Instructions for Creating GitHub Issues

1. Create each issue manually in GitHub, or use GitHub CLI:

```bash
# Install GitHub CLI if needed
# Then for each issue:

gh issue create \
  --repo abbyluggery/salesforce-wellness-platform \
  --title "[FEATURE] Create Gratitude_Entry__c Custom Object" \
  --body-file issue-01-gratitude-entry.md \
  --label "claude-code,priority: high,backend,day-1"
```

2. Use this template for each issue body (copy from above sections)

3. Apply appropriate labels for filtering

4. Assign to Claude Code bot (if configured)

5. Add to project board for tracking

---

## Next Steps After Issue Creation

1. **Test OAuth Flow:** Verify PWA → Salesforce authentication
2. **Monitor Claude Code Progress:** Check issue completion daily
3. **Review Pull Requests:** Review and merge Claude Code's PRs
4. **Test Integrated Flows:** End-to-end testing of wellness features
5. **Update Documentation:** README with new features
