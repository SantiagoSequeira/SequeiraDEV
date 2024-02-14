import { LightningElement, api, track} from 'lwc';
import getImages from '@salesforce/apex/ImageViewerController.getImages';

export default class DniViewer extends LightningElement {
    @api recordId;

    dniImageAnverso;
    dniImageReverso;
    selfie;

    isLoaded = false;

    renderedCallback(){
        if(!this.isLoaded) {
            this.isLoaded = true;
            getImages({"recordId": this.recordId})
            .then(result => {
                this.dniImageAnverso = result.anverso;
                this.dniImageReverso = result.reverso;
                this.selfie = result.selfie;
                console.log('Rendered')
            })
            .catch(error => {

                console.log(error)
            });
        }
    }

}