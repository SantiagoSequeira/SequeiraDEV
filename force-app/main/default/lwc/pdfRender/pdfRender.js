import { LightningElement, api } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import RESOURCES from '@salesforce/resourceUrl/pdfRender';
const convToMM = 3.7795275591, 
    PAGE_WIDTH = 210, 
    WHITE_SPACE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQMAAADCCAMAAAB6zFdcAAAAA1BMVEX7//7XyoOCAAAASElEQVR4nO3BMQEAAADCoPVPbQ' +
        'wfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIC3AcUIAAFkqh/QAAAAAElFTkSuQmCC';

export default class pdfRender extends LightningElement {
    /* VARIABLES */
    styleData = '';
    iniciated = false;
    container;
    pdfOptions = {
        orientation: 'p',
        unit:'mm',
        format: 'a4'
    };
    imageMargin;
    html2CanvasOptions = {
        scrollX: 0,
        scale: 1,
        scrollY: 0
    };

    renderedCallback() {
        if(!this.iniciated) {
            Promise.all([
                loadScript(this, RESOURCES + '/canvg.js'),
                loadScript(this, RESOURCES + '/rgbcolor.js'),
                loadScript(this, RESOURCES + '/html2canvas.min.js'),
                loadScript(this, RESOURCES + '/jspdf.min.js'),
                loadScript(this, RESOURCES + '/jquery.min.js')
            ])
            .then(() => {
            })
            .catch(error => {
            });
            this.inicializeContainer();
            this.iniciated = true;
        }
    }

    @api
    setMainStyle(styleData) {
        this.styleData = this.sanitizeStyles(styleData);
    }

    inicializeContainer() {
        this.container = document.createElement('div');
        this.container.style.height = '1px';
        this.container.style.overflow = 'scroll';
        this.container.setAttribute('class', 'pdfRenderContainer')
        document.body.appendChild(this.container);
    }

    sanitizeStyles(styleData) {
        if(styleData && styleData.startsWith('<')) {
            return styleData;
        } else {
            return '<style>' + styleData + '</style>';
        }
    }

    @api
    setPDFOptions(options) {
        this.pdfOptions = {...options};
    }

    @api
    setHTML2CanvasOptions(options) {
        this.html2CanvasOptions = {...options};
    }

    @api
    generatePDF(payload) {
        return new Promise((resolve, reject) => {
            try {
                const CLASSITEMID = 'pdfGenerator-' + payload.itemId;
                let element = document.createElement('div');
                element.setAttribute('class', CLASSITEMID);
                if(payload.styleData) {
                    payload.styleData = this.sanitizeStyles(payload.styleData);
                } else {
                    payload.styleData = this.styleData;
                }
                element.innerHTML = payload.styleData + payload.htmlData;
                this.container.appendChild(element);
                var targetElem = document.body.querySelector('.' + CLASSITEMID);
                this.constructHTML2CanvasSettings(targetElem, resolve, payload);
                html2canvas(targetElem, this.html2CanvasOptions);
            } catch (e) {
                console.error(e);
                reject('No se pudo generar el PDF, ver en consola para mas detalles.');
            }
        })
    }

    @api
    downloadPDF(payload) {
        try {
            payload.output = 'base64'; //this is needed to avoid an incorrect output type when need to download
            this.generatePDF(payload).then(data => {
                let element = document.createElement('a');
                element.setAttribute('href', data);
                element.setAttribute('download', (payload.fileName) ? payload.fileName : 'myPDF');
                document.body.appendChild(element);
                element.click();
                element.style.display = 'none';
            })
        } catch (e) {
            console.error(e);
        }
    }

    constructHTML2CanvasSettings (targetElem, resolve, payload) {
        this.html2CanvasOptions.onrendered = (canvas) => {
            targetElem.style.display = 'none';
            var imgData = canvas.toDataURL('image/jpg'),
                pageHeight = 295,
                imgHeight = canvas.height * PAGE_WIDTH / canvas.width,
                heightLeft = imgHeight,
                doc = new jsPDF(this.pdfOptions);
                if(payload.margin) {
                    payload.margin.top = (payload.margin.top) ?  payload.margin.top * convToMM : 0;
                    payload.margin.bottom = (payload.margin.bottom) ?  payload.margin.bottom * convToMM : 0;
                } else {
                    payload.margin = {top: 0, bottom: 0};
                }
            var position = 0;
            doc.addImage(imgData, 'JPG', 0, position, PAGE_WIDTH, imgHeight);
            heightLeft -= pageHeight;
            var page = 0;
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                doc.addPage();
                doc.addImage(imgData, 'JPG', 0, position, PAGE_WIDTH, imgHeight);
                /* P */
                heightLeft -= pageHeight;
                page++;
            }
            resolve(this.getReturnType(doc, payload.output));
        }
        if(!this.html2CanvasOptions.width) {
            this.html2CanvasOptions.width = targetElem.offsetWidth;
        }
        if(!this.html2CanvasOptions.height) {
            this.html2CanvasOptions.height = targetElem.offsetHeight + 150;
        }
    }

    getReturnType(doc, output) {
        if(output && output != 'base64') {
            return doc.output(output);
        } else {
            return 'data:application/pdf;base64,' + btoa(doc.output());
        }
    }

    setMargins(payload) {
        //fillRect(left, top, w, h)
        if(payload.margin) {
            const convToMM = 3.7795275591, width = 210 * convToMM, height = 295 * convToMM;
            var marginCreator = document.createElement('canvas');
            marginCreator.width = 210 * convToMM;
            marginCreator.height = 295 * convToMM;
            var margin = {
                "top": payload.margin.top ? payload.margin.top * convToMM : 0,
                "bottom": payload.margin.bottom ? payload.margin.bottom * convToMM : 0,
            };
            ctx.beginPath();
            ctx.fillStyle = "#FFF";
            ctx.fillRect(0, 0, width, margin.top);
            ctx.beginPath();
            ctx.fillStyle = "#FFF";
            ctx.fillRect(0, height - margin.bottom, width, margin.bottom);
            this.imageMargin = marginCreator.toDataURL('image/jpg');
        }
    }
}