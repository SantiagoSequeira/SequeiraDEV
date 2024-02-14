import { LightningElement, api } from 'lwc';
import getTemplateData from '@salesforce/apex/DocxGeneratorController.getTemplateData';
import getFilledTemplate from '@salesforce/apex/DocxGeneratorController.getFilledTemplate';
import DATA_FIELD from '@salesforce/schema/Plantilla__c.Data__c';
import ID_FIELD from '@salesforce/schema/Plantilla__c.Id';

import { getNumbering } from './docSetting';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { updateRecord } from 'lightning/uiRecordApi';
import LightningConfirm from 'lightning/confirm';
//scripts
import { loadScript } from "lightning/platformResourceLoader";
import docxImport from "@salesforce/resourceUrl/docx";

export default class DocxGenerator extends LightningElement {
	
	@api isEditMode = false;
	modalOpen = false;
	error;
	today;
	account;
	downloadURL = '';
	text;
	isOpenModal = false;
	childrens = [];
	instance = 0;
	parentNode = true;
	data;
	numbering;
	formats = [
        'bold',
        'italic',
        'underline',
        'strike',
        'list',
        'indent',
        'align',
        'clean',
		'mark',
		'background'
    ];

	get labelButton(){
		return this.isEditMode ? 'Guardar plantilla' : 'Descargar documento';
	}
	
	async connectedCallback() {
		console.log('connected');
		await Promise.all([loadScript(this, docxImport)]).then(() => {
			this.numbering = getNumbering(docx);
		});
		if(this.isEditMode) {
			getTemplateData({recordId: 'a0Y6g00000OUFfsEAH'})
			.then(resp=>{
				this.data = resp;
			})
			.catch(err=>{
				console.log(err);
			});
		} else {
			getFilledTemplate({recordId: 'a0Y6g00000OUFfsEAH', accountId: '0016g000007dTMKAA2'})
			.then(resp=>{
				this.data = resp;
			})
			.catch(err=>{
				console.log(err);
			});
		}
		const date = new Date();
		let day = date.getDate();
		let year = date.getFullYear();
		this.today = day + ' de ' + date.toLocaleString('default', { month: 'long' }) + ' de ' + year;
	}

	handleMarkText() {
        const inputRichText = this.template.querySelector('[data-id="Main_Template"]');
        let format = inputRichText.getFormat();
        // Set or unset code-block format based on format on current selection
        if (format['background']) {
            inputRichText.setFormat({ background: null });
        } else {
            inputRichText.setFormat({ background: 'yellow' });
        }
    }

	handleInsertField(){
		this.isOpenModal = true;
	}

	handleCloseModal(evt) {
		var detail = evt.detail;
		this.isOpenModal = false;
        if(detail.action == 'confirm'){
			const editor = this.template.querySelector('[data-id="Main_Template"]');
			if(detail.field == 'GENERIC_FIELD'){
				editor.setRangeText('*******', undefined, undefined, 'select');
				editor.setFormat({ background: 'red' });
			} else {
				editor.setRangeText('{!'+ detail.field+'}', undefined, undefined, 'select');
			}
        }
	}

	async handleClick() {
        var text = this.template.querySelector("lightning-input-rich-text").value;
		text = text.replaceAll('<br>', '<br></br>').replaceAll('&nbsp;', ' ');
		if(this.isEditMode){
			const fields = {};
            fields[ID_FIELD.fieldApiName] = 'a0Y6g00000OUFfsEAH';
            fields[DATA_FIELD.fieldApiName] = text;

			const recordInput = { fields }

			updateRecord(recordInput)
			.then(() => {
				this.dispatchEvent(
					new ShowToastEvent({
						title: 'Success',
						message: 'Contact updated',
						variant: 'success'
					})
				);
			})
			.catch(error => {
				this.dispatchEvent(
					new ShowToastEvent({
						title: 'Error creating record',
						message: error.body.message,
						variant: 'error'
					})
				);
			});
		} else {
			text = '<div>' + text + '</div>';
			if(text.includes('*******')){
				const result = await LightningConfirm.open({
					message: 'Se detecto un campo no cargado',
					variant: 'header',
					theme: 'error',
					label: 'Error de carga',
					// setting theme would have no effect
				});
				if(!result){
					return;
				}
			}
			var doc = new DOMParser().parseFromString(text, "text/xml");
			this.parseNodes(doc.firstChild.childNodes);
			var children = this.childrens;
			var solicitudName = 'TEST1';
			var clientName = 'TEST2';
			var abogadoName = 'TEST3';
			if(children){
				let document = new docx.Document({
					numbering: this.numbering,
					sections: [{
						children: [...children],
						footers: {
							default: new docx.Footer({
								children: [
									new docx.Paragraph(`SUF: ${solicitudName}`),
									new docx.Paragraph(`Rut Cliente: ${clientName}`),
									new docx.Paragraph(`${abogadoName.toUpperCase()}`)
								]
							})
						}
					}],
					properties: []
				});
				this.downloadDocumentWord(document, 'prueba');
				this.childrens = [];
			}
		}
    }

