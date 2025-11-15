/**
 * @description Test class for DailyRoutineAPI
 *
 * @author Claude Code Assistant
 * @date 2025-11-15
 */
@isTest
private class DailyRoutineAPITest {

    @testSetup
    static void setup() {
        // Create daily routine
        Daily_Routine__c routine = new Daily_Routine__c(
            Date__c = Date.today(),
            Mood__c = 'Happy',
            Stress_Level__c = 'Low',
            Gratitude__c = 'Great weather today',
            Morning_Routine_Complete__c = true,
            Exercise_Completed__c = true
        );
        insert routine;

        // Create mood entries
        List<Mood_Entry__c> moodEntries = new List<Mood_Entry__c>();
        moodEntries.add(new Mood_Entry__c(
            Daily_Routine__c = routine.Id,
            Time_of_Day__c = 'Morning',
            Mood_Score__c = 8,
            Energy_Score__c = 7,
            Notes__c = 'Feeling energized',
            Timestamp__c = DateTime.now()
        ));
        moodEntries.add(new Mood_Entry__c(
            Daily_Routine__c = routine.Id,
            Time_of_Day__c = 'Evening',
            Mood_Score__c = 7,
            Energy_Score__c = 6,
            Notes__c = 'Productive day',
            Timestamp__c = DateTime.now()
        ));
        insert moodEntries;

        // Create win entries
        List<Win_Entry__c> winEntries = new List<Win_Entry__c>();
        winEntries.add(new Win_Entry__c(
            Daily_Routine__c = routine.Id,
            Win_Text__c = 'Completed project milestone',
            Category__c = 'Work',
            Timestamp__c = DateTime.now()
        ));
        insert winEntries;
    }

    @isTest
    static void testGetDailyRoutine_Success() {
        // Setup
        RestRequest req = new RestRequest();
        RestResponse res = new RestResponse();
        req.requestURI = '/services/apexrest/routine/daily/' + String.valueOf(Date.today());
        req.httpMethod = 'GET';
        RestContext.request = req;
        RestContext.response = res;

        Test.startTest();
        DailyRoutineAPI.getDailyRoutine();
        Test.stopTest();

        // Verify
        System.assertEquals(200, res.statusCode, 'Should return 200 status');
        String responseBody = res.responseBody.toString();
        System.assert(responseBody.contains('success'), 'Response should contain success');
        System.assert(responseBody.contains('Happy'), 'Response should contain mood data');
    }

    @isTest
    static void testGetDailyRoutine_NoRoutineFound() {
        // Setup - use future date with no routine
        RestRequest req = new RestRequest();
        RestResponse res = new RestResponse();
        req.requestURI = '/services/apexrest/routine/daily/2099-12-31';
        req.httpMethod = 'GET';
        RestContext.request = req;
        RestContext.response = res;

        Test.startTest();
        DailyRoutineAPI.getDailyRoutine();
        Test.stopTest();

        // Verify
        System.assertEquals(200, res.statusCode, 'Should return 200 status');
        String responseBody = res.responseBody.toString();
        System.assert(responseBody.contains('No routine found'), 'Should indicate no routine');
    }

    @isTest
    static void testGetDailyRoutine_InvalidDate() {
        // Setup
        RestRequest req = new RestRequest();
        RestResponse res = new RestResponse();
        req.requestURI = '/services/apexrest/routine/daily/invalid-date';
        req.httpMethod = 'GET';
        RestContext.request = req;
        RestContext.response = res;

        Test.startTest();
        DailyRoutineAPI.getDailyRoutine();
        Test.stopTest();

        // Verify
        System.assertEquals(400, res.statusCode, 'Should return 400 for invalid date');
        String responseBody = res.responseBody.toString();
        System.assert(responseBody.contains('Invalid date format'), 'Should show validation error');
    }

