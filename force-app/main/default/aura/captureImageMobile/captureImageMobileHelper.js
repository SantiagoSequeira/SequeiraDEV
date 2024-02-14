({
    uploadFile : function(component, uploadedFiles, type) {
        component.set('v.isLoading', true);
        var action = component.get('c.uploadFile');
        action.setParams({
            recordId: component.get('v.recordId'),
            fileId: uploadedFiles[0].documentId,
            type
        });
        console.log(uploadedFiles[0].documentId);
        action.setCallback(this, function(response) {
            alert(response.getState());
            component.set('v.isLoading', false);
        });
        $A.enqueueAction(action);
    }
})