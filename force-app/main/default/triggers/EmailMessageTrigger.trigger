trigger EmailMessageTrigger on EmailMessage (before insert) {
    
    if(Trigger.isBefore) {
        if(Trigger.isInsert) {
            CallToTrelloQueuable queue = new CallToTrelloQueuable();
            for(EmailMessage em :Trigger.new) {
                if(em.Incoming){
                    if(em.FromAddress == 'jira@bancar.atlassian.net') {
                        queue.cards.add(
                            new TrelloHelper.TrelloCard(
                                em.Subject, em.TextBody, 
                                em.FromAddress,
                                new List<String> {'uala', 'jira'}
                            )
                        );
                    } else {
                        queue.cards.add(
                            new TrelloHelper.TrelloCard(
                                em.Subject, em.TextBody, em.FromAddress
                            )
                        );
                    }
                }
            }
            if(!queue.cards.isEmpty()) {
                System.enqueueJob(queue);
            }
        }
    }
    
    
}