    @isTest
    static void testUpsertDailyRoutine_CreateNew() {
        // Setup
        RestRequest req = new RestRequest();
        RestResponse res = new RestResponse();
        req.httpMethod = 'POST';
        RestContext.request = req;
        RestContext.response = res;

        DailyRoutineAPI.RoutineData routineData = new DailyRoutineAPI.RoutineData();
        routineData.routineDate = '2099-12-30';
        routineData.mood = 'Excited';
        routineData.stressLevel = 'Medium';
        routineData.gratitude = 'New opportunities';
        routineData.morningRoutineComplete = true;

        Test.startTest();
        DailyRoutineAPI.upsertDailyRoutine(routineData);
        Test.stopTest();

        // Verify
        System.assertEquals(200, res.statusCode, 'Should return 200 status');
        String responseBody = res.responseBody.toString();
        System.assert(responseBody.contains('success'), 'Response should indicate success');

        // Verify record created
        List<Daily_Routine__c> routines = [
            SELECT Id, Mood__c FROM Daily_Routine__c
            WHERE Date__c = :Date.valueOf('2099-12-30')
        ];
        System.assertEquals(1, routines.size(), 'Routine should be created');
        System.assertEquals('Excited', routines[0].Mood__c, 'Mood should be set');
    }

    @isTest
    static void testUpsertDailyRoutine_UpdateExisting() {
        // Setup
        RestRequest req = new RestRequest();
        RestResponse res = new RestResponse();
        req.httpMethod = 'POST';
        RestContext.request = req;
        RestContext.response = res;

        DailyRoutineAPI.RoutineData routineData = new DailyRoutineAPI.RoutineData();
        routineData.routineDate = String.valueOf(Date.today());
        routineData.mood = 'Peaceful';
        routineData.stressLevel = 'Low';

        Test.startTest();
        DailyRoutineAPI.upsertDailyRoutine(routineData);
        Test.stopTest();

        // Verify
        System.assertEquals(200, res.statusCode, 'Should return 200 status');

        // Verify record updated
        List<Daily_Routine__c> routines = [
            SELECT Id, Mood__c FROM Daily_Routine__c
            WHERE Date__c = :Date.today()
        ];
        System.assertEquals(1, routines.size(), 'Should only have one routine');
        System.assertEquals('Peaceful', routines[0].Mood__c, 'Mood should be updated');
    }

    @isTest
    static void testUpsertDailyRoutine_WithMoodEntries() {
        // Setup
        RestRequest req = new RestRequest();
        RestResponse res = new RestResponse();
        req.httpMethod = 'POST';
        RestContext.request = req;
        RestContext.response = res;

        DailyRoutineAPI.RoutineData routineData = new DailyRoutineAPI.RoutineData();
        routineData.routineDate = '2099-12-29';
        routineData.mood = 'Content';

        // Add mood entries
        DailyRoutineAPI.MoodEntryData moodEntry = new DailyRoutineAPI.MoodEntryData();
        moodEntry.timeOfDay = 'Afternoon';
        moodEntry.moodScore = 9;
        moodEntry.energyScore = 8;
        moodEntry.notes = 'Great afternoon';
        routineData.moodEntries = new List<DailyRoutineAPI.MoodEntryData>{moodEntry};

        Test.startTest();
        DailyRoutineAPI.upsertDailyRoutine(routineData);
        Test.stopTest();

        // Verify
        System.assertEquals(200, res.statusCode, 'Should return 200 status');

        // Verify mood entry created
        List<Mood_Entry__c> entries = [
            SELECT Id, Mood_Score__c, Notes__c FROM Mood_Entry__c
            WHERE Mood_Score__c = 9
            LIMIT 1
        ];
        System.assertEquals(1, entries.size(), 'Mood entry should be created');
        System.assertEquals(9, entries[0].Mood_Score__c, 'Mood score should be set');
    }

