/**
 * @description Scheduled job to check for expiring coupons and send alerts
 * Runs daily at 9:00 AM to notify users of coupons expiring within 3 days
 *
 * @author Claude Code Assistant
 * @date 2025-11-16
 *
 * Schedule with: System.schedule('Daily Coupon Expiration Check', '0 0 9 * * ?', new CouponExpirationScheduler());
 */
public class CouponExpirationScheduler implements Schedulable {

    /**
     * @description Execute method called by Salesforce scheduler
     * @param sc SchedulableContext
     */
    public void execute(SchedulableContext sc) {
        // Find coupons expiring in the next 3 days
        Date threeDaysFromNow = Date.today().addDays(3);

        List<Store_Coupon__c> expiringCoupons = [
            SELECT Id, Coupon_Code__c, Description__c, Discount_Amount__c,
                   Discount_Percentage__c, Valid_To__c, Product_Category__c
            FROM Store_Coupon__c
            WHERE Valid_To__c >= :Date.today()
            AND Valid_To__c <= :threeDaysFromNow
            AND Valid_To__c != null
            ORDER BY Valid_To__c ASC
            LIMIT 200
        ];

        if (!expiringCoupons.isEmpty()) {
            sendExpirationAlerts(expiringCoupons);
        }
    }

    /**
     * @description Send email alerts for expiring coupons
     * @param coupons List of expiring coupons
     */
    private void sendExpirationAlerts(List<Store_Coupon__c> coupons) {
        // Build email body
        String emailBody = '<h2>Coupons Expiring Soon!</h2>\n';
        emailBody += '<p>The following coupons will expire within the next 3 days. Use them before they\'re gone!</p>\n';
        emailBody += '<table border="1" cellpadding="5" style="border-collapse: collapse;">\n';
        emailBody += '<tr><th>Coupon Code</th><th>Description</th><th>Discount</th><th>Expires</th></tr>\n';

        Decimal totalPotentialSavings = 0;

        for (Store_Coupon__c coupon : coupons) {
            String discount = '';
            if (coupon.Discount_Amount__c != null) {
                discount = '$' + String.valueOf(coupon.Discount_Amount__c);
                totalPotentialSavings += coupon.Discount_Amount__c;
            } else if (coupon.Discount_Percentage__c != null) {
                discount = String.valueOf(coupon.Discount_Percentage__c) + '%';
            }

            emailBody += '<tr>';
            emailBody += '<td>' + (coupon.Coupon_Code__c != null ? coupon.Coupon_Code__c : 'N/A') + '</td>';
            emailBody += '<td>' + (coupon.Description__c != null ? coupon.Description__c : 'No description') + '</td>';
            emailBody += '<td>' + discount + '</td>';
            emailBody += '<td>' + coupon.Valid_To__c.format() + '</td>';
            emailBody += '</tr>\n';
        }

        emailBody += '</table>\n';
        emailBody += '<p><strong>Total Potential Savings: $' + totalPotentialSavings.setScale(2) + '</strong></p>\n';
        emailBody += '<p>Visit your Walgreens account or shopping list to redeem these coupons!</p>';

        // Send email to current user
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail.setToAddresses(new String[] { UserInfo.getUserEmail() });
        mail.setSubject('🎫 ' + coupons.size() + ' Coupons Expiring Soon!');
        mail.setHtmlBody(emailBody);

        try {
            Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
            System.debug('Expiration alert email sent for ' + coupons.size() + ' coupons');
        } catch (Exception e) {
            System.debug('Error sending expiration alert email: ' + e.getMessage());
        }
    }
}
