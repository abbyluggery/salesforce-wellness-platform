# NeuroThrive Platform - Scheduling Setup Guide

**Created:** 2025-11-16
**Target Org:** abbyluggery179@agentforce.com

## Overview

This guide explains how to set up automated scheduled jobs for the NeuroThrive platform, including wellness reminders, mood summaries, and data synchronization.

## Scheduled Jobs Configuration

### 1. Weekly Mood Summary (Sundays 8:00 PM)

**Purpose:** Sends weekly mood analytics and insights email to active users

**Scheduler Class:** `MoodSummaryScheduler.cls`

**Schedule via Execute Anonymous:**
```apex
String cronExp = '0 0 20 ? * SUN';
String jobName = 'Weekly Mood Summary Email';
System.schedule(jobName, cronExp, new MoodSummaryScheduler());
```

**Cron Expression Breakdown:**
- `0` - Seconds (0)
- `0` - Minutes (0)
- `20` - Hour (8 PM in 24-hour format)
- `?` - Day of month (not specified)
- `*` - Month (every month)
- `SUN` - Day of week (Sunday)

**What it does:**
1. Queries all active users
2. Checks for mood entries from past week
3. Triggers `Weekly_Mood_Summary` flow
4. Sends email with mood statistics and trends

---

### 2. Daily Win Reminder (Every Day 7:00 PM)

**Purpose:** Reminds users to log daily wins each evening

**Scheduler Class:** `DailyWinReminderScheduler.cls`

**Schedule via Execute Anonymous:**
```apex
String cronExp = '0 0 19 * * ?';
String jobName = 'Daily Win Reminder';
System.schedule(jobName, cronExp, new DailyWinReminderScheduler());
```

**Cron Expression Breakdown:**
- `0` - Seconds (0)
- `0` - Minutes (0)
- `19` - Hour (7 PM in 24-hour format)
- `*` - Day of month (every day)
- `*` - Month (every month)
- `?` - Day of week (not specified)

**What it does:**
1. Queries all active users
2. Checks if wins logged today
3. Triggers `Daily_Win_Reminder` flow
4. Sends reminder or encouragement email

---

## Flow Scheduling (Alternative Method)

The flows `Weekly_Mood_Summary` and `Daily_Win_Reminder` have built-in scheduling configured in their metadata:

### Weekly_Mood_Summary Flow
- **Status:** Active
- **Frequency:** Weekly
- **Day:** Sunday
- **Time:** 20:00:00.000Z (8 PM UTC)
- **Start Date:** 2025-11-17

### Daily_Win_Reminder Flow
- **Status:** Active
- **Frequency:** Daily
- **Time:** 19:00:00.000Z (7 PM UTC)
- **Start Date:** 2025-11-15

**Note:** Flows scheduled this way run automatically without needing Schedulable classes. The Schedulable classes provide additional control and logging.

---

## Setup Instructions

### Method 1: Using Execute Anonymous (Recommended)

1. Navigate to **Developer Console** → **Debug** → **Open Execute Anonymous Window**

2. **Schedule Weekly Mood Summary:**
```apex
// Schedule Weekly Mood Summary (Sundays 8 PM)
String cronExp = '0 0 20 ? * SUN';
String jobId = System.schedule('Weekly Mood Summary Email', cronExp, new MoodSummaryScheduler());
System.debug('Scheduled Weekly Mood Summary with Job ID: ' + jobId);
```

3. **Schedule Daily Win Reminder:**
```apex
// Schedule Daily Win Reminder (Every day 7 PM)
String cronExp = '0 0 19 * * ?';
String jobId = System.schedule('Daily Win Reminder', cronExp, new DailyWinReminderScheduler());
System.debug('Scheduled Daily Win Reminder with Job ID: ' + jobId);
```

4. Click **Execute** and check logs for job IDs

### Method 2: Using Apex Code

Create a setup class:

```apex
public class NeuroThriveSchedulerSetup {
    public static void scheduleAllJobs() {
        // Weekly Mood Summary
        String moodCron = '0 0 20 ? * SUN';
        System.schedule('Weekly Mood Summary', moodCron, new MoodSummaryScheduler());

        // Daily Win Reminder
        String winCron = '0 0 19 * * ?';
        System.schedule('Daily Win Reminder', winCron, new DailyWinReminderScheduler());

        System.debug('All NeuroThrive schedulers activated');
    }
}
```

Then run in Execute Anonymous:
```apex
NeuroThriveSchedulerSetup.scheduleAllJobs();
```

---

## Verification Steps

### 1. Verify Jobs are Scheduled

Navigate to **Setup** → **Apex Jobs** → **Scheduled Jobs**

You should see:
- ✅ Weekly Mood Summary Email (Next run: Sunday 8 PM)
- ✅ Daily Win Reminder (Next run: Today/Tomorrow 7 PM)

### 2. Check Job Details

Query scheduled jobs via Execute Anonymous:
```apex
List<CronTrigger> jobs = [
    SELECT Id, CronJobDetail.Name, NextFireTime, State, CronExpression
    FROM CronTrigger
    WHERE CronJobDetail.Name LIKE 'Weekly Mood%'
    OR CronJobDetail.Name LIKE 'Daily Win%'
];

for (CronTrigger job : jobs) {
    System.debug('Job: ' + job.CronJobDetail.Name);
    System.debug('Next Run: ' + job.NextFireTime);
    System.debug('Status: ' + job.State);
    System.debug('Cron: ' + job.CronExpression);
    System.debug('---');
}
```

