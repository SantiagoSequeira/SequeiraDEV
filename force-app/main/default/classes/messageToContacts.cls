public with sharing class messageToContacts {
    public List<Contact> Contacts {get;set;} 
    public String message {get;set;}
    public messageToContacts(){
        this.Contacts = ([SELECT id, character_id__c, LastName, FirstName, Message__c, checked__c FROM Contact]);
    }
    public void save (){
        System.debug('Contacts: ' + this.contacts);
        List<Contact> updateContacts = new List<Contact>();
        for(Contact c : Contacts){
            if(c.Checked__c == True){
                //c.Message__c = this.message;
                updateContacts.add(c);
            }
        }
        if(updateContacts.size()>0){
            delete updateContacts;
        }
    }
 }