({
    submitEvent : function(channel, data) {
        var appEvent = $A.get("e.c:SubPathRenderNewComponent");
        appEvent.setParams({channel, data});
        appEvent.fire();
    }
})