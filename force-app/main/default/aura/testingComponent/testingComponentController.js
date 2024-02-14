({
	changeText : function(component, event, helper) {
        event.preventDefault();
        var newName = component.get('v.newName');
        if(newName == "") {
            newName = "world";
        }
		component.set("v.name", newName);
        
	}
})