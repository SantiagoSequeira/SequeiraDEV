public with sharing class ImageUrlViewer {
    @AuraEnabled()
    public static Event getData(String recordId) {
        return [SELECT Id, Image__c FROM Event WHERE Id = :recordId];
    }
}