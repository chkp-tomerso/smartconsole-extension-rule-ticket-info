/**
We use Javascript to:
- get the currently selected rule with the SmartConsole Extensions API available with the special "smxProxy" object
- asynchronously fetch ServiceNow information by calling our server-side servicenow-calls.php
- update UI elements with information from the selected rule "Ticket Number" and from ServiceNow
**/	

	var selectedLayer = {};
	var selectedRule = {};

	function isSmartConsoleExtension(){
		return typeof(smxProxy) != "undefined";
	}
	
	function getSmartConsoleExtensionContext(onContextReceived) {
		smxProxy.sendRequest("get-context", null, onContextReceived);
	}
	
	function commitChanges(commands) {
		smxProxy.sendRequest("request-commit", { "commands": commands },"onCommit");
	}
	

	/**
		gets the selected rule from the Security Management Server 
		in order to get its information from ServiceNow later.
	**/
	function getContext() {

		if (!isSmartConsoleExtension()){
			
			setError("This integration works only as a SmartConsole Extension.");
			return;
		}
		
		setStatus("Loading selected rule information...");
		getSmartConsoleExtensionContext("onContext");
	}
	
	/**
		After the context from the Security Management Server is received,
		we get the selected rule in order to get its data from ServiceNow.
	**/
	function onContext(context) {
		
		// parse the selected rule and layer.
		var triggeredEvent = context.event;		
		var objects = triggeredEvent.objects;
		for (i = 0; i < objects.length; i++){
			
			var element = objects[i];
			if(element.type == "access-layer"){
				selectedLayer = element;
			  }
		    else if (element.type == "access-rule"){
				selectedRule = element;
			}
		}
		
		// get the ticket number fmor the "custom field 2" 
		// (if you open SmartConsole you can see 
		// that the rule bottom pane has a Summary tab 
		// and the second custom field is called "Ticket Number")
		var ruleTicketNumberText = "No rule is selected.";
		var ruleTicketNumber = null;
		
		if (selectedRule["custom-fields"]){
			
			ruleTicketNumber = selectedRule["custom-fields"]["field-2"];
		}
		
		if (ruleTicketNumber) {
			
			setTicketNumber(ruleTicketNumber);
			loadTicketInformation(ruleTicketNumber);
		}
		else {
			
			setError("Rule Ticket Number is empty.");
		}
	}
	
	/**
		Connects to our PHP server in order to get the information from ServiceNow.
	**/
	function loadTicketInformation(ticketNumber) {
		
		const headers = {
			"User-Agent": "Mozilla/5.0",
			"Accept": "application/json",
			"Content-Type": "application/json"
		};
	
		const options = {
			method: "GET",
			headers: headers
		};
		
		const serviceNowApiUrl = 
			"servicenow-calls.php?ticket-number=" + ticketNumber;
			
		console.log("fetching request to " + serviceNowApiUrl + ", headers: " + JSON.stringify(headers));
		setStatus("Getting data from ServiceNow...");
		
		fetch(serviceNowApiUrl, options)
		.then(response => response.json())
		.catch(error => {

            const message = error.message ? error.message : error;
            setError(JSON.stringify(message));
        })
		.then(data => onServiceNowTicketInformation(data));	
	}
	
	/**
		This gets called when the PHP server has a response.
		In case the response is valid, we update the page with the details received from ServiceNow.
	**/
	function onServiceNowTicketInformation(data){

		const results = data["result"];
		
		if (!results) {
			
			document.getElementById("ticketnum").innerText = "Could not find ticket in ServiceNow.";
			return;
		}
		
		setTicketDataFromServiceNow(results);
	}
	
	/**
		Updates the page with the status of fetching data, 
		either from the Security Management Server or from ServiceNow.
	**/
	function setStatus(message) {
		
		console.log(message);
		document.getElementById("status").style.display = "block";
		document.getElementById("status").innerText = message;
		document.getElementById("ticketData").style.display = "none";
	}
	
	/**
		Displays an error message on the screen.
	**/
	function setError(message) {
		
		console.error(message);
		document.getElementById("status").style.display = "block";
		document.getElementById("status").innerText = message;
		document.getElementById("ticketNumber").style.display = "none";
		document.getElementById("ticketData").style.display = "none";
	}
	
	/**
		Gets a ticket number from the Security Management API 
		and updates the HTML page with the ticket number.
	**/
	function setTicketNumber(ticketNumber) {
		
		document.getElementById("status").style.display = "none";
		document.getElementById("ticketNumber").style.display = "block";
		document.getElementById("ticketnum").innerText = ticketNumber;
	}
	
	/**
		Gets a ticketInfo object from ServiceNow and populates the HTML page with the details.
	**/
	function setTicketDataFromServiceNow(ticketInfo) {
		
		document.getElementById("status").style.display = "none";
		document.getElementById("ticketData").style.display = "block";
		if (ticketInfo["questions"] && ticketInfo["questions"]["justification"]){
			
			document.getElementById("ticket_comments").innerText = ticketInfo["questions"]["justification"];
		}
		
		if (ticketInfo["stage"]){
			
			document.getElementById("servicenow_stage").innerText = ticketInfo["stage"];
		}
		
		if (ticketInfo["approval"]){
			
			document.getElementById("servicenow_approval").innerText = ticketInfo["approval"];
		}
		
		if (ticketInfo["created_date"]){
			
			document.getElementById("servicenow_ticket_creation_date").innerText = ticketInfo["created_date"];
		}
	}
	
	/**
		Once we have the ServiceNow ticket information, we can read the "ticket_comments" field from ServiceNow 
		and update the comments of the Access Control Rule at the Check Point Security Management Server.
		We will call commitChanges() which uses the SmartConsole Extension API 
		to ask the user to approve the changes.
	**/
	function synchronizeComments() {
		var comments = document.getElementById("ticket_comments").innerText;
		var commands = ["set access-rule layer "+selectedLayer.uid+" uid " +selectedRule.uid+ " comments \"" + comments + "\" --format json"];
		commitChanges(commands);
	}
	
	/**
		Runs after the user approves committing changes.
	**/
	function onCommit(result) {
	}