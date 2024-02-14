import { LightningElement, api } from 'lwc';
const ITEM_DATA = 'item';
const EXPANDED_ITEM_DATA = ITEM_DATA + ' expanded-item'
export default class MiNota extends LightningElement {
    @api
    nota = {};
    cssClass = ITEM_DATA;
    isExpanded = false;

    expandItem() {
        this.isExpanded = !this.isExpanded;
        this.cssClass = (this.isExpanded) ? EXPANDED_ITEM_DATA : ITEM_DATA;
    }
}