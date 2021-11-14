#!/bin/bash
set -e
set -o pipefail
rsync -SavLP dist fduat.com:~/workspace/github.com/beenotung/ole-wordcloud/server
