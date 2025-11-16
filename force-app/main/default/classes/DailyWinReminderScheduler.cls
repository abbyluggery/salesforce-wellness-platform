/**
 * @description Schedulable class to trigger Daily Win Reminder flow
 * Runs every day at 7:00 PM to remind users to log wins
 *
 * Schedule in Execute Anonymous:
 * String cronExp = '0 0 19 * * ?';
 * System.schedule('Daily Win Reminder', cronExp, new DailyWinReminderScheduler());
 *
 * @author Claude Code Assistant
 * @date 2025-11-16
 */
public class DailyWinReminderScheduler implements Schedulable {

    /**
     * @description Execute method called by the scheduler
     * Triggers the Daily_Win_Reminder flow for all active users
     */
    public void execute(SchedulableContext ctx) {
        // Get all active users
        List<User> activeUsers = [
            SELECT Id, Email
            FROM User
            WHERE IsActive = true
            AND Profile.Name NOT LIKE '%Guest%'
            LIMIT 200
        ];

        // Check which users haven't logged wins today
        Date today = Date.today();

        for (User user : activeUsers) {
            // Count wins logged today by this user
            Integer winCount = [
                SELECT COUNT()
                FROM Win_Entry__c
                WHERE CreatedDate = TODAY
                AND CreatedBy.Id = :user.Id
            ];

            try {
                // Start Daily_Win_Reminder flow
                // The flow will send appropriate email based on whether wins exist
                Flow.Interview dailyWinReminder = new Flow.Interview.Daily_Win_Reminder(
                    new Map<String, Object>{
                        'UserId' => user.Id,
                        'HasWinsToday' => winCount > 0
                    }
                );
                dailyWinReminder.start();
            } catch (Exception e) {
                System.debug(LoggingLevel.ERROR,
                    'DailyWinReminderScheduler error for user ' + user.Id + ': ' + e.getMessage());
            }
        }

        // Log execution
        System.debug('DailyWinReminderScheduler completed for ' + activeUsers.size() + ' users');
    }
}
