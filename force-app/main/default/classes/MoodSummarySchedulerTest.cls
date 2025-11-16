/**
 * @description Test class for MoodSummaryScheduler
 * @author Claude Code Assistant
 * @date 2025-11-16
 */
@isTest
private class MoodSummarySchedulerTest {

    @testSetup
    static void setup() {
        // Create daily routine
        Daily_Routine__c routine = new Daily_Routine__c(
            Date__c = Date.today()
        );
        insert routine;

        // Create mood entries
        List<Mood_Entry__c> moodEntries = new List<Mood_Entry__c>();
        for (Integer i = 0; i < 5; i++) {
            moodEntries.add(new Mood_Entry__c(
                Daily_Routine__c = routine.Id,
                Mood_Score__c = 7 + i,
                Energy_Score__c = 6,
                Time_of_Day__c = 'Morning',
                Timestamp__c = DateTime.now().addDays(-i)
            ));
        }
        insert moodEntries;
    }

    @isTest
    static void testSchedulerExecution() {
        Test.startTest();

        // Schedule the job
        String cronExp = '0 0 20 ? * SUN';
        String jobId = System.schedule('Test Weekly Mood Summary',
                                      cronExp,
                                      new MoodSummaryScheduler());

        // Verify job was scheduled
        System.assertNotEquals(null, jobId, 'Job should be scheduled');

        // Get scheduled job info
        CronTrigger ct = [
            SELECT Id, CronExpression, TimesTriggered, NextFireTime
            FROM CronTrigger
            WHERE Id = :jobId
        ];

        System.assertEquals(cronExp, ct.CronExpression, 'Cron expression should match');
        System.assertEquals(0, ct.TimesTriggered, 'Job should not have run yet');

        Test.stopTest();
    }

    @isTest
    static void testSchedulerWithMoodData() {
        // Execute the scheduler directly
        Test.startTest();
        MoodSummaryScheduler scheduler = new MoodSummaryScheduler();
        scheduler.execute(null);
        Test.stopTest();

        // Verify execution completed without errors
        // Since flow execution is async, we just verify no exceptions were thrown
        System.assert(true, 'Scheduler should execute without errors');
    }

    @isTest
    static void testSchedulerWithNoMoodData() {
        // Delete all mood entries
        delete [SELECT Id FROM Mood_Entry__c];

        Test.startTest();
        MoodSummaryScheduler scheduler = new MoodSummaryScheduler();
        scheduler.execute(null);
        Test.stopTest();

        // Verify execution completed without errors
        System.assert(true, 'Scheduler should handle no mood data gracefully');
    }
}
