#M2M Project report

Ce projet est réalisé dans le cadre du cours M2M, et vise à mettre en place une infrastructure de collecte de données de capteur. Pour réaliser ce projet nous avons reçu une carte Intel Galileo ainsi qu'un capteur afin de disposer de tous les éléments pour la collecte d'informations. Le capteur fournit n'étant pas compatible avec notre carte, nous avons dans un premier temps simulé le capteur (avec des valeurs aléatoires) et dans un second temps emprunté un capteur pour la seconde partie de ce projet.

## Première partie 

La première partie consiste à utiliser la carte comme un micro-contrôleur relié à un ordinateur, via un port série, qui va relever les données et les publier à l'aide d'un message broker. Pour cela nous avons utilisé plusieurs frameworks et applications existantes et les avons combinées afin d'obtenir une chaîne de collecte d'informations complète. Les mesures sont archivées dans une base de données et en même temps publiées sur un serveur web. Nous avons réalisé un projet de collecte mais il est aussi possible d’exécuter des commandes depuis un site web avec ce que nous avons mis en place. 

![Alt text](/images/Architecture1.jpg "Architecture première partie")

###Les outils utilisés 
Pour la collecte de mesures nous utilisons un sketch Arduino qui est exécuté sur la carte Intel Galileo. Dans ce sketch nous ne lisons pas les valeurs de notre capteur, car celui ci ne fonctionne pas avec notre carte, mais générons des valeurs aléatoires entre 0 et 25*. Une fois les donnée récupérées nous utilisons le port série pour communiquer avec l'ordinateur et lui transmettre les mesures. Cette transmissions se fait périodiquement toutes les secondes. Cette communication série est ensuite capturée par le framework OpenHab qui va publier les données sous forme de messages MQTT destinés aux divers agents collecteurs. OpenHAB est écrit en Java et utilise l'architecture OSGI et le principe des bundles pour proposer différents services et permettre d'écrire rapidement des applications fonctionnelles. Nous utilisons le message broker open source Mosquitto ainsi qu'un outils de mashup nommé NodeRed pour créer les différents consommateurs de messages MQTT. Mosquitto est un broker MQTT léger (ce qui permet de le faire tourner sur une carte embarquée) et disponible dans plusieurs langages (python,C/C++). Ce broker est déployé dans un premier temps sur l'ordinateur relié à la carte Galileo mais dans la secondes partie sera embarqué. L'outil NodeRed est à installer sur l'ordinateur afin de créer des clients MQTT pour manipuler stocker et afficher les données publiées. Il est écrit en javascript et fonctionne avec nodejs. 

\* : La récupération des données d'un capteur sur un arduino n'étant pas une chose difficile nous n'expliquerons pas la procédure à suivre dans ce document.

###Etape 1 : Intel Galileo
Installer l'IDE Arduino dédié à l'utilisation des cartes Intel Galileo. Une fois l'IDE installé, il faut lancer un script Arduino (fichier .ino) qui récupère les mesures d'un capteur et les publie sur le port série qui communique avec l'ordinateur. Le sketch présent dans le dossier Arduino/sketch publie des mesures simulées toutes les secondes sur le port série. Il est possible de visualiser la sortie du port série dans l'IDE Arduino afin de s'assurer que cette étape fonctionne.

###Etape 2 : OpenHAB 
Récupérer le dossier OpenHAB. Afin de faire communiquer OpenHAB et notre serveur Mosquitto  nous devons configurer OpenHAB pour lui indiquer le broker à utiliser pour le binding MQTT. Le fichier contenant la configuration de OpenHAB est "OpenHAB/openhab-runtime-1/configurations/openhab_default.cfg" et la connexion au broker se fait de la manière suivante : 

>mqtt:local-mosquitto.url=tcp://localhost:1883  
>mqtt:local-mosquitto.clientId=openHABClient (optionnel)

Il faut maintenant récupérer les données publiées sur le port série et les transmettre au broker. Il faut donc créer deux nouveaux items dans OpenHAB et cette création se fait dans le fichier "OpenHAB/openhab-runtime-1/configurations/items/demo.items". Nous créons un item de type String qui représente la mesure émise sur le port série que nous appelons SerialDevice.

>String SerialDevice                "CAPTEUR [%s]"   { serial="/dev/cu.usbmodem1a121" } 
>
>*Le nom du port série varie suivant les machines et leur système d'exploitation, il est à vérifier
>dans l'IDE Arduino, en bas à droite de la fenêtre de l'IDE. 

