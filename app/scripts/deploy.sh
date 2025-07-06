#!/bin/bash
set -e
set -o pipefail
rsync -SavLP www hkit.cc:~/workspace/github.com/beenotung/ole-wordcloud/app
