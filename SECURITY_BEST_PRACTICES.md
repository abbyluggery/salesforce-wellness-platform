# NeuroThrive Platform - Security Best Practices

**Created:** 2025-11-16
**Target Org:** abbyluggery179@agentforce.com
**Platform Version:** API 59.0

## Overview

This document outlines security best practices for the NeuroThrive Holistic Life Assistant platform, focusing on Salesforce-specific security patterns, data protection, and compliance considerations for mental health wellness data.

---

## 1. SOQL Query Security

### Using WITH SECURITY_ENFORCED

**Purpose:** Enforce field-level security (FLS) and object-level security at query runtime.

**Pattern:**
```apex
List<Mood_Entry__c> moods = [
    SELECT Id, Mood_Score__c, Entry_Date__c, Notes__c
    FROM Mood_Entry__c
    WHERE CreatedBy.Id = :userId
    WITH SECURITY_ENFORCED
    ORDER BY Entry_Date__c DESC
    LIMIT 30
];
```

**When to Use:**
- All SOQL queries in controller classes exposed to Lightning components
- Any query that returns data directly to the UI
- Queries in service classes that may be called from multiple contexts

**Current Implementation Status:**
The following classes should be updated with `WITH SECURITY_ENFORCED`:

**High Priority:**
- `HolisticDashboardController.cls` - All SOQL queries (lines 45, 89, 134, 178, 223, 268, 312, 356, 381)
- `MealPlanController.cls` - Recipe and meal plan queries
- `ShoppingListController.cls` - Shopping list and item queries
- `InterviewPrepController.cls` - Job posting queries

**Example Fix:**
```apex
// BEFORE (insecure)
List<Gratitude_Entry__c> gratitudes = [
    SELECT Id, Entry_Text__c, Created_Date__c
    FROM Gratitude_Entry__c
    WHERE User__c = :userId
];

// AFTER (secure)
List<Gratitude_Entry__c> gratitudes = [
    SELECT Id, Entry_Text__c, Created_Date__c
    FROM Gratitude_Entry__c
    WHERE User__c = :userId
    WITH SECURITY_ENFORCED
];
```

### Handling Security Exceptions

**Pattern:**
```apex
try {
    List<Mood_Entry__c> moods = [
        SELECT Id, Mood_Score__c, Entry_Date__c
        FROM Mood_Entry__c
        WHERE CreatedBy.Id = :UserInfo.getUserId()
        WITH SECURITY_ENFORCED
        LIMIT 30
    ];
    return moods;
} catch (System.QueryException e) {
    // Log security violation
    System.debug(LoggingLevel.ERROR, 'FLS violation in mood query: ' + e.getMessage());

    // Return empty list or throw custom exception
    throw new AuraHandledException('You do not have permission to access mood data.');
}
```

---

## 2. Security.stripInaccessible()

### Purpose

Remove fields from DML operations that the current user cannot access, preventing FLS bypass vulnerabilities.

### DML Insert Pattern

```apex
@AuraEnabled
public static Id createMoodEntry(Mood_Entry__c moodEntry) {
    try {
        // Strip inaccessible fields before insert
        SObjectAccessDecision decision = Security.stripInaccessible(
            AccessType.CREATABLE,
            new List<Mood_Entry__c>{moodEntry}
        );

        insert decision.getRecords();
        return decision.getRecords()[0].Id;

    } catch (Exception e) {
        throw new AuraHandledException('Error creating mood entry: ' + e.getMessage());
    }
}
```

### DML Update Pattern

```apex
@AuraEnabled
public static void updateWinEntry(Win_Entry__c winEntry) {
    try {
        // Strip inaccessible fields before update
        SObjectAccessDecision decision = Security.stripInaccessible(
            AccessType.UPDATABLE,
            new List<Win_Entry__c>{winEntry}
        );

        update decision.getRecords();

    } catch (Exception e) {
        throw new AuraHandledException('Error updating win entry: ' + e.getMessage());
    }
}
```

### Classes Requiring stripInaccessible

**Priority Updates:**
1. `WinParserService.cls` - Win_Entry__c inserts
2. `MoodTrackerService.cls` - Mood_Entry__c inserts
3. `MealPlanController.cls` - Weekly_Meal_Plan__c, Meal__c inserts/updates
4. `ShoppingListController.cls` - Shopping_List__c, Shopping_List_Item__c DML
5. `GratitudeService.cls` - Gratitude_Entry__c inserts

