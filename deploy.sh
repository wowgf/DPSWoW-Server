#!/bin/bash

cd /home/project/mz-wow-master-server
git pull
npm install
npm run build
npm run pm2:stop
npm run pm2:start