public class UpdateAccountBatch implements Queueable, Database.AllowsCallouts {
    private List<Account> accountsToProcess = new List<Account>();
    private List<Account> accountsToUpdate = new List<Account>();
    
    public UpdateAccountBatch(List<Account> accountsToProcess) {
        this.accountsToProcess = accountsToProcess;
    }
    
    public void execute(QueueableContext context) {
        for(Account acc:accountsToProcess) {
            acc.Name = acc.JSONData__c;
            acc.JSONData__c = null;
            acc.BypassTrigger__c = true;
            acc.ReadyToProcess__c = false;
            accountsToUpdate.add(acc);
        }
        update accountsToUpdate;
    }
}