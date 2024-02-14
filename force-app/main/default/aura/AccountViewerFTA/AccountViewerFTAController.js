({
	doInit: function (component, event, helper) {
        var action = component.get("c.getData");
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                // Alert the user with the value returned 
                // from the server
                component.set("v.data", JSON.parse(response.getReturnValue()));
                component.set("v.isLoading", false);
                component.set("v.hasError", false);
                // You would typically fire a event here to trigger 
                // client-side notification that the server-side 
                // action is complete
            } else {
                component.set("v.isLoading", false);
                component.set("v.hasError", true);
            }         
        });
        $A.enqueueAction(action);
	}
})