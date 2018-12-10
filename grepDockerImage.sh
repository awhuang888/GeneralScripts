#!/bin/bash

docker image list | grep '<none>' | awk '{print $3}' | xargs