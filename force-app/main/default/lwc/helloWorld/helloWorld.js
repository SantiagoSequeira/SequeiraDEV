import { LightningElement, api } from 'lwc';

export default class helloWorld extends LightningElement {
    @api showModal = false;
    @api accountId;
    @api 
    openModal() {
        this.showModal = true;
    }
    @api 
    closeModal(event) {
        this.accountId = event.id;
        this.showModal = false;
    }
    contacts = [
        {
            Id: 1,
            Name: 'Amy Taylor',
            Title: 'VP of Engineering',
            AssignedTo: 'F0.F1.F2'
        },
        {
            Id: 2,
            Name: 'Michael Jones',
            Title: 'VP of Sales',
            AssignedTo: 'F3.F4.F5'
        },
        {
            Id: 3,
            Name: 'Jennifer Wu',
            Title: 'CEO',
            AssignedTo: 'F6.F7.F8'
        },
    ];
    acciones = [
        {
            Id: 1,
            AccountName: 'Amy Taylor',
            Name: 'VP of Engineering'
        },
        {
            Id: 2,
            AccountName: 'Michael Jones',
            Name: 'VP of Sales'
        },
        {
            Id: 3,
            AccountName: 'Jennifer Wu',
            Name: 'CEO'
        },
    ];

}