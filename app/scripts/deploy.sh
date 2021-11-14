#!/bin/bash
set -e
set -o pipefail
rsync www fduat.com:~/workspace/github.com/beenotung/ole-wordcloud/app
