/**
 * @description Trigger on Win_Entry__c to automatically detect imposter syndrome patterns
 * @author Claude Code Assistant
 * @date 2025-11-15
 */
trigger WinEntryTrigger on Win_Entry__c (after insert) {
    if (Trigger.isAfter && Trigger.isInsert) {
        // Collect wins to analyze for imposter syndrome patterns
        Map<Id, String> winsToAnalyze = new Map<Id, String>();

        for (Win_Entry__c win : Trigger.new) {
            if (String.isNotBlank(win.Win_Text__c)) {
                winsToAnalyze.put(win.Id, win.Win_Text__c);
            }
        }

        // Trigger async imposter syndrome analysis
        if (!winsToAnalyze.isEmpty()) {
            analyzeWinsForImposterSyndrome(winsToAnalyze);
        }
    }

    /**
     * @description Analyze wins for imposter syndrome patterns asynchronously
     */
    @future(callout=true)
    static void analyzeWinsForImposterSyndrome(Map<Id, String> winsMap) {
        List<Therapy_Step_Completion__c> sessionsToCreate = new List<Therapy_Step_Completion__c>();

        for (Id winId : winsMap.keySet()) {
            String winText = winsMap.get(winId);

            try {
                // Analyze text for imposter syndrome
                ImposterSyndromeAnalyzer.ImposterAnalysisResult result =
                    ImposterSyndromeAnalyzer.analyzeText(winText);

                // If imposter thought detected, create therapy session recommendation
                if (result.isImposterThought && result.severityScore >= 5) {
                    // Get the win entry to find related daily routine
                    Win_Entry__c winEntry = [
                        SELECT Daily_Routine__c
                        FROM Win_Entry__c
                        WHERE Id = :winId
                        LIMIT 1
                    ];

                    if (winEntry.Daily_Routine__c != null) {
                        // Create session with recommended reframe
                        Therapy_Step_Completion__c session = new Therapy_Step_Completion__c(
                            Daily_Routine__c = winEntry.Daily_Routine__c,
                            Therapy_Type__c = 'CBT',
                            Step_Number__c = 1,
                            Step_Name__c = 'Imposter Syndrome Reframe',
                            Instructions__c = 'Detected imposter pattern: ' + result.primaryPattern +
                                             '\\n\\nSuggested reframe: ' + result.suggestedReframe,
                            Effectiveness_Rating__c = null
                        );
                        sessionsToCreate.add(session);
                    }
                }
            } catch (Exception e) {
                System.debug(LoggingLevel.ERROR,
                    'WinEntryTrigger: Error analyzing win ' + winId + ': ' + e.getMessage());
            }
        }

        // Insert therapy recommendations
        if (!sessionsToCreate.isEmpty()) {
            try {
                insert sessionsToCreate;
            } catch (Exception e) {
                System.debug(LoggingLevel.ERROR,
                    'WinEntryTrigger: Error creating therapy sessions: ' + e.getMessage());
            }
        }
    }
}
