({
    doInit : function(component, event, helper) {
        var options = component.get('v.field.options');
        var newOptions = new Array();
        options.forEach(element => {
            newOptions.push({label: element, value: element});
        });
        component.set('v.options', newOptions);
    },
    checkErrors : function(component, event, helper) {
        var field = component.get("v.field");
        var thisField = component.find("thisField");
        var error = component.get("v.findedError");
        if(error != null && error != undefined) {
            if(field.fieldName == error.field) {
                thisField.setCustomValidity(error.message);
                thisField.focus();
                thisField.showHelpMessageIfInvalid();
            } else {
                thisField.setCustomValidity('');
                thisField.showHelpMessageIfInvalid();
            }
        }
    },
    handleChange: function(component, event, helper) {
        component.set("v.hasChanges", true);
    }
})