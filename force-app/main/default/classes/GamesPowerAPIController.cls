public class GamesPowerAPIController {
    @AuraEnabled
    public static String callToService() {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://www.gamerpower.com/api/giveaways?platform=pc');
        request.setMethod('GET');
        HttpResponse response = http.send(request);
        // If the request is successful, parse the JSON response.
        if (response.getStatusCode() == 200) {
            // Deserialize the JSON string into collections of primitive data types.
            return response.getBody();
        }
        return '';
    }
}