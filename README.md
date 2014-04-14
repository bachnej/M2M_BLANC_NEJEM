#M2M Project report

Ce projet est réalisé dans le cadre du cours M2M, et vise à mettre en place une infrastructure de collecte de données de capteur. Pour réaliser ce projet nous avons reçu une carte Intel Galileo ainsi qu'un capteur afin de disposer de tous les éléments pour la collecte d'informations. Le capteur fournit n'étant pas compatible avec notre carte, nous avons dans un premier temps simulé le capteur (avec des valeurs aléatoires) et dans un second temps emprunté un capteur pour la seconde partie de ce projet.

## Première partie 

La première partie consiste à utiliser la carte comme un micro-contrôleur relié à un ordinateur, via un port série, qui va relever les données et les publier à l'aide d'un message broker. Pour cela nous avons utilisé plusieurs frameworks et applications existantes et les avons combinées afin d'obtenir une chaîne de collecte d'informations complète. Les mesures sont archivées dans une base de données et en même temps publiées sur un serveur web. Nous avons réalisé un projet de collecte mais il est aussi possible d’exécuter des commandes depuis un site web avec ce que nous avons mis en place. 

###Les outils utilisés 
Pour la collecte de mesures nous utilisons un sketch Arduino qui est exécuté sur la carte Intel Galileo. Dans ce sketch nous ne lisons pas les valeurs de notre capteur, car celui ci ne fonctionne pas avec notre carte, mais générons des valeurs aléatoires entre 0 et 25*. Une fois les donnée récupérées nous utilisons le port série pour communiquer avec l'ordinateur et lui transmettre les mesures. Cette transmissions se fait périodiquement toutes les secondes. Cette communication série est ensuite capturée par le framework OpenHab qui va publier les données sous forme de messages MQTT destinés aux divers agents collecteurs. OpenHAB est écrit en Java et utilise l'architecture OSGI et le principe des bundles pour proposer différents services et permettre d'écrire rapidement des applications fonctionnelles. Nous utilisons le message broker open source Mosquitto ainsi qu'un outils de mashup nommé NodeRed pour créer les différents consommateurs de messages MQTT. Mosquitto est un broker MQTT léger (ce qui permet de le faire tourner sur une carte embarquée) et disponible dans plusieurs langages (python,C/C++). Ce broker est déployé dans un premier temps sur l'ordinateur relié à la carte Galileo mais dans la secondes partie sera embarqué. L'outil NodeRed est à installer sur l'ordinateur afin de créer des clients MQTT pour manipuler stocker et afficher les données publiées. Il est écrit en javascript et fonctionne avec nodejs. 

\* : La récupération des données d'un capteur sur un arduino n'étant pas une chose difficile nous n'expliquerons pas la procédure à suivre dans ce document.

###Etape 1 : Intel Galileo
Installer l'IDE Arduino dédié à l'utilisation des cartes Intel Galileo. Une fois l'IDE installé, il faut lancer un script Arduino (fichier .ino) qui récupère les mesures d'un capteur et les publie sur le port série qui communique avec l'ordinateur. Le sketch présent dans le dossier Arduino/sketch publie des mesures simulées toutes les secondes sur le port série. Il est possible de visualiser la sortie du port série dans l'IDE Arduino afin de s'assurer que cette étape fonctionne.

###Etape 2 : OpenHAB 
Récupérer le dossier OpenHAB. Afin de faire communiquer OpenHAB et notre serveur Mosquitto  nous devons configurer OpenHAB pour lui indiquer le broker à utiliser pour le binding MQTT. Le fichier contenant la configuration de OpenHAB est "OpenHAB/openhab-runtime-1/configurations/openhab_default.cfg" et la connexion au broker se fait de la manière suivante : 
>mqtt:local-mosquitto.url=tcp://localhost:1883  
>mqtt:local-mosquitto.clientId=openHABClient (optionnel)



## Seconde partie
Dans la seconde partie nous allons utiliser la carte comme un micro-processeur avec une distribution linux allégée. Nous allons utiliser la distribution linux pour exécuter un broker MQTT (Mosquitto) directement sur la carte et relier la carte à un ordinateur via un câble Ethernet. Il est aussi possible de relier la carte à un routeur mais cela importe peu. De cette manière nous nous passons d'OpenHAB pour l'émission des valeurs vers le broker et il est désormais possible de réaliser plusieurs taches avec la carte (tout comme sur une vraie machine). 


![alt tag](http://www.nasa.gov/images/content/693949main_pia15817-43_946-710.jpg)