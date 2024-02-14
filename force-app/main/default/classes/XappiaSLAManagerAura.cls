public class XappiaSLAManagerAura  {
    
    @AuraEnabled(Cacheable=true)
    public static List<SlaProcess> getProcesses() {
         return [
            SELECT Id, Name
            FROM SlaProcess
            WHERE IsActive = true
            AND IsVersionDefault = true
            ];
     }

    @AuraEnabled
    public static Response initializeFields(String selectedProcess){
        return new Response(selectedProcess);
    }

    private static List<XappiaSLAManagerAura.FieldTypeInfo> getFields(String selectedProcess){
        Map<String, SLACriterion__c> oldCriterions = new Map<String, SLACriterion__c>();
        Set<Integer> sets = new Set<Integer>();
        if(!String.isBlank(selectedProcess)) {
            for(SLACriterion__c criterion: [
                    SELECT id, FieldType__c, SelectedOptions__c, 
                            FieldName__c, Checked__c, IsNot__c, SLAProcess__c, Set__c
                    FROM SLACriterion__c 
                    WHERE SLAProcess__c = :selectedProcess]
            ){
                sets.add(Integer.valueOf(criterion.Set__c));
                oldCriterions.put(criterion.FieldName__c, criterion);
            }
        }
        if(!oldCriterions.isEmpty()) {
            List<XappiaSLAManagerAura.FieldTypeInfo> response = new List<XappiaSLAManagerAura.FieldTypeInfo>();
            for(Integer i :sets) {
                response.addAll(getAllFields(oldCriterions, i));
            }
            return response;
        }   
       return getAllFields(oldCriterions, 0);
    }

    public class Response {
        @AuraEnabled public List<XappiaSLAManagerAura.FieldTypeInfo> generalFields;
        @AuraEnabled public List<Map<String, Object>> items = new List<Map<String, Object>>();

        public Response (String selectedProcess) {
            generalFields = getFields('');
            Map<Integer, Object> sets = new Map<Integer, Object>();
            for(XappiaSLAManagerAura.FieldTypeInfo fTI : getFields(selectedProcess)) {
                if(sets.containsKey(fTI.setNumber)) {
                   List<XappiaSLAManagerAura.FieldTypeInfo> field = (List<XappiaSLAManagerAura.FieldTypeInfo>) sets.get(fTI.setNumber);
                   field.add(fTI);
                } else {
                    sets.put(fTI.setNumber, new List<XappiaSLAManagerAura.FieldTypeInfo> { fTI });
                }
            }
            List<Integer> setNumbers = new List<Integer>();
            setNumbers.addAll(sets.keySet());
            setNumbers.sort();
            for(Integer key : setNumbers) {
                items.add(new Map<String, Object>{
                    'fields' => (List<XappiaSLAManagerAura.FieldTypeInfo>) sets.get(key),
                    'hasChanged' => false,
                    'num' => key
                });
            }
        }
    }
    
    private static List<XappiaSLAManagerAura.FieldTypeInfo> getAllFields (Map<String, SLACriterion__c> oldCriterions, Integer thisSet) {
        Map<String, XappiaSLAManagerAura.FieldTypeInfo> fields = new Map<String, XappiaSLAManagerAura.FieldTypeInfo>();
        List<XappiaSLAManagerAura.FieldTypeInfo> orderedFields = new List<XappiaSLAManagerAura.FieldTypeInfo>();
        List<String> fieldsNamesForOrder = new List<String>();
        for(Schema.SObjectField sfield : Schema.getGlobalDescribe()
                .get('Case')
                .getDescribe()
                .fields
                .getMap()
                .Values()
        ){
            schema.describefieldresult dField = sfield.getDescribe();
            if(String.valueOf(dField.getType()) != 'DATE' && String.valueOf(dField.getType()) != 'DATETIME' && String.valueOf(dField.getType()) != 'TIME') {
                fieldsNamesForOrder.add(dField.getName());
                XappiaSLAManagerAura.FieldTypeInfo fTInfo = new XappiaSLAManagerAura.FieldTypeInfo();
                fTInfo.initializateValue(dField, thisSet);
                if(oldCriterions.containsKey(dField.getName())){
                    fTInfo.checkPreviousValues(oldCriterions.get(dField.getName()));
                }
                fields.put(dField.getName(),fTInfo);
            }
        }
        fieldsNamesForOrder.sort();
        for(String key :fieldsNamesForOrder) {
            orderedFields.add(fields.get(key));
        }
        return orderedFields;
    }

    @AuraEnabled
    public static String clearSLA(String selectedProcess, Integer setNumber){
        try {
            Delete [SELECT id FROM SLACriterion__c WHERE SLAProcess__c = :selectedProcess AND Set__c = :setNumber];
            return'{status: ok}';
        } catch (Exception e) {
            return'{status: error, message: ' + e.getMessage() +'}';
        }   
    }

    @AuraEnabled
    public static String saveSLA(String fieldsJSON, String selectedProcess, Integer setNumber){
        try{
            Delete [SELECT id FROM SLACriterion__c WHERE SLAProcess__c = :selectedProcess AND Set__c = :setNumber]; 
            List<XappiaSLAManagerAura.FieldTypeInfo> fields = (List<XappiaSLAManagerAura.FieldTypeInfo>) JSON.deserialize(fieldsJSON, List<XappiaSLAManagerAura.FieldTypeInfo>.class);
            List<SLACriterion__c> criterions = new List<SLACriterion__c>();
            Integer i = 0;
            for(FieldTypeInfo fTInfo :fields) {
                if(fTInfo.selected) {
                    criterions.add(fTInfo.convertIntoACriterion(i, selectedProcess, setNumber));
                    i++;
                }
            }
            insert criterions;
            return'{"status": "ok"}';
        } catch (Exception e) {
            System.debug(e.getMessage());
            return '{"status": "error"}';
        }
        
    }

     public class FieldTypeInfo {
        @AuraEnabled public List<String> options {get;set;}
        @AuraEnabled public List<String> selectedOptions {get;set;}
        @AuraEnabled public Boolean checked {get;set;}
        @AuraEnabled public Boolean isNot {get;set;}
        @AuraEnabled public Boolean selected {get;set;}
        @AuraEnabled public String stringFilter {get;set;}
        @AuraEnabled public String fieldName {get;set;}
        @AuraEnabled public Integer setNumber {get;set;}
        @AuraEnabled public String fieldType {get;set;}
        @AuraEnabled public String labelName {get;set;}
        
        public FieldTypeInfo() {}

        public void checkPreviousValues(SLACriterion__c oldCriterion) {
            if(this.setNumber == Integer.valueOf(oldCriterion.Set__c)) {
                if(oldCriterion.FieldType__c == 'BOOLEAN'){
                    this.checked = oldCriterion.Checked__c;
                } else if(oldCriterion.FieldType__c == 'PICKLIST' || oldCriterion.FieldName__c == 'RecordTypeId'){
                    for(Object option : (List<Object>) JSON.deserializeUntyped(oldCriterion.SelectedOptions__c)) {
                        this.selectedOptions.add(String.valueOf(option));
                    }
                } else {
                    for(Object option : (List<Object>) JSON.deserializeUntyped(oldCriterion.SelectedOptions__c)) {
                        this.stringFilter += String.valueOf(option) + ';'; 
                    }
                }
                this.isNot = oldCriterion.IsNot__c;
                this.selected = true;
            }

        }

        public void initializateValue(schema.describefieldresult value, Integer setNumber) {
             this.fieldName = value.getName();
             this.labelName = value.getLabel();
             this.selectedOptions = new List<String>();
             this.stringFilter = '';
             this.isNot = false;
             this.fieldType = String.valueOf(value.getType());
             this.selected = false;
             this.checked = false;
             this.options = new List<String>();
             this.setNumber = setNumber;

             if(this.fieldType ==  'PICKLIST') {
                 for(PicklistEntry pick :value.getPicklistValues()) {
                     if(pick.isActive()) {
                        this.options.add(pick.getLabel());
                     }
                 }
             } else if(this.fieldName == 'RecordTypeId') {
                 for(Schema.RecordTypeInfo rType : Schema.getGlobalDescribe()
                                                 .get('Case')
                                                 .getDescribe()
                                                 .getRecordTypeInfos()
                 ){
                     if(rType.isActive() && rType.getName() != 'Master') {
                         this.options.add(rType.getName());

                     }
                 }
             }
         }

         public SLACriterion__c convertIntoACriterion(Integer itemNumber, String inFunction, Integer setNumber) {
             String nameMaker = String.valueOf(Datetime.now()).replace(' ', '')
                                                              .replace('-', '')
                                                              .replace(':', '').right(12);
             SLACriterion__c newSLACriterion = new SLACriterion__c();
             newSLACriterion.SLAProcess__c = inFunction;
             newSLACriterion.Set__c = setNumber;
             newSLACriterion.Name = nameMaker + 
                                         String.valueOf(Datetime.now().getTime()).right(3) + 'S' + String.valueOf(setNumber) +
                                                     '-' + String.valueOf(itemNumber);
             newSLACriterion.Checked__c = this.checked;
             newSLACriterion.IsNot__c = this.isNot;
             newSLACriterion.FieldType__c = this.fieldType;
             newSLACriterion.FieldName__c = this.fieldName;
             if(this.fieldName == 'RecordTypeId' || this.fieldType == 'PICKLIST') {
                 newSLACriterion.SelectedOptions__c = JSON.serialize(this.selectedOptions);
             } else {
                 newSLACriterion.SelectedOptions__c = JSON.serialize(this.stringFilter.split('\\;'));
             }
             return newSLACriterion;
         }
     }
 }