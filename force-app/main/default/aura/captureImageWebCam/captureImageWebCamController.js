({
    doInit : function(component, event, helper) {
       
        var width = 400; // scale the photo width to this
        var height = 0; // computed based on the input stream

     	var streaming = false;
        var video = null;
        var canvas = null;
        var photo = null;
        var startbutton = null;
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        photo = document.getElementById('photo');
        startbutton = document.getElementById('startbutton');
        var clearbutton = document.getElementById('clearbutton');
        
        navigator.mediaDevices.getUserMedia({video: true, audio: false})
        .then(function(stream) {
            video.srcObject = stream;
            video.play();
        })
        .catch(function(err) {
            console.log("An error occurred: " + err);
        });
        
        video.addEventListener('canplay', function(ev){
            if (!streaming) {
                height = video.videoHeight / (video.videoWidth/width);
                
                // Firefox currently has a bug where the height can't be read from
                // the video, so make assumptions if this happens.
                
                if (isNaN(height)) {
                    height = width / (4/3);
                }
                
                video.setAttribute('width', width);
                video.setAttribute('height', height);
                canvas.setAttribute('width', width);
                canvas.setAttribute('height', height);
                streaming = true;
            }
        }, false);
        
        startbutton.addEventListener('click', function(ev){
            takepicture();
        }, false);
        
        clearbutton.addEventListener('click', function(ev){
            clearphoto();
        }, false);
        
        
        clearphoto();
      
        function clearphoto() {
            var context = canvas.getContext('2d');
            context.fillStyle = "#AAA";
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            var data = canvas.toDataURL('image/png');
            component.set('v.image', data);
        }
        
      	function takepicture() {
            var context = canvas.getContext('2d');
            if (width && height) {
                canvas.width = width;
                canvas.height = height;
                context.drawImage(video, 0, 0, width, height);
                var data = canvas.toDataURL('image/png');
                component.set('v.image', data);
                component.set('v.isModalOpen', true);
            } else {
                clearphoto();
            }
        }
        
    },
    savePhoto: function(component, event, helper) {
        component.set('v.isLoading', true);
       	var image = component.get('v.image');
        var action = component.get('c.saveImageFile'); 
       	action.setParams({
            "imageUrl" : image,
            "recordId" : component.get('v.recordId')
        });
        action.setCallback(this, function(a){
            var state = a.getState(); // get the response state
            if(state == 'SUCCESS') {
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Success",
                    "message": "La foto fue guardada",
                    "type": "success"
                });
                toastEvent.fire();
                component.set('v.isModalOpen', false);
            } else {
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Error",
                    "message": "La foto no fue guardada",
                    "type": "error"
                });
                toastEvent.fire();
            }
            component.set('v.isLoading', false);
        });
        $A.enqueueAction(action);
	},
    handleClose : function(component, event, helper) {
        component.set('v.isModalOpen', false);
    }
})