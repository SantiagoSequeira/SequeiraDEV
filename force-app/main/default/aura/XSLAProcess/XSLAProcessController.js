({
    handleChange: function (component, event, helper) {
        var process= event.getSource().get('v.value');
        var action = component.get("c.initializeFields");
        action.setParams({
            selectedProcess: process
        })
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var generalFields = response.getReturnValue().generalFields;
                var responseItems = response.getReturnValue().items;
                var items = [{num: 0, hasChanged: false, fields: JSON.parse(JSON.stringify(generalFields))}];
                component.set("v.items", (responseItems.length > 0) ? responseItems : items);
                component.set("v.generalFields", JSON.parse(JSON.stringify(generalFields)));
                component.set('v.selectedProcess', process);
            }   
            console.log(response.getState());
        });
        $A.enqueueAction(action);
    }
})