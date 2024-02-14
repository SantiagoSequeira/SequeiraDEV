public virtual class Prueba1{
    public String main;
    public virtual void Ahre() {
        System.debug('NonOverrided');
    }

    public virtual Boolean isMainNotNull() {
        return main != null;
    }

    public static void pruebaManualGit() {
        System.debug('Purebaaaaa 2');
    }
}