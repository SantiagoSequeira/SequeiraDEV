import { LightningElement } from 'lwc';
import getNotas from '@salesforce/apex/MisNotasVisualizerController.getNotas';
export default class misNotasVisualizer extends LightningElement {
    isLoaded = false;
    notas = [];
    renderedCallback(){
        if(!this.isLoaded){
            getNotas().then(result => {
                console.log(result);
                this.notas = result;
            })
            this.isLoaded = true;
        }
    }

}