L'autre item est le message MQTT qui sera envoyé lors de la réception d'une nouvelle mesure. Ce message sera envoyé au broker nommé local-mosquitto (déclaré avant dans la configuration) et le topic du message sera "capteur". Les clients devront donc s'abonner au topic "capteur" pour recevoir les mesures. 

>String message_MQTT  { mqtt=">[local-mosquitto:capteur:state:*:default]" }

Une fois les items déclarés il suffit d'écrire la procédure d'envoie des mesures lors de la réception d'une nouvelle mesure sur le port série. Cela se fait facilement dans le fichier "OpenHAB/openhab-runtime-1/configurations/rules/demo.rules" auquel nous ajoutons la règle suivante : 

>rule MQTT_sending
>when
>       Item SerialDevice received update
>then
>	    postUpdate(message_MQTT,SerialDevice.state)
>end

Une fois la règle ajoutée il suffit d'exécuter OpenHAB (et le broker Mosquitto) pour voir que les mesures sont maintenant publiées sur le broker grâce à OpenHAB.

##Etape 3 : NodeRed et MongoDB
Récupérer le dossier NodeRed et installer la base de données MongoDB. Lors de son installation, MongoDB va créer une base "test" que nous utilisons pour stocker nos mesures. Une fois NodeRed exécuté, se rendre sur la page "localhost:1880" qui présente l'interface de NodeRed. Pour importer un projet il suffit de cliquer en haut à droite de la fenêtre et de sélectionner "Import from ... -> Clipboard ..." et de copier le code du projet. Le code à copier est le suivant  : 

>[{"id":"aacfc0c.f55304","type":"mqtt-broker","broker":"169.254.129.144","port":"1883","clientid":""},{"id":"f8c95da6.0736a","type":"mongodb","hostname":"127.0.0.1","port":"27017","db":"test","name":"MongoDB"},{"id":"1935a1e7.e6ca5e","type":"mqtt-broker","broker":"localhost","port":"1883","clientid":"node-red"},{"id":"a30fd3d2.5cf03","type":"mqtt in","name":"mqtt-pc","topic":"capteur","broker":"1935a1e7.e6ca5e","x":143,"y":79,"z":"58fcf25e.a7030c","wires":[["7cddad4f.832254"]]},{"id":"a7e89da.f58176","type":"debug","name":"","active":true,"complete":"true","x":572,"y":89,"z":"58fcf25e.a7030c","wires":[]},{"id":"4302a582.bcfd5c","type":"mongodb out","mongodb":"f8c95da6.0736a","name":"capteur_db","collection":"capteur","payonly":false,"operation":"store","x":578,"y":329,"z":"58fcf25e.a7030c","wires":[]},{"id":"7cddad4f.832254","type":"function","name":"add timestamp","func":"// The received message is stored in 'msg'\n// It will have at least a 'payload' property:\n//   console.log(msg.payload);\n// The 'context' object is available to store state\n// between invocations of the function\n//   context = {};\nmsg.timestamp = new Date().getTime();\n\nreturn msg;","outputs":1,"x":341,"y":220,"z":"58fcf25e.a7030c","wires":[["a7e89da.f58176","4302a582.bcfd5c"]]},{"id":"50e029a6.af1fd8","type":"mqtt in","name":"mqtt-carte","topic":"capteur","broker":"aacfc0c.f55304","x":143,"y":360,"z":"58fcf25e.a7030c","wires":[["7cddad4f.832254"]]}]

Aperçu du rendu :
![Alt text](/images/nodered.png "NodeRed screenshot")

Pour récupérer les messages MQTT nous utilisons des inputs:mqtt. Ces objets permettent de s'abonner à un topic et de récupérer les messages pour les transmettre à d'autres objets NodeRed. Ensuite le message est envoyé à une fonction qui y ajoute un timestamp. En sortie de cette fonction nous utilisons l'objet outputs:debug pour afficher ce que nous allons stocker et l'objet storage:mongodb pour stocker les mesures et leur timestamp dans une collection nommée "capteur". Une fois le paramétrage de mongoDB et du broker MQTT en place il est possible de déployer l'application pour commencer à stocker les messages émis sur le broker avec le topic "capteur". 


## Seconde partie
Dans la seconde partie nous allons utiliser la carte comme un micro-processeur avec une distribution linux allégée. Nous allons utiliser la distribution linux pour exécuter un broker MQTT (Mosquitto) directement sur la carte et relier la carte à un ordinateur via un câble Ethernet. Il est aussi possible de relier la carte à un routeur mais cela importe peu. De cette manière nous nous passons d'OpenHAB pour l'émission des valeurs vers le broker et il est désormais possible de réaliser plusieurs taches avec la carte (tout comme sur une vraie machine). 


