public class AccountUtility {
    public static void viewAnnualRevenue() {
        List<Account> accountsList = [SELECT Name, AnnualRevenue FROM Account];
        String acctRev = '';
        for(Account acc :accountsList) {
            acctRev += acc.Name + ':' + String.valueOf(acc.AnnualRevenue);
        }
        System.debug(acctRev);
    }
}