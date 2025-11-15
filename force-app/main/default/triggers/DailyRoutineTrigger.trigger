/**
 * @description Trigger on Daily_Routine__c to automatically parse wins and analyze patterns
 * @author Claude Code Assistant
 * @date 2025-11-15
 */
trigger DailyRoutineTrigger on Daily_Routine__c (after insert, after update) {
    if (Trigger.isAfter && (Trigger.isInsert || Trigger.isUpdate)) {
        // Collect routines that have new or updated accomplishments
        Set<Id> routinesToProcess = new Set<Id>();

        for (Daily_Routine__c routine : Trigger.new) {
            // Check if Accomplished_Today field has content
            if (String.isNotBlank(routine.Accomplished_Today__c)) {
                // For updates, only process if the field changed
                if (Trigger.isInsert) {
                    routinesToProcess.add(routine.Id);
                } else {
                    Daily_Routine__c oldRoutine = Trigger.oldMap.get(routine.Id);
                    if (routine.Accomplished_Today__c != oldRoutine.Accomplished_Today__c) {
                        routinesToProcess.add(routine.Id);
                    }
                }
            }
        }

        // Trigger async win parsing
        if (!routinesToProcess.isEmpty()) {
            WinParserService.batchProcessJournals(routinesToProcess);
        }
    }
}