    @isTest
    static void testUpsertDailyRoutine_WithWinEntries() {
        // Setup
        RestRequest req = new RestRequest();
        RestResponse res = new RestResponse();
        req.httpMethod = 'POST';
        RestContext.request = req;
        RestContext.response = res;

        DailyRoutineAPI.RoutineData routineData = new DailyRoutineAPI.RoutineData();
        routineData.routineDate = '2099-12-28';
        routineData.mood = 'Proud';

        // Add win entries
        DailyRoutineAPI.WinEntryData winEntry = new DailyRoutineAPI.WinEntryData();
        winEntry.winText = 'Helped a colleague with a problem';
        winEntry.category = 'Work';
        routineData.wins = new List<DailyRoutineAPI.WinEntryData>{winEntry};

        Test.startTest();
        DailyRoutineAPI.upsertDailyRoutine(routineData);
        Test.stopTest();

        // Verify
        System.assertEquals(200, res.statusCode, 'Should return 200 status');

        // Verify win entry created
        List<Win_Entry__c> entries = [
            SELECT Id, Win_Text__c FROM Win_Entry__c
            WHERE Win_Text__c = 'Helped a colleague with a problem'
        ];
        System.assertEquals(1, entries.size(), 'Win entry should be created');
    }

    @isTest
    static void testUpsertDailyRoutine_MissingDate() {
        // Setup
        RestRequest req = new RestRequest();
        RestResponse res = new RestResponse();
        req.httpMethod = 'POST';
        RestContext.request = req;
        RestContext.response = res;

        DailyRoutineAPI.RoutineData routineData = new DailyRoutineAPI.RoutineData();
        routineData.mood = 'Happy';
        // Missing routineDate

        Test.startTest();
        DailyRoutineAPI.upsertDailyRoutine(routineData);
        Test.stopTest();

        // Verify
        System.assertEquals(400, res.statusCode, 'Should return 400 for missing date');
        String responseBody = res.responseBody.toString();
        System.assert(responseBody.contains('required'), 'Should show validation error');
    }

    @isTest
    static void testCreateGratitudeEntry_Success() {
        DailyRoutineAPI.GratitudeData gratitudeData = new DailyRoutineAPI.GratitudeData();
        gratitudeData.gratitudeText = 'Thankful for my health';
        gratitudeData.category = 'Health';
        gratitudeData.intensity = 8;
        gratitudeData.dateRecorded = String.valueOf(Date.today());

        Test.startTest();
        DailyRoutineAPI.APIResponse response = DailyRoutineAPI.createGratitudeEntry(gratitudeData);
        Test.stopTest();

        // Verify
        System.assertEquals(true, response.success, 'Should succeed');
        System.assertNotEquals(null, response.data, 'Should return data');

        // Verify record created
        List<Gratitude_Entry__c> entries = [
            SELECT Id, Gratitude_Text__c, Category__c, Intensity__c
            FROM Gratitude_Entry__c
            WHERE Gratitude_Text__c = 'Thankful for my health'
        ];
        System.assertEquals(1, entries.size(), 'Entry should be created');
        System.assertEquals('Health', entries[0].Category__c, 'Category should be set');
        System.assertEquals(8, entries[0].Intensity__c, 'Intensity should be set');
    }

    @isTest
    static void testCreateGratitudeEntry_MissingText() {
        DailyRoutineAPI.GratitudeData gratitudeData = new DailyRoutineAPI.GratitudeData();
        gratitudeData.category = 'Health';

        Test.startTest();
        DailyRoutineAPI.APIResponse response = DailyRoutineAPI.createGratitudeEntry(gratitudeData);
        Test.stopTest();

        // Verify
        System.assertEquals(false, response.success, 'Should fail validation');
        System.assert(response.error.contains('required'), 'Should show validation error');
    }

