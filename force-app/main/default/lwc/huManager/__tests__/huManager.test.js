import { createElement } from 'lwc';
import HuManager from 'c/huManager';
import getHUs from '@salesforce/apex/HuController.getHUs';
import saveHU from '@salesforce/apex/HuController.saveHU';
import getPermissionRequests from '@salesforce/apex/HuController.getPermissionRequests';

jest.mock(
    '@salesforce/apex/HuController.getHUs',
    () => {
        const {
            createApexTestWireAdapter
        } = require('@salesforce/sfdx-lwc-jest');
        return {
            default: createApexTestWireAdapter(jest.fn())
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/apex/HuController.saveHU',
    () => {
        return {
            default: jest.fn()
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/apex/HuController.getPermissionRequests',
    () => {
        return {
            default: jest.fn().mockResolvedValue([])
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/apex/HuController.savePermissionRequest',
    () => {
        return {
            default: jest.fn()
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/apex/HuController.deletePermissionRequest',
    () => {
        return {
            default: jest.fn()
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/apex/HuController.deleteHU',
    () => {
        return {
            default: jest.fn()
        };
    },
    { virtual: true }
);

const mockHUs = [
    {
        Id: 'a01000000000001AAA',
        HU_Number__c: 'HU-1001',
        Name__c: 'Alta de acceso',
        Branch__c: 'feature/HU-1001',
        HU_Status__c: 'Nuevo',
        Package_Path__c: '/packages/hu1001/package.xml',
        Test_Text__c: 'TestOne TestTwo',
        Has_Data__c: true,
        Has_Permissions__c: false,
        Has_Permission_Groups__c: false,
        Has_AFA_Approval__c: false,
        Has_Test_Plans__c: false,
        Notes__c: '',
        External_Reference__c: ''
    }
];

function flushPromises() {
    return Promise.resolve();
}

describe('c-hu-manager', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    it('renders the list of HUs returned by the wired apex method', async () => {
        const element = createElement('c-hu-manager', { is: HuManager });
        document.body.appendChild(element);

        getHUs.emit(mockHUs);
        await flushPromises();

        const rows = element.shadowRoot.querySelectorAll('tbody tr');
        expect(rows.length).toBe(1);
        const firstCell = rows[0].querySelector('td');
        expect(firstCell.textContent).toBe('HU-1001');
        expect(getPermissionRequests).not.toHaveBeenCalled();
    });

    it('renders the copyable branch field', async () => {
        const element = createElement('c-hu-manager', { is: HuManager });
        document.body.appendChild(element);

        getHUs.emit([]);
        await flushPromises();

        const branchInput = element.shadowRoot.querySelector(
            'lightning-input[data-field="Branch__c"]'
        );
        const copyButton = element.shadowRoot.querySelector(
            'lightning-button-icon[data-field="Branch__c"]'
        );

        expect(branchInput).not.toBeNull();
        expect(copyButton).not.toBeNull();
    });

    it('shows an empty state when there are no HU records', async () => {
        const element = createElement('c-hu-manager', { is: HuManager });
        document.body.appendChild(element);

        getHUs.emit([]);
        await flushPromises();

        const emptyMessage = element.shadowRoot.querySelector(
            'p.slds-text-color_weak'
        );
        expect(emptyMessage).not.toBeNull();
        expect(emptyMessage.textContent).toBe('No hay HUs para mostrar.');
    });

    it('does not call saveHU when the required HU number field is missing', async () => {
        const element = createElement('c-hu-manager', { is: HuManager });
        document.body.appendChild(element);

        getHUs.emit([]);
        await flushPromises();

        const saveButton = [
            ...element.shadowRoot.querySelectorAll('lightning-button')
        ].find((button) => button.label === 'Guardar HU');
        saveButton.click();

        await flushPromises();

        expect(saveHU).not.toHaveBeenCalled();
    });

    it('disables save button when there are no changes on a new form and enables it upon field change', async () => {
        const element = createElement('c-hu-manager', { is: HuManager });
        document.body.appendChild(element);

        getHUs.emit([]);
        await flushPromises();

        const getSaveButton = () =>
            [
                ...element.shadowRoot.querySelectorAll('lightning-button')
            ].find((button) => button.label === 'Guardar HU');

        expect(getSaveButton().disabled).toBe(true);

        const huInput = element.shadowRoot.querySelector(
            'lightning-input[data-field="HU_Number__c"]'
        );
        huInput.value = 'HU-2002';
        huInput.dispatchEvent(new CustomEvent('change'));
        await flushPromises();

        expect(getSaveButton().disabled).toBe(false);

        huInput.value = '';
        huInput.dispatchEvent(new CustomEvent('change'));
        await flushPromises();

        expect(getSaveButton().disabled).toBe(true);
    });

    it('disables update button when editing an existing HU without changes and enables when modified', async () => {
        const element = createElement('c-hu-manager', { is: HuManager });
        document.body.appendChild(element);

        getHUs.emit(mockHUs);
        await flushPromises();

        const editButton = element.shadowRoot.querySelector(
            'lightning-button-icon[title="Editar"]'
        );
        editButton.click();
        await flushPromises();

        const getUpdateButton = () =>
            [
                ...element.shadowRoot.querySelectorAll('lightning-button')
            ].find((button) => button.label === 'Actualizar HU');

        expect(getUpdateButton()).not.toBeNull();
        expect(getUpdateButton().disabled).toBe(true);

        const nameInput = element.shadowRoot.querySelector(
            'lightning-input[data-field="Name__c"]'
        );
        nameInput.value = 'Nombre modificado';
        nameInput.dispatchEvent(new CustomEvent('change'));
        await flushPromises();

        expect(getUpdateButton().disabled).toBe(false);

        nameInput.value = 'Alta de acceso';
        nameInput.dispatchEvent(new CustomEvent('change'));
        await flushPromises();

        expect(getUpdateButton().disabled).toBe(true);
    });

    it('enables update button when a checkbox is toggled', async () => {
        const element = createElement('c-hu-manager', { is: HuManager });
        document.body.appendChild(element);

        getHUs.emit(mockHUs);
        await flushPromises();

        const editButton = element.shadowRoot.querySelector(
            'lightning-button-icon[title="Editar"]'
        );
        editButton.click();
        await flushPromises();

        const getUpdateButton = () =>
            [
                ...element.shadowRoot.querySelectorAll('lightning-button')
            ].find((button) => button.label === 'Actualizar HU');

        expect(getUpdateButton().disabled).toBe(true);

        const toggleInput = element.shadowRoot.querySelector(
            'lightning-input[data-field="Solo_DevOps__c"]'
        );
        toggleInput.checked = true;
        toggleInput.dispatchEvent(new CustomEvent('change'));
        await flushPromises();

        expect(getUpdateButton().disabled).toBe(false);

        toggleInput.checked = false;
        toggleInput.dispatchEvent(new CustomEvent('change'));
        await flushPromises();

        expect(getUpdateButton().disabled).toBe(true);
    });

    it('disables update button after successfully saving changes on an existing record', async () => {
        saveHU.mockResolvedValue({
            ...mockHUs[0],
            Name__c: 'Nombre modificado'
        });

        const element = createElement('c-hu-manager', { is: HuManager });
        document.body.appendChild(element);

        getHUs.emit(mockHUs);
        await flushPromises();

        const editButton = element.shadowRoot.querySelector(
            'lightning-button-icon[title="Editar"]'
        );
        editButton.click();
        await flushPromises();

        const huInput = element.shadowRoot.querySelector(
            'lightning-input[data-field="HU_Number__c"]'
        );
        huInput.reportValidity = jest.fn().mockReturnValue(true);

        const nameInput = element.shadowRoot.querySelector(
            'lightning-input[data-field="Name__c"]'
        );
        nameInput.value = 'Nombre modificado';
        nameInput.dispatchEvent(new CustomEvent('change'));
        await flushPromises();

        const getUpdateButton = () =>
            [
                ...element.shadowRoot.querySelectorAll('lightning-button')
            ].find((button) => button.label === 'Actualizar HU');

        expect(getUpdateButton().disabled).toBe(false);

        getUpdateButton().click();
        await flushPromises();

        expect(saveHU).toHaveBeenCalled();
        expect(getUpdateButton().disabled).toBe(true);
    });
});
