<?php

	/* 
	
	The server-side part of the Check Point - ServiceNow integration:
	Receives the ticket number parameter, then makes an API call to ServiceNow 
	to fetch the details of the ticket.
	The reason why we need this PHP page is to avoid Javascript cross-site-scripting, 
	and also to use the ServiceNow API admin credentials in a safe manner.
	
	*/
	
	header('Content-Type: application/json');
	
	$request = json_decode(file_get_contents("php://input"),true);
	$ticketNumber = $_GET["ticket-number"];
	
	// Note: we get the ServiceNow login credentials from the registry.
	$keyConst = HKEY_LOCAL_MACHINE;
	$key = "SOFTWARE\ServiceNowSmartConsoleExtension";
	if (!($reg = reg_open_key($keyConst, $key))) {
		throw new Exception("Cannot access registry.");
	}
	$credentials = reg_get_value($reg, "logininfo");

	
	// Note: Other users are most likely to change this address, and the tables. They are specific to my environment.
	$query = "https://dev57863.service-now.com/api/x_159908_firewallr/firewall_request/fetch_request?number=".$ticketNumber;
		
	$curl = curl_init($query);
	
	curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
	curl_setopt($curl, CURLOPT_USERPWD, $credentials);
	curl_setopt($curl, CURLOPT_VERBOSE, 1);
	curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
	
	$response = curl_exec($curl);
	echo $response;
?>

