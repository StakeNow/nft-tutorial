#!/bin/bash

docker run --rm --name flextesa-sandbox -e block_time=3  -e flextesa_node_cors_origin="*" --detach -p 20000:20000 oxheadalpha/flextesa:20230313 mumbaibox start
