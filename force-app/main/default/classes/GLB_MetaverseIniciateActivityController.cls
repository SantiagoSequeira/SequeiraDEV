public with sharing class GLB_MetaverseIniciateActivityController {

    @SuppressWarnings('PMD.ApexCRUDViolation')
    @AuraEnabled
    public static void iniciateActivity(String recordId){
        List<Account> accountsInActivity = [SELECT id, RunningActivity__c FROM Account WHERE RunningActivity__c = true];
        Account accountToIniciate = [SELECT id, RunningActivity__c FROM Account WHERE Id = :recordId];
        accountToIniciate.RunningActivity__c = true;
        List<Account> accountsToUpdate = new List<Account>{ accountToIniciate} ;

        if(!accountsInActivity.isEmpty()){
            for(Account acc : accountsInActivity){
                acc.RunningActivity__c = false;
                accountsToUpdate.add(acc);
            }
        }
        update accountsToUpdate;
    }

    @SuppressWarnings('PMD.ApexCRUDViolation')
    @AuraEnabled
    public static Boolean isRunningActivity(String recordId){
        Account acc = [SELECT id, RunningActivity__c FROM Account WHERE Id = :recordId];
        return acc.RunningActivity__c;
    }

    @SuppressWarnings('PMD.ApexCRUDViolation')
    @AuraEnabled
    public static void finishActivity(String recordId){
        Account acc = [SELECT id, RunningActivity__c FROM Account WHERE Id = :recordId];
        acc.RunningActivity__c = false;
        update acc;
    }
}