({
	clickSearch : function(component, event, helper) {
        event.preventDefault();
		var id = parseInt(component.get("v.id"));
        
        component.set("v.searching", true);
        component.set("v.finded", false);
        component.set("v.dontFinded", false); 
        if(Number.isInteger(id)){
        	var action = component.get("c.getCharacter");
            action.setParams({ id : id });
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    let data = response.getReturnValue();
                    if(data !== null) {
                        data.id = id;
                        if(isNaN(data.height)){
                            data.height = "";
                        }
                        component.set("v.searching", false);
                        component.set("v.character", data);
                    	component.set("v.finded", true);
                    } else {
                        component.set("v.searching", false);
                       component.set("v.finded", false); 
                       component.set("v.dontFinded", true);  
                    }  
                }
                else {
                    component.set("v.searching", false);
                    component.set("v.finded", false); 
                    component.set("v.dontFinded", true); 
                    console.log(response.getReturnValue());
                    console.log("Failed with state: " + state);
                }
            });
            // Send action off to be executed
            $A.enqueueAction(action);
        } else {
            component.set("v.searching", false);
            component.set("v.finded", false);
            component.set("v.dontFinded", true);   
        }
	}
})