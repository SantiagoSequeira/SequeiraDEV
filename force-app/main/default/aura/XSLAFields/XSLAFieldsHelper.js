({
    validate: function (component, helper) {
        var fields = component.get("v.fields");
        var count = 0;
        var hasError = false;
        var findedError = {field: '', message: ''};
        component.set("v.findedError", findedError);
        fields.forEach(element => {
            if(element.selected) {
                if(element.fieldType != "PICKLIST" 
                    && element.fieldType != "BOOLEAN" 
                    && element.fieldName != "RecordTypeId"
                ) {
                    if(element.stringFilter == "" || element.stringFilter == null) {
                        component.set("v.findedError", {field: element.fieldName, message: 'No debe haber campos sin informacion.'})
                        hasError = true;
                        //break;
                    } else {
                        count++;
                    }
                } else if (element.fieldType == "PICKLIST" || element.fieldName == "RecordTypeId") {
                    if(element.selectedOptions.length < 1) {
                        component.set("v.findedError", {field: element.fieldName, message: 'Debes seleccionar al menos una opcion.'})
                        hasError = true;
                        //break;
                    } else {
                        count++;
                    }
                } else if(element.fieldType == "BOOLEAN") {
                    count++;
                }
            }
        });
        if(count > 0 && !hasError) {
            return true;
        } else if(count < 1 && !hasError) {
            helper.clearPrevious(component);
        }
        return false;
    },
    clearPrevious: function (component) {
        var action = component.get("c.clearSLA");
        action.setParams({
            selectedProcess: component.get("v.selectedProcess"),
            setNumber: component.get("v.set")
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state === "SUCCESS") {
                alert(response.getReturnValue());
            } 
        });
        $A.enqueueAction(action);
    },
    setAlreadySaved: function (component) {
        var items = component.get("v.itemsWithChanges");
        var thisItem = component.get("v.set");
        const index = items.indexOf(thisItem);
        if (index > -1) {
            items.splice(index, 1);
        } 
        component.set("v.itemsWithChanges", items);
    }
})