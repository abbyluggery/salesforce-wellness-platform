import { LightningElement, api, wire, track } from 'lwc';
import getDashboardData from '@salesforce/apex/HolisticDashboardController.getDashboardData';

export default class WellnessSummaryCard extends LightningElement {
    @api dateRange;
    @track isLoading = false;
    @track error;
    @track todayMood = 'N/A';
    @track todayEnergy = 0;
    @track winsThisWeek = 0;
    @track moodEntriesThisWeek = 0;
    @track gratitudeEntriesThisWeek = 0;
    @track therapySessionsThisWeek = 0;
    @track thoughtAnalysesThisWeek = 0;
    @track moodTrend = '';
    @track recentWins = [];

    @wire(getDashboardData)
    wiredDashboardData({ error, data }) {
        this.isLoading = false;

        if (data) {
            this.error = null;
            this.processWellnessData(data.wellness);
        } else if (error) {
            this.error = error.body ? error.body.message : 'Error loading wellness data';
            console.error('Error loading dashboard data:', error);
        }
    }

    connectedCallback() {
        this.isLoading = true;
    }

    processWellnessData(wellnessData) {
        if (!wellnessData) return;

        this.todayMood = wellnessData.todayMood || 'N/A';
        this.todayEnergy = wellnessData.todayEnergy || 0;
        this.winsThisWeek = wellnessData.winEntriesThisWeek || 0;
        this.moodEntriesThisWeek = wellnessData.moodEntriesThisWeek || 0;
        this.gratitudeEntriesThisWeek = wellnessData.gratitudeEntriesThisWeek || 0;
        this.therapySessionsThisWeek = wellnessData.therapySessionsThisWeek || 0;
        this.thoughtAnalysesThisWeek = wellnessData.thoughtAnalysesThisWeek || 0;
        this.moodTrend = wellnessData.moodTrend || '';
        this.recentWins = wellnessData.recentWins || [];
    }

    get hasMoodTrend() {
        return this.moodTrend && this.moodTrend !== 'Unknown' && this.moodTrend !== 'Insufficient data';
    }

    get trendIcon() {
        if (this.moodTrend === 'Improving') return 'utility:trending';
        if (this.moodTrend === 'Declining') return 'utility:down';
        return 'utility:dash';
    }

    get trendVariant() {
        if (this.moodTrend === 'Improving') return 'success';
        if (this.moodTrend === 'Declining') return 'warning';
        return 'inverse';
    }

    get hasRecentWins() {
        return this.recentWins && this.recentWins.length > 0;
    }
}
