public with sharing class MisNotasVisualizerController {
    @AuraEnabled
    public static List<Nota__c> getNotas(){
        return [SELECT id, Data__c FROM Nota__c LIMIT 10000];
    }
}