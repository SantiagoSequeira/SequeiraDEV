public class StringArrayTest {
    public static List<String> generateStringArray(Integer cant){
        List<String> generatedStringArray = new List<String>();
        for(Integer i=0; i<cant;i++){
            generatedStringArray.add('Test' + i);
        }
        System.debug(generatedStringArray);
        return generatedStringArray;
    }
}