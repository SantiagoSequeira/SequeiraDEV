/**
 * Apex controller supporting the huManager LWC.
 * Provides CRUD operations and validation for HU__c records.
 */
public with sharing class HuController {
    private static final List<String> HU_FIELDS = new List<String>{
        'Id',
        'Name',
        'HU_Number__c',
        'Name__c',
        'Branch__c',
        'Package_Path__c',
        'Test_Text__c',
        'HU_Status__c',
        'Has_Data__c',
        'Has_Permissions__c',
        'Has_Permission_Groups__c',
        'Has_AFA_Approval__c',
        'Has_Test_Plans__c',
        'Solo_DevOps__c',
        'Guide_Sent__c',
        'Is_Multiple_Production__c',
        'Multiple_Production_HU_Numbers__c',
        'Notes__c',
        'External_Reference__c',
        'CreatedDate',
        'LastModifiedDate',
        '(SELECT Id FROM Permission_Requests__r)'
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
        Set<String> relatedHUNumbers = getRelatedHUNumbers(hu);
        validateRelatedHUs(relatedHUNumbers);

        if (hu.Id != null) {
            update hu;
        } else {
            insert hu;
        }

        closeRelatedHUs(hu.Id, relatedHUNumbers);

        Id huId = hu.Id;
        List<HU__c> results = Database.query(
            'SELECT ' + String.join(HU_FIELDS, ', ') + ' FROM HU__c WHERE Id = :huId LIMIT 1'
        );
        return results.isEmpty() ? hu : results[0];
    }

    private static Set<String> getRelatedHUNumbers(HU__c hu) {
        Set<String> huNumbers = new Set<String>();
        if (
            !hu.Is_Multiple_Production__c ||
            hu.HU_Status__c != 'Cerrado' ||
            String.isBlank(hu.Multiple_Production_HU_Numbers__c)
        ) {
            return huNumbers;
        }

        for (String huNumber : hu.Multiple_Production_HU_Numbers__c.split(';')) {
            if (String.isNotBlank(huNumber)) {
                huNumbers.add(huNumber.trim());
            }
        }
        return huNumbers;
    }

    private static void validateRelatedHUs(Set<String> relatedHUNumbers) {
        if (relatedHUNumbers.isEmpty()) {
            return;
        }

        Set<String> foundHUNumbers = new Set<String>();
        for (HU__c relatedHu : [
            SELECT HU_Number__c
            FROM HU__c
            WHERE HU_Number__c IN :relatedHUNumbers
        ]) {
            foundHUNumbers.add(relatedHu.HU_Number__c);
        }

        Set<String> missingHUNumbers = relatedHUNumbers.clone();
        missingHUNumbers.removeAll(foundHUNumbers);
        if (!missingHUNumbers.isEmpty()) {
            throw new AuraHandledException(
                'No se encontraron las HUs: ' + String.join(new List<String>(missingHUNumbers), ', ')
            );
        }
    }

    private static void closeRelatedHUs(Id sourceHuId, Set<String> relatedHUNumbers) {
        if (relatedHUNumbers.isEmpty()) {
            return;
        }

        List<HU__c> relatedHUs = [
            SELECT Id, HU_Status__c
            FROM HU__c
            WHERE HU_Number__c IN :relatedHUNumbers
            AND Id != :sourceHuId
        ];
        for (HU__c relatedHu : relatedHUs) {
            relatedHu.HU_Status__c = 'Cerrado';
        }
        if (!relatedHUs.isEmpty()) {
            update relatedHUs;
        }
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

    @AuraEnabled
    public static List<Permission_Request__c> getPermissionRequests(Id huId) {
        if (huId == null) {
            return new List<Permission_Request__c>();
        }

        return [
            SELECT Id, Request_Number__c, Description__c, Status__c
            FROM Permission_Request__c
            WHERE HU__c = :huId
            ORDER BY CreatedDate DESC
        ];
    }

    @AuraEnabled
    public static Permission_Request__c savePermissionRequest(Permission_Request__c permissionRequest) {
        validatePermissionRequest(permissionRequest);

        if (permissionRequest.Id == null) {
            insert permissionRequest;
        } else {
            update permissionRequest;
        }

        Id permissionRequestId = permissionRequest.Id;
        return [
            SELECT Id, HU__c, Request_Number__c, Description__c, Status__c
            FROM Permission_Request__c
            WHERE Id = :permissionRequestId
            LIMIT 1
        ];
    }

    @AuraEnabled
    public static void deletePermissionRequest(Id permissionRequestId) {
        if (permissionRequestId == null) {
            throw new AuraHandledException('No se recibió el Id de la solicitud a eliminar.');
        }

        List<Permission_Request__c> requests = [
            SELECT Id
            FROM Permission_Request__c
            WHERE Id = :permissionRequestId
            LIMIT 1
        ];
        if (requests.isEmpty()) {
            throw new AuraHandledException('No se encontró la solicitud solicitada.');
        }
        delete requests;
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

    }

    @TestVisible
    private static void validatePermissionRequest(Permission_Request__c permissionRequest) {
        if (permissionRequest == null || permissionRequest.HU__c == null) {
            throw new AuraHandledException('La solicitud debe estar asociada a una HU.');
        }
        if (String.isBlank(permissionRequest.Request_Number__c)) {
            throw new AuraHandledException('El Nro de solicitud es obligatorio.');
        }
    }
}
