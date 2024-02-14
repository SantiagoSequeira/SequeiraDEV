({
	contactSave : function(component, event, helper) {
        component.set("v.saving", true);
        event.preventDefault();
		 var validContact = component.find('characterform').reduce(function (validSoFar, inputCmp) {
            inputCmp.showHelpMessageIfInvalid();
            return validSoFar && inputCmp.get('v.validity').valid;
        }, true);
       
        if(validContact){
            var character = component.get("v.character");
           	var action = component.get("c.insertContact");
            action.setParams(
                { 
                    id : character.id, 
                 	FirstName : character.name,
                    height : parseFloat(character.height),
                    gender : character.gender,
                    hair_color :  character.hair_color,
                    eye_color : character.eye_color,
                    url : character.url,
                    world : character.homeworld
                });
            var toastEvent = $A.get("e.force:showToast");
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    let data = response.getReturnValue();
                    if(data){
                        toastEvent.setParams({
                            "title": "Success!",
                            "message": "The record has been updated successfully.",
                            "type": "success"
                        });
                        toastEvent.fire();
                    } else {
                        toastEvent.setParams({
                            "title": "Failed!",
                            "message": "Something was wrong.",
                            "variant": "error"
                        });
                        toastEvent.fire();
                    }                        
                    component.set("v.saving", false);
                }
                else {
                     toastEvent.setParams({
                            "title": "Error!!",
                            "message": "Something was wrong.",
                            "variant": "warning"
                        });
                    toastEvent.fire();
                    component.set("v.saving", false);
                }
            });
            $A.enqueueAction(action);
        } else {
            component.set("v.saving", false);
        }
	}
})