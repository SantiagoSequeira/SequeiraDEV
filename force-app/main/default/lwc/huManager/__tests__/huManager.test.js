import { createElement } from 'lwc';
import HuManager from 'c/huManager';
import getHUs from '@salesforce/apex/HuController.getHUs';
import saveHU from '@salesforce/apex/HuController.saveHU';

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
        HU_Status__c: 'Nuevo',
        Branch_Name__c: 'feature/hu-1001',
        Permission_Requests__c: '1234 5678',
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
    return new Promise((resolve) => setTimeout(resolve, 0));
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
});
