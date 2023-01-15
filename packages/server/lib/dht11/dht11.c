#include <wiringPi.h>
#include <stdio.h>
#include <time.h>

#define DHT_PIN 1
#define TIME_BUF_SIZE 20

// send to sensor
int send() {
  pinMode(DHT_PIN, OUTPUT);
  digitalWrite(DHT_PIN, LOW);
  delay(20); // 18ms~ waiting after pull down
  digitalWrite(DHT_PIN, HIGH);
  delayMicroseconds(30); // 20~40us waiting after pull up
}

// receive from sensor
int receive() {
  pinMode(DHT_PIN, INPUT);
  while (digitalRead(DHT_PIN) != LOW); // keep 80us after pull down
  while (digitalRead(DHT_PIN) != HIGH); // keep 80us after pull up
  while (digitalRead(DHT_PIN) != LOW); // keep waiting for next bit after pull down
}

int readData() {
  int data[5] = {0, 0, 0, 0, 0};

  for (int i = 0; i < 40; i++) { // dht-11 has 40(5 * 8) bit data
    int count = 0;

    while (digitalRead(DHT_PIN) == LOW) { // data start with 50us LOW
      delayMicroseconds(1);
      count++;
      if (count >= 255) break;
    }

    count = 0;
    // when data keep for 26~28us, it means 0 bit
    // when data keep for 70us, it means 1 bit
    while (digitalRead(DHT_PIN) == HIGH) {
      delayMicroseconds(1);
      count++;
      if (count >= 255) break;
    }

    data[i / 8] <<= 1; // make digit and fill 0

    if (count > 28) {
      data[i / 8] |= 1; // fill 1 bit
    }
  }

  char timeBuf[TIME_BUF_SIZE];
  time_t now = time(NULL);
  strftime(timeBuf, TIME_BUF_SIZE, "%Y-%m-%dT%H:%M:%S", localtime(&now));

  if (data[4] != data[0] + data[1] + data[2] + data[3]) {
    printf("%s error - - \n", timeBuf);
    return -1;
  }

  printf("%s success %d.%d %d.%d\n", timeBuf, data[0], data[1], data[2], data[3]);
}

int main() {
  if (wiringPiSetup() < 0) return -1;

  while (1)
  {
    send();
    receive();
    readData();
    delay(1000 * 60 * 5); // 5 minute cycle
  }
}
