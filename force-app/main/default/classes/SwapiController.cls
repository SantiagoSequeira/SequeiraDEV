public with sharing class SwapiController {
    @AuraEnabled
    public static Object getCharacter(Integer id) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://swapi.dev/api/people/'+ id + '/?format=json');
        request.setMethod('GET');
        HttpResponse response = http.send(request);
        if (response.getStatusCode() == 200) {
            
            Object result = (Object) JSON.deserializeUntyped(response.getBody());
            return result;
        }
        return null;
    }    
    @AuraEnabled
    public static boolean insertContact(Integer id, String FirstName, Double height, String gender, String hair_color, String eye_color, String url, String world) {
        Contact newContact = new Contact();
        newContact.FirstName = FirstName;
        newContact.LastName = '.';
        newContact.eye_color__c = eye_color;
        newContact.hair_color__c = hair_color;
        newContact.gender__c = gender;
        newContact.world__c = world;
        newContact.character_id__c = id;
        newContact.height__c = height;
        newContact.url__c = url;
        try {
            upsert newContact Contact.fields.Character_id__c;
        } catch (DmlException e) {
            return false;
        }

        
        
		return true;
	}
}