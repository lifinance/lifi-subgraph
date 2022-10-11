#!/bin/bash
echo "_—_—_—_— deploy all contracts _—_—_—_—"

allChains=("eth" "ava" "bsc" "cel" "ftm" "moo" "pol")
numChains=${#allChains[@]}
echo "Number of chains to deploy: ${numChains}"
counter=0;
for (( i=0; i<${numChains}; i++ ));
do
    echo "deploying ${allChains[$i]} ..."
    yarn "deploy:${allChains[$i]}"
    if [ $? -ne 0 ]
    then
        echo "!!! failed to deploy ${allChains[$i]}"
        echo "exiting..."
        exit 1;
    else
    then 
        counter = counter + 1;
    fi
done