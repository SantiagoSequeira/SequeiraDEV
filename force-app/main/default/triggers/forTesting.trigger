trigger forTesting on Case (before insert) {
    if(Trigger.isBefore) {
        if(Trigger.isInsert) {
            for(Case caso:Trigger.new) {
                if(caso.Subject == 'Email'){
                    caso.Status = 'Closed';
                    
                }
                
            }
        }
        
    }
}