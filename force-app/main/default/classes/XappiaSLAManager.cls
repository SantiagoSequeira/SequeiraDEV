public class XappiaSLAManager  {
    
   // public final List<SLA__mdt> SLAs {get;set;}
   // final Map<String, SLA__mdt> SLAsByApiName {get; set;}
    public List<SlaProcess> slaProcesses {get;set;}
    public String inFunction {get;set;}
    public Map<String, FieldTypeInfo> fields {get;set;}
    public String jsonGenerated {get;set;}
    public List<String> fieldsNamesForOrder {get;set;}
    public List<SLACriterion__c> criterions {get;Set;}
    public Integer itemNumber {get;set;}

    public XappiaSLAManager() { 
       // SLAs = new List<SLA__mdt>();
       // SLAsByApiName = new Map<String, SLA__mdt>();
        itemNumber = 0;
        inFunction = 'None';
        jsonGenerated = '';
        fields = new Map<String, FieldTypeInfo>();
        fieldsNamesForOrder = new List<String>();
        /*for (SLA__mdt v : [SELECT QualifiedApiName, MasterLabel
                                FROM SLA__mdt]) { 
                                    SLAs.add(v);
                                    SLAsByApiName.put(v.QualifiedApiName, v);
                                }*/
        slaProcesses = [
		     SELECT Id, Name
		     FROM SlaProcess
		     WHERE IsActive = true
             AND IsVersionDefault = true
		     ];
        if(ApexPages.CurrentPage().getParameters().containsKey('process')) {
            inFunction = ApexPages.CurrentPage().getParameters().get('process');

        }
        for(Schema.SObjectField sfield : Schema.getGlobalDescribe()
                                               .get('Case')
                                               .getDescribe()
                                               .fields
                                               .getMap()
                                               .Values()
        ){
            schema.describefieldresult dField = sfield.getDescribe();
          //  if(dField.getName() == 'RecordTypeId' || String.valueOf(dField.getType()) != 'REFERENCE') {
                fieldsNamesForOrder.add(dField.getName());
                fields.put(dField.getName(),new FieldTypeInfo(dField));
          //  }
        }
        fieldsNamesForOrder.sort();
    }
    
    public void save() {
        Delete [SELECT id FROM SLACriterion__c WHERE SLAProcess__c = :inFunction];        
        insert criterions;
        /*Metadata.DeployContainer container = new Metadata.DeployContainer();
        // A unique name for developer name 
        // Replace space with '_'
        String recordDevName = inFunction.replaceAll(' ', '_');
        // Set up custom metadata to be created in the subscriber org.
        Metadata.CustomMetadata customMetadata =  new Metadata.CustomMetadata();
        customMetadata.fullName = '' + 'SLA__mdt.' + recordDevName;
        customMetadata.label = recordDevName;

        Metadata.CustomMetadataValue customField = new Metadata.CustomMetadataValue();
        customField.field = 'Criterion__c';
        customField.value = jsonGenerated;
        customMetadata.values.add(customField);

        container.addMetadata(customMetadata);

        Id jobId = Metadata.Operations.enqueueDeployment(container, null);
        /* Create a metadata container.
        
        List<String> slaFullNames = new List<String>();
        for (String recordName : SLAsByApiName.keySet()) {
            slaFullNames.add('SLA.' + recordName);
        }
        
        List<Metadata.Metadata> records = 
            Metadata.Operations.retrieve(Metadata.MetadataType.CustomMetadata, 
                                         slaFullNames);
        
        for (Metadata.Metadata record : records) {
            Metadata.CustomMetadata slaRecord = (Metadata.CustomMetadata) record;
            String slaRecordName = slaRecord.fullName.substringAfter('.');
            SLA__mdt slaToCopy = SLAsByApiName.get(slaRecordName);
            
            for (Metadata.CustomMetadataValue slaRecValue : slaRecord.values) {
                slaRecValue.value = slaToCopy.get(slaRecValue.field);
            }
            
            // Add record to the container.
            container.addMetadata(slaRecord);
        }   
        
        // Deploy the container with the new components. 
        Id asyncResultId = Metadata.Operations.enqueueDeployment(container, null);
       
        return null; */
    }

    public void generateJson() {
        System.debug('generateJson');
        criterions = new List<SLACriterion__c>();
        
        if(!fields.isEmpty()) {
            for(FieldTypeInfo fTI :fields.values()) {
                if(fTI.selected) {
                    itemNumber++;
                    criterions.add(fTI.convertIntoACriterion(itemNumber, inFunction)); 
                    System.debug('------CRITERIONS--------');
                    System.debug(criterions);
                    System.debug('------END--CRITERIONS------');
                    System.debug('------FTI--------');
                    System.debug(fTI);
                    System.debug('-----END-FTI--------');
                }
            }
            this.jsonGenerated = JSON.serialize(criterions);
            System.debug('------JSON-GENERATED-------');
            System.debug(jsonGenerated);
            System.debug('-----END-JSON-GENERATED-------');

            save();
        }
        
    }

    public class FieldTypeInfo {
        public List<SelectOption> options {get;set;}
        public List<String> selectedOptions {get;set;}
        public Boolean checked {get;set;}
        public Boolean isNot {get;set;}
        public Boolean selected {get;set;}
        public String stringFilter {get;set;}
        public String fieldName {get;set;}
        public String fieldType {get;set;}

        public FieldTypeInfo(schema.describefieldresult value) {
            this.fieldName = value.getName();
            this.selectedOptions = new List<String>();
            this.stringFilter = '';
            this.isNot = false;
            this.fieldType = String.valueOf(value.getType());
            this.selected = false;
            this.checked = false;
            this.options = new List<SelectOption>();
            if(this.fieldType ==  'PICKLIST') {
                for(PicklistEntry pick :value.getPicklistValues()) {
                    if(pick.isActive()) {
                        this.options.add(new SelectOption(pick.getValue(), pick.getLabel()));
                    }
                }
            } else if(this.fieldName == 'RecordTypeId') {
                for(Schema.RecordTypeInfo rType : Schema.getGlobalDescribe()
                                                .get('Case')
                                                .getDescribe()
                                                .getRecordTypeInfos()
                ){
                    if(rType.isActive() && rType.getName() != 'Master') {
                        this.options.add(new SelectOption(rType.getDeveloperName(), rType.getName()));
                    }
                }
            }
        }

        public SLACriterion__c convertIntoACriterion(Integer itemNumber, String inFunction) {
            String nameMaker = String.valueOf(Datetime.now()).replace(' ', '')
                                                             .replace('-', '')
                                                             .replace(':', '');
            SLACriterion__c newSLACriterion = new SLACriterion__c();
            newSLACriterion.SLAProcess__c = inFunction;
            newSLACriterion.Name = nameMaker + 
                                        String.valueOf(Datetime.now().getTime()).right(3) + 
                                                    '-' + String.valueOf(itemNumber);
            newSLACriterion.Checked__c = this.checked;
            newSLACriterion.IsNot__c = this.isNot;
            newSLACriterion.FieldType__c = this.fieldType;
            newSLACriterion.FieldName__c = this.fieldName;
            if(this.fieldName == 'RecordTypeId' || this.fieldType == 'PICKLIST') {
                newSLACriterion.SelectedOptions__c = JSON.serialize(this.selectedOptions);
            } else {
                newSLACriterion.SelectedOptions__c = JSON.serialize(this.stringFilter.remove(' ').split('\\;'));
            }
            return newSLACriterion;
        }
    }
}