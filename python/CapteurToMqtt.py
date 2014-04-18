#!/usr/bin/python
import time
import os

pGazValue='0'
gazValue='0'

while True:
  f = open ("/sys/bus/iio/devices/iio:device0/in_voltage0_raw","r")
  gazValue = f.readline()
  if (gazValue != pGazValue):
    print "new gazValue : " + gazValue
    pGazValue = gazValue	    
    os.system("mosquitto_pub -h localhost -t capteur -m " + gazValue)
  f.close()
  time.sleep(1);