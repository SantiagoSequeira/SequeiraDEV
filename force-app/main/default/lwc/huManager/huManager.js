import { LightningElement, wire, api } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import LightningConfirm from 'lightning/confirm';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getHUs from '@salesforce/apex/HuController.getHUs';
import saveHU from '@salesforce/apex/HuController.saveHU';
import deleteHU from '@salesforce/apex/HuController.deleteHU';
import getPermissionRequests from '@salesforce/apex/HuController.getPermissionRequests';
import savePermissionRequest from '@salesforce/apex/HuController.savePermissionRequest';
import deletePermissionRequest from '@salesforce/apex/HuController.deletePermissionRequest';

const STATUS_OPTIONS = [
    { label: 'Nuevo', value: 'Nuevo' },
    { label: 'En análisis', value: 'En analisis' },
    { label: 'En desarrollo', value: 'En desarrollo' },
    { label: 'En pruebas', value: 'En pruebas' },
    { label: 'En pruebas PO', value: 'En pruebas PO' },
    { label: 'En paso a produccion', value: 'En paso a produccion' },
    { label: 'Revision de error', value: 'Revision de error' },
    { label: 'Bloqueado', value: 'Bloqueado' },
    { label: 'Cerrado', value: 'Cerrado' }
];

const CHECK_FIELDS = [
    { field: 'Has_Data__c', label: 'Lleva datos' },
    { field: 'Has_Permissions__c', label: 'Lleva permisos' },
    { field: 'Has_Permission_Groups__c', label: 'Lleva grupos de permisos' },
    { field: 'Has_AFA_Approval__c', label: 'Tiene VB de AFA' },
    { field: 'Has_Test_Plans__c', label: 'Tiene planes de prueba' },
    { field: 'Solo_DevOps__c', label: 'Solo devops' },
    { field: 'Guide_Sent__c', label: 'Guia enviada' },
    { field: 'Is_Multiple_Production__c', label: 'Es paso a prod multiple' }
];

const REQUEST_STATUS_OPTIONS = [
    { label: 'Nuevo', value: 'Nuevo' },
    { label: 'En progreso', value: 'En progreso' },
    { label: 'Faltan VB', value: 'Faltan VB' },
    { label: 'Resuelto', value: 'Resuelto' },
    { label: 'Cancelado', value: 'Cancelado' }
];

const DEFAULT_FORM = {
    Id: null,
    HU_Number__c: '',
    Name__c: '',
    Branch__c: '',
    Package_Path__c: '',
    Test_Text__c: '',
    HU_Status__c: 'Nuevo',
    Has_Data__c: false,
    Has_Permissions__c: false,
    Has_Permission_Groups__c: false,
    Has_AFA_Approval__c: false,
    Has_Test_Plans__c: false,
    Solo_DevOps__c: false,
    Guide_Sent__c: false,
    Is_Multiple_Production__c: false,
    Multiple_Production_HU_Numbers__c: '',
    Notes__c: '',
    External_Reference__c: ''
};

const DEFAULT_PERMISSION_REQUEST = {
    Id: null,
    HU__c: null,
    Request_Number__c: '',
    Description__c: '',
    Status__c: 'Nuevo'
};

export default class HuManager extends LightningElement {
    @api cardTitle = 'HU Manager';

    statusOptions = STATUS_OPTIONS;
    requestStatusOptions = REQUEST_STATUS_OPTIONS;
    checkFields = CHECK_FIELDS;

    form = { ...DEFAULT_FORM };
    initialForm = { ...DEFAULT_FORM };
    permissionRequestForm = { ...DEFAULT_PERMISSION_REQUEST };
    searchTerm = '';
    isSaving = false;
    isSavingPermissionRequest = false;
    wiredHUsResult;
    hus = [];
    permissionRequests = [];
    sortField = 'LastModifiedDate';
    sortDirection = 'desc';

