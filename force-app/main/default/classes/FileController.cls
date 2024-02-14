public without sharing class FileController {
    @AuraEnabled
    public static string uploadFile(Id recordId, String fileId, String type) {
        ContentDocument cD = [SELECT id, LatestPublishedVersion.VersionData FROM ContentDocument WHERE id = :fileId];
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('callout:filestackapi/api/store/S3?key=AVqoWJGBhSi1dntzwSkqQz');
        request.setMethod('POST');
        request.setHeader('Content-Type', 'image/png');
        request.setBodyAsBlob(cD.LatestPublishedVersion.VersionData);
        HttpResponse response = http.send(request);
        // Parse the JSON response
        if (response.getStatusCode() != 200) {
            System.debug('The status code returned was not expected: ' + response.getStatusCode() + ' ' + response.getStatus());
            return 'error';
        } else {
            UploadResponse res = (UploadResponse) JSON.deserialize(response.getBody(), UploadResponse.class);
            Account acc = [SELECT id, RunningActivity__c FROM Account WHERE Id = :recordId];
            System.debug(res.url);
            acc.ImageURL__c = res.url;
            Database.SaveResult saveRes = Database.update(acc);
            System.debug(saveRes.isSuccess());
            return 'success';
        }
    }
    public class UploadResponse {
        @AuraEnabled
        public String url;
    }
}