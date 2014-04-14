#include <DHT.h> //Librairie pour le capteur DHT
  
#define DHTPIN 2 //Pin auquel est connecté le capteur DHT
 
#define DHTTYPE DHT11 //Si vous utiliser le DHT 11
//#define DHTTYPE DHT22 //Si vous utiliser le DHT 22  (AM2302)
//#define DHTTYPE DHT21 //Si vous utiliser le DHT 21 (AM2301)
 
const int intTimePause = 5000; //Par défaut on actualise les valeures toutes les 5 secondes
 
float fltHumidity; //Pourcentage d'humidité mesuré
float fltTemperature; //Température mesurée en Celsius
 
DHT dht(DHTPIN, DHTTYPE); //On initialise le capteur DHT
 
void setup(){}
 
void loop()
{
  fltHumidity = dht.readHumidity(); //On lit le pourcentage d'humidité
  fltTemperature = dht.readTemperature(); //On lit la température en degrés Celsuis
  if (isnan(fltTemperature) || isnan(fltHumidity)) //Si les valeures retournées ne sont pas des nombres :
  {
    Serial.print(" illisible"); //On affiche l'erreur
  }
  else
  {
    //mise en forme et affichage des informations sur le port série
    Serial.print("**************"); 
    Serial.print("Degres : ");
    Serial.print(fltTemperature);
    Serial.print((char)223);
    Serial.print("C"); //En degrés Celsuis
    Serial.print("Humidite : ");
    Serial.print(fltHumidity); //Affichage de l'humidité
    Serial.print("%");
  }
  delay(intTimePause); //On actualise les informations toutes les x millisecondes.
}
