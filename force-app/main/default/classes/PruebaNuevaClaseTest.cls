@isTest
public with sharing class PruebaNuevaClaseTest {
    @isTest
    public static void whoImTest() {
        Test.startTest();
        PruebaNuevaClase.whoIm();
        Test.stopTest();
    }
}