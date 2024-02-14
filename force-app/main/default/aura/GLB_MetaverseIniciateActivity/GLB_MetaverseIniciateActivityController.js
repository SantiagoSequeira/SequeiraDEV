({
    openModalStartActivity : function(component, event, helper) {
        var recordId = component.get('v.recordId');
        var action = component.get('c.isRunningActivity');
        action.setParams({
            recordId
        });
        action.setCallback(this, function(result) {
            if(result.getState() === 'SUCCESS'){
                if(result.getReturnValue()) {
                    component.set('v.isModalOpen', true);
                } else {
                    component.set('v.isAlertOpen', true);
                }
            }
        })
        $A.enqueueAction(action);
    },
    startActivity : function(component, event, helper) {
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
            component.set('v.isAlertOpen', false);
        })
        $A.enqueueAction(action);
    },
    doInit : function(component, event, helper) {
        var recordId = component.get('v.recordId');
        var action = component.get('c.isRunningActivity');
        action.setParams({
            recordId
        });
        action.setCallback(this, function(result) {
            if(result.getState() === 'SUCCESS'){
                component.set('v.isIniciating', false);
                component.set('v.isModalOpen', result.getReturnValue());
            }
        })
        $A.enqueueAction(action);
    },
    handleClose : function(component, event, helper) {
        component.set('v.isModalOpen', false);
        component.set('v.isAlertOpen', false);
    },
    endActivity : function(component, event, helper) {
        var recordId = component.get('v.recordId');
        var action = component.get('c.finishActivity');
        action.setParams({
            recordId
        });
        action.setCallback(this, function(result) {
            if(result.getState() === 'SUCCESS'){
                component.set('v.isModalOpen', false);
            }  else {
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Error",
                    "message": "Ocurrio un error finalizando la actividad"
                });
                toastEvent.fire();
            }
        })
        $A.enqueueAction(action);
    }
})