public with sharing class DocxGeneratorController {

    private static final String SOLICITUD_PREFIX = '\\{!Solicitud.';
    private static final String FIELD_SUFFIX = '\\}';
    private static final String CURRENT_USER_PREFIX = '\\{!CurrentUser.';
    private static final String PATTERN_REGEX = '\\{![^}]*\\}';
    private static final String EMPTY_FIELD = '<span style="background-color: orange;">*******</span>';

    @AuraEnabled
    public static String getTemplateData(String recordId){
        Plantilla__c plantilla = [SELECT Data__c FROM Plantilla__c WHERE Id = :recordId];
        return plantilla.Data__c;
    }

    @AuraEnabled
    public static String getFilledTemplate(String recordId, String accountId){
        String text = getTemplateData(recordId);
        return parseTemplateData(text, accountId);
    }

    private static String parseTemplateData(String text, String accountId){
        String currentUser = UserInfo.getUserId();
        Pattern patternObj = Pattern.compile(PATTERN_REGEX);
        Matcher matcher = patternObj.matcher(text);

        List<String> matches = new List<String>();
        while (matcher.find()) {
            String field = matcher.group();
            field = field.replaceAll(' ', '');
            matches.add(field.subString(2, field.length() -1));
        }
        List<String> solicitudFields = new List<String>{'Id'};
        List<String> currentUserFields = new List<String>{'Id'};
        for(String field : matches){
            List<String> fieldData = field.split('\\.', 2);
            if(fieldData.size() != 2){
                continue;
            }
            if(fieldData[0] == 'Solicitud'){
                solicitudFields.add(fieldData[1]);
            } else if(fieldData[0] == 'CurrentUser'){
                currentUserFields.add(fieldData[1]);
            }
        }
        Account acc = Database.query('SELECT ' + String.join(solicitudFields, ', ') + ' FROM Account WHERE Id =:accountId ');
        User usr = Database.query('SELECT ' + String.join(currentUserFields, ', ') + ' FROM User WHERE Id =:currentUser ');

        for(String field : solicitudFields){
            text = text.replaceAll(SOLICITUD_PREFIX + field + FIELD_SUFFIX, getFieldData(acc, field));
        }
        for(String field : currentUserFields){
            text = text.replaceAll(CURRENT_USER_PREFIX + field + FIELD_SUFFIX, getFieldData(usr, field));
        }
        return text;
    }

    private static String getFieldData(Sobject record, String field){
        try{
            if(field.contains('.')){
                List<String> fieldData = field.split('\\.', 2);
                return getFieldData(record.getSObject(fieldData[0]), fieldData[1]);
            } else {
                String data = String.valueOf(record.get(field));
                return String.isBlank(data) ? EMPTY_FIELD : data;
            }
        } catch(Exception ex){
            return EMPTY_FIELD;
        }  
    }

    @AuraEnabled
    public static AccessibleFields getAccessibleFields(){
        //solicitud, tipo, usuario
        AccessibleFields accesibleFields = new AccessibleFields();
        for(Schema.SobjectField field : Account.getSObjectType().getDescribe().fields.getMap().values()){
            Schema.DescribeFieldResult fieldDescribe = field.getDescribe();
            if(fieldDescribe.isAccessible()){
                accesibleFields.solicitudFields.add(new Field('Solicitud.' + fieldDescribe.getName(), fieldDescribe.getLabel()));
            }
        }
        for(Schema.SobjectField field : User.getSObjectType().getDescribe().fields.getMap().values()){
            Schema.DescribeFieldResult fieldDescribe = field.getDescribe();
            if(fieldDescribe.isAccessible()){
                accesibleFields.userFields.add(new Field('CurrentUser.' + fieldDescribe.getName(), fieldDescribe.getLabel()));
            }
        }
        return accesibleFields;
    }

    public class AccessibleFields {
        @AuraEnabled
        public List<Field> userFields = new List<Field>();
        @AuraEnabled
        public List<Field> solicitudFields = new List<Field>();
    }

    public class Field {
        @AuraEnabled
        public String fieldName;
        @AuraEnabled
        public String fieldLabel;

        public Field(String fieldName, String fieldLabel){
            this.fieldName = fieldName;
            this.fieldLabel = fieldLabel;
        }
    }
}