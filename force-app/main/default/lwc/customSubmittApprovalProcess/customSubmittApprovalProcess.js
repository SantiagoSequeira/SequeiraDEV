import { LightningElement } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';

export default class CustomSubmittApprovalProcess extends LightningElement {
    closeAction(){
        this.dispatchEvent(new CloseActionScreenEvent());
    }
}