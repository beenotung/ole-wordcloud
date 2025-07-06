#!/bin/bash
set -e
set -o pipefail
rsync -SavLP dist ole-wordcloud.hkit.cc:~/workspace/github.com/beenotung/ole-wordcloud/server
