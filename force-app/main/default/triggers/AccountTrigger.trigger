trigger AccountTrigger on Account (before update, after update) {
    /* if(Trigger.isBefore) {
        if(Trigger.isUpdate) {
            System.debug('<BEFORE UPDATE>');            
            for(Integer i = 0; i< 5; i++) {
                System.enqueueJob(new UpdateAccountBatch(new List<Account>()));
               /* Account oldAcc = Trigger.oldMap.get(acc.Id);
                if(!acc.BypassTrigger__c) {
                    if(acc.ReadyToProcess__c || acc.RequestSubmitted__c) {
                        acc.addError('No se puede modificar un registro con un cambio pendiente.');
                        continue;
                    }
                    acc.ReadyToProcess__c = true;
                    acc.JSONData__c = 'ELTEST';
                } else {
                    acc.BypassTrigger__c = false;
                }
                System.debug(acc.BypassTrigger__c);//
            }
            System.debug('</BEFORE UPDATE>');
        }
    } else if(Trigger.isAfter) {
        if(Trigger.isUpdate) {
            System.debug('<AFTER UPDATE>');
            List<Account> accountsToProcess = new List<Account>();
            Account acc = Trigger.new[0].clone(true, true, false, false);
            Account oldAcc = Trigger.old[0].clone(true, true, false, false);
            if(acc.ReadyToProcess__c) {
                accountsToProcess.add(acc);
            }
            if(!accountsToProcess.isEmpty()) {
                System.enqueueJob(new UpdateAccountBatch(accountsToProcess));
            }
            System.debug(acc.BypassTrigger__c);
            System.debug('</AFTER UPDATE>');
        }
    } */
}