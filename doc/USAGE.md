## Using the VersionOne Integration for Zendesk ##

The VersionOne Integration for Zendesk allows user-agents to create new VersionOne defects from a ticket, or associate an existing VersionOne defect with a ticket.

Once installed, the integration will appear in the Zendesk sidebar along with any other applications that may be installed.

![alt text](https://github.com/aceybunch/VersionOne.Integration.Zendesk/blob/master/imgs/main_form.png)

### Creating a VersionOne Defect from a Zendesk Ticket ###

To create a VersionOne defect from the currently opened ticket, simply click the `Create Defect` button. Once the defect has been created in VersionOne, the defect information form will appear as follows:

![alt text](https://github.com/aceybunch/VersionOne.Integration.Zendesk/blob/master/imgs/defect_info.png)

### Associating a Zendesk Ticket with an Existing VersionOne Defect ###

To associate the currently opened ticket with a defect that already exists in VersionOne, first use VersionOne to look up the defect's asset number like "D-01234". Once you have that number, enter it in the main integration form and then click `Assign`. Once the existing defect has been updated in VersionOne, the defect information form will appear.

### Disassociating a Zendesk Ticket from a VersionOne Defect ###

Should the need arise, you may also dissassociate a Zendesk ticket that has been linked to a VersionOne defect by clicking the `Unassign` button in the defect information form.

> Note that dissociating a ticket from a defect will not delete the defect in VersionOne.

