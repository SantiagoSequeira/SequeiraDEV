import { LightningElement } from 'lwc';

export default class PdfRenderContainer extends LightningElement {
    PDFRender;
    initialized = false;
    renderedCallback() {
        if(!this.initialized) {
            this.PDFRender = this.template.querySelector('c-pdf-render');
            this.initialized = true;
        }
    }

    printPDF() {
        var htmlData = `
        <div class ='printPdf' > <!-- content to be printed inside the pdf included in div-->
           
            <div>
                <div class="section-personalInformation" >
                    <h2>User Info:</h2>
                    <table style="width:100%;table-layout: fixed;">
                        <tr>
                            <td class="title">AccountID</td>
                            <td class="title">UserName</td>
                        </tr>
                        <tr>
                            <td class="value"></td>
                            <td class="value">{!item['userName']}</td>
                        </tr> 
                        <tr>
                            <td class="title">Created Date</td>
                            <td class="title">Version</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['createdDate']}</td>
                            <td class="value">{!item['version']}</td>
                        </tr> 
                        <tr>
                            <td class="title">Record Type</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['recordType']}</td>
                        </tr> 
                    </table>
                </div>
                <div class="section-personalInformation" >
                    <h2>User Info:</h2>
                    <table style="width:100%;table-layout: fixed;">
                        <tr>
                            <td class="title">AccountID</td>
                            <td class="title">UserName</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['accountId']}</td>
                            <td class="value">{!item['userName']}</td>
                        </tr> 
                        <tr>
                            <td class="title">Created Date</td>
                            <td class="title">Version</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['createdDate']}</td>
                            <td class="value">{!item['version']}</td>
                        </tr> 
                        <tr>
                            <td class="title">Record Type</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['recordType']}</td>
                        </tr> 
                    </table>
                </div>
                <div class="section-personalInformation" >
                    <h2>User Info:</h2>
                    <table style="width:100%;table-layout: fixed;">
                        <tr>
                            <td class="title">AccountID</td>
                            <td class="title">UserName</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['accountId']}</td>
                            <td class="value">{!item['userName']}</td>
                        </tr> 
                        <tr>
                            <td class="title">Created Date</td>
                            <td class="title">Version</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['createdDate']}</td>
                            <td class="value">{!item['version']}</td>
                        </tr> 
                        <tr>
                            <td class="title">Record Type</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['recordType']}</td>
                        </tr> 
                    </table>
                </div>
                <div class="section-personalInformation" >
                    <h2>User Info:</h2>
                    <table style="width:100%;table-layout: fixed;">
                        <tr>
                            <td class="title">AccountID</td>
                            <td class="title">UserName</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['accountId']}</td>
                            <td class="value">{!item['userName']}</td>
                        </tr> 
                        <tr>
                            <td class="title">Created Date</td>
                            <td class="title">Version</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['createdDate']}</td>
                            <td class="value">{!item['version']}</td>
                        </tr> 
                        <tr>
                            <td class="title">Record Type</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['recordType']}</td>
                        </tr> 
                    </table>
                </div>
                <div class="section-personalInformation" >
                    <h2>User Info:</h2>
                    <table style="width:100%;table-layout: fixed;">
                        <tr>
                            <td class="title">AccountID</td>
                            <td class="title">UserName</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['accountId']}</td>
                            <td class="value">{!item['userName']}</td>
                        </tr> 
                        <tr>
                            <td class="title">Created Date</td>
                            <td class="title">Version</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['createdDate']}</td>
                            <td class="value">{!item['version']}</td>
                        </tr> 
                        <tr>
                            <td class="title">Record Type</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['recordType']}</td>
                        </tr> 
                    </table>
                </div>
                <div>
                    <h2>{!type} Data:</h2>
                    <apex:outputText value="{!item['htmlData']}" escape="false" ></apex:outputText>
                </div>
                ELPEPEE
            </div>
            <div>
                <div class="section-personalInformation" >
                    <h2>User Info:</h2>
                    <table style="width:100%;table-layout: fixed;">
                        <tr>
                            <td class="title">AccountID</td>
                            <td class="title">UserName</td>
                        </tr>
                        <tr>
                            <td class="value"></td>
                            <td class="value">{!item['userName']}</td>
                        </tr> 
                        <tr>
                            <td class="title">Created Date</td>
                            <td class="title">Version</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['createdDate']}</td>
                            <td class="value">{!item['version']}</td>
                        </tr> 
                        <tr>
                            <td class="title">Record Type</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['recordType']}</td>
                        </tr> 
                    </table>
                </div>
                <div class="section-personalInformation" >
                    <h2>User Info:</h2>
                    <table style="width:100%;table-layout: fixed;">
                        <tr>
                            <td class="title">AccountID</td>
                            <td class="title">UserName</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['accountId']}</td>
                            <td class="value">{!item['userName']}</td>
                        </tr> 
                        <tr>
                            <td class="title">Created Date</td>
                            <td class="title">Version</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['createdDate']}</td>
                            <td class="value">{!item['version']}</td>
                        </tr> 
                        <tr>
                            <td class="title">Record Type</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['recordType']}</td>
                        </tr> 
                    </table>
                </div>
                <div class="section-personalInformation" >
                    <h2>User Info:</h2>
                    <table style="width:100%;table-layout: fixed;">
                        <tr>
                            <td class="title">AccountID</td>
                            <td class="title">UserName</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['accountId']}</td>
                            <td class="value">{!item['userName']}</td>
                        </tr> 
                        <tr>
                            <td class="title">Created Date</td>
                            <td class="title">Version</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['createdDate']}</td>
                            <td class="value">{!item['version']}</td>
                        </tr> 
                        <tr>
                            <td class="title">Record Type</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['recordType']}</td>
                        </tr> 
                    </table>
                </div>
                <div class="section-personalInformation" >
                    <h2>User Info:</h2>
                    <table style="width:100%;table-layout: fixed;">
                        <tr>
                            <td class="title">AccountID</td>
                            <td class="title">UserName</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['accountId']}</td>
                            <td class="value">{!item['userName']}</td>
                        </tr> 
                        <tr>
                            <td class="title">Created Date</td>
                            <td class="title">Version</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['createdDate']}</td>
                            <td class="value">{!item['version']}</td>
                        </tr> 
                        <tr>
                            <td class="title">Record Type</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['recordType']}</td>
                        </tr> 
                    </table>
                </div>
                <div class="section-personalInformation" >
                    <h2>User Info:</h2>
                    <table style="width:100%;table-layout: fixed;">
                        <tr>
                            <td class="title">AccountID</td>
                            <td class="title">UserName</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['accountId']}</td>
                            <td class="value">{!item['userName']}</td>
                        </tr> 
                        <tr>
                            <td class="title">Created Date</td>
                            <td class="title">Version</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['createdDate']}</td>
                            <td class="value">{!item['version']}</td>
                        </tr> 
                        <tr>
                            <td class="title">Record Type</td>
                        </tr>
                        <tr>
                            <td class="value">{!item['recordType']}</td>
                        </tr> 
                    </table>
                </div>
                <div>
                    <h2>{!type} Data:</h2>
                    <apex:outputText value="{!item['htmlData']}" escape="false" ></apex:outputText>
                </div>
                ELPEPEE
            </div>
        </div>
        `;
        var styleData = `
            .logo-pdf {
                width: 150px;
                height: 150px;
                margin: 0;
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
            .html2canvas-container { width: 3000px !important; height: 3000px !important; }
            .value {
                border-bottom: solid 2px rgb(243, 242, 242);
                max-width: 50%;
                word-break: break-word;
                overflow-wrap: break-word;
            }
            td {
                width: 50%;
                max-width: 50%;
            }
            .subItem {
                margin-left: 20px;
            }
            .printPdf {
                font-size: 2em;
                padding: 0 100px;
            }        
        `;
        this.PDFRender.setMainStyle(styleData);
        this.PDFRender.downloadPDF({ 
            htmlData, 
            itemId: 'test', 
            output: 'base64' 
        });
    }
}