    @wire(getHUs, { searchTerm: '$searchTerm' })
    wiredHUs(result) {
        this.wiredHUsResult = result;
        if (result.data) {
            this.setHUs(result.data);
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

    get hasFormChanges() {
        const keys = Object.keys(DEFAULT_FORM);
        return keys.some((key) => {
            const currentValue = this.form[key] ?? '';
            const initialValue = this.initialForm[key] ?? '';
            return currentValue !== initialValue;
        });
    }

    get isSaveDisabled() {
        return this.isSaving || !this.hasFormChanges;
    }

    get hasResults() {
        return this.hus && this.hus.length > 0;
    }

    get huNumberSortIcon() {
        return this.getSortIcon('HU_Number__c');
    }

    get huNameSortIcon() {
        return this.getSortIcon('Name__c');
    }

    get huStatusSortIcon() {
        return this.getSortIcon('HU_Status__c');
    }

    get huCreatedDateSortIcon() {
        return this.getSortIcon('CreatedDate');
    }

    get huLastModifiedDateSortIcon() {
        return this.getSortIcon('LastModifiedDate');
    }

    get isEditingPermissionRequest() {
        return !!this.permissionRequestForm.Id;
    }

    get permissionRequestSaveLabel() {
        return this.isEditingPermissionRequest
            ? 'Actualizar solicitud'
            : 'Guardar solicitud';
    }

    get showProductionReadinessBanner() {
        return this.form.HU_Status__c === 'En paso a produccion';
    }

    get showErrorReviewBanner() {
        return this.form.HU_Status__c === 'Revision de error';
    }

    get showMultipleProductionHUs() {
        return this.form.Is_Multiple_Production__c;
    }

    get productionReadiness() {
        const pendingItems = [];
        if (
            (this.form.Has_Permissions__c ||
                this.form.Has_Permission_Groups__c) &&
            !this.permissionRequests.length
        ) {
            pendingItems.push('Cargar al menos un Nro de solicitud de permiso.');
        }
        if (!this.form.Solo_DevOps__c && !this.form.Has_Test_Plans__c) {
            pendingItems.push('Cargar los planes de prueba.');
        }
        if (!this.form.Has_AFA_Approval__c) {
            pendingItems.push('Obtener el VB de AFA.');
        }
        if (!this.form.Guide_Sent__c) {
            pendingItems.push('Enviar la guia.');
        }

        if (pendingItems.length) {
            return {
                className: 'production-banner production-banner_error',
                title: 'Falta para el paso:',
                items: pendingItems
            };
        }

        if (this.form.Has_Data__c) {
            return {
                className: 'production-banner production-banner_warning',
                title: 'Atencion para el paso:',
                items: ['La HU lleva datos.']
            };
        }

        return {
            className: 'production-banner production-banner_success',
            title: 'Listo para el paso a produccion.',
            items: ['No hay requisitos pendientes.']
        };
    }

    get resultsCount() {
        return this.hus ? this.hus.length : 0;
    }

    setHUs(records) {
        const isSearching = this.searchTerm.trim().length > 0;
        this.hus = records
            .filter((hu) => isSearching || hu.HU_Status__c !== 'Cerrado')
            .map((hu) => ({
                ...hu,
                checksSummary: this.buildChecksSummary(hu),
                productionRowClass: this.getProductionRowClass(hu)
            }))
            .sort((firstHu, secondHu) => this.compareHUs(firstHu, secondHu));
    }

    getSortIcon(field) {
        if (this.sortField !== field) {
            return 'utility:chevrondown';
        }
        return this.sortDirection === 'asc'
            ? 'utility:arrowup'
            : 'utility:arrowdown';
    }

    getReadinessRank(hu) {
        if (hu.productionRowClass.includes('production-row_error')) {
            return 0;
        }
        if (hu.productionRowClass.includes('production-row_warning')) {
            return 1;
        }
        if (hu.productionRowClass.includes('production-row_success')) {
            return 2;
        }
        return 3;
    }

    compareHUs(firstHu, secondHu) {
        const readinessDifference =
            this.getReadinessRank(firstHu) - this.getReadinessRank(secondHu);
        if (readinessDifference !== 0) {
            return readinessDifference;
        }

        const firstValue = firstHu[this.sortField] || '';
        const secondValue = secondHu[this.sortField] || '';
        const comparison = firstValue.localeCompare(secondValue, undefined, {
            numeric: true,
            sensitivity: 'base'
        });
        return this.sortDirection === 'asc' ? comparison : -comparison;
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

    getProductionRowClass(hu) {
        if (hu.HU_Status__c === 'Revision de error') {
            return 'production-row production-row_error';
        }
        if (hu.HU_Status__c !== 'En paso a produccion') {
            return '';
        }

        const hasPermissionRequests =
            hu.Permission_Requests__r && hu.Permission_Requests__r.length > 0;
        const hasBlockingRequirement =
            ((hu.Has_Permissions__c || hu.Has_Permission_Groups__c) &&
                !hasPermissionRequests) ||
            (!hu.Solo_DevOps__c && !hu.Has_Test_Plans__c) ||
            !hu.Has_AFA_Approval__c ||
            !hu.Guide_Sent__c;

        if (hasBlockingRequirement) {
            return 'production-row production-row_error';
        }
        if (hu.Has_Data__c) {
            return 'production-row production-row_warning';
        }
        return 'production-row production-row_success';
    }

    handleFieldChange(event) {
        const { field } = event.target.dataset;
        if (!field) {
            return;
        }
        const value =
            field === 'Package_Path__c'
                ? event.target.value.replace(/\\/g, '/')
                : event.target.value;
        this.form = { ...this.form, [field]: value };
    }

    handleCheckChange(event) {
        const { field } = event.target.dataset;
        if (!field) {
            return;
        }
        this.form = { ...this.form, [field]: event.target.checked };
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
    }

    handleSort(event) {
        const { field } = event.currentTarget.dataset;
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = 'asc';
        }
        this.hus = [...this.hus].sort((firstHu, secondHu) =>
            this.compareHUs(firstHu, secondHu)
        );
    }

    handleNew() {
        this.form = { ...DEFAULT_FORM };
        this.initialForm = { ...DEFAULT_FORM };
        this.permissionRequests = [];
        this.handleNewPermissionRequest();
    }

    mapRecordToForm(record) {
        return {
            Id: record ? record.Id || null : null,
            HU_Number__c: (record && record.HU_Number__c) || '',
            Name__c: (record && record.Name__c) || '',
            Branch__c: (record && record.Branch__c) || '',
            Package_Path__c: (record && record.Package_Path__c) || '',
            Test_Text__c: (record && record.Test_Text__c) || '',
            HU_Status__c: (record && record.HU_Status__c) || 'Nuevo',
            Has_Data__c: !!(record && record.Has_Data__c),
            Has_Permissions__c: !!(record && record.Has_Permissions__c),
            Has_Permission_Groups__c: !!(record && record.Has_Permission_Groups__c),
            Has_AFA_Approval__c: !!(record && record.Has_AFA_Approval__c),
            Has_Test_Plans__c: !!(record && record.Has_Test_Plans__c),
            Solo_DevOps__c: !!(record && record.Solo_DevOps__c),
            Guide_Sent__c: !!(record && record.Guide_Sent__c),
            Is_Multiple_Production__c: !!(record && record.Is_Multiple_Production__c),
            Multiple_Production_HU_Numbers__c:
                (record && record.Multiple_Production_HU_Numbers__c) || '',
            Notes__c: (record && record.Notes__c) || '',
            External_Reference__c: (record && record.External_Reference__c) || ''
        };
    }

    handleEdit(event) {
        const { id } = event.currentTarget.dataset;
        const record = this.hus.find((hu) => hu.Id === id);
        if (record) {
            this.form = this.mapRecordToForm(record);
            this.initialForm = { ...this.form };
            this.handleNewPermissionRequest();
            this.loadPermissionRequests();
        }
    }

    async handleDelete(event) {
        const { id } = event.currentTarget.dataset;
        if (!id) {
            return;
        }
        const confirmed = await LightningConfirm.open({
            message: 'Esta acción eliminará la HU y no se puede deshacer.',
            label: 'Eliminar HU',
            theme: 'warning'
        });
        if (!confirmed) {
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
        if (this.isSaveDisabled) {
            return;
        }
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
            const savedHu = await saveHU({ hu: recordToSave });
            this.notifySuccess('HU guardada correctamente.');
            this.form = this.mapRecordToForm(savedHu);
            this.initialForm = { ...this.form };
            this.handleNewPermissionRequest();
            await refreshApex(this.wiredHUsResult);
            await this.loadPermissionRequests();
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

    async loadPermissionRequests() {
        if (!this.form.Id) {
            this.permissionRequests = [];
            return;
        }

        try {
            const result = await getPermissionRequests({ huId: this.form.Id });
            this.permissionRequests = Array.isArray(result) ? result : [];
        } catch (error) {
            this.permissionRequests = [];
            this.notifyError('No se pudieron cargar las solicitudes.', error);
        }
    }

    handleNewPermissionRequest() {
        this.permissionRequestForm = {
            ...DEFAULT_PERMISSION_REQUEST,
            HU__c: this.form.Id || null
        };
    }

    handlePermissionRequestFieldChange(event) {
        const { field } = event.target.dataset;
        if (!field) {
            return;
        }
        this.permissionRequestForm = {
            ...this.permissionRequestForm,
            [field]: event.target.value
        };
    }

    handleEditPermissionRequest(event) {
        const { id } = event.currentTarget.dataset;
        const permissionRequest = this.permissionRequests.find(
            (request) => request.Id === id
        );
        if (permissionRequest) {
            this.permissionRequestForm = {
                Id: permissionRequest.Id,
                HU__c: this.form.Id,
                Request_Number__c: permissionRequest.Request_Number__c || '',
                Description__c: permissionRequest.Description__c || '',
                Status__c: permissionRequest.Status__c || 'Nuevo'
            };
        }
    }

    validatePermissionRequest() {
        const inputs = this.template.querySelectorAll(
            '[data-request-validate="true"]'
        );
        return [...inputs].every((input) => input.reportValidity());
    }

    async handleSavePermissionRequest() {
        if (!this.validatePermissionRequest()) {
            return;
        }

        this.isSavingPermissionRequest = true;
        try {
            const permissionRequest = { ...this.permissionRequestForm };
            if (!permissionRequest.Id) {
                delete permissionRequest.Id;
            }
            const savedPermissionRequest = await savePermissionRequest({
                permissionRequest
            });
            const existingIndex = this.permissionRequests.findIndex(
                (request) => request.Id === savedPermissionRequest.Id
            );
            if (existingIndex === -1) {
                this.permissionRequests = [
                    savedPermissionRequest,
                    ...this.permissionRequests
                ];
            } else {
                this.permissionRequests = this.permissionRequests.map((request) => {
                    return request.Id === savedPermissionRequest.Id
                        ? savedPermissionRequest
                        : request;
                });
            }
            this.notifySuccess('Solicitud guardada correctamente.');
            this.handleNewPermissionRequest();
            await this.loadPermissionRequests();
        } catch (error) {
            this.notifyError('No se pudo guardar la solicitud.', error);
        } finally {
            this.isSavingPermissionRequest = false;
        }
    }

    async handleDeletePermissionRequest(event) {
        const { id } = event.currentTarget.dataset;
        if (!id) {
            return;
        }
        const confirmed = await LightningConfirm.open({
            message: 'Esta acción eliminará la solicitud y no se puede deshacer.',
            label: 'Eliminar solicitud',
            theme: 'warning'
        });
        if (!confirmed) {
            return;
        }

        try {
            await deletePermissionRequest({ permissionRequestId: id });
            this.permissionRequests = this.permissionRequests.filter(
                (request) => request.Id !== id
            );
            this.notifySuccess('Solicitud eliminada correctamente.');
            if (this.permissionRequestForm.Id === id) {
                this.handleNewPermissionRequest();
            }
            await this.loadPermissionRequests();
        } catch (error) {
            this.notifyError('No se pudo eliminar la solicitud.', error);
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
