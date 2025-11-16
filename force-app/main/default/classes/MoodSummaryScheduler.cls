/**
 * @description Schedulable class to trigger Weekly Mood Summary flow
 * Runs every Sunday at 8:00 PM to send mood insights email
 *
 * Schedule in Execute Anonymous:
 * String cronExp = '0 0 20 ? * SUN';
 * System.schedule('Weekly Mood Summary Email', cronExp, new MoodSummaryScheduler());
 *
 * @author Claude Code Assistant
 * @date 2025-11-16
 */
public class MoodSummaryScheduler implements Schedulable {

    /**
     * @description Execute method called by the scheduler
     * Triggers the Weekly_Mood_Summary flow for all active users
     */
    public void execute(SchedulableContext ctx) {
        // Get all active users who have wellness data
        List<User> activeUsers = [
            SELECT Id, Email
            FROM User
            WHERE IsActive = true
            AND Profile.Name NOT LIKE '%Guest%'
            LIMIT 200
        ];

        // For each user, check if they have mood entries this week
        Date weekStart = Date.today().toStartOfWeek();

        for (User user : activeUsers) {
            // Count mood entries for this user this week
            Integer moodCount = [
                SELECT COUNT()
                FROM Mood_Entry__c
                WHERE CreatedDate >= :weekStart
                AND CreatedBy.Id = :user.Id
            ];

            // Only send email if user has been tracking mood
            if (moodCount > 0) {
                try {
                    // Start Weekly_Mood_Summary flow
                    Flow.Interview weeklyMoodSummary = new Flow.Interview.Weekly_Mood_Summary(
                        new Map<String, Object>{
                            'UserId' => user.Id
                        }
                    );
                    weeklyMoodSummary.start();
                } catch (Exception e) {
                    System.debug(LoggingLevel.ERROR,
                        'MoodSummaryScheduler error for user ' + user.Id + ': ' + e.getMessage());
                }
            }
        }

        // Log execution
        System.debug('MoodSummaryScheduler completed for ' + activeUsers.size() + ' users');
    }
}
