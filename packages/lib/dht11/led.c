#include <wiringPi.h>

void on(int pinNum) {
  digitalWrite(pinNum, HIGH);
}

void off(int pinNum) {
  digitalWrite(pinNum, LOW);
}