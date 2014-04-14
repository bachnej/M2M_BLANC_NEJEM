M2M_BLANC_NEJEM
===============

M2M Project
M2M_REPORT

Ce projet est réalisé dans le cadre du cours M2M, et vise à mettre en place une infrastructure de collecte de données de capteur.  Pour réaliser ce projet nous avons reçu une carte Intel Galileo ainsi qu'un capteur afin de disposer de tous les éléments pour la collecte d'informations. Le capteur fournit n'étant pas compatible avec notre carte, nous avons dans un premier temps simulé le capteur (avec des valeurs aléatoires)  et dans un second temps emprunté un capteur pour la seconde partie de ce projet.

PREMIERE PARTIE

La première partie consiste à utiliser la carte comme un micro-contrôleur relié à un ordinateur, via un port série, qui va relever les données et les publier à l'aide d'un message broker. Pour cela nous avons utilisé plusieurs frameworks et applications existantes et les avons combinées afin d'obtenir une chaîne de collecte d'informations complète.  Les mesures sont archivées dans une base de données et en même temps publiées sur un serveur web. Nous avons réalisé un projet de collecte mais il est aussi possible d’exécuter des commandes depuis un site web avec ce que nous avons mis en place. 



![alt tag](http://www.nasa.gov/images/content/693949main_pia15817-43_946-710.jpg)