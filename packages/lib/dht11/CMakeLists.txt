cmake_minimum_required(VERSION 3.21)

project(dht11)

set(CMAKE_C_COMPILER /usr/bin/gcc)
set(CMAKE_CXX_COMPILER /usr/bin/g++)

include_directories(/usr/local/include)
link_directories(/usr/local/lib)

add_executable(${PROJECT_NAME} dht11.c)

target_link_libraries(${PROJECT_NAME} PRIVATE wiringPi)