    @isTest
    static void testCreateMoodEntry_Success() {
        DailyRoutineAPI.MoodData moodData = new DailyRoutineAPI.MoodData();
        moodData.mood = 6;
        moodData.trigger = 'Heavy traffic';
        moodData.notes = 'Feeling a bit stressed';

        Test.startTest();
        DailyRoutineAPI.APIResponse response = DailyRoutineAPI.createMoodEntry(moodData);
        Test.stopTest();

        // Verify
        System.assertEquals(true, response.success, 'Should succeed');
        System.assertNotEquals(null, response.data, 'Should return data');

        // Verify record created
        List<Mood_Entry__c> entries = [
            SELECT Id, Mood_Score__c, Notes__c
            FROM Mood_Entry__c
            WHERE Mood_Score__c = 6
            LIMIT 1
        ];
        System.assertEquals(1, entries.size(), 'Entry should be created');
        System.assertEquals(6, entries[0].Mood_Score__c, 'Mood score should be set');
        System.assert(entries[0].Notes__c.contains('Trigger: Heavy traffic'), 'Should include trigger');
    }

    @isTest
    static void testCreateMoodEntry_MissingMood() {
        DailyRoutineAPI.MoodData moodData = new DailyRoutineAPI.MoodData();
        moodData.notes = 'Just some notes';

        Test.startTest();
        DailyRoutineAPI.APIResponse response = DailyRoutineAPI.createMoodEntry(moodData);
        Test.stopTest();

        // Verify
        System.assertEquals(false, response.success, 'Should fail validation');
        System.assert(response.error.contains('required'), 'Should show validation error');
    }

    @isTest
    static void testGetTherapyProtocols_Success() {
        Test.startTest();
        DailyRoutineAPI.APIResponse response = DailyRoutineAPI.getTherapyProtocols();
        Test.stopTest();

        // Verify
        System.assertEquals(true, response.success, 'Should succeed');
        System.assertNotEquals(null, response.data, 'Should return data');

        // Verify protocols returned
        List<DailyRoutineAPI.TherapyProtocol> protocols =
            (List<DailyRoutineAPI.TherapyProtocol>) response.data;
        System.assertEquals(5, protocols.size(), 'Should return 5 therapy types');

        // Verify protocol structure
        Boolean foundCBT = false;
        for (DailyRoutineAPI.TherapyProtocol protocol : protocols) {
            if (protocol.therapyType == 'CBT') {
                foundCBT = true;
                System.assert(protocol.steps.size() > 0, 'CBT should have steps');
                System.assertNotEquals(null, protocol.steps[0].stepName, 'Steps should have names');
            }
        }
        System.assert(foundCBT, 'Should include CBT protocol');
    }

    @isTest
    static void testMapRoutineToData() {
        Daily_Routine__c routine = [
            SELECT Id, Date__c, Mood__c, Stress_Level__c, Gratitude__c,
                   Morning_Routine_Complete__c, Exercise_Completed__c,
                   Accomplished_Today__c, Tomorrow_Priorities__c, Challenges__c,
                   LastModifiedDate,
                   (SELECT Id, Time_of_Day__c, Mood_Score__c, Energy_Score__c,
                           Notes__c, Timestamp__c
                    FROM Mood_Entries__r),
                   (SELECT Id, Win_Text__c, Category__c, Timestamp__c
                    FROM Win_Entries__r)
            FROM Daily_Routine__c
            LIMIT 1
        ];

        Test.startTest();
        // This is a private method, but we can test it indirectly via GET endpoint
        RestRequest req = new RestRequest();
        RestResponse res = new RestResponse();
        req.requestURI = '/services/apexrest/routine/daily/' + String.valueOf(Date.today());
        req.httpMethod = 'GET';
        RestContext.request = req;
        RestContext.response = res;

        DailyRoutineAPI.getDailyRoutine();
        Test.stopTest();

        // Verify mapping worked
        System.assertEquals(200, res.statusCode, 'Should return success');
        String responseBody = res.responseBody.toString();
        System.assert(responseBody.contains('moodEntries'), 'Should map mood entries');
        System.assert(responseBody.contains('wins'), 'Should map win entries');
    }
}
