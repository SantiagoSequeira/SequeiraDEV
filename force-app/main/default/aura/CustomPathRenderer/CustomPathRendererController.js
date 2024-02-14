({
    doInit: function(component, event, helper){
        var paths = [
            {
                position: 2,
                label: 'Test 1',
                component: 'c:CustomTestComponent1',
                stage: 'Value Proposition'
            },
            {
                position: 1,
                label: 'Test 2',
                component: 'c:CustomTestComponent2',
                stage: 'Value Proposition'
            },
            {
                position: 0,
                label: 'Test 3',
                component: 'c:CustomTestComponent2',
                stage: 'Id. Decision Makers'
            }
        ];
        var subPaths = new Map();;
        paths.forEach(path => {
            if(subPaths.get(path.stage)) {
                subPaths.get(path.stage).push(path);
            } else {
                subPaths.set(path.stage, [path])
            }
        });
        console.log(subPaths)
        component.set('v.paths', subPaths);
    },
    handleSelect : function(component, event, helper) {
        var selectedStage = event.getParam("detail").value;
        var channel = component.get('v.channel');
        component.set('v.selectedStage', selectedStage);
        console.log(selectedStage);
        var paths = component.get('v.paths');
        var visiblePaths = [];
        if(paths.has(selectedStage)) {
            visiblePaths = paths.get(selectedStage);
            visiblePaths.sort((a, b) => {
                return a.position - b.position;
            });
            helper.submitEvent(channel, visiblePaths[0]);
            if(visiblePaths[0].position == 0) {
                visiblePaths = [];
            }

        } else {
            helper.submitEvent(channel, null);
            visiblePaths = [];
        }
        if(component.get('v.subPathWiredMode')) {
            component.set('v.visiblePaths', visiblePaths);
        } else {
            var appEvent = $A.get("e.c:SubPathRenderNotWiredEvent");
            appEvent.setParams({channel, visiblePaths});
            appEvent.fire();
        }
    }
})