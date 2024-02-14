trigger CaseTrigger on Case (before insert, after update) {
    if(Trigger.isBefore) {
        if(Trigger.isInsert) {
            SLAUtils.assignEntitlements(Trigger.new);
        }
    } else if(Trigger.isAfter) {
        if(Trigger.isUpdate) {
            SLAUtils.closeMilestonesInClosedCases(Trigger.new, Trigger.oldMap);
        }
    }
}