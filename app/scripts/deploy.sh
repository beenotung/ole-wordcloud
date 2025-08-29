#!/bin/bash
set -e
set -o pipefail
rsync -SavLP www node@ole-wordcloud.hkit.cc:~/workspace/github.com/beenotung/ole-wordcloud/app
