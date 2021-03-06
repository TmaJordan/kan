# kan
## Problem Statement
Agents spend much of their time updating managers and trying to organise information related to tasks manually. This time could be better spent completing their assigned tasks. Managers have no visibility into the progress or status of individual tasks without emailing or calling the owner of the task. This time could be better spent ensuring that projects are completed on-time.
## Mission Statement
The app will keep all of the information required for a task connected to the task and provide a simple view for agents to complete their workload in order of priority and in a timely manner. Managers will be able to view the progress of individual tasks as well as the current workload of each agent, ensuring that tasks are allocated in an efficient and fair manner.
##Installation
To install the app, simply clone the repository locally and run npm install to download all dependencies.
Before starting the application, you will need to set a number of environment variables for the app instance. To do this, create a file called ".env" in the root of the project and add the following keys with appropriate values:
* PORT= port number server will listen on e.g. 3000
* DB_HOST=url used to connect to mongo DB instance e.g. mongodb://localhost/kanapp
* EMAIL=email account used to send emails
* EMAIL_PASS=password for email account
* SERVER_LOC=URL of server root e.g. http://localhost:3000/
* JWT_SECRET= Secret used for generating JSON Web Tokens
* ORG_DOMAIN=Optional, limit new users to specific email domain e.g. gmail.com
* HTTPS=true //If this key is present, https will be enabled for the application. You will need to place the server.key and server.crt files in the sslcert directory
* ENVIRONMENT=dev //Optional, controlls error logging. Remove for production
 
Once this file is in place, start the app by running "npm start" from the project root.
## App Structure
###apidoc
Contains all of the documentation for the server routes
###config
Contains passport, nodemailer and other configuration settings
###models
Contains all of the mongoose models
###public
Contains the angular web app and all required resources for it.
* audio - Sounds which play using HTML5 Audio
* export - Where exported project csv files are saved
* images - All svg images required by app
* js - All javascript files
 * controllers - Angular controllers for different views
 * lib - 3rd Party libraries and widgets
 * services - Angular factory services used to fetch and update data
 * kan.js - Entry point to application
* style - All css files and any 3rd party styles for widgets
* templates - Angular templates used to display different views.
* uploads - Location that profile image uploads are stored.
###routes
Contains all of the defined express routes handling the different services
###sslcert
Place your ssl certs here if https is required
