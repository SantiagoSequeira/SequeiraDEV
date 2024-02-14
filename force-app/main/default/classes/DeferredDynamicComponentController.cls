public with sharing class DeferredDynamicComponentController {
    public String title {get;set;}

    public Account getAccount() {
        return [SELECT Name From Account WHERE id = '0016g000007dTMKAA2'];
    }

    public Component.Apex.PageBlock getDynamicForm() {
        Component.Apex.PageBlock dynPageBlock = new Component.Apex.PageBlock();
        Component.Apex.OutputText lineBreak = new Component.Apex.OutputText();
        lineBreak.escape = false;
        lineBreak.expressions.value = EncodingUtil.urlDecode(ApexPages.currentPage().getParameters().get('html'), 'UTF-8');
        // Assemble the form components
        dynPageBlock.childComponents.add(lineBreak);
        return dynPageBlock;
    }
}