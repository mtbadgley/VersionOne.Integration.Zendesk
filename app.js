(function() {

	//TODO: Move to persisted storage and set on installation.
	var v1url = 'http://localhost/versionone';
	var v1username = 'admin';
	var v1password = 'admin';
	var v1projectName = 'ZenDesk';
	var v1projectID = 'Scope:2082';

  return {
  
    events: {
      'app.activated':'showMain',
	  'click':'createDefect'
    },
	
	requests: {

		submitDefect: function(xmlPayload) {
			return {
				url: 		v1url + '/rest-1.v1/Data/Defect',
				type:		'POST',
				dataType: 	'application/xml',
				data: 		xmlPayload,
				headers: {
					'Authorization': 'Basic ' + v1username + ':' + v1password
					}
			};
		}
	},	
	
	showMain: function() {
		this.switchTo('main');
    },

	showError: function() {
		this.switchTo('error');
	},
	
	createDefect: function() {
		
		var ticketId = this.ticket().id();
		var ticketSubject = this.ticket().subject();
		var ticketDescription = this.ticket().description();
		var ticketStatus = this.ticket().status();
		var ticketPriority = this.ticket().priority();
		var ticketType = this.ticket().type();
		var currentAccount = this.currentAccount();
  	
		console.log('ID: ' + ticketId);
		console.log('Subject: ' + ticketSubject);
		console.log('Description: ' + ticketDescription);
		console.log('Status: ' + ticketStatus);
		console.log('Priority: ' + ticketPriority);
		console.log('Type: ' + ticketType);
		console.log('Url: https://' + currentAccount.subdomain() + '.zendesk.com/agent/#/tickets/' + ticketId);
		
		var xmlPayload = '<Asset>';
		xmlPayload += '<Relation name="Scope" act="set"><Asset idref="' + v1projectID + '" /></Relation>';
		xmlPayload += '<Attribute name="Name" act="set">' + ticketSubject + '</Attribute>';
		xmlPayload += '<Attribute name="Reference" act="set">' + ticketId + '</Attribute>';
		xmlPayload += '</Asset>';
		console.log('xmlPayload: ' + xmlPayload);

		var request = this.ajax('submitDefect', xmlPayload);
		//request.done(alert('Success!'));
		request.fail(this.showError);

	},
	
	showCredentials: function() {
		alert('URL: ' + v1url + '\nUsername: ' + v1username + '\nPassword: ' + v1password);
	}
	
	
  };

}());
