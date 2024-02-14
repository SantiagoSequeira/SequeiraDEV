import { LightningElement } from 'lwc';
import jspdf from '@salesforce/resourceUrl/jspdf134';
import {loadScript} from 'lightning/platformResourceLoader';

export default class gamesTracker extends LightningElement {
    renderedCallback() {
        Promise.all([
            loadScript(this, jspdf)
        ]);
    }

    downloadPDF() {
        const jsPDF = window.jsPDF;
        var pdf = new jsPDF();
        let html = `
        <style>
            .logo-pdf {
                width: 1em;
                height: 1em;
                margin: 0;
                left: 0;
                top: 0;
                float: left;
                position: absolute;
            }
            .title-pdf {
                font-size: 1.0em;
                font-weight: 500;
            }
            .header-pdf {
                background: rgb(243, 242, 242);
                text-indent: .5em;
                font-family: 'Lucida Console';
                font-weight: 400;
                font-size: 1.6em;
                margin-top: 25px;
            }
            .column {
                margin-top: 15px;
            }
        </style>
        <img src="/resource/1629763379000/logo" class='logo-pdf' />
        <div class="section-personalInformation" >
            <h2 class="header-pdf">Información Personal</h2>
            <div class="row">
                <div class="column">
                    <span  class="title-pdf">AccountID: </span>
                    <span>test</span>
                </div>
                <div class="column">
                    <span class="title-pdf">UserName: </span>
                    <span>test</span>
                </div>
                <div class="column">
                    <span class="title-pdf">Created Date: </span>
                    <span>test</span>
                </div>
                <div class="column">
                    <span class="title-pdf">Record Type: </span>
                    <span>test</span>
                </div>
            </div>
        '</div>'
        `;
        let element = document.createElement('div');
        element.setAttribute('id', 'jsPDF');
        element.innerHTML = html;
        document.body.appendChild(element);  
        let res = document.getElementById('jsPDF');
        pdf.fromHTML(res, 15, 15, {
            'width': 170
            },
            function() {
                let res = pdf.output('datauri');
                document.createElement('a');
                let element = document.createElement('a');
                element.setAttribute('href', res);
                element.setAttribute('download', 'download');
                
                element.style.display = 'none';
                document.body.appendChild(element);
                
                element.click();
            }
        ); 
        
        
    }


}