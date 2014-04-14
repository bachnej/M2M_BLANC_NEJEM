#!/usr/bin/python
import time
import os

pGazValue='0'
gazValue='0'

while True:
f = open ("/sys/bus/iio/devices/iio\:device0/in_voltage0_raw","r")
cat        /sys/bus/iio/devices/iio\:device0/in_voltage0_raw
gazValue = f.readline()
if (gazValue != pGazValue):
pGazValue = gazValue
os.system("mosquitto_pub -t capteur -m $gazValue")
f.close()
time.sleep(1);