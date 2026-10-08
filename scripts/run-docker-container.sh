#!/bin/bash

docker rm $(docker ps -a -q -f status=exited)
docker run --name fabtrakr-server-node-container -p 8001:8001 -v $(pwd)/src:/usr/src/app/src fabtrakr-server-node-image npm run start