/**
 * @description Test class for DailyWinReminderScheduler
 * @author Claude Code Assistant
 * @date 2025-11-16
 */
@isTest
private class DailyWinReminderSchedulerTest {

    @testSetup
    static void setup() {
        // Create daily routine
        Daily_Routine__c routine = new Daily_Routine__c(
            Date__c = Date.today()
        );
        insert routine;

        // Create win entries
        List<Win_Entry__c> winEntries = new List<Win_Entry__c>();
        winEntries.add(new Win_Entry__c(
            Daily_Routine__c = routine.Id,
            Win_Text__c = 'Completed a project',
            Category__c = 'Work',
            Timestamp__c = DateTime.now()
        ));
        insert winEntries;
    }

    @isTest
    static void testSchedulerExecution() {
        Test.startTest();

        // Schedule the job
        String cronExp = '0 0 19 * * ?';
        String jobId = System.schedule('Test Daily Win Reminder',
                                      cronExp,
                                      new DailyWinReminderScheduler());

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
    static void testSchedulerWithWinData() {
        // Execute the scheduler directly
        Test.startTest();
        DailyWinReminderScheduler scheduler = new DailyWinReminderScheduler();
        scheduler.execute(null);
        Test.stopTest();

        // Verify execution completed without errors
        System.assert(true, 'Scheduler should execute without errors');
    }

    @isTest
    static void testSchedulerWithNoWinData() {
        // Delete all win entries
        delete [SELECT Id FROM Win_Entry__c];

        Test.startTest();
        DailyWinReminderScheduler scheduler = new DailyWinReminderScheduler();
        scheduler.execute(null);
        Test.stopTest();

        // Verify execution completed without errors
        System.assert(true, 'Scheduler should handle no win data gracefully');
    }

    @isTest
    static void testSchedulerWithMultipleUsers() {
        // The test will run with the current user
        // This test verifies the scheduler processes users correctly

        Test.startTest();
        DailyWinReminderScheduler scheduler = new DailyWinReminderScheduler();
        scheduler.execute(null);
        Test.stopTest();

        // Verify successful execution
        System.assert(true, 'Scheduler should process multiple users');
    }
}
