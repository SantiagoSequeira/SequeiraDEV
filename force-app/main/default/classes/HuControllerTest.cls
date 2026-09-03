@isTest
private class HuControllerTest {
    @isTest
    static void testSaveHUCreatesRecord() {
        HU__c hu = new HU__c(
            HU_Number__c = 'HU-1001',
            Package_Path__c = '/packages/hu1001/package.xml',
            Test_Text__c = 'TestClassOne TestClassTwo',
            HU_Status__c = 'Nuevo',
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

        Test.startTest();
        HU__c updated = HuController.saveHU(hu);
        Test.stopTest();

        System.assertEquals('En desarrollo', updated.HU_Status__c);
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
    static void testSavePermissionRequest() {
        HU__c hu = new HU__c(HU_Number__c = 'HU-3003', HU_Status__c = 'Nuevo');
        insert hu;

        Permission_Request__c permissionRequest = new Permission_Request__c(
            HU__c = hu.Id,
            Request_Number__c = 'REQ-100',
            Description__c = 'Acceso al repositorio',
            Status__c = 'Nuevo'
        );

        Test.startTest();
        Permission_Request__c saved = HuController.savePermissionRequest(permissionRequest);
        List<Permission_Request__c> requests = HuController.getPermissionRequests(hu.Id);
        HuController.deletePermissionRequest(saved.Id);
        Test.stopTest();

        System.assertEquals('REQ-100', saved.Request_Number__c);
        System.assertEquals(1, requests.size());
        System.assertEquals(0, [SELECT count() FROM Permission_Request__c WHERE Id = :saved.Id]);
    }

    @isTest
    static void testSavePermissionRequestWithoutNumberThrows() {
        HU__c hu = new HU__c(
            HU_Number__c = 'HU-3003',
            HU_Status__c = 'Nuevo'
        );
        insert hu;

        Boolean threw = false;
        try {
            HuController.savePermissionRequest(
                new Permission_Request__c(HU__c = hu.Id, Description__c = 'Descripción')
            );
        } catch (AuraHandledException e) {
            threw = true;
        }

        System.assert(threw, 'Expected an AuraHandledException when the request number is blank.');
    }

    @isTest
    static void testClosingMultipleProductionClosesRelatedHUs() {
        HU__c relatedHu = new HU__c(
            HU_Number__c = 'HU-3501',
            HU_Status__c = 'En pruebas'
        );
        HU__c primaryHu = new HU__c(
            HU_Number__c = 'HU-3500',
            HU_Status__c = 'Cerrado',
            Is_Multiple_Production__c = true,
            Multiple_Production_HU_Numbers__c = 'HU-3501'
        );
        insert relatedHu;
        insert primaryHu;

        Test.startTest();
        HuController.saveHU(primaryHu);
        Test.stopTest();

        relatedHu = [SELECT HU_Status__c FROM HU__c WHERE Id = :relatedHu.Id];
        System.assertEquals('Cerrado', relatedHu.HU_Status__c);
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
