/**
 * @description Trigger on Mood_Entry__c to automatically analyze negative thoughts
 * @author Claude Code Assistant
 * @date 2025-11-15
 */
trigger MoodEntryTrigger on Mood_Entry__c (after insert) {
    if (Trigger.isAfter && Trigger.isInsert) {
        // Collect mood entries that may contain negative thoughts (low mood score or notes)
        Set<Id> moodEntriesToAnalyze = new Set<Id>();

        for (Mood_Entry__c entry : Trigger.new) {
            // Analyze if mood is low (< 5) or if notes are provided
            if ((entry.Mood_Score__c != null && entry.Mood_Score__c < 5) ||
                String.isNotBlank(entry.Notes__c)) {
                moodEntriesToAnalyze.add(entry.Id);
            }
        }

        // Trigger async analysis for negative thoughts
        if (!moodEntriesToAnalyze.isEmpty()) {
            NegativeThoughtDetector.batchAnalyzeMoodEntries(moodEntriesToAnalyze);
        }
    }
}
