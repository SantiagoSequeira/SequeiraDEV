import { LightningElement, api, wire } from 'lwc';
import getData from "@salesforce/apex/ImageUrlViewer.getData";


export default class ImegeUrlViewer extends LightningElement {
    @api recordId;

    image;

    connectedCallback(){
        getData({recordId: this.recordId}).then(data => {
            this.image = data.Image__c;
        })
    }
  
}