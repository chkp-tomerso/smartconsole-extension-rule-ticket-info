# Rule Ticket Info - details from ServiceNow by Tomer Sole'

Read about SmartConsole Extensions and their Interaction Methods at https://sc1.checkpoint.com/documents/SmartConsole/Extensions/index.html

This integration is supported for SmartConsole of versions R80.20 and above.

Components
----------
manifest.json - describes the SmartConsole Extenion. In this case, it will add a tab to the bottom pane of the selected rule at the Access Control policy. 
index.html - the SmartConsole Extension page. It only fetches details from ServiceNow when it's hosted as a SmartConsole Extension.
js_interactions.js - uses the SmartConsole Extensions API to get the selected rule, fetch its details from ServiceNow using servicenow-calls.php, and also synchronize the comments from ServiceNow with the comments of the selected Access Control Rule.
instructions.html - After the user adds the SmartConsole Extension, a pop-up page shows where to find the newly added page.
style.css - styling for the HTML pages.
servicenow-calls.php - a very simple server-side page which given a ticket ID, gets the details of the ticket from ServiceNow. 


Installation instructions
-------------------------
1. Clone the repository or download its contents.
2. Install WampServer from http://www.wampserver.com/en/. WampServer is a simple PHP server that runs on Windows. We will use it to make a call to ServiceNow and fetch the rule details.
3. Enable HTTPS and SSL certificate at your WAMPServer because SmartConsole Extensions are only served over HTTPS. Guide is here: https://articlebin.michaelmilette.com/how-to-add-ssl-https-to-wampserver/
4. Place all contents at the installation folder of the WampServer, typically C:\wamp64\www\ 
5. Edit servicenow-calls.php with your specific ServiceNow instance, tables and commands, as well as the registry location of the login credentials for your ServiceNow instance.
6. Navigate to https://localhost/checkpoint-servicenow and if you see an HTML page that says “This integration works only as a SmartConsole Extension.” That means the site is working.
7. Open SmartConsole (R80.20 and above), go to Manage &amp; Settings, find Extensions, and add the extension from this URL: https://<your Windows IP>/checkpoint-servicenow/manifest.json
8. Still in SmartConsole, navigate to Security Policies and go to the Access Control Policy. Now you can find a new tab, ServiceNow Information, at the bottom part of the Access Control Policy. Clicking a rule gets its "ticket info", which is the second custom field at the "Summary" tab at the bottom pane of the rule, then calls servicenow-calls.php with the ticket info, and writes the response at the page.

For troubleshooting SmartConsole Extensions, see https://sc1.checkpoint.com/documents/SmartConsole/Extensions/index.html?ref=hands-on