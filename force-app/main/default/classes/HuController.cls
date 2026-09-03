/**
 * Apex controller supporting the huManager LWC.
 * Provides CRUD operations and validation for HU__c records.
 */
public with sharing class HuController {
    private static final List<String> HU_FIELDS = new List<String>{
        'Id',
        'Name',
        'HU_Number__c',
        'Package_Path__c',
        'Branch_Name__c',
        'Test_Text__c',
        'HU_Status__c',
        'Permission_Requests__c',
        'Has_Data__c',
        'Has_Permissions__c',
        'Has_Permission_Groups__c',
        'Has_AFA_Approval__c',
        'Has_Test_Plans__c',
        'Notes__c',
        'External_Reference__c',
        'LastModifiedDate'
    };

    /**
     * Returns the list of HU records, optionally filtered by HU number (partial match).
     */
    @AuraEnabled(cacheable=true)
    public static List<HU__c> getHUs(String searchTerm) {
        String query =
            'SELECT ' +
            String.join(HU_FIELDS, ', ') +
            ' FROM HU__c';

        String likeTerm;
        if (String.isNotBlank(searchTerm)) {
            likeTerm = '%' + String.escapeSingleQuotes(searchTerm.trim()) + '%';
            query += ' WHERE HU_Number__c LIKE :likeTerm';
        }

        query += ' ORDER BY LastModifiedDate DESC LIMIT 200';

        return Database.query(query);
    }

    /**
     * Creates or updates an HU record after validating required data.
     */
    @AuraEnabled
    public static HU__c saveHU(HU__c hu) {
        validateHU(hu);

        if (hu.Id != null) {
            update hu;
        } else {
            insert hu;
        }

        List<HU__c> results = Database.query(
            'SELECT ' + String.join(HU_FIELDS, ', ') + ' FROM HU__c WHERE Id = :hu.Id LIMIT 1'
        );
        return results.isEmpty() ? hu : results[0];
    }

    /**
     * Deletes an HU record by Id.
     */
    @AuraEnabled
    public static void deleteHU(Id huId) {
        if (huId == null) {
            throw new AuraHandledException('No se recibió el Id de la HU a eliminar.');
        }

        List<HU__c> toDelete = [SELECT Id FROM HU__c WHERE Id = :huId LIMIT 1];
        if (toDelete.isEmpty()) {
            throw new AuraHandledException('No se encontró la HU solicitada.');
        }
        delete toDelete;
    }

    /**
     * Validates required business rules for an HU record.
     * Public + static so it can be unit tested independently of DML.
     */
    @TestVisible
    private static void validateHU(HU__c hu) {
        if (hu == null) {
            throw new AuraHandledException('No se recibió información de la HU.');
        }

        if (String.isBlank(hu.HU_Number__c)) {
            throw new AuraHandledException('El Nro de HU es obligatorio.');
        }

        if (
            String.isNotBlank(hu.Permission_Requests__c) &&
            !Pattern.matches('^\\d+(\\s+\\d+)*$', hu.Permission_Requests__c.trim())
        ) {
            throw new AuraHandledException(
                'Los números de solicitudes de permisos deben ser números separados por espacios.'
            );
        }
    }
}
