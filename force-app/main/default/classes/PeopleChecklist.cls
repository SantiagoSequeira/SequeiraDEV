public class PeopleChecklist {
	@AuraEnabled
    public static List<Option> getPersons() {
        List<Option> persons = new List<Option>();
        for(Contact contacto :[SELECT Name FROM Contact WHERE isContableToChecklist__c = true ORDER BY Name ASC]) {
            persons.add(new Option(contacto.Name));
        }
        return persons;
    }
    
    public class Option {
        @AuraEnabled public String label;
        @AuraEnabled public String value;
        
        public Option(String value) {
            this.label = value;
            this.value = value;
        }
    }
}