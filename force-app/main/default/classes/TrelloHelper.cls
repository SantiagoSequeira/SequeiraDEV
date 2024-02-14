public class TrelloHelper {
    
    public static final Map<String, String>  labels = new Map<String, String>{ 
        'uala' => '5f1ee3387669b22549ddfd04',
            'jira' => '601bec7e2a99163cf41050d3',
            'salesforce' => '600f5e505b297729ec854542',
            'merged' => '6062392dc44de0428ba90f26'
            };
                
    public static final String token = '7c99cb3048b7797805070933ec862ab9770d08f26692cffca811d5b0d217fa79';
    public static final String key = '583599ca1046253d22c0ceb2b03cc5c5';
    public static final String idList = '5f1ee338a5d3873d2d527259';
                
    public static void createCard(TrelloCard card) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
         // LISTA DE TAREAS
        String idLabels = createTags(card.tags); //UALA + SALESFORCE
        String endpoint = 'callout:Trello/1/cards?key='+ key +
            '&token='+ token + 
            '&idList='+ idList +
            '&idLabels='+idLabels +
            '&name='+ card.title.removeStart('Re%3A+').removeStart('Re: ') +
            '&desc=' + card.description;
        request.setEndpoint(endpoint) ;
        request.setHeader('Accept','*/*');
        request.setMethod('POST');
        HttpResponse response = http.send(request);
        if(response.getStatusCode() > 299 || response.getStatusCode() < 200) {
            Log__c log = new Log__c (
                Response__c = response.getBody(),
                Request__c = JSON.serialize(request),
                Status__c = response.getStatus(), 
                StatusCode__c = response.getStatusCode()
            );
            insert log;
            throw new CallToTrelloException(log.Id);
        }    
    }
    
    public static void findCards(TrelloCard card) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        String endpoint = 'callout:Trello/1/search?key='+ key +
            '&token='+ token + 
            '&query='+ card.title.removeStart('Re%3A+').removeStart('Re: ');
        request.setEndpoint(endpoint) ;
        request.setHeader('Accept','*/*');
        request.setMethod('GET');
        HttpResponse response = http.send(request);
        if(response.getStatusCode() == 200) {
            TrelloResponse res = (TrelloResponse) JSON.deserialize(response.getBody(), TrelloResponse.class);
            if(res.cards != null) {
                if(!res.cards.isEmpty()) {
                    createCardUpdate(res.cards[0].id, card);
                } else {
                    createCard(card);
                }
            } else {
                createCard(card);
            }
        } else {
            Log__c log = new Log__c (
                Response__c = response.getBody(),
                Request__c = JSON.serialize(request),
                Status__c = response.getStatus(), 
                StatusCode__c = response.getStatusCode()
            );
            insert log;
            throw new CallToTrelloException(log.Id);
        }
    }
    
    public static void createCardUpdate(String cardId,TrelloCard card) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        String endpoint = 'callout:Trello/1/cards/' + cardId + '/actions/comments?key='+ key +
            '&token='+ token + 
            '&text='+ card.description;
        request.setEndpoint(endpoint) ;
        request.setHeader('Accept','*/*');
        request.setMethod('POST');
        HttpResponse response = http.send(request);
        if(response.getStatusCode() != 200) {
            Log__c log = new Log__c (
                Response__c = response.getBody(),
                Request__c = JSON.serialize(request),
                Status__c = response.getStatus(), 
                StatusCode__c = response.getStatusCode()
            );
            insert log;
            throw new CallToTrelloException(log.Id);
        } else {
            if(card.description.containsIgnoreCase('Merged')) {
                markAsMerged(cardId);
            }
        }
    }
    
    public static void markAsMerged (String cardId) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        String endpoint = 'callout:Trello/1/cards/' + cardId + '/idLabels?key='+ key +
            '&token='+ token + 
            '&value='+ labels.get('merged');
        request.setEndpoint(endpoint) ;
        request.setHeader('Accept','*/*');
        request.setMethod('POST');
        HttpResponse  response = http.send(request);
        if(response.getStatusCode() != 200) {
            Log__c log = new Log__c (
                Response__c = response.getBody(),
                Request__c = JSON.serialize(request),
                Status__c = response.getStatus(), 
                StatusCode__c = response.getStatusCode()
            );
            insert log;
            throw new CallToTrelloException(log.Id);
        }
    }
    
    public static String createTags(List<String> tags) {
        String result = '';
        for(String s:tags) {
            if(labels.containsKey(s)) {
                result += labels.get(s) + ',';
            }
        }
        result = result.removeEnd(',');
        return result;
    }
    
    public class TrelloCard {
        public String title;
        public String description;
        public List<String> tags;
        public String origin;
        
        public TrelloCard (String title, String description, String origin) {
            this(title, description, origin, null);
        }
        
        public TrelloCard (String title, String description, String origin, List<String> tags) {
            if(origin == null) {
                this.origin = '';
            } else {
                this.origin = origin;
            }
            description = (description != null) ? description : '';
            this.title = EncodingUtil.urlEncode(title, 'UTF-8');
            this.description = EncodingUtil.urlEncode(description, 'UTF-8');
            if(tags == null) {
                this.tags = new List<String> { 'uala', 'salesforce' };
             } else {
                this.tags = tags;  
             }
        }
    }
}