({
    handleSubmit: function(component, event, helper) {
        if(helper.validate(component, helper)) {
            var action = component.get("c.saveSLA");
            action.setParams({
                fieldsJSON: JSON.stringify(component.get("v.fields")),
                selectedProcess: component.get("v.selectedProcess"),
                setNumber: component.get("v.set")
            });
            console.log(component.get("v.set"));
            action.setCallback(this, function(response){
                var state = response.getState();
                if(state === "SUCCESS") {
                    var result = JSON.parse(response.getReturnValue());
                    helper.setAlreadySaved(component);
                    alert(result.status);
                } 
            });
            $A.enqueueAction(action);
        } else {
            //alert("SE ENCONTRO UN ERROR:" + component.get("v.findedError.message"));
        }
    },
    handleChange: function(component, event, helper) {
        var items = component.get("v.itemsWithChanges");
        var thisItem = component.get("v.set");
        items.push(thisItem);
        console.log(items);
        component.set("v.itemsWithChanges", items);
    }
})