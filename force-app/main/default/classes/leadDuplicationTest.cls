@isTest
public class leadDuplicationTest {
	@isTest
    public static void testInsert(){
        Lead newLead = new Lead();
        newLead.Email = 'email123@abc.com';
        newLead.LastName = 'Test123';
        newLead.Company = 'Test123';
        Test.startTest();
        	insert newLead;
        Test.stopTest();
    }
}