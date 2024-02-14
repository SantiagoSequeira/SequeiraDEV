import {LightningElement, api, track} from 'lwc';
import getDataFromApex from '@salesforce/apex/AccountViewer.getData';

export default class AccountViewerFT extends LightningElement {
    @api recordId;
    @track data;
    @track hasError;
    @track isLoading;

    connectedCallback() {
        this.isLoading = true;
        this.loadData();
    }

    loadData(){
        getDataFromApex()
        .then(results=> {
            this.data = JSON.parse(results);
            this.hasError = false;
            this.isLoading = false;
        })
        .catch(error => {
            this.hasError = true;
        });
    }
}