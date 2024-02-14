({
    handleApplicationEvent : function(component, event, helper) {
        var channel = component.get('v.channel');
        var eventChannel = event.getParam('channel');
        if(channel === eventChannel) {
            component.set('v.isLoading', true);
            var data = event.getParam('data');
            console.log(data);
            if(data) {
                $A.createComponent(
                    data.component,
                    {
                        recordId: component.get('v.recordId')
                    },
                    function(newButton, status, errorMessage){
                        //Add the new button to the body array
                        if (status === "SUCCESS") {
                            component.set("v.body", newButton);
                        } else if (status === "INCOMPLETE") {
                            console.log("No response from server or client is offline.")
                            // Show offline error
                        } else if (status === "ERROR") {
                            console.log("Error: " + errorMessage);
                            // Show error message
                        }
                        component.set("v.isLoading", false);
                    }
                );
            } else {
                component.set("v.body", null);
                component.set("v.isLoading", false);
            }
        }
    }
})