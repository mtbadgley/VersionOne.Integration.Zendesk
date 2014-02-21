(function () {

    //var v1url = 'https://www11.v1host.com/V1Integrations';
    //var v1username = 'admin';
	//var v1password = 'admin1234';
	//var v1projectID = 'Scope:1136';
	//var v1sourceID = 'StorySource:1137';
	//var v1AssetIDCustomField = 'custom_field_21479374';
	//var v1AssetNumberCustomField = 'custom_field_21481134';
	//var v1AssetStatusCustomField = 'custom_field_21487554';
	//var v1ReleaseNumberCustomField = 'custom_field_21481584';

    var v1url = '';
    var v1username = '';
    var v1password = '';
    var v1projectID = '';
    var v1sourceID = '';
    var v1AssetIDCustomField = '';
    var v1AssetNumberCustomField = '';
    var v1AssetStatusCustomField = '';
    var v1ReleaseNumberCustomField = '';

    var v1DefectId = '';
    var v1defectTag = 'v1defect';

    return {

        events: {
            'app.activated': 'initializeApp',
            'click .createDefect': 'createDefect',
            'click .searchDefect': 'searchDefect',
            'click .assignDefect': 'findDefect',
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

            updateDefect: function (v1DefectInteger, xmlPayload) {
				return {
					url: v1url + '/rest-1.v1/Data/Defect/' + v1DefectInteger + '?Accept=application/json',
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
            },

            getDefectByNumber: function (defectNumber) {
				return {
					url: v1url + '/rest-1.v1/Data/Defect?Accept=application/json&sel=Number,Status.Name,Owners.Name,Priority.Name,FixedInBuild,ChangeDateUTC&where=Number="' + defectNumber + '"',
					type: 'GET',
					dataType: 'application/xml',
					headers: { 'Authorization': 'Basic ' + Base64.encode(v1username + ':' + v1password) },
					proxy_v2: true
				};
            }
        },

		//Initialize the application by setting global variables.
        initializeApp: function (data) {

			if (data.firstLoad) {
				v1url = this.setting('v1url');
				v1username = this.setting('v1username');
				v1password = this.setting('v1password');
				v1projectID = this.setting('v1project');
				v1sourceID = this.setting('v1source');
				v1AssetIDCustomField = this.setting('v1assetIDField');
				v1AssetNumberCustomField = this.setting('v1assetNumberField');
				v1AssetStatusCustomField = this.setting('v1assetStatusField');
				v1ReleaseNumberCustomField = this.setting('v1assetNumberField');

				//DEBUG ONLY:
				//console.log(v1url + ":" + v1username + ":" + v1password);
				//console.log(v1projectID + ":" + v1sourceID);
				//console.log(v1AssetIDCustomField + ":" + v1AssetNumberCustomField + ":" + v1ReleaseNumberCustomField + ":" + v1AssetStatusCustomField);
			}

			this.showMain(data);
        },

		//Determine if current ticket is associated with a V1 defect, then display the main form in the Zendesk sidebar.
        showMain: function () {

			var field = this.ticket().customField(v1AssetIDCustomField);
			if (field) {
				var request = this.ajax('getDefect', this.ticket().customField(v1AssetIDCustomField));
				request.always(this.showDefect);
			}
			else {
				this.switchTo('mainAssign');
			}
        },

		//Display error form in Zendesk sidebar.
        showError: function () {
            this.switchTo('error');
        },

		//Determine V1 api call success, then display V1 defect data in Zendesk sidebar.
        processDefect: function (data) {

			//DEBUG ONLY:
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

		//Display V1 defect in Zendesk sidebar.
        showDefect: function (data) {

			//DEBUG ONLY:
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

		//Create V1 defect from Zendesk ticket.
        createDefect: function () {

			//DEBUG ONLY:
            this.logTicket();

            var xmlPayload = '<Asset>';
            xmlPayload += '<Relation name="Scope" act="set"><Asset idref="' + v1projectID + '" /></Relation>';
            xmlPayload += '<Attribute name="Name" act="set">' + this.ticket().subject() + '</Attribute>';
            xmlPayload += '<Attribute name="Reference" act="set">' + this.ticket().id() + '</Attribute>';
            xmlPayload += '<Attribute name="Description" act="set">' + this.ticket().description() + '</Attribute>';
            xmlPayload += '<Relation name="Source" act="set"><Asset idref="' + v1sourceID + '" /></Relation>';
            xmlPayload += '<Attribute name="FoundBy" act="set">' + this.ticket().requester().email() + '</Attribute>';
            xmlPayload += '<Attribute name="FoundInBuild" act="set">' + this.ticket().customField(v1ReleaseNumberCustomField) + '</Attribute>';
            xmlPayload += '</Asset>';
            console.log('xmlPayload: ' + xmlPayload);

            this.showSpinner(true);
            var request = this.ajax('submitDefect', xmlPayload);
            request.always(this.createLink);

        },

		//Find V1 defect based on specified V1 asset number like "D-01234".
        findDefect: function () {
			this.showSpinner(true);
			var request = this.ajax('getDefectByNumber', this.$("#txtSearch").val());
			request.always(this.assignDefect);
        },

		//Associate an existing V1 defect with the current Zendesk ticket.
        assignDefect: function (data) {

			//DEBUG ONLY:
			console.log(data);

			if (data.status == '200') {

				//Get the integer portion of the V1 defect ID that is needed for defect update in V1.
				var defectJSON = JSON.parse(data.responseText);
				var v1IdArray = defectJSON.Assets[0].id.split(":");
				var v1DefectInteger = v1IdArray[1];
				console.log("v1DefectInteger: " + v1DefectInteger);

				var xmlPayload = '<Asset>';
				xmlPayload += '<Attribute name="Reference" act="set">' + this.ticket().id() + '</Attribute>';
				xmlPayload += '<Relation name="Source" act="set"><Asset idref="' + v1sourceID + '" /></Relation>';
				xmlPayload += '</Asset>';
				console.log('xmlPayload: ' + xmlPayload);

				var request = this.ajax('updateDefect', v1DefectInteger, xmlPayload);
				request.always(this.createLink);
			}
			else {
				this.showSpinner(false);
				this.switchTo('error');
			}
        },

		//Create a v1 link asset for the given v1 defect.
        createLink: function (data) {

			//DEBUG ONLY:
            console.log(data);

            v1DefectId = this.getDefectId(data.responseText);
            var ticketId = this.ticket().id();
            var ticketUrl = 'https://' + this.currentAccount().subdomain() + '.zendesk.com/agent/#/tickets/' + this.ticket().id();

            if (data.status == '200') {

                var xmlPayload = '<Asset>';
                xmlPayload += '<Attribute name="OnMenu" act="set">false</Attribute>';
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

		//Unassigns the defect from teh Zendesk ticket by removing field values in the Zendesk ticket.
        unassignDefect: function () {
            this.ticket().customField(v1AssetIDCustomField, "");
            this.ticket().customField(v1AssetNumberCustomField, "");
            this.ticket().customField(v1AssetStatusCustomField, "");
            this.ticket().tags().remove(v1defectTag);
            this.switchTo('mainAssign');
        },

		//TODO: Search for v1 defect based on specified search text.
        searchDefect: function () {
            alert('Not implemented!');
            //this.showSpinner(true);
            //var request = this.ajax('searchDefect', this.$("#txtSearch").val());
            //request.always(this.showMain);
            //this.showSpinner(false);
        },

		//Returns defect OID with moment value stripped off.
        getDefectId: function (defect) {
            var defectJSON = JSON.parse(defect);
            var v1IdArray = defectJSON.id.split(":");
            return v1IdArray[0] + ':' + v1IdArray[1];
        },

		//Converts UTCDateTime to friendly format.
        getFriendlyDateTime: function (dateTimeValue) {
            var newDate = new Date(dateTimeValue);
            var datePart = (newDate.getMonth() + 1) + '/' + newDate.getDate() + '/' + newDate.getFullYear();
            var timePart = newDate.getHours() + ':' + newDate.getMinutes();
            return datePart + ' ' + timePart;
        },

		//Displays the Zendesk spinner.
        showSpinner: function (showValue) {
            if (showValue === true)
                this.$(".spinner").css("visibility", "visible");
            else
                this.$(".spinner").css("visibility", "hidden");
        },

		//Logs ticket information to the browser console.
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
