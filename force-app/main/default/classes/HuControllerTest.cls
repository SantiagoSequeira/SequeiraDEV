@isTest
private class HuControllerTest {
    @isTest
    static void testSaveHUCreatesRecord() {
        HU__c hu = new HU__c(
            HU_Number__c = 'HU-1001',
            Package_Path__c = '/packages/hu1001/package.xml',
            Test_Text__c = 'TestClassOne TestClassTwo',
            HU_Status__c = 'Nuevo',
            Permission_Requests__c = 2,
            Has_Data__c = true
        );

        Test.startTest();
        HU__c saved = HuController.saveHU(hu);
        Test.stopTest();

        System.assertNotEquals(null, saved.Id, 'The HU record should have been inserted.');
        System.assertEquals('HU-1001', saved.HU_Number__c);
    }

    @isTest
    static void testSaveHUUpdatesRecord() {
        HU__c hu = new HU__c(HU_Number__c = 'HU-2002', HU_Status__c = 'Nuevo');
        insert hu;

        hu.HU_Status__c = 'En desarrollo';
        hu.Permission_Requests__c = 5;

        Test.startTest();
        HU__c updated = HuController.saveHU(hu);
        Test.stopTest();

        System.assertEquals('En desarrollo', updated.HU_Status__c);
        System.assertEquals(5, updated.Permission_Requests__c);
    }

    @isTest
    static void testSaveHUWithoutNumberThrows() {
        HU__c hu = new HU__c(HU_Status__c = 'Nuevo');

        Boolean threw = false;
        try {
            HuController.saveHU(hu);
        } catch (AuraHandledException e) {
            threw = true;
        }

        System.assert(threw, 'Expected an AuraHandledException when HU_Number__c is blank.');
    }

    @isTest
    static void testSaveHUWithNegativePermissionRequestsThrows() {
        HU__c hu = new HU__c(
            HU_Number__c = 'HU-3003',
            HU_Status__c = 'Nuevo',
            Permission_Requests__c = -1
        );

        Boolean threw = false;
        try {
            HuController.saveHU(hu);
        } catch (AuraHandledException e) {
            threw = true;
        }

        System.assert(threw, 'Expected an AuraHandledException for negative permission requests.');
    }

    @isTest
    static void testGetHUsReturnsAllAndFiltered() {
        insert new List<HU__c>{
            new HU__c(HU_Number__c = 'HU-4004', HU_Status__c = 'Nuevo'),
            new HU__c(HU_Number__c = 'HU-5005', HU_Status__c = 'Nuevo')
        };

        Test.startTest();
        List<HU__c> all = HuController.getHUs(null);
        List<HU__c> filtered = HuController.getHUs('4004');
        Test.stopTest();

        System.assertEquals(2, all.size());
        System.assertEquals(1, filtered.size());
        System.assertEquals('HU-4004', filtered[0].HU_Number__c);
    }

    @isTest
    static void testDeleteHU() {
        HU__c hu = new HU__c(HU_Number__c = 'HU-6006', HU_Status__c = 'Nuevo');
        insert hu;

        Test.startTest();
        HuController.deleteHU(hu.Id);
        Test.stopTest();

        List<HU__c> remaining = [SELECT Id FROM HU__c WHERE Id = :hu.Id];
        System.assertEquals(0, remaining.size());
    }

    @isTest
    static void testDeleteHUWithNullIdThrows() {
        Boolean threw = false;
        try {
            HuController.deleteHU(null);
        } catch (AuraHandledException e) {
            threw = true;
        }
        System.assert(threw, 'Expected an AuraHandledException when Id is null.');
    }

    @isTest
    static void testDeleteHUWithUnknownIdThrows() {
        HU__c hu = new HU__c(HU_Number__c = 'HU-7007', HU_Status__c = 'Nuevo');
        insert hu;
        Id huId = hu.Id;
        delete hu;

        Boolean threw = false;
        try {
            HuController.deleteHU(huId);
        } catch (AuraHandledException e) {
            threw = true;
        }
        System.assert(threw, 'Expected an AuraHandledException when the HU no longer exists.');
    }
}
