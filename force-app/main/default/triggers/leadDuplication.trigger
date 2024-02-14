trigger leadDuplication on Lead (before insert) {
    List<Lead> leads = new List<Lead>();
    Map<String,Lead> leadMap = new Map<String, Lead>();
    if(System.Trigger.isBefore){
        for(Lead l : System.Trigger.New){
            if(l.Email != null && (System.Trigger.isInsert || l.Email != System.Trigger.oldMap.get(l.id).Email)){
                leads.add(l);
                if(leadMap.containsKey(l.Email)){
                    l.Email.addError('El email ya existe!');
                } else {
                    leadMap.put(l.Email, l);
                }
            } else {
                l.addError('El email ya existe!');
            }
        }
        
    }
    for (Lead l : [SELECT email FROM Lead WHERE Email IN :leadMap.KeySet()]){
        Lead newLead = leadMap.get(l.Email);
        newLead.Email.addError('El email ya existe!');
    }
}