public class AccountViewer  {
    @AuraEnabled(cacheable=true)
    public static String getData (){//Id accountId) {
        return '{' +
            '"userId": "44f3b40cb-16cd-420d-b1dc-388b4ad5ae87",' +
            '"accountId": "a988fe7e-d470-4bb7-97ac-b1586b38d44b",' +
            '"userName": "santiiqa",' +
            '"documentId": "31032092",' +
            '"smsStatus": "",' +
            '"updatedDate": "2019-09-13T15:27:25.520Z",' +
            '"createdDate": "2019-03-20T16:03:03.014Z",' +
            '"cuil": "20310320928",' +
            '"address": {' +
                '"province": "2",' +
                '"city": "Banfield",' +
                '"street": "Cabrera",' +
                '"number": "1297",' +
                '"floor": "",' +
                '"apartment": "",' +
                '"observations": "",' +
                '"zipCode": "1828",' +
                '"empty": "false"' +
            '},' +
            '"birthdate": "1998-08-05",' +
            '"gender": "M",' +
            '"isPhoneVerified": "false",' +
            '"idFrontPicture": "Documentos/santiiqa-front-a0ed0d33-9e59-4b06-b196-4dd629a7e8be",' +
            '"idBackPicture": "Documentos/santiiqa-back-3d4af629-3465-45be-b956-835f1fa1047f",' +
            '"givenName": "Santi",' +
            '"picture": "Selfies/santiiqa-selfie-86adf5d7-3adb-4ee0-a7d7-780341721e18",' +
            '"nationality": "032",' +
            '"deliveryAddress": {' +
                '"province": "2",' +
                '"city": "Banfield",' +
                '"street": "Cabrera",' +
                '"number": "1297",' +
                '"floor": "",' +
                '"apartment": "",' +
                '"observations": "",' +
                '"zipCode": "1828",' +
                '"empty": "false"' +
            '},' +
            '"phoneNumber": "+5491133437573",' +
            '"birthPlace": "032",' +
            '"familyName": "Mostei",' +
            '"email": "santiago.mosteiro+04@uala.com.ar",' +
            '"maritalStatus": "Soltero",' +
            '"pep": "false",' +
            '"pepRelationship": "Ninguna",' +
            '"pepPosition": "QA2",' +
            '"pepOffice": "",' +
            '"parentGivenName": "",' +
            '"parentFamilyName": "",' +
            '"parentBirthDate": "",' +
            '"parentRelationShip": "",' +
            '"parentId": "",' +
            '"parentEmail": "",' +
            '"parentPictureBirthCert": "",' +
            '"parentPictureCert": "",' +
            '"parentPhoneNumber": "",' +
            '"parentPictureId": "",' +
            '"metadata": {' +
                '"reason": "Falta de envío de documentación de ingresos",' +
                '"av_error_code": "1000"' +
            '},' +
            '"accountStatus": "VALID",' +
            '"obligatedEntity": "no",' +
            '"occupation": "Relación de dependencia",' +
            '"soDocs": "false",' +
            '"incomes": "ahr",' +
            '"sensitiveInformation": {' +
                '"worldSys": [],' +
                '"uif": [],' +
                '"vuSecurity": [],' +
                '"updatedDate": "",' +
                '"denominacion": "",' +
                '"cuil": "",' +
                '"controlTerrorista": "",' +
                '"fechaTerrorista": "",' +
                '"controlPep": "",' +
                '"fechaPep": "",' +
                '"controlSsoo": ""' +
            '}'+
        '}';
    }
	//AHRe x--------xahre
}