({
    handleUploadFinishedA : function(component, event, helper) {
        helper.uploadFile(component, event.getParam("files"), 'A')
    },
    handleUploadFinishedB : function(component, event, helper) {
        helper.uploadFile(component, event.getParam("files"), 'B')
    }
})