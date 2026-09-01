import { LightningElement, track } from 'lwc';
import Toast from 'lightning/toast';

export default class PathEditor extends LightningElement {
    @track
    steps = [{"label":"Creando Solicitud","value":"step-1","index":0,"estado":"Borrador","subEstado":"Creando Solicitud"},{"label":"Validando documentacion","value":"LBI_ValidandoDocumentacion","index":1,"estado":"En Validacion","subEstado":"Validando documentacion"},{"label":"Estudio de Titulo","value":"LBI_EstudioDeTitulo","index":2,"estado":"En Estudio","subEstado":"Estudio de Titulo"},{"label":"New Step","value":"New_Step_4"}]
    @track
    selectedStep = null;
    estados = [{"label":"En Estudio","value":"En Estudio"}, {"label":"Borrador", value: "Borrador"}];
    subEstados = [{"label":"Validacion","value":"Validacion"}, {"label":"Adjuntar PCN", value: "Adjuntar PCN"}];
    permisos = [{"label":"Ejecutivo formalizador","value":"SL_EjecutivoFormalizador"}, {"label":"Ejecutivo de cuentas", value: "SL_EjecutivoCuentas"}];
    reasignarA = [{"label":"Ejecutivo formalizador","value":"Ejecutivo asignado"}, {"label":"Oficina de partes", value: "Oficina de partes asignado"}];

    get stepsText() {
        return JSON.stringify(this.steps);
    }

    setSteps(event) {
        try {
            this.steps = JSON.parse(event.target.value);
        } catch (error) {
            console.log("Couldn't parse");
        }
    }

    focus(event) {
        let index = event.detail.index;
        this.selectedStep = {... this.steps[index], index};
    }

    setCheck(event){
        let field = event.target.dataset.field;
        this.selectedStep[field] = event.target.checked;
    }

    setField(event){
        let field = event.target.dataset.field;
        this.selectedStep[field] = event.target.value;
    }

    setSelected(event) {
        let field = event.target.dataset.field;
        this.selectedStep[field] = event.detail.value;
    }

    save(){
        let selectedStep = this.selectedStep;
        this.steps[selectedStep.index] = selectedStep;
        this.selectedStep = null;
    }

    addNew(){
        this.steps.push({label: 'New Step', value: 'New_Step_' + (this.steps.length+1)});
        this.selectedStep = null;
    }

    del(){
        let selectedStep = this.selectedStep;
        this.steps = this.steps.filter(step => selectedStep.value != step.value);
        this.selectedStep = null;
    }

    exportData(){
       
    }

    importData(){
         
    }

    message(label, message, variant){
        Toast.show({label, message, variant}, this);
    }
    
}