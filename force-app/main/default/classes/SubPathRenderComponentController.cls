public with sharing class SubPathRenderComponentController {
    @AuraEnabled
    public static Response getInititalData(){//String recordId, String controllingField){
        Response response = new Response();
        response.subPaths.add(new SubPathOption(2, 'Test 1', 'c:CustomTestComponent1', 'Value Proposition'));
        response.subPaths.add(new SubPathOption(1, 'Test 2', 'c:CustomTestComponent2', 'Value Proposition'));
        response.subPaths.add(new SubPathOption(0, 'Test 3', 'c:CustomTestComponent2', 'Id. Decision Makers'));
        return response;
    }

    public class Response {
        @AuraEnabled
        public List<SubpathOption> subPaths = new List<SubpathOption>();
    }
    public class SubpathOption {
        @AuraEnabled public Integer position;
        @AuraEnabled public String label;
        @AuraEnabled public String component;
        @AuraEnabled public String stage;

        public SubpathOption(Integer position, String label, String component, String stage) {
            this.position = position;
            this.label = label;
            this.component = component;
            this.stage = stage;
        }
    }

}