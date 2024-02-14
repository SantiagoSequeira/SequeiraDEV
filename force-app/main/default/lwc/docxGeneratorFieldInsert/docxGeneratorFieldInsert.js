import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getAccessibleFields from '@salesforce/apex/DocxGeneratorController.getAccessibleFields';

export default class DocxGeneratorFieldInsert extends LightningElement {

    camposSolicitud = [];
    camposUsuario = [];

    get okButtonLabel(){
        if(this.modoAvance) {
            return 'Avanzar';
        } else if(this.approve) {
            return 'Aprobar';
        } else {
            return 'Reparar';
        }
    }
    connectedCallback() {
        getAccessibleFields()
			.then(resp => {
                console.log(resp);
                resp.userFields.sort((a, b) => a.fieldLabel.localeCompare(b.fieldLabel));
                resp.solicitudFields.sort((a, b) => a.fieldLabel.localeCompare(b.fieldLabel));
                console.log(resp);
				this.camposUsuario = resp.userFields;
                this.camposSolicitud = resp.solicitudFields;
			})
			.catch(err=>{
				console.log(err);
			});
    }

    handleSelectField(event){
        this.closeModal({ 'action': 'confirm', 'field': event.target.dataset.id });
        
    }

    handleOkay() {
        this.closeModal({ 'action': 'confirm', 'field': data });
    }

    closeModal(data){
        this.dispatchEvent( new CustomEvent('close', { detail: data }));
    }

    handleCancel(){
        this.uploadedFile = null;
        this.fileName = null;
        this.closeModal({'action': 'cancel'});
    }

    mensaje(title, message , variant){
        this.dispatchEvent(
            new ShowToastEvent({title, message , variant, mode: "dismissable"})
        );
    }
}