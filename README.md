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
Récupérer le dossier OpenHAB. Afin de faire communiquer OpenHAB et notre broker Mosquitto  nous devons configurer OpenHAB pour lui indiquer le broker à utiliser pour le binding MQTT. Le fichier contenant la configuration de OpenHAB est `OpenHAB/openhab-runtime-1/configurations/openhab_default.cfg` et la connexion au broker se fait de la manière suivante : 

>mqtt:local-mosquitto.url=tcp://localhost:1883  
>mqtt:local-mosquitto.clientId=openHABClient (optionnel)

Il faut maintenant récupérer les données publiées sur le port série et les transmettre au broker. Il faut donc créer deux nouveaux items dans OpenHAB et cette création se fait dans le fichier `OpenHAB/openhab-runtime-1/configurations/items/demo.items`. Nous créons un item de type String qui représente la mesure émise sur le port série que nous appelons SerialDevice.

>String SerialDevice                "CAPTEUR [%s]"   { serial="/dev/cu.usbmodem1a121" } 
>
>*Le nom du port série varie suivant les machines et leur système d'exploitation, il est à vérifier
>dans l'IDE Arduino, en bas à droite de la fenêtre de l'IDE. 

L'autre item est le message MQTT qui sera envoyé lors de la réception d'une nouvelle mesure. Ce message sera envoyé au broker nommé local-mosquitto (déclaré avant dans la configuration) et le topic du message sera `capteur`. Les clients devront donc s'abonner au topic `capteur` pour recevoir les mesures. 

>String message_MQTT  { mqtt=">[local-mosquitto:capteur:state:*:default]" }

Une fois les items déclarés il suffit d'écrire la procédure d'envoie des mesures lors de la réception d'une nouvelle mesure sur le port série. Cela se fait facilement dans le fichier `OpenHAB/openhab-runtime-1/configurations/rules/demo.rules` auquel nous ajoutons la règle suivante : 

>rule MQTT_sending
>when
>       Item SerialDevice received update
>then
>	    postUpdate(message_MQTT,SerialDevice.state)
>end

Une fois la règle ajoutée il suffit d'exécuter OpenHAB (et le broker Mosquitto) pour voir que les mesures sont maintenant publiées sur le broker grâce à OpenHAB.

##Etape 3 : NodeRed et MongoDB
Récupérer le dossier NodeRed et installer la base de données MongoDB. Lors de son installation, MongoDB va créer une base `test` que nous utilisons pour stocker nos mesures. Une fois NodeRed exécuté, se rendre sur la page `http://localhost:1880` qui présente l'interface de NodeRed. Pour importer un projet il suffit de cliquer en haut à droite de la fenêtre et de sélectionner "Import from ... -> Clipboard ..." et de copier le code du projet. Le code à copier est le suivant  : 

>[{"id":"aacfc0c.f55304","type":"mqtt-broker","broker":"169.254.129.144","port":"1883","clientid":""},{"id":"f8c95da6.0736a","type":"mongodb","hostname":"127.0.0.1","port":"27017","db":"test","name":"MongoDB"},{"id":"1935a1e7.e6ca5e","type":"mqtt-broker","broker":"localhost","port":"1883","clientid":"node-red"},{"id":"a30fd3d2.5cf03","type":"mqtt in","name":"mqtt-pc","topic":"capteur","broker":"1935a1e7.e6ca5e","x":143,"y":79,"z":"58fcf25e.a7030c","wires":[["7cddad4f.832254"]]},{"id":"a7e89da.f58176","type":"debug","name":"","active":true,"complete":"true","x":572,"y":89,"z":"58fcf25e.a7030c","wires":[]},{"id":"4302a582.bcfd5c","type":"mongodb out","mongodb":"f8c95da6.0736a","name":"capteur_db","collection":"capteur","payonly":false,"operation":"store","x":578,"y":329,"z":"58fcf25e.a7030c","wires":[]},{"id":"7cddad4f.832254","type":"function","name":"add timestamp","func":"// The received message is stored in 'msg'\n// It will have at least a 'payload' property:\n//   console.log(msg.payload);\n// The 'context' object is available to store state\n// between invocations of the function\n//   context = {};\nmsg.timestamp = new Date().getTime();\n\nreturn msg;","outputs":1,"x":341,"y":220,"z":"58fcf25e.a7030c","wires":[["a7e89da.f58176","4302a582.bcfd5c"]]},{"id":"50e029a6.af1fd8","type":"mqtt in","name":"mqtt-carte","topic":"capteur","broker":"aacfc0c.f55304","x":143,"y":360,"z":"58fcf25e.a7030c","wires":[["7cddad4f.832254"]]}]

Aperçu du rendu :
![Alt text](/images/nodered.png "NodeRed screenshot")

Pour récupérer les messages MQTT nous utilisons des inputs:mqtt. Ces objets permettent de s'abonner à un topic et de récupérer les messages pour les transmettre à d'autres objets NodeRed. Ensuite le message est envoyé à une fonction qui y ajoute un timestamp. En sortie de cette fonction nous utilisons l'objet outputs:debug pour afficher ce que nous allons stocker et l'objet storage:mongodb pour stocker les mesures et leur timestamp dans une collection nommée `capteur`. Une fois le paramétrage de mongoDB et du broker MQTT en place il est possible de déployer l'application pour commencer à stocker les messages émis sur le broker avec le topic `capteur`. 

