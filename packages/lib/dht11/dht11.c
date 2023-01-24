#include <wiringPi.h>
#include <fcntl.h>
#include <stdio.h>
#include <string.h>
#include <time.h>
#include <unistd.h>

#define DHT_PIN 1
#define TIME_BUF_SIZE 40
#define DATE_BUF_SIZE 10
#define INT_DIGITS 19

// send to sensor
void send() {
  pinMode(DHT_PIN, OUTPUT);
  digitalWrite(DHT_PIN, LOW);
  delay(20); // 18ms~ waiting after pull down
  digitalWrite(DHT_PIN, HIGH);
  delayMicroseconds(30); // 20~40us waiting after pull up
}

// receive from sensor
void receive() {
  pinMode(DHT_PIN, INPUT);
  while (digitalRead(DHT_PIN) != LOW); // keep 80us after pull down
  while (digitalRead(DHT_PIN) != HIGH); // keep 80us after pull up
  while (digitalRead(DHT_PIN) != LOW); // keep waiting for next bit after pull down
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
  char path[30] = "./log/"; // 4
  char dateBuf[DATE_BUF_SIZE];

  datetime(dateBuf, DATE_BUF_SIZE, "%Y%m%d"); // 8
  strcat(path, dateBuf);
  strcat(path, ".log"); // 4
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
  datetime(timeBuf, TIME_BUF_SIZE, "%Y-%m-%dT%H:%M:%S");

  if (data[4] != data[0] + data[1] + data[2] + data[3]) {
    strcat(timeBuf, " error - -\n");
    writeFile(timeBuf);
    return -1;
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
  return 1;
}

int main(int argc, char* argv) {
  if (wiringPiSetup() < 0) return -1;

  while (1) {
    send();
    receive();
    readData();
    delay(1000 * 60 * 5); // 5 minute cycle
  }
}
