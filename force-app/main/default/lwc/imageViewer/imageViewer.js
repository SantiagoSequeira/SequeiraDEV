import { LightningElement, api } from 'lwc';
import cropper from '@salesforce/resourceUrl/cropper';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class imageViewer extends LightningElement {
    oImage;
    oHeight;

    @api title;
    isLoaded;

    @api get originalimage(){
        return this.oImage;
    } 
    set originalimage(value) {
        if(!this.isLoaded) {
            try {
                this.oImage = value;
                var i = new Image();
                i.onload = () => {
                    this.oHeight = i.height;
                    this.changeImage(value, i.height);
                };
                i.src = value;
            } catch (e) {
    
            }
        }
    }

    isRotated = false;
    tooltips = null;
    image = null;
    main;
    tooltip; 
    container;
    cropp;    
    limits;
    imagemain;
    isCropperDisabled = true;
    initialCallback = true;
    isModified = false;

    renderedCallback() {
        if(this.initialCallback) {
            this.initialCallback = true;
            this.imagemain = this.template.querySelector('.image-thumb');
            loadStyle(this, cropper + '/cropper.min.css').then(() => {
                loadScript(this, cropper + '/cropper.min.js').then(()=> {
                    this.isRotated = false;
                    this.tooltips = this.template.querySelector('.tooltip span');
                    this.image = this.template.querySelector('.image-show');
                    this.main = this.template.querySelector('.main');
                    this.tooltip = this.template.querySelector('.tooltip');
                    this.container = this.template.querySelector('.container');
                    this.limits = this.imagemain.getBoundingClientRect();
                    

                    this.tooltip.addEventListener('mousemove', (e) => {
                        if(this.isCropperDisabled) {
                            this.limits = this.tooltip.getBoundingClientRect();
                            var mX = e.clientX,
                                mY = e.clientY,
                                iX = this.limits.left,
                                iY = this.limits.top;
                            var x = mX - (iX),
                                y = mY - (iY),
                                w = this.limits.width,
                                h = this.limits.height;
                            var xP = (-x / w) * -100,
                                yP = (-y / h) * -100;
                            var offsetX = 100-(x * 200 / w ),
                                offsetY = 100-(y * 200 / h );
                            if(mX < iX || x > w || mY < iY || y > h) {
                                this.tooltips.style.display = 'none';
                            } else {
                                this.tooltips.style.display = 'block';
                            }
                            this.tooltips.style.top = (mY-100)+ 'px';
                            this.tooltips.style.left = (mX-100) + 'px';
                            this.image.style.backgroundPosition = 'calc(' + xP + '% - '+ -offsetX +'px) calc(' + yP + '% - '+ -offsetY + 'px)';
                        }
                    });
                });
            });
        }
    }

    rotate(srcBase64, degrees, callback) {
        const canvas = document.createElement('canvas');
        let ctx = canvas.getContext("2d");
        let image = new Image();

        image.onload = function () {
            canvas.width = degrees % 180 === 0 ? image.width : image.height;
            canvas.height = degrees % 180 === 0 ? image.height : image.width;

            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(degrees * Math.PI / 180);
            ctx.drawImage(image, image.width / -2, image.height / -2);

            callback(canvas.toDataURL());
        };

        image.src = srcBase64;
    }

    rotateImageLeft(e) {
        e.preventDefault();
        this.rotateImage(true);
    }

    rotateImageRight(e) {
        e.preventDefault();
        this.rotateImage(false);
    }
    
    rotateImage(left) {
        this.isRotated = true;
        this.isModified = true;
        this.rotate(this.imagemain.getAttribute('src'), (left) ? -90 : 90, (resultBase64) => {
            this.imagemain.setAttribute('src', resultBase64);
            this.image.style.backgroundImage = 'url(' + resultBase64 + ')'; 
        });
    }

    activateCrop() {
        this.isCropperDisabled = false;
        this.cropp = new Cropper(this.imagemain, {
            aspectRatio: null,
            crop(event) {
            },
        });
    }

    confirmCrop() {
        this.isModified = true;
        let data = this.cropp.getCroppedCanvas();
        let dataUrl = data.toDataURL();
        this.changeImage(dataUrl, data.height);
        this.cropp.destroy();
        this.isCropperDisabled = true;
    }

    cancelCrop() {
        this.cropp.destroy();
        this.isCropperDisabled = true;
    }

    restoreImage() {
        this.isCropperDisabled = true;
        this.cropp.destroy();
        this.changeImage(this.oImage, this.oHeight);
        this.isModified = false;
    }

    changeImage(imgBase64, height) {
        this.isLoaded = true;
        this.tooltip.style.height = (height * 0.5) + 'px';
        this.imagemain.setAttribute('src', imgBase64);
        this.image.style.backgroundImage = 'url(' + imgBase64 + ')';
        this.image.style.backgroundSize = ((height * 0.5) + 200) +'px';  
    }

    saveImage() {

    }

    uploadNewImage() {
        
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/x-png,image/jpg,image/jpeg';
        input.onchange = e => { 

            // getting a hold of the file reference
            var file = e.target.files[0]; 
            let name = file.name;
            let ext = name.substring(name.lastIndexOf('.')+ 1, name.length);
            if(ext == 'jpg' || ext == 'jpeg' || ext == 'png') {
                var img = new Image();

                // setting up the reader
                var reader = new FileReader();
                reader.readAsDataURL(file);
    
                // here we tell the reader what to do when it's done reading...
                reader.onload = readerEvent => {
                    var content = readerEvent.target.result; // this is the content!
                    img.src = content;
    
                    img.onload = () => {
                        this.isModified = true;
                        this.changeImage(content, img.height);
                    }
                }
            } else {
                const event = new ShowToastEvent({
                    "title": "Error!",
                    "message": "El archivo seleccionado no es una imagen.",
                    "variant": "error"
                });
                this.dispatchEvent(event);
            }
            
            

        }

        input.click()
    }
}