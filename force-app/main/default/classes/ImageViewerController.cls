public class ImageViewerController {
    @AuraEnabled
    public static Map<String, String> getImages(String recordId) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://i1.wp.com/infodecordoba.com.ar/wp-content/uploads/2014/06/solicitar-nuevo-dni-internet.jpg?fit=900%2C560');
        req.setMethod('GET');
        Http binding = new Http();
        HttpResponse res = binding.send(req);
        Blob dniAnverso = res.getBodyAsBlob();

        req = new HttpRequest();
        req.setEndpoint('https://i.blogs.es/f1da39/img_0013/2560_3000.jpg');
        req.setMethod('GET');
        binding = new Http();
        res = binding.send(req);
        Blob selfie = res.getBodyAsBlob();

        req = new HttpRequest();
        req.setEndpoint('https://resizer.iproimg.com/unsafe/880x/https://assets.iprofesional.com/assets/jpg/2020/11/507339.jpg?6.3.0');
        req.setMethod('GET');
        binding = new Http();
        res = binding.send(req);
        Blob dniReverso = res.getBodyAsBlob();

        Map<String , String> images = new Map<String , String>{
            'selfie' => 'data:image/png;base64,' + EncodingUtil.base64Encode(selfie),
            'reverso' => 'data:image/png;base64,' + EncodingUtil.base64Encode(dniReverso),
            'anverso' => 'data:image/png;base64,' + EncodingUtil.base64Encode(dniAnverso)
        };
        return images;
    }
    
}