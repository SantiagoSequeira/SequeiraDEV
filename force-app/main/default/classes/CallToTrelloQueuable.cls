public class CallToTrelloQueuable implements Queueable, Database.AllowsCallouts {
    public List<TrelloHelper.TrelloCard> cards = new List<TrelloHelper.TrelloCard>();
    
    public void execute(QueueableContext context) {
        for(TrelloHelper.TrelloCard card : cards) {
            if(card.title != null) {
                if(card.title.startsWith('Re') || card.origin.containsIgnoreCase('github')) {
                    TrelloHelper.findCards(card);
                } else {
                    TrelloHelper.createCard(card);
                }
            } 
        }
    }
}