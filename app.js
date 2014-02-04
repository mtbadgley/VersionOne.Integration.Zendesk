(function() {

	//TODO: Move to persisted storage and set on installation.
    var v1url = 'https://www11.v1host.com/V1Integrations';
	var v1username = 'admin';
	var v1password = 'admin1234';
	var v1projectName = 'Zendesk';
	var v1projectID = 'Scope:1136';
	var v1SourceID = 'StorySource:1137';
	var v1DefectId = '';

  return {
  
    events: {
      'app.activated':'showMain',
      'click .createDefect': 'createDefect',
      'click .updateDefect': 'updateDefect',
      'click .unassignDefect': 'unassignDefect'
    },
	
	requests: {

		submitDefect: function(xmlPayload) {
			return {
			    url: v1url + '/rest-1.v1/Data/Defect?Accept=application/json',
				type:		'POST',
				dataType:   'application/xml',
				data: 		xmlPayload,
				headers: { 'Authorization': 'Basic ' + Base64.encode(v1username + ':' + v1password) },
				proxy_v2:   true
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

		getDefect: function (defectID) {
		    return {
		        url: v1url + '/rest-1.v1/Data/Defect?Accept=application/json&sel=Number,Status.Name,Owners.Name&where=ID="' + defectID + '"',
		        type: 'GET',
		        dataType: 'application/xml',
		        headers: { 'Authorization': 'Basic ' + Base64.encode(v1username + ':' + v1password) },
		        proxy_v2: true
		    };
		}
	},	
	
	showMain: function() {
		this.switchTo('defectInfo');
    },

	showError: function(data) {
		this.switchTo('error');
	},

	processDefect: function (data) {

	    console.log(data);

	    if (data.status == '200') {
	        var request = this.ajax('getDefect', v1DefectId);
	        request.always(this.showDefect);
	    }
	    else {
	        this.switchTo('error');
	    }
	    
	},

	showDefect: function (data) {

	    console.log(data);

	    if (data.status == '200') {
	        var responseJSON = JSON.parse(data.responseText);
	        this.switchTo('defectInfo', responseJSON);
	    }
	    else {
	        this.switchTo('error');
	    }

	},
	
	createDefect: function() {
  	
		this.logTicket();

		var xmlPayload = '<Asset>';
		xmlPayload += '<Relation name="Scope" act="set"><Asset idref="' + v1projectID + '" /></Relation>';
		xmlPayload += '<Attribute name="Name" act="set">' + this.ticket().subject() + '</Attribute>';
		xmlPayload += '<Attribute name="Reference" act="set">' + this.ticket().id() + '</Attribute>';
		xmlPayload += '<Attribute name="Description" act="set">' + this.ticket().description() + '</Attribute>';
		xmlPayload += '<Relation name="Source" act="set"><Asset idref="' + v1SourceID + '" /></Relation>';
		xmlPayload += '<Attribute name="FoundBy" act="set">' + this.ticket().requester().email() + '</Attribute>';
		xmlPayload += '</Asset>';
		console.log('xmlPayload: ' + xmlPayload);

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
	        this.switchTo('error');
	    }

	},

	updateDefect: function () {
	    alert('Update...');
	},

	unassignDefect: function () {
	    alert('Unassign...');
	},

	getDefectId: function(defect) {
	    var defectJSON = JSON.parse(defect);
	    var v1IdArray = defectJSON.id.split(":");
	    return v1IdArray[0] + ':' + v1IdArray[1];
	},
	
	logTicket: function() {
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