---

## 3. CRUD and FLS Checks

### Schema-Based Permission Checks

**Object-Level Permissions:**
```apex
@AuraEnabled
public static List<Mood_Entry__c> getMoodEntries() {
    // Check object-level read permission
    if (!Schema.sObjectType.Mood_Entry__c.isAccessible()) {
        throw new AuraHandledException('You do not have permission to view mood entries.');
    }

    // Check field-level read permissions
    if (!Schema.sObjectType.Mood_Entry__c.fields.Mood_Score__c.isAccessible() ||
        !Schema.sObjectType.Mood_Entry__c.fields.Entry_Date__c.isAccessible()) {
        throw new AuraHandledException('You do not have permission to view required mood fields.');
    }

    return [
        SELECT Id, Mood_Score__c, Entry_Date__c, Notes__c
        FROM Mood_Entry__c
        WITH SECURITY_ENFORCED
        LIMIT 100
    ];
}
```

**Create Permission Check:**
```apex
@AuraEnabled
public static Id createGratitudeEntry(String entryText) {
    // Check create permission
    if (!Schema.sObjectType.Gratitude_Entry__c.isCreateable()) {
        throw new AuraHandledException('You do not have permission to create gratitude entries.');
    }

    Gratitude_Entry__c gratitude = new Gratitude_Entry__c(
        Entry_Text__c = entryText,
        User__c = UserInfo.getUserId()
    );

    SObjectAccessDecision decision = Security.stripInaccessible(
        AccessType.CREATABLE,
        new List<Gratitude_Entry__c>{gratitude}
    );

    insert decision.getRecords();
    return decision.getRecords()[0].Id;
}
```

**Update Permission Check:**
```apex
@AuraEnabled
public static void updateMoodEntry(Id moodId, Decimal newScore) {
    // Check update permission
    if (!Schema.sObjectType.Mood_Entry__c.isUpdateable()) {
        throw new AuraHandledException('You do not have permission to update mood entries.');
    }

    Mood_Entry__c mood = new Mood_Entry__c(
        Id = moodId,
        Mood_Score__c = newScore
    );

    SObjectAccessDecision decision = Security.stripInaccessible(
        AccessType.UPDATABLE,
        new List<Mood_Entry__c>{mood}
    );

    update decision.getRecords();
}
```

**Delete Permission Check:**
```apex
@AuraEnabled
public static void deleteTherapyStep(Id stepId) {
    // Check delete permission
    if (!Schema.sObjectType.Therapy_Step_Completion__c.isDeletable()) {
        throw new AuraHandledException('You do not have permission to delete therapy steps.');
    }

    delete [SELECT Id FROM Therapy_Step_Completion__c WHERE Id = :stepId];
}
```

---

## 4. SOQL Injection Prevention

### String.escapeSingleQuotes()

**Always escape user input in dynamic SOQL:**

```apex
// UNSAFE - Vulnerable to SOQL injection
@AuraEnabled
public static List<Recipe__c> searchRecipes(String searchTerm) {
    String query = 'SELECT Id, Name FROM Recipe__c WHERE Name LIKE \'%' + searchTerm + '%\'';
    return Database.query(query);
}

// SAFE - Properly escaped
@AuraEnabled
public static List<Recipe__c> searchRecipes(String searchTerm) {
    String safeTerm = String.escapeSingleQuotes(searchTerm);
    String query = 'SELECT Id, Name FROM Recipe__c WHERE Name LIKE \'%' + safeTerm + '%\' WITH SECURITY_ENFORCED';
    return Database.query(query);
}
```

### Prefer Static SOQL with Bind Variables

```apex
// BEST PRACTICE - Use bind variables instead of dynamic SOQL
@AuraEnabled
public static List<Recipe__c> searchRecipes(String searchTerm) {
    String searchPattern = '%' + searchTerm + '%';
    return [
        SELECT Id, Name, Description__c, Prep_Time__c
        FROM Recipe__c
        WHERE Name LIKE :searchPattern
        WITH SECURITY_ENFORCED
        LIMIT 50
    ];
}
```

### Classes Requiring SOQL Injection Review

1. `HolisticDashboardController.cls` - Any dynamic queries
2. `MealPlanController.cls` - Recipe search functionality
3. `InterviewPrepController.cls` - Job posting search

