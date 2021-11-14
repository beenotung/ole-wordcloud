#!/bin/bash
set -e
set -o pipefail
rsync -SavLP www fduat.com:~/workspace/github.com/beenotung/ole-wordcloud/app
