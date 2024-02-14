({
    startActivity : function(component) {
        var recordId = component.get('v.recordId');
        var action = component.get('c.iniciateActivity');
        action.setParams({
            recordId
        });
        action.setCallback(this, function(result) {
            if(result.getState() === 'SUCCESS'){
                component.set('v.isModalOpen', true);
            } else {
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Error",
                    "message": "Ocurrio un error iniciando la actividad"
                });
                toastEvent.fire();
            }
            component.set('v.isIniciating', false);

        })
        $A.enqueueAction(action);
    }
})