---

## 5. Sensitive Data Protection

### Mental Health Data Classification

**Highly Sensitive (Requires Extra Protection):**
- `Mood_Entry__c.Notes__c` - Free-text mood notes
- `Therapy_Step_Completion__c.User_Response__c` - Therapy session notes
- `Win_Entry__c.Raw_Text__c` - Personal achievement text
- `Gratitude_Entry__c.Entry_Text__c` - Personal gratitude reflections

**Moderate Sensitivity:**
- `Daily_Routine__c` - Daily activity logs
- `Recipe__c` - Meal preferences
- `Job_Posting__c` - Career information

### Field-Level Security Recommendations

**Setup → Object Manager → [Object] → Fields → Field-Level Security**

For each sensitive field:
- ✅ System Administrator: Read, Edit
- ✅ NeuroThrive User (custom profile): Read, Edit (own records only)
- ❌ Guest User: No access
- ❌ Standard User: No access

### Data Retention Policy

**Recommended:**
- Mood entries: Retain 2 years, then archive
- Therapy completions: Retain indefinitely (audit trail)
- Win entries: Retain 1 year
- Gratitude entries: Retain 1 year

**Implementation:**
Create scheduled Apex job for data archiving (future enhancement).

---

## 6. API Security

### Claude API Key Protection

**Current Implementation:**
- API keys stored in `ClaudeAPISettings__c` custom metadata type
- Keys protected at platform level (not accessible via SOQL)

**Verification:**
```apex
// CORRECT - Using Custom Metadata
ClaudeAPISettings__c settings = ClaudeAPISettings__c.getInstance();
String apiKey = settings.API_Key__c;

// INCORRECT - Never hardcode API keys
String apiKey = 'sk-ant-api...'; // NEVER DO THIS
```

**Best Practices:**
- ✅ Use Custom Metadata Types or Named Credentials
- ✅ Restrict metadata deployment permissions
- ❌ Never commit API keys to Git
- ❌ Never log API keys in debug statements
- ❌ Never return API keys to client-side JavaScript

### External Callout Security

**Pattern for Claude API calls:**
```apex
public class ClaudeAPIService {
    private static final String ENDPOINT = 'https://api.anthropic.com/v1/messages';

    public static String callClaudeAPI(String prompt) {
        // Get API key from secure storage
        ClaudeAPISettings__c settings = ClaudeAPISettings__c.getInstance();

        HttpRequest req = new HttpRequest();
        req.setEndpoint(ENDPOINT);
        req.setMethod('POST');
        req.setHeader('anthropic-version', '2023-06-01');
        req.setHeader('x-api-key', settings.API_Key__c);
        req.setHeader('Content-Type', 'application/json');

        // Sanitize prompt - remove PII
        String sanitizedPrompt = sanitizePrompt(prompt);
        req.setBody(buildRequestBody(sanitizedPrompt));

        Http http = new Http();
        HttpResponse res = http.send(req);

        // Never log full response (may contain sensitive data)
        System.debug('Claude API Status: ' + res.getStatusCode());

        return parseResponse(res.getBody());
    }

    private static String sanitizePrompt(String prompt) {
        // Remove email addresses, phone numbers, SSN patterns
        String sanitized = prompt;
        sanitized = sanitized.replaceAll('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', '[EMAIL]');
        sanitized = sanitized.replaceAll('\\d{3}-\\d{2}-\\d{4}', '[SSN]');
        return sanitized;
    }
}
```

---

## 7. Lightning Web Component Security

### @AuraEnabled Method Security

**Always validate user permissions in Apex:**
```apex
// CORRECT
@AuraEnabled
public static List<Mood_Entry__c> getMoodEntries() {
    if (!Schema.sObjectType.Mood_Entry__c.isAccessible()) {
        throw new AuraHandledException('Access denied.');
    }

    return [
        SELECT Id, Mood_Score__c, Entry_Date__c
        FROM Mood_Entry__c
        WHERE CreatedBy.Id = :UserInfo.getUserId()
        WITH SECURITY_ENFORCED
        LIMIT 100
    ];
}

// INCORRECT - Relying on client-side checks only
@AuraEnabled
public static List<Mood_Entry__c> getMoodEntries() {
    // Client can bypass LWC validation!
    return [SELECT Id, Mood_Score__c FROM Mood_Entry__c];
}
```

