/**
 * @description Service to detect cognitive distortions (CBT) in journal entries
 * and suggest evidence-based reframes
 *
 * @author Claude Code Assistant
 * @date 2025-11-15
 */
public with sharing class NegativeThoughtDetector {

    /**
     * @description Detect cognitive distortions in text using AI
     * @param text The text to analyze
     * @return List<DistortionResult> Detected distortions with reframes
     */
    public static List<DistortionResult> detectDistortions(String text) {
        if (String.isBlank(text)) {
            return new List<DistortionResult>();
        }

        try {
            String systemPrompt = 'You are a CBT therapist expert in identifying cognitive distortions. ' +
                'Analyze text for the 10 common cognitive distortions and suggest helpful reframes.';

            String userPrompt = 'Analyze this text for cognitive distortions:\n\n' +
                text + '\n\n' +
                'Identify any of these 10 distortions:\n' +
                '1. All-or-Nothing Thinking: Black and white, no middle ground\n' +
                '2. Overgeneralization: One event = always/never pattern\n' +
                '3. Mental Filter: Focus only on negatives\n' +
                '4. Disqualifying Positives: Reject positive experiences\n' +
                '5. Jumping to Conclusions: Mind reading or fortune telling\n' +
                '6. Magnification: Catastrophizing or minimizing\n' +
                '7. Emotional Reasoning: "I feel it, so it must be true"\n' +
                '8. Should Statements: Rigid rules causing guilt\n' +
                '9. Labeling: Extreme labels instead of describing behavior\n' +
                '10. Personalization: Taking responsibility for things outside your control\n\n' +
                'Return JSON array:\n' +
                '[{\n' +
                '  "distortionType": "name from list above",\n' +
                '  "extractedThought": "the specific thought",\n' +
                '  "severityScore": 1-10,\n' +
                '  "suggestedReframe": "CBT-based reframe"\n' +
                '}]\n\n' +
                'Only return the JSON array, nothing else.';

            ClaudeAPIService.ClaudeResponse response = ClaudeAPIService.generateText(systemPrompt, userPrompt);
            String responseText = ClaudeAPIService.extractTextContent(response);

            return parseDistortions(responseText);

        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Distortion detection error: ' + e.getMessage());
            return new List<DistortionResult>();
        }
    }

    /**
     * @description Generate CBT reframe for a specific distortion type
     * @param thought The thought to reframe
     * @param distortionType The type of distortion
     * @return String The reframed thought
     */
    public static String generateReframe(String thought, String distortionType) {
        // Simple template-based reframes as fallback
        Map<String, String> templates = new Map<String, String>{
            'All-or-Nothing Thinking' => 'Consider the middle ground. Things are rarely all good or all bad.',
            'Overgeneralization' => 'One instance doesn\'t define a pattern. Look for exceptions.',
            'Mental Filter' => 'Notice the positives too. What went well?',
            'Disqualifying Positives' => 'Your successes count. They\'re evidence of your abilities.',
            'Jumping to Conclusions' => 'What evidence supports this? What other explanations exist?',
            'Magnification' => 'Is this as catastrophic as it feels? Will it matter in a year?',
            'Emotional Reasoning' => 'Feelings are valid, but they aren\'t always facts.',
            'Should Statements' => 'Replace "should" with "prefer" or "it would be nice if".',
            'Labeling' => 'Describe the behavior, not your character. You aren\'t your actions.',
            'Personalization' => 'What factors are outside your control? You\'re not responsible for everything.'
        };

        String reframe = templates.get(distortionType);
        if (reframe != null) {
            return reframe;
        }

        return 'Challenge this thought: Is it based on facts or feelings?';
    }

    /**
     * @description Create Negative_Thought_Analysis__c record
     * @param thought The negative thought
     * @param moodEntryId Related mood entry ID
     * @return Negative_Thought_Analysis__c The created record
     */
    public static Negative_Thought_Analysis__c createAnalysis(String thought, Id moodEntryId) {
        List<DistortionResult> distortions = detectDistortions(thought);

        if (distortions.isEmpty()) {
            return null;
        }

        Negative_Thought_Analysis__c analysis = new Negative_Thought_Analysis__c();
        analysis.Original_Thought__c = thought;
        analysis.Mood_Entry__c = moodEntryId;
        analysis.Analysis_Date__c = DateTime.now();
        analysis.Processed_By_AI__c = true;

        // Use first distortion as primary
        DistortionResult primary = distortions[0];
        analysis.Primary_Distortion__c = primary.distortionType;
        analysis.Severity_Score__c = primary.severityScore;
        analysis.Reframe_Suggestion__c = primary.suggestedReframe;

        // Collect all detected distortions
        List<String> allDistortions = new List<String>();
        for (DistortionResult d : distortions) {
            allDistortions.add(d.distortionType);
        }
        // Multi-select picklist uses semicolons
        analysis.Detected_Distortions__c = String.join(allDistortions, ';');

        analysis.AI_Confidence__c = 0.85; // 85% confidence

        insert analysis;
        return analysis;
    }

    /**
     * @description Batch analyze multiple mood entries
     * @param moodEntryIds List of Mood_Entry__c IDs to analyze
     */
    @future(callout=true)
    public static void batchAnalyzeMoodEntries(Set<Id> moodEntryIds) {
        List<Mood_Entry__c> moods = [
            SELECT Id, Notes__c
            FROM Mood_Entry__c
            WHERE Id IN :moodEntryIds
        ];

        for (Mood_Entry__c mood : moods) {
            // Skip if Notes__c is blank
            if (String.isBlank(mood.Notes__c)) {
                continue;
            }
            try {
                createAnalysis(mood.Notes__c, mood.Id);
            } catch (Exception e) {
                System.debug(LoggingLevel.ERROR, 'Error analyzing mood ' + mood.Id + ': ' + e.getMessage());
            }
        }
    }

    /**
     * @description Parse distortions from JSON response
     * @param jsonText JSON response from AI
     * @return List<DistortionResult> Parsed distortions
     */
    private static List<DistortionResult> parseDistortions(String jsonText) {
        List<DistortionResult> distortions = new List<DistortionResult>();

        try {
            // Clean JSON
            jsonText = jsonText.trim();
            if (jsonText.startsWith('```json')) {
                jsonText = jsonText.substring(7);
            }
            if (jsonText.startsWith('```')) {
                jsonText = jsonText.substring(3);
            }
            if (jsonText.endsWith('```')) {
                jsonText = jsonText.substring(0, jsonText.length() - 3);
            }
            jsonText = jsonText.trim();

            List<Object> jsonList = (List<Object>) JSON.deserializeUntyped(jsonText);

            for (Object obj : jsonList) {
                Map<String, Object> distMap = (Map<String, Object>) obj;

                DistortionResult dist = new DistortionResult();
                dist.distortionType = (String) distMap.get('distortionType');
                dist.extractedThought = (String) distMap.get('extractedThought');
                dist.suggestedReframe = (String) distMap.get('suggestedReframe');

                Object severityObj = distMap.get('severityScore');
                if (severityObj != null) {
                    dist.severityScore = Integer.valueOf(severityObj);
                }

                distortions.add(dist);
            }

        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'JSON parse error: ' + e.getMessage());
        }

        return distortions;
    }

    /**
     * @description Inner class for distortion results
     */
    public class DistortionResult {
        public String distortionType;
        public String extractedThought;
        public Integer severityScore;
        public String suggestedReframe;

        public DistortionResult() {
            this.severityScore = 5;
        }
    }
}
