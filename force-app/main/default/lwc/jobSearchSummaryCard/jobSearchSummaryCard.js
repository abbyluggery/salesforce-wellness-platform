import { LightningElement, api, wire, track } from 'lwc';
import getDashboardData from '@salesforce/apex/HolisticDashboardController.getDashboardData';

export default class JobSearchSummaryCard extends LightningElement {
    @api dateRange;
    @track isLoading = false;
    @track error;
    @track totalApplications = 0;
    @track applicationsThisWeek = 0;
    @track interviewsScheduled = 0;
    @track offers = 0;
    @track upcomingInterviews = [];
    @track latestInsight = '';

    @wire(getDashboardData)
    wiredDashboardData({ error, data }) {
        this.isLoading = false;

        if (data) {
            this.error = null;
            this.processJobSearchData(data.jobSearch);
            this.upcomingInterviews = data.upcomingInterviews || [];
        } else if (error) {
            this.error = error.body ? error.body.message : 'Error loading job search data';
            console.error('Error loading dashboard data:', error);
        }
    }

    connectedCallback() {
        this.isLoading = true;
    }

    processJobSearchData(jobSearchData) {
        if (!jobSearchData) return;

        this.totalApplications = jobSearchData.totalJobs || 0;
        this.applicationsThisWeek = jobSearchData.applicationsThisWeek || 0;
        this.interviewsScheduled = jobSearchData.jobsInterviewing || 0;
        this.offers = jobSearchData.jobsOffers || 0;

        // Generate insight based on data
        this.generateAiInsight(jobSearchData);
    }

    generateAiInsight(data) {
        if (data.applicationsThisWeek > 5) {
            this.latestInsight = `Great job! You've applied to ${data.applicationsThisWeek} positions this week.`;
        } else if (data.jobsInterviewing > 0) {
            this.latestInsight = `You have ${data.jobsInterviewing} interviews coming up. Time to prepare!`;
        } else if (data.totalJobs > 0) {
            this.latestInsight = `Keep up the momentum! You're tracking ${data.totalJobs} opportunities.`;
        } else {
            this.latestInsight = 'Start your job search journey today!';
        }
    }

    get hasUpcomingInterviews() {
        return this.upcomingInterviews && this.upcomingInterviews.length > 0;
    }

    get hasAiInsights() {
        return this.latestInsight && this.latestInsight.length > 0;
    }
}