### Input Validation

**Validate all user input in Apex:**
```apex
@AuraEnabled
public static void createMoodEntry(Decimal moodScore, String notes) {
    // Validate score range
    if (moodScore < 1 || moodScore > 10) {
        throw new AuraHandledException('Mood score must be between 1 and 10.');
    }

    // Validate notes length
    if (notes != null && notes.length() > 32000) {
        throw new AuraHandledException('Notes exceed maximum length.');
    }

    // Sanitize HTML from notes
    String sanitizedNotes = notes != null ? notes.stripHtmlTags() : null;

    Mood_Entry__c mood = new Mood_Entry__c(
        Mood_Score__c = moodScore,
        Notes__c = sanitizedNotes,
        Entry_Date__c = Date.today()
    );

    SObjectAccessDecision decision = Security.stripInaccessible(
        AccessType.CREATABLE,
        new List<Mood_Entry__c>{mood}
    );

    insert decision.getRecords();
}
```

### Prevent XSS in LWC Templates

```html
<!-- SAFE - Automatically escaped by LWC -->
<template>
    <div>{moodNote}</div>
</template>

<!-- UNSAFE - Renders raw HTML (only use lightning-formatted-rich-text for trusted content) -->
<template>
    <lightning-formatted-rich-text value={moodNote}></lightning-formatted-rich-text>
</template>
```

---

## 8. Sharing and Record Access

### User Data Isolation

**Recommended Sharing Model:**
- **Organization-Wide Defaults:** Private
- **Sharing Rules:** None (users only see their own records)
- **Role Hierarchy:** Flat (no manager access to user mental health data)

**Custom Object Settings:**
```
Setup → Sharing Settings → [Custom Object] → Organization-Wide Defaults
- Mood_Entry__c: Private (Controlled by Parent: Daily_Routine__c)
- Win_Entry__c: Private
- Gratitude_Entry__c: Private
- Therapy_Step_Completion__c: Private
- Weekly_Meal_Plan__c: Private
- Job_Posting__c: Public Read Only (if sharing across users)
```

### SOQL Filtering by User

**Always filter by current user for personal data:**
```apex
// CORRECT - Filter by current user
List<Mood_Entry__c> moods = [
    SELECT Id, Mood_Score__c
    FROM Mood_Entry__c
    WHERE CreatedBy.Id = :UserInfo.getUserId()
    WITH SECURITY_ENFORCED
];

// INCORRECT - Returns all users' data (privacy violation!)
List<Mood_Entry__c> moods = [
    SELECT Id, Mood_Score__c
    FROM Mood_Entry__c
    WITH SECURITY_ENFORCED
];
```

---

## 9. Governor Limit Security

### Prevent Resource Exhaustion

**Limit query results:**
```apex
@AuraEnabled
public static List<Win_Entry__c> getWinEntries(Integer pageSize) {
    // Enforce maximum page size
    Integer safePageSize = Math.min(pageSize, 100);

    return [
        SELECT Id, Title__c, Description__c, Created_Date__c
        FROM Win_Entry__c
        WHERE CreatedBy.Id = :UserInfo.getUserId()
        WITH SECURITY_ENFORCED
        ORDER BY Created_Date__c DESC
        LIMIT :safePageSize
    ];
}
```

**Use pagination for large datasets:**
```apex
@AuraEnabled
public static List<Mood_Entry__c> getMoodEntriesPaginated(Integer offset, Integer pageSize) {
    Integer safeOffset = Math.max(0, offset);
    Integer safePageSize = Math.min(pageSize, 100);

    return [
        SELECT Id, Mood_Score__c, Entry_Date__c, Notes__c
        FROM Mood_Entry__c
        WHERE CreatedBy.Id = :UserInfo.getUserId()
        WITH SECURITY_ENFORCED
        ORDER BY Entry_Date__c DESC
        LIMIT :safePageSize
        OFFSET :safeOffset
    ];
}
```

---

## 10. Security Scanner Compliance

### Running Salesforce Security Scanner

**Installation:**
```bash
sf plugins install @salesforce/sfdx-scanner
```

**Scan Apex Classes:**
```bash
sf scanner run --target "force-app/main/default/classes/**/*.cls" --format table
```

**Common Violations to Fix:**

