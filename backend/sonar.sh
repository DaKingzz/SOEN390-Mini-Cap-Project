#!/bin/bash
source .env
./mvnw clean verify sonar:sonar -Dsonar.token=$SONAR_TOKEN
