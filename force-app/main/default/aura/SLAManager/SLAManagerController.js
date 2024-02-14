({
	doInit: function (component, event, helper) {
        var action = component.get("c.getProcesses");
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set("v.processes", response.getReturnValue());
            }         
        });
        $A.enqueueAction(action);
    },
    handleSelect: function (component, event, helper) {
        var itemsWithChanges = component.get("v.itemsWithChanges");
        if (itemsWithChanges.length > 0) {
            component.find("tabs").set("v.selectedTabId", 'T' + itemsWithChanges[0]);
            alert("Hay cambios pendientes en Set " + itemsWithChanges[0]);
        } else if(event.getParam('id') == 'ADD') {
            var items = component.get("v.items");
            var max = 0;
            var isWaiting = false;
            var pendingChangesTab;
            items.forEach(item =>{
                if(item.num > max) {
                    max = item.num;
                }
                if(item.hasChanged) {
                    isWaiting = true;
                    pendingChangesTab = item.num;
                }
            });
            var lastOne = max + 1;
            var fields = JSON.parse(JSON.stringify(component.get("v.generalFields")));
            console.log(fields);
            items.push({num: lastOne, hasChanges: false, fields});
            component.set("v.items", items);
            component.find("tabs").set("v.selectedTabId", 'T' + lastOne);
        }
    }
})