	parseNodes (childNodes) {
		for(let i = 0; i < childNodes.length; i++){
			let childNode = childNodes[i];
			var textStyle = {};
			var paragraph = {children:[]};
			if(childNode.nodeName == 'p' || childNode.nodeName == 'P'){
				
				if(childNode.getAttribute('style')){
					paragraph = this.parseStyling(childNode.getAttribute('style').split(';'), paragraph, textStyle);
				}
				if(childNode.classList.length > 0){
					paragraph = this.parseClassStyling(childNode.classList, paragraph);
				}
				paragraph = this.parseNode({...paragraph}, childNode.childNodes, textStyle);
				if(paragraph){
					this.childrens.push(new docx.Paragraph({...paragraph, spacing:{line:360}}));
				}
			} else if(childNode.nodeName == 'ul'){
				this.parseNode({...paragraph}, childNode.childNodes, textStyle, 'unordered', 0);
			} else if(childNode.nodeName == 'ol'){
				this.instance = this.instance + 1;
				this.parseNode({...paragraph}, childNode.childNodes, textStyle, 'numbered', 0);
			}
		}
	}

	parseNode(paragraph, childNodes, textStyle, numberingStyle, numberingDetph){
		let textSize = 24;
		let textFont = 'Times';
		var parentNode = this.parentNode;
		this.parentNode = false;
		for(let i = 0; i < childNodes.length; i++){
			let childNode = childNodes[i];
			if(childNode.nodeName != '#text'){
				if(childNode.getAttribute('style')){
					paragraph = this.parseStyling(childNode.getAttribute('style').split(';'), {...paragraph}, textStyle);
				}
				if(childNode.classList.length > 0){
					paragraph = this.parseClassStyling(childNode.classList, {...paragraph});
				}
			}
			if(childNode.nodeName == 'span'){
				paragraph = this.parseNode({...paragraph}, childNode.childNodes, textStyle, numberingStyle, numberingDetph);
			} else if(childNode.nodeName == 'em'){
				textStyle.italics = true;
				paragraph = this.parseNode({...paragraph}, childNode.childNodes, textStyle, numberingStyle, numberingDetph);
			} else if(childNode.nodeName == 'u'){
				textStyle.underline = {};
				paragraph = this.parseNode({...paragraph}, childNode.childNodes, textStyle, numberingStyle, numberingDetph);
			} else if(childNode.nodeName == 'strike'){
				textStyle.strike = true;
				paragraph = this.parseNode({...paragraph}, childNode.childNodes, textStyle, numberingStyle, numberingDetph);
			} else if(childNode.nodeName == 'strong'){
				textStyle.bold = true;
				paragraph = this.parseNode({...paragraph}, childNode.childNodes, textStyle, numberingStyle, numberingDetph);
			} else if(childNode.nodeName == 'ul'){
				numberingStyle = 'unordered';
				this.parseNode({...paragraph}, childNode.childNodes, textStyle, numberingStyle, numberingDetph + 1);
				continue;
			} else if(childNode.nodeName == 'ol'){
				if(parentNode){
					this.instance = this.instance + 1;
				}
				this.parseNode({...paragraph}, childNode.childNodes, textStyle, numberingStyle, numberingDetph + 1);
				continue;
			} else if(childNode.nodeName == 'br'){
				this.childrens.push(new docx.Paragraph({children: []}));
				continue;
			} else if(childNode.nodeName == 'li'){
				if(numberingStyle == 'unordered'){
					paragraph.bullet = { level: numberingDetph };
				} else if(numberingStyle == 'numbered'){
					paragraph.numbering = { level: numberingDetph, reference: "numbering-style-1", instance: this.instance }
				}
				if(childNode.firstElementChild){
					this.childrens.push(new docx.Paragraph({...paragraph, children: [new docx.TextRun({ ...textStyle, text: childNode.firstChild.data, size: textSize, font: textFont })]}));
					this.parseNode({...paragraph}, [...childNode.childNodes].slice(1, childNode.childNodes.length), textStyle, numberingStyle, numberingDetph);
					continue;
				} else {
					this.childrens.push(new docx.Paragraph({...paragraph, children: [new docx.TextRun({ ...textStyle, text: childNode.firstChild.data, size: textSize, font: textFont })]}));
					continue;
				}
			} else if(childNode.nodeName == '#text'){
				paragraph.children.push(new docx.TextRun({ ...textStyle, text: childNode.data, size: textSize, font: textFont }));
			}
			textStyle = {};
		}
		return paragraph;
	}

