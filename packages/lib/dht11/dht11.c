#include <wiringPi.h>
#include <fcntl.h>
#include <math.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>
#include "led.c"

#ifndef max
#define max(a, b)  (((a) > (b)) ? (a) : (b))
#endif

#ifndef min
#define min(a, b)  (((a) < (b)) ? (a) : (b))
#endif

#define PIN_DHT 1
#define PIN_GREEN 25
#define PIN_RED 27

#define TIME_BUF_SIZE 40
#define DATE_BUF_SIZE 10
#define INT_DIGITS 19

// send to sensor
void send() {
  pinMode(PIN_DHT, OUTPUT);
  digitalWrite(PIN_DHT, LOW);
  delay(20); // 18ms~ waiting after pull down
  digitalWrite(PIN_DHT, HIGH);
  delayMicroseconds(30); // 20~40us waiting after pull up
}

// receive from sensor
void receive() {
  pinMode(PIN_DHT, INPUT);
  while (digitalRead(PIN_DHT) != LOW); // keep 80us after pull down
  while (digitalRead(PIN_DHT) != HIGH); // keep 80us after pull up
  while (digitalRead(PIN_DHT) != LOW); // keep waiting for next bit after pull down
}

void datetime(char* buf, size_t bufSize, const char* format) {
  time_t now = time(NULL);
  strftime(buf, bufSize, format, localtime(&now));
}

char* itoa(int i) {
  static char buf[INT_DIGITS + 2];
  char* p = buf + INT_DIGITS + 1; // \0

  if (i < 0) return "";

  do {
    *--p = '0' + (i % 10);
    i  /= 10;
  } while (i != 0);

  return p;
}

int writeFile(char* message) {
  printf("%s\n", message);
  char path[30] = "/var/log/dht11/"; // 16-bit
  char dateBuf[DATE_BUF_SIZE];

  datetime(dateBuf, DATE_BUF_SIZE, "%Y%m%d"); // 8-bit
  strcat(path, dateBuf);
  strcat(path, ".log"); // 4-bit
  printf("log file path is %s\n", path);

  int flag = O_RDWR | O_CREAT | O_APPEND;
  int fd;
  
  if ((fd = open(path, flag, 0644)) < 0) {
    printf("cannot open the file\n");
    return -1;
  }

  if (write(fd, message, strlen(message)) < 0) {
    printf("cannot write the file\n");
    close(fd);
    return -1;
  };
  
  close(fd);
  return 1;
}

int readData(int* data) {
  for (int i = 0; i < 40; i++) { // dht-11 has 40(5 * 8) bit data
    int count = 0;

    while (digitalRead(PIN_DHT) == LOW) { // data start with 50us LOW
      delayMicroseconds(1);
      count++;
      if (count >= 255) break;
    }

    count = 0;
    // when data keep for 26~28us, it means 0 bit
    // when data keep for 70us, it means 1 bit
    while (digitalRead(PIN_DHT) == HIGH) {
      delayMicroseconds(1);
      count++;
      if (count >= 255) break;
    }

    data[i / 8] <<= 1; // make digit and fill 0

    if (count > 28) {
      data[i / 8] |= 1; // fill 1 bit
    }
  }

  if (data[4] != data[0] + data[1] + data[2] + data[3]) return -1; // checksum
  return 1;
}

void logTime(int* data, bool success) {
  char timeBuf[TIME_BUF_SIZE];
  datetime(timeBuf, TIME_BUF_SIZE, "%Y-%m-%dT%H:%M:%S");

  if (!success) {
    strcat(timeBuf, " error - -\n");
    writeFile(timeBuf);
    return;
  }

  strcat(timeBuf, " success ");
  strcat(timeBuf, itoa(data[0]));
  strcat(timeBuf, ".");
  strcat(timeBuf, itoa(data[1]));
  strcat(timeBuf, " ");
  strcat(timeBuf, itoa(data[2]));
  strcat(timeBuf, ".");
  strcat(timeBuf, itoa(data[3]));
  strcat(timeBuf, "\n");
  writeFile(timeBuf);
}

void setLimit(int* limit, int argc, char** argv) {
  switch (argc) {
    case 5:
      limit[3] = min(limit[3], atoi(argv[4]));
    case 4:
      limit[2] = max(limit[2], atoi(argv[3]));
    case 3:
      limit[1] = min(limit[1], atoi(argv[2]));
    case 2:
      limit[0] = max(limit[0], atoi(argv[1]));
  }
}

void reset(int* data, int limit) {
  int i = 0;

  while (i < limit) data[i++] = 0;
}

bool valid(int* data, int* limit) {
  float humidity = data[0] + data[1] * 0.1;
  float temperature = data[2] + data[3] * 0.1;

  bool valid = (humidity >= limit[0] && humidity <= limit[1]) &&
    (temperature >= limit[2] && temperature <= limit[3]);

  return valid;
}

void mailWarning(int* data) {
  char commandBuf[30] = "./warning.sh ";

  strcat(commandBuf, itoa(data[0]));
  strcat(commandBuf, ".");
  strcat(commandBuf, itoa(data[1]));
  strcat(commandBuf, " ");
  strcat(commandBuf, itoa(data[2]));
  strcat(commandBuf, ".");
  strcat(commandBuf, itoa(data[3]));

  system(commandBuf);
}

void setNormal() {
  on(PIN_GREEN);
  off(PIN_RED);
}

void setWarning() {
  off(PIN_GREEN);
  on(PIN_RED);
}

/**
 * @param argv[1] humidity_low. default 20
 * @param argv[2] humidity_high. default 90
 * @param argv[3] temperature_low. default 0
 * @param argv[4] temperature_high. default 50
*/
int main(int argc, char** argv) {
  if (wiringPiSetup() < 0) return -1;

  int data[5] = {0, 0, 0, 0, 0};
  int limit[4] = {20, 90, 0, 50};

  setLimit(limit, argc, argv);

  pinMode(PIN_GREEN, OUTPUT);
  pinMode(PIN_RED, OUTPUT);

  while (1) {
    send();
    receive();

    if (readData(data) < 0) { // checksum failed
      logTime(data, false);
    } else {
      if (valid(data, limit)) setNormal();
      else {
        setWarning();
        mailWarning(data);
      }
      logTime(data, true);
    }

    reset(data, 5);
    delay(1000 * 60 * 5); // 5 minute cycle
  }
}
