public class ImageController {
    
    @AuraEnabled
    public static String saveImageAttachment(String imageUrl, String recordId) {
         try {
			// Save in Attachment            
            Attachment attchment = new Attachment();
            attchment.ParentID = recordId;
            attchment.Body = EncodingUtil.base64Decode(imageUrl.substring(imageUrl.indexOf(',') + 1));
            attchment.contentType = 'image/png';
            attchment.Name=recordId+'.png';
            attchment.OwnerId = UserInfo.getUserId();
            insert attchment;
            return 'success';
            
        }catch(Exception e){
            system.debug('---------- ' + e.getMessage());
            return JSON.serialize(e.getMessage());
        }
    }
    @AuraEnabled
    public static String saveImageFile(String imageUrl, String recordId) {
        String data = imageUrl.substring(imageUrl.indexOf(',') + 1);
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('callout:filestackapi/api/store/S3?key=AVqoWJGBhSi1dntzwSkqQz&base64decode=true&mimetype=image/png');
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        String payload = 'data=' + EncodingUtil.urlEncode(data,'UTF-8');
        System.debug(payload);
        request.setBody(payload);
        HttpResponse response = http.send(request);
        // Parse the JSON response
        if (response.getStatusCode() != 200) {
            System.debug('The status code returned was not expected: ' + response.getStatusCode() + ' ' + response.getStatus());
            return 'error';
        } else {
            UploadResponse res = (UploadResponse) JSON.deserialize(response.getBody(), UploadResponse.class);
            Account acc = [SELECT id, RunningActivity__c FROM Account WHERE Id = :recordId];
            acc.ImageURL__c = res.url;
            update acc;
            return 'success';
        }
    }

    public class UploadResponse {
        @AuraEnabled
        public String url;
    }
}