###Etape 4 : MQTTPanel (ou presque)
Récupérer le dossier MQTTPanel. Ce dossier comporte un serveur web javascript (`server.js`) qui est exécuté sur le port 8081 avec nodejs et une page web (`index.html`) qui est la réponse du serveur à une requete (`localhost:8081/index`). Le serveur va utiliser la librairie `mqtt` pour se connecter au broker Mosquitto et récupérer les messages du topic `capteur`. Lors de la réception d'une nouvelle valeur, le serveur va pousser la valeur vers les clients avec l'utilisation de la librairie socket.io qui permet de faire de la communication temps réel entre le client et le serveur. Le client va afficher la liste des valeurs reçues à l'aide de la librairie NVD3.js qui est une surcouche de D3.js qui permet d'afficher des graphes en javascript. L'affichage est raffraichit à la réception d'une nouvelle mesure et permet donc un affichage temps réel des informations issues du capteur. Une seconde page est disponible à l'adresse `localhost:8081/resume` qui permet d'afficher l'ensemble des valeurs stockées dans la base de données MongoDB. La récupération se fait via le serveur avec l'utilisation de la librairie `mongodb` qui permet d'instancier un client MongoDB en javascript. Pour lancer le serveur web utiliser la commande `node server.js` et se rendre sur la page `http://localhost:8081/index` pour visualiser les données temps réel (`http://localhost:8081/resume` pour les données stockées dans MongoDB)


## Seconde partie
Dans la seconde partie nous allons utiliser la carte comme un micro-processeur avec une distribution linux allégée. Nous allons utiliser la distribution linux pour exécuter un broker MQTT (Mosquitto) directement sur la carte et relier la carte à un ordinateur via un câble Ethernet. Il est aussi possible de relier la carte à un routeur mais cela importe peu. De cette manière nous nous passons d'OpenHAB pour l'émission des valeurs vers le broker et il est désormais possible de réaliser plusieurs taches avec la carte (tout comme sur une vraie machine). 

![Alt text](/images/Architecture2.jpg "Architecture seconde partie")

### Connexion SSH avec la carte
Nous utilisons la distribution linux du projet Yocto nommée "clanton". La distribution est installée sur une micro SD qui est en suite insérée dans la carte avant son boot. Contrairement à la distribution de base, celle-ci intègre un serveur SSH et permet donc de communiquer avec la carte facilement et de manière sécurisé. Pour pouvoir établir cette connexion il faut relier la carte et l'ordinateur à l'aide d'un câble Ethernet et s'assurer que les deux périphériques soient dans le même réseau. Nous avons utilisé Wireshark pour capturer les paquets provenant de la carte et ainsi connaître son adresse IP. Une fois l'adresse connue, nous avons changé l'adresse IP de la carte réseau de l'ordinateur avec l'adresse IP de la carte +1. Par exemple si la carte dispose de l'adresse `15.125.125.12`, l'adresse de l'ordinateur sera `15.125.125.13`. Une fois qu'il est possible depuis l'ordinateur de pinger la carte, on peut établir une connexion SSH en tapant la commande suivante dans un terminal : `ssh root@ip_de_la_carte`. 

### Installation de Mosquitto
Pour installer Mosquitto il suffit de copier les fichiers source sur la carte et de taper les commandes suivantes à l'intérieur du dossier : `make` et `make install`.

### Script python
#### Interaction avec les GPIO
Maintenant que nous n'utilisons plus l'IDE Arduino, il va falloir récupérer les informations issues des GPIO directement depuis le système d'exploitation. Pour cette étape nous avons emprunté un capteur de gaz pour nous fournir des données. Nous allons utiliser sysfs pour lire l'information du capteur qui est un voltage sur la GPIO A0 et qui sera disponible sous forme de fichier. Les commandes pour utiliser la GPIO A0 en lecture sont les suivantes : 
>root@clanton:~# echo -n "37" > /sys/class/gpio/export
>
>root@clanton:~# echo -n "out" > /sys/class/gpio/gpio37/direction
>
>root@clanton:~# echo -n "0" > /sys/class/gpio/gpio37/value
>
source : http://www.malinov.com/Home/sergey-s-blog 

Le voltage appliqué sur l'entrée A0 est maintenant disponible dans un fichier. Pour l'afficher taper la commande `cat /sys/bus/iio/devices/iio\:device0/in_voltage0_raw`. Cette valeur est à traiter pour calculer la valeur de la grandeur mesurée avec le capteur. Pour le calcul se référer à la documentation constructeur du capteur. Pour notre projet nous n'avons pas traité ces valeurs. 

#### Lecture du fichier et publication MQTT en python
Dans le dossier python se trouve un script permettant la lecture du fichier contenant la valeur du capteur et la publication d'un message MQTT avec la valeur lue. Pour lire le fichier nous utilisons la commande système `cat`. Pour envoyer un message MQTT nous utilisons l'exécutable `mosquitto_pub` qui permet de publier un message dans un certain topic. La commande exécutée dans le script est la suivante `mosquitto_pub -t capteur -m message_to_send` et permet de publier sur le broker Mosquitto local dans le topic capteur. Le script va lire toutes les secondes le fichier et publier un message si la valeur à changée depuis la dernière lecture. 

### L'affichage et le stockage des données
Pour cette partie il suffit de reprendre le travail de la partie 1 et de modifier l'adresse du broker MQTT en renseignant l'adresse de la carte. L'ordinateur devra bien sur être lui aussi relié par un câble Ethernet à la carte et faire partit du même réseau. 
