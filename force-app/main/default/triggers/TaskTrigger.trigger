trigger TaskTrigger on Task (before insert) {
    if(Trigger.isBefore) {
        if(Trigger.isInsert) {
            CallToTrelloQueuable queue = new CallToTrelloQueuable();
            for(Task tarea :Trigger.new) {
                queue.cards.add(
                    new TrelloHelper.TrelloCard(
                        tarea.Subject__c, 
                        tarea.Description, 
                        'Internal'
                    )
                );
            }
            if(!queue.cards.isEmpty()) {
                System.enqueueJob(queue);
            }
        }
    }
}