import { LightningElement, wire, api } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getHUs from '@salesforce/apex/HuController.getHUs';
import saveHU from '@salesforce/apex/HuController.saveHU';
import deleteHU from '@salesforce/apex/HuController.deleteHU';

const STATUS_OPTIONS = [
    { label: 'Nuevo', value: 'Nuevo' },
    { label: 'En análisis', value: 'En analisis' },
    { label: 'En desarrollo', value: 'En desarrollo' },
    { label: 'En pruebas', value: 'En pruebas' },
    { label: 'Bloqueado', value: 'Bloqueado' },
    { label: 'Cerrado', value: 'Cerrado' }
];

const CHECK_FIELDS = [
    { field: 'Has_Data__c', label: 'Lleva datos' },
    { field: 'Has_Permissions__c', label: 'Lleva permisos' },
    { field: 'Has_Permission_Groups__c', label: 'Lleva grupos de permisos' },
    { field: 'Has_AFA_Approval__c', label: 'Tiene VB de AFA' },
    { field: 'Has_Test_Plans__c', label: 'Tiene planes de prueba' }
];

const DEFAULT_FORM = {
    Id: null,
    HU_Number__c: '',
    Package_Path__c: '',
    Branch_Name__c: '',
    Test_Text__c: '',
    HU_Status__c: 'Nuevo',
    Permission_Requests__c: '',
    Has_Data__c: false,
    Has_Permissions__c: false,
    Has_Permission_Groups__c: false,
    Has_AFA_Approval__c: false,
    Has_Test_Plans__c: false,
    Notes__c: '',
    External_Reference__c: ''
};

export default class HuManager extends LightningElement {
    @api cardTitle = 'HU Manager';

    statusOptions = STATUS_OPTIONS;
    checkFields = CHECK_FIELDS;

    form = { ...DEFAULT_FORM };
    searchTerm = '';
    isSaving = false;
    isFormDirty = false;
    wiredHUsResult;
    hus = [];

    @wire(getHUs, { searchTerm: '$searchTerm' })
    wiredHUs(result) {
        this.wiredHUsResult = result;
        if (result.data) {
            this.hus = result.data.map((hu) => ({
                ...hu,
                checksSummary: this.buildChecksSummary(hu)
            }));
        } else if (result.error) {
            this.hus = [];
            this.notifyError('No se pudieron cargar las HUs.', result.error);
        }
    }

    get isEditing() {
        return !!this.form.Id;
    }

    get formTitle() {
        return this.isEditing
            ? `Editando ${this.form.HU_Number__c}`
            : 'Nueva HU';
    }

    get saveButtonLabel() {
        return this.isEditing ? 'Actualizar HU' : 'Guardar HU';
    }

    get isSaveDisabled() {
        return this.isSaving || (this.isEditing && !this.isFormDirty);
    }

    get hasResults() {
        return this.hus && this.hus.length > 0;
    }

    get resultsCount() {
        return this.hus ? this.hus.length : 0;
    }

    get checkItems() {
        return this.checkFields.map((check) => ({
            field: check.field,
            label: check.label,
            value: !!this.form[check.field]
        }));
    }

    buildChecksSummary(hu) {
        return this.checkFields
            .filter((check) => hu[check.field])
            .map((check) => check.label)
            .join(', ');
    }

    handleFieldChange(event) {
        const { field } = event.target.dataset;
        if (!field) {
            return;
        }
        this.form = { ...this.form, [field]: event.target.value };
        this.isFormDirty = true;
    }

    handleCheckChange(event) {
        const { field } = event.target.dataset;
        if (!field) {
            return;
        }
        this.form = { ...this.form, [field]: event.target.checked };
        this.isFormDirty = true;
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
    }

    handleNew() {
        this.form = { ...DEFAULT_FORM };
        this.isFormDirty = false;
    }

    handleEdit(event) {
        const { id } = event.currentTarget.dataset;
        const record = this.hus.find((hu) => hu.Id === id);
        if (record) {
            this.form = {
                Id: record.Id,
                HU_Number__c: record.HU_Number__c || '',
                Package_Path__c: record.Package_Path__c || '',
                Branch_Name__c: record.Branch_Name__c || '',
                Test_Text__c: record.Test_Text__c || '',
                HU_Status__c: record.HU_Status__c || 'Nuevo',
                Permission_Requests__c:
                    record.Permission_Requests__c || '',
                Has_Data__c: !!record.Has_Data__c,
                Has_Permissions__c: !!record.Has_Permissions__c,
                Has_Permission_Groups__c: !!record.Has_Permission_Groups__c,
                Has_AFA_Approval__c: !!record.Has_AFA_Approval__c,
                Has_Test_Plans__c: !!record.Has_Test_Plans__c,
                Notes__c: record.Notes__c || '',
                External_Reference__c: record.External_Reference__c || ''
            };
            this.isFormDirty = false;
        }
    }

    async handleDelete(event) {
        const { id } = event.currentTarget.dataset;
        if (!id) {
            return;
        }
        try {
            await deleteHU({ huId: id });
            this.notifySuccess('HU eliminada correctamente.');
            if (this.form.Id === id) {
                this.handleNew();
            }
            await refreshApex(this.wiredHUsResult);
        } catch (error) {
            this.notifyError('No se pudo eliminar la HU.', error);
        }
    }

    validateForm() {
        const inputs = this.template.querySelectorAll(
            '[data-validate="true"]'
        );
        let allValid = true;
        inputs.forEach((input) => {
            if (!input.reportValidity()) {
                allValid = false;
            }
        });
        return allValid;
    }

    async handleSave() {
        if (!this.validateForm()) {
            this.notifyError(
                'Revisá los campos del formulario.',
                'Existen campos obligatorios o inválidos.'
            );
            return;
        }

        this.isSaving = true;
        try {
            const recordToSave = { ...this.form };
            if (!recordToSave.Id) {
                delete recordToSave.Id;
            }
            await saveHU({ hu: recordToSave });
            this.notifySuccess('HU guardada correctamente.');
            this.handleNew();
            await refreshApex(this.wiredHUsResult);
        } catch (error) {
            this.notifyError('No se pudo guardar la HU.', error);
        } finally {
            this.isSaving = false;
        }
    }

    async handleCopy(event) {
        const { field } = event.currentTarget.dataset;
        const value = this.form[field];
        if (!value) {
            this.notifyError(
                'Nada para copiar',
                'El campo está vacío.'
            );
            return;
        }
        const copied = await this.copyToClipboard(value);
        if (copied) {
            this.notifySuccess('Copiado al portapapeles.');
        } else {
            this.notifyError(
                'No se pudo copiar',
                'El navegador no permitió copiar al portapapeles.'
            );
        }
    }

    async copyToClipboard(value) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(value);
                return true;
            }
        } catch (error) {
            // fall through to legacy approach below
        }

        try {
            const textArea = document.createElement('textarea');
            textArea.value = value;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            this.template.querySelector('.hu-manager').appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            textArea.remove();
            return successful;
        } catch (error) {
            return false;
        }
    }

    notifySuccess(message) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Éxito',
                message,
                variant: 'success'
            })
        );
    }

    notifyError(title, error) {
        const message =
            (error && error.body && error.body.message) ||
            (typeof error === 'string' ? error : 'Ocurrió un error inesperado.');
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant: 'error'
            })
        );
    }
}
