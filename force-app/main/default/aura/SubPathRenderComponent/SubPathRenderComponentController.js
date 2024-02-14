({
    handleX: function(component, event, helper) {
        let index = event.getParam('index')
        var data = component.get('v.visiblePaths')[index];
        helper.submitEvent(component.get('v.channel'), data);
    },
    doInit: function (component, event, helper) {

    },
    handleApplicationEvent: function (component, event, helper) {
        if(!component.get('v.wiredMode')) {
            var channel = component.get('v.channel');
            var eventChannel = event.getParam('channel');
            if(channel === eventChannel) {
                component.set('v.visiblePaths', event.getParam('visiblePaths'));
            }
        }
        
    }
})