1. **ApexCRUDViolation** - Missing CRUD/FLS checks
   - Fix: Add `WITH SECURITY_ENFORCED` or Schema.sObjectType checks

2. **ApexSOQLInjection** - Unsanitized user input in dynamic SOQL
   - Fix: Use bind variables or String.escapeSingleQuotes()

3. **ApexXSSFromURLParam** - Unescaped URL parameters
   - Fix: Use String.escapeSingleQuotes() or stripHtmlTags()

4. **ApexInsecureEndpoint** - HTTP instead of HTTPS
   - Fix: Use HTTPS endpoints only

5. **ApexDangerousMethod** - Using System.debug with sensitive data
   - Fix: Remove PII from debug statements

### Priority Files for Scanner Review

1. `HolisticDashboardController.cls`
2. `MoodTrackerService.cls`
3. `WinParserService.cls`
4. `MealPlanController.cls`
5. `ShoppingListController.cls`
6. `InterviewPrepController.cls`

---

## 11. Compliance Considerations

### HIPAA Compliance (If Applicable)

If treating NeuroThrive as a healthcare application:

**Required:**
- ✅ Business Associate Agreement (BAA) with Salesforce
- ✅ Audit logging enabled (Setup → Security → Event Monitoring)
- ✅ Encryption at rest (Salesforce Shield Platform Encryption)
- ✅ Two-factor authentication enforced
- ✅ Session timeout configured (2 hours or less)

**Data Subject Rights (GDPR/CCPA):**
- Right to access: Provide data export functionality
- Right to deletion: Implement hard delete for user data
- Right to portability: JSON export of all user wellness data

### Audit Trail

**Enable Field History Tracking:**
```
Setup → Object Manager → [Object] → Fields & Relationships → Set History Tracking
```

Track changes on sensitive fields:
- Mood_Entry__c.Mood_Score__c
- Win_Entry__c.Title__c
- Therapy_Step_Completion__c.Completed__c

---

## 12. Security Checklist

### Pre-Deployment Security Audit

- [ ] All SOQL queries use `WITH SECURITY_ENFORCED`
- [ ] All DML operations use `Security.stripInaccessible()`
- [ ] All @AuraEnabled methods validate permissions
- [ ] No hardcoded credentials or API keys
- [ ] All user input is validated and sanitized
- [ ] Dynamic SOQL uses bind variables or escapeSingleQuotes()
- [ ] Field-level security configured for sensitive fields
- [ ] Organization-wide defaults set to Private for personal data objects
- [ ] API callouts use HTTPS endpoints only
- [ ] Debug statements do not log sensitive data
- [ ] Salesforce Security Scanner executed with zero high-severity issues
- [ ] Test classes validate security exceptions
- [ ] Session timeout configured (2 hours)
- [ ] Password policy enforces complexity requirements
- [ ] Two-factor authentication enabled for admin users

### Post-Deployment Monitoring

- [ ] Review login history weekly (Setup → Login History)
- [ ] Monitor API usage (Setup → System Overview → API Usage)
- [ ] Check failed login attempts (Setup → Login Forensics)
- [ ] Review sharing rule changes (Setup → Audit Trail)
- [ ] Monitor record access reports
- [ ] Review field history for sensitive data changes

---

## 13. Security Incidents

### Incident Response Plan

**If suspicious activity detected:**

1. **Isolate:** Freeze affected user accounts immediately
2. **Investigate:** Review audit trail and login history
3. **Notify:** Alert security team and affected users
4. **Remediate:** Reset passwords, revoke sessions
5. **Document:** Create incident report with timeline

**Emergency Contacts:**
- Salesforce Support: 1-800-667-6389
- Org Admin: [Configure in custom metadata]

---

## 14. References

**Salesforce Security Resources:**
- [Security Guide](https://developer.salesforce.com/docs/atlas.en-us.securityImplGuide.meta/securityImplGuide/)
- [Apex Security Best Practices](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_security_best_practices.htm)
- [LWC Security](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

**NeuroThrive-Specific:**
- See `TEST_COVERAGE_REPORT.md` for security test coverage
- See `SCHEDULING_SETUP_GUIDE.md` for scheduled job security
- See `USER_GUIDE.md` for user-facing security features

---

**Document Status:** ✅ Complete
**Last Updated:** 2025-11-16
**Next Review:** Before production deployment
**Owner:** Development Team