### 3. Test Manual Execution

To test the schedulers without waiting:
```apex
// Test Mood Summary Scheduler
Test.startTest();
MoodSummaryScheduler moodScheduler = new MoodSummaryScheduler();
moodScheduler.execute(null);
Test.stopTest();

// Test Daily Win Reminder Scheduler
Test.startTest();
DailyWinReminderScheduler winScheduler = new DailyWinReminderScheduler();
winScheduler.execute(null);
Test.stopTest();
```

---

## Monitoring & Maintenance

### View Scheduler Logs

1. **Setup** → **Debug Logs**
2. Create trace flag for your user
3. Check logs after scheduled execution
4. Look for: `MoodSummaryScheduler completed` or `DailyWinReminderScheduler completed`

### Delete Scheduled Jobs

If you need to remove or reschedule:
```apex
// Get job IDs
List<CronTrigger> jobs = [
    SELECT Id, CronJobDetail.Name
    FROM CronTrigger
    WHERE CronJobDetail.Name = 'Weekly Mood Summary Email'
    OR CronJobDetail.Name = 'Daily Win Reminder'
];

// Abort jobs
for (CronTrigger job : jobs) {
    System.abortJob(job.Id);
    System.debug('Aborted: ' + job.CronJobDetail.Name);
}
```

### Reschedule Jobs

```apex
// Abort old job
System.abortJob('OLD_JOB_ID_HERE');

// Create new schedule
String newCron = '0 0 21 ? * SUN'; // Changed to 9 PM
System.schedule('Weekly Mood Summary Email', newCron, new MoodSummaryScheduler());
```

---

## Cron Expression Reference

### Common Patterns

```
Pattern              Description
'0 0 20 ? * SUN'     Every Sunday at 8 PM
'0 0 19 * * ?'       Every day at 7 PM
'0 0 6 ? * SUN'      Every Sunday at 6 AM
'0 0 9 * * ?'        Every day at 9 AM
'0 0 12 * * MON-FRI' Every weekday at noon
'0 30 8 * * ?'       Every day at 8:30 AM
```

### Cron Format
```
┌───────────── second (0-59)
│ ┌─────────── minute (0-59)
│ │ ┌───────── hour (0-23)
│ │ │ ┌─────── day of month (1-31)
│ │ │ │ ┌───── month (1-12 or JAN-DEC)
│ │ │ │ │ ┌─── day of week (0-6 or SUN-SAT, ? = not specified)
│ │ │ │ │ │
* * * * * *
```

---

## Troubleshooting

### Issue: Job not running at expected time

**Solution:** Check timezone settings
- Cron times are in UTC
- Org default timezone may differ
- Adjust cron expression accordingly

### Issue: Flow not triggering

**Solution:** Verify flow is Active
```apex
List<Flow> flows = [
    SELECT Id, ApiName, Status, ProcessType
    FROM Flow
    WHERE ApiName IN ('Weekly_Mood_Summary', 'Daily_Win_Reminder')
];

for (Flow f : flows) {
    System.debug('Flow: ' + f.ApiName);
    System.debug('Status: ' + f.Status);
}
```

### Issue: Emails not sending

**Check:**
1. Email deliverability settings
2. User email addresses are valid
3. Email templates exist
4. No email governor limits hit

---

## Additional Scheduled Jobs (Future)

### Walgreens Coupon Sync (if implemented)
```apex
String cronExp = '0 0 6 ? * SUN';
System.schedule('Walgreens Weekly Coupon Sync', cronExp, new WalgreensOfferSyncScheduler());
```

### Coupon Expiration Alerts (if implemented)
```apex
String cronExp = '0 0 9 * * ?';
System.schedule('Coupon Expiration Alerts', cronExp, new CouponExpirationScheduler());
```

---

## Best Practices

1. **Always test in sandbox first**
2. **Monitor initial runs** to verify correct operation
3. **Set up debug logs** for troubleshooting
4. **Document any custom cron changes**
5. **Abort old jobs** before rescheduling
6. **Limit to 100 scheduled Apex jobs** (Salesforce limit)

---

## Quick Reference Commands

```apex
// Schedule all jobs at once
String moodCron = '0 0 20 ? * SUN';
String winCron = '0 0 19 * * ?';
System.schedule('Weekly Mood Summary', moodCron, new MoodSummaryScheduler());
System.schedule('Daily Win Reminder', winCron, new DailyWinReminderScheduler());

// View all scheduled jobs
SELECT Id, CronJobDetail.Name, NextFireTime, State
FROM CronTrigger
WHERE CronJobDetail.Name LIKE '%NeuroThrive%'
OR CronJobDetail.Name LIKE '%Mood%'
OR CronJobDetail.Name LIKE '%Win%'

// Abort all NeuroThrive jobs
List<CronTrigger> jobs = [
    SELECT Id FROM CronTrigger
    WHERE CronJobDetail.Name LIKE '%Mood%' OR CronJobDetail.Name LIKE '%Win%'
];
for (CronTrigger job : jobs) {
    System.abortJob(job.Id);
}
```

---

**Status:** ✅ Scheduler classes created and tested
**Next Steps:** Execute the scheduling commands in your Salesforce org
**Support:** Check debug logs if issues arise
