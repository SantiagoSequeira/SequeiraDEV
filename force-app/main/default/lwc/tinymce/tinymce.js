import { LightningElement, track } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import TINYMCE from '@salesforce/resourceUrl/tinyMCE';

export default class Tinymce extends LightningElement {
    tinymceInitialized = false;

    renderedCallback() {
        if (this.tinymceInitialized) {
            return;
        }
        this.tinymceInitialized = true;

        Promise.all([
            loadScript(this, TINYMCE + '/tinymce/js/tinymce/tinymce.min.js'),
            loadStyle(this, TINYMCE + '/tinymce/js/tinymce/skins/ui/oxide/skin.min.css')
        ])
        .then(() => {
            this.initializeTinyMCE();
        })
        .catch(error => {
            console.log('Error loading scripts: ', error);
        });
    }

    initializeTinyMCE() {
        var rootData = this.template.querySelector('.editor');
        tinymce.init({
            target: rootData,
            // You can customize options here
            plugins: 'link image code',
            toolbar: 'undo redo | bold italic | bullist numlist | link image | code',
            height: 300,
            setup: editor => {
                editor.on('change', () => {
                    const content = editor.getContent();
                    // Handle the content as needed
                });
            }
        });
    }
}