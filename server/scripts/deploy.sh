#!/bin/bash

echo What should the version be?
read VERSION

docker build -t ronnevinkx/lireddit:$VERSION .
docker push ronnevinkx/lireddit:$VERSION

ssh root@142.93.234.17 "docker pull ronnevinkx/lireddit:$VERSION && docker tag ronnevinkx/lireddit:$VERSION dokku/api:latest && dokku tags:deploy api latest"