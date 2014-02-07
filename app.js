(function () {

    var v1url = 'https://www11.v1host.com/V1Integrations';
    var v1username = 'admin';
    var v1password = 'admin1234';
    var v1projectID = 'Scope:1136';
    var v1SourceID = 'StorySource:1137';
    var v1DefectId = '';
    var v1AssetIDCustomField = 'custom_field_21479374';
    var v1AssetNumberCustomField = 'custom_field_21481134';
    var v1ReleaseNumberCustomField = 'custom_field_21481584';
    var v1AssetStatusCustomField = 'custom_field_21487554';
    var v1defectTag = 'v1defect';

    return {

        events: {
            'app.activated': 'showMain',
            'click .createDefect': 'createDefect',
            'click .searchDefect': 'searchDefect',
            'click .unassignDefect': 'unassignDefect'
        },

        requests: {

            submitDefect: function (xmlPayload) {
                return {
                    url: v1url + '/rest-1.v1/Data/Defect?Accept=application/json',
                    type: 'POST',
                    dataType: 'application/xml',
                    data: xmlPayload,
                    headers: { 'Authorization': 'Basic ' + Base64.encode(v1username + ':' + v1password) },
                    proxy_v2: true
                };
            },

            submitLink: function (xmlPayload) {
                return {
                    url: v1url + '/rest-1.v1/Data/Link?Accept=application/json',
                    type: 'POST',
                    dataType: 'application/xml',
                    data: xmlPayload,
                    headers: { 'Authorization': 'Basic ' + Base64.encode(v1username + ':' + v1password) },
                    proxy_v2: true
                };
            },

            searchDefect: function (stringToSearch) {
                return {
                    url: v1url + '/rest-1.v1/Data/Defect?Accept=application/json&sel=Number,Name&findin=Name,Description&find="' + stringToSearch + '"',
                    type: 'GET',
                    dataType: 'application/xml',
                    headers: { 'Authorization': 'Basic ' + Base64.encode(v1username + ':' + v1password) },
                    proxy_v2: true
                };
            },

            getDefect: function (defectID) {
                return {
                    url: v1url + '/rest-1.v1/Data/Defect?Accept=application/json&sel=Number,Status.Name,Owners.Name,Priority.Name,FixedInBuild,ChangeDateUTC&where=ID="' + defectID + '"',
                    type: 'GET',
                    dataType: 'application/xml',
                    headers: { 'Authorization': 'Basic ' + Base64.encode(v1username + ':' + v1password) },
                    proxy_v2: true
                };
            }
        },

        showMain: function (data) {

			var field = this.ticket().customField(v1AssetIDCustomField);
            if (field) {
                var request = this.ajax('getDefect', this.ticket().customField(v1AssetIDCustomField));
                request.always(this.showDefect);
            }
            else {
                this.switchTo('main');
            }
        },

        showError: function (data) {
            this.switchTo('error');
        },

        processDefect: function (data) {

            console.log(data);

            if (data.status == '200') {
                this.ticket().tags().add(v1defectTag);
                var request = this.ajax('getDefect', v1DefectId);
                request.always(this.showDefect);
            }
            else {
                this.showSpinner(false);
                this.switchTo('error');
            }
        },

        showDefect: function (data) {

            console.log(data);

            if (data.status == '200') {

                var defectJSON = JSON.parse(data.responseText);
                this.ticket().customField(v1AssetIDCustomField, defectJSON.Assets[0].id);
                this.ticket().customField(v1AssetNumberCustomField, defectJSON.Assets[0].Attributes.Number.value);
                this.ticket().customField(v1AssetStatusCustomField, defectJSON.Assets[0].Attributes["Status.Name"].value);
                this.showSpinner(false);

                this.switchTo('defectInfo', {
                defectID: defectJSON.Assets[0].id,
                defectNumber: defectJSON.Assets[0].Attributes.Number.value,
                defectStatus: defectJSON.Assets[0].Attributes["Status.Name"].value,
                defectPriority: defectJSON.Assets[0].Attributes["Priority.Name"].value,
                defectFixedInBuild: defectJSON.Assets[0].Attributes.FixedInBuild.value,
                defectChangeDate: this.getFriendlyDateTime(defectJSON.Assets[0].Attributes.ChangeDateUTC.value)
				});
			}
			else {
				this.showSpinner(false);
				this.switchTo('error');
			}
		},

        createDefect: function () {

            this.logTicket();

            var xmlPayload = '<Asset>';
            xmlPayload += '<Relation name="Scope" act="set"><Asset idref="' + v1projectID + '" /></Relation>';
            xmlPayload += '<Attribute name="Name" act="set">' + this.ticket().subject() + '</Attribute>';
            xmlPayload += '<Attribute name="Reference" act="set">' + this.ticket().id() + '</Attribute>';
            xmlPayload += '<Attribute name="Description" act="set">' + this.ticket().description() + '</Attribute>';
            xmlPayload += '<Relation name="Source" act="set"><Asset idref="' + v1SourceID + '" /></Relation>';
            xmlPayload += '<Attribute name="FoundBy" act="set">' + this.ticket().requester().email() + '</Attribute>';
            xmlPayload += '<Attribute name="FoundInBuild" act="set">' + this.ticket().customField(v1ReleaseNumberCustomField) + '</Attribute>';
            xmlPayload += '</Asset>';
            console.log('xmlPayload: ' + xmlPayload);

            this.showSpinner(true);
            var request = this.ajax('submitDefect', xmlPayload);
            request.always(this.createLink);

        },

        createLink: function (data) {

            console.log(data);

            v1DefectId = this.getDefectId(data.responseText);
            var ticketId = this.ticket().id();
            var ticketUrl = 'https://' + this.currentAccount().subdomain() + '.zendesk.com/agent/#/tickets/' + this.ticket().id();

            if (data.status == '200') {

                var xmlPayload = '<Asset>';
                xmlPayload += '<Attribute name="OnMenu" act="set">true</Attribute>';
                xmlPayload += '<Attribute name="URL" act="set">' + ticketUrl + '</Attribute>';
                xmlPayload += '<Attribute name="Name" act="set">Zendesk #' + ticketId + '</Attribute>';
                xmlPayload += '<Relation name="Asset" act="set"><Asset idref="' + v1DefectId + '" /></Relation>';
                xmlPayload += '</Asset>';
                console.log('xmlPayload: ' + xmlPayload);

                var request = this.ajax('submitLink', xmlPayload);
                request.always(this.processDefect);
            }
            else {
                this.showSpinner(false);
                this.switchTo('error');
            }

        },

        unassignDefect: function () {
            this.ticket().customField(v1AssetIDCustomField, "");
            this.ticket().customField(v1AssetNumberCustomField, "");
            this.ticket().customField(v1AssetStatusCustomField, "");
            this.ticket().tags().remove(v1defectTag);
            this.switchTo('main');
        },

        searchDefect: function () {

            alert('Not implemented!');

            //this.showSpinner(true);

            //var request = this.ajax('searchDefect', this.$("#txtSearch").val());
            //request.always(this.showMain);

            //this.showSpinner(false);
        },

        getDefectId: function (defect) {
            var defectJSON = JSON.parse(defect);
            var v1IdArray = defectJSON.id.split(":");
            return v1IdArray[0] + ':' + v1IdArray[1];
        },

        getFriendlyDateTime: function (dateTimeValue) {
            var newDate = new Date(dateTimeValue);
            var datePart = (newDate.getMonth() + 1) + '/' + newDate.getDate() + '/' + newDate.getFullYear();
            var timePart = newDate.getHours() + ':' + newDate.getMinutes();
            return datePart + ' ' + timePart;
        },

        showSpinner: function (showValue) {
            if (showValue === true)
                this.$(".spinner").css("visibility", "visible");
            else
                this.$(".spinner").css("visibility", "hidden");
        },

        logTicket: function () {
            console.log('ID: ' + this.ticket().id());
            console.log('Subject: ' + this.ticket().subject());
            console.log('Description: ' + this.ticket().description());
            console.log('Status: ' + this.ticket().status());
            console.log('Priority: ' + this.ticket().priority());
            console.log('Type: ' + this.ticket().type());
            console.log('Url: https://' + this.currentAccount().subdomain() + '.zendesk.com/agent/#/tickets/' + this.ticket().id());
        }

    };

}());
