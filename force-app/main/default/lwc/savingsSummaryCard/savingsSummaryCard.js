import { LightningElement, api, wire, track } from 'lwc';
import getDashboardData from '@salesforce/apex/HolisticDashboardController.getDashboardData';

export default class SavingsSummaryCard extends LightningElement {
    @api dateRange;
    @track isLoading = false;
    @track error;
    @track totalSavings = 0;
    @track activeCoupons = 0;
    @track listsReady = 0;
    @track itemsOnLists = 0;
    @track savingsPercent = 0;
    @track hasHighValueCoupons = false;
    @track highValueCouponCount = 0;
    @track highValueSavings = 0;
    @track savingsTip = '';

    @wire(getDashboardData)
    wiredDashboardData({ error, data }) {
        this.isLoading = false;

        if (data) {
            this.error = null;
            this.processSavingsData(data.shopping);
        } else if (error) {
            this.error = error.body ? error.body.message : 'Error loading savings data';
            console.error('Error loading dashboard data:', error);
        }
    }

    connectedCallback() {
        this.isLoading = true;
    }

    processSavingsData(shoppingData) {
        if (!shoppingData) return;

        this.totalSavings = (shoppingData.estimatedSavings || 0).toFixed(2);
        this.activeCoupons = shoppingData.activeCoupons || 0;
        this.listsReady = shoppingData.listsReady || 0;
        this.itemsOnLists = shoppingData.itemsOnLists || 0;
        this.hasHighValueCoupons = shoppingData.hasHighValueCoupons || false;
        this.highValueCouponCount = shoppingData.highValueCouponCount || 0;
        this.highValueSavings = (shoppingData.highValueSavings || 0).toFixed(2);

        // Calculate average savings percentage (simplified - assuming base cost)
        const estimatedBaseCost = this.totalSavings > 0 ? this.totalSavings * 10 : 0;
        this.savingsPercent = estimatedBaseCost > 0
            ? Math.round((this.totalSavings / estimatedBaseCost) * 100)
            : 0;

        // Generate savings tip
        this.generateSavingsTip();
    }

    generateSavingsTip() {
        const tips = [
            'Stack manufacturer and store coupons for maximum savings!',
            'Check for digital coupons before your shopping trip.',
            'Plan meals around items on sale this week.',
            'Buy store brands to save an average of 30%.',
            'Use the Walgreens app to clip digital coupons easily.',
            'Stock up on non-perishables when they\'re on sale.',
            'Compare unit prices to find the best deals.'
        ];

        // Select tip based on current data
        if (this.hasHighValueCoupons) {
            this.savingsTip = 'Don\'t miss out on high-value coupons expiring soon!';
        } else if (this.activeCoupons > 20) {
            this.savingsTip = tips[0];
        } else if (this.listsReady > 0) {
            this.savingsTip = tips[1];
        } else {
            // Random tip
            const randomIndex = Math.floor(Math.random() * tips.length);
            this.savingsTip = tips[randomIndex];
        }
    }
}
