import { LightningElement, track } from 'lwc';

export default class UnifiedDashboard extends LightningElement {
    @track dateRange = {
        start: new Date(new Date().setHours(0, 0, 0, 0)),
        end: new Date(new Date().setHours(23, 59, 59, 999))
    };

    @track isLoading = false;
    @track error;
    @track selectedPeriod = 'today';
    @track showSyncStatus = false;
    @track syncMessage = '';
    @track syncIcon = 'utility:success';
    @track syncVariant = 'success';

    connectedCallback() {
        this.handleTodayClick();
        this.checkSyncStatus();
    }

    get todayButtonVariant() {
        return this.selectedPeriod === 'today' ? 'brand' : 'neutral';
    }

    get weekButtonVariant() {
        return this.selectedPeriod === 'week' ? 'brand' : 'neutral';
    }

    get monthButtonVariant() {
        return this.selectedPeriod === 'month' ? 'brand' : 'neutral';
    }

    handleTodayClick() {
        this.selectedPeriod = 'today';
        const today = new Date();
        this.dateRange = {
            start: new Date(today.setHours(0, 0, 0, 0)),
            end: new Date(today.setHours(23, 59, 59, 999))
        };
    }

    handleWeekClick() {
        this.selectedPeriod = 'week';
        const today = new Date();
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday

        const weekStart = new Date(today.setDate(diff));
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        this.dateRange = {
            start: weekStart,
            end: weekEnd
        };
    }

    handleMonthClick() {
        this.selectedPeriod = 'month';
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        monthStart.setHours(0, 0, 0, 0);

        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);

        this.dateRange = {
            start: monthStart,
            end: monthEnd
        };
    }

    handleRefresh() {
        this.isLoading = true;
        this.error = null;

        // Trigger refresh on all child components by updating dateRange
        const currentDateRange = { ...this.dateRange };
        this.dateRange = null;

        // Use setTimeout to ensure the change is detected
        setTimeout(() => {
            this.dateRange = currentDateRange;
            this.isLoading = false;
            this.showSyncNotification('Dashboard refreshed successfully', 'success');
        }, 500);
    }

    checkSyncStatus() {
        // Check if data is synced with Salesforce
        // This is a placeholder - implement actual sync check logic
        this.syncMessage = 'All data synced';
        this.syncIcon = 'utility:success';
        this.syncVariant = 'success';
        this.showSyncStatus = true;

        // Hide sync status after 3 seconds
        setTimeout(() => {
            this.showSyncStatus = false;
        }, 3000);
    }

    showSyncNotification(message, variant) {
        this.syncMessage = message;
        this.syncVariant = variant;
        this.syncIcon = variant === 'success' ? 'utility:success' : 'utility:warning';
        this.showSyncStatus = true;

        setTimeout(() => {
            this.showSyncStatus = false;
        }, 3000);
    }

    handleError(error) {
        this.isLoading = false;
        this.error = error.body ? error.body.message : error.message;
        this.showSyncNotification('Error loading dashboard data', 'error');
    }
}
