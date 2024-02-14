public with sharing class Prueba2 {
    public Prueba2() {
        Prueba3 p3 = new Prueba3();
        p3.isMainNotNull();
    }

    public class Prueba3 extends Prueba1 implements myInterface {
        public Prueba3() {

        }

        public override void Ahre() {
            System.debug('overrided');
        }
    }
}