	parseStyling(styles, paragraph, textStyle){
		for(let i = 0; i < styles.length; i++) {
			switch (styles[i]) {
				case 'text-align: center': 
					paragraph.alignment = docx.AlignmentType.CENTER;
					break;
				case 'text-align: right':
					paragraph.alignment = docx.AlignmentType.END;
					break;
				case 'background-color: yellow':
					textStyle.highlight = "yellow";
					break;
				case 'background-color: red':
					textStyle.highlight = "red";
					break;
			}
		}
		return paragraph;
	}

	parseClassStyling(classList, paragraph){
		let tabSpacing = 1.27;
		for(let i = 0; i < classList.length; i++) {
			switch (classList[i]) {
				case 'ql-indent-1': 
					paragraph.indent = { left: tabSpacing*1 +'cm' };
					break;
				case 'ql-indent-2': 
					paragraph.indent = { left: tabSpacing*2 +'cm' };
					break;
				case 'ql-indent-3': 
					paragraph.indent = { left: tabSpacing*3 +'cm' };
					break;
				case 'ql-indent-4': 
					paragraph.indent = { left: tabSpacing*4 +'cm' };
					break;
				case 'ql-indent-5': 
					paragraph.indent = { left: tabSpacing*5 +'cm' };
					break;
				case 'ql-indent-6': 
					paragraph.indent = { left: tabSpacing*6 +'cm' };
					break;
				case 'ql-indent-7': 
					paragraph.indent = { left: tabSpacing*7 +'cm' };
					break;
				case 'ql-indent-8': 
					paragraph.indent = { left: tabSpacing*8 +'cm' };
					break;
			}
		}
		return paragraph;
	}

	dateFormatYYYYMMDD_HHMMSS() {
		var d = new Date();
		let month = (d.getMonth() + 1).toString();
		let day = (d.getDate()).toString();
		let year = (d.getFullYear()).toString();
		let hour = (d.getHours()).toString();
		let minutes = (d.getMinutes()).toString();
		let seconds = (d.getSeconds()).toString();

		if (hour.length < 2) {
			hour = '0' + hour;
		}

		if (minutes.length < 2) {
			minutes = '0' + minutes;
		}

		if (seconds.length < 2) {
			seconds = '0' + seconds;
		}
		if (month.length < 2) {
			month = '0' + month;
		}
		if (day.length < 2) {
			day = '0' + day;
		}

		return year + month + day + '_' + hour + minutes + seconds;
	}

	async downloadDocumentWord(doc, registerName) {
		await docx.Packer.toBase64String(doc).then(textBlob => {
			this.downloadURL = 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,' + textBlob;
		})
		let link = document.createElement("a");
		link.href = this.downloadURL;
		link.download = 'InformeLegal_Reparo_' + registerName + '_' + this.dateFormatYYYYMMDD_HHMMSS() + '.docx';
		document.body.appendChild(link);
		link.dispatchEvent(
			new MouseEvent('click', {
				bubbles: true,
				cancelable: true,

			})
		);
		document.body.removeChild(link);
	}
}