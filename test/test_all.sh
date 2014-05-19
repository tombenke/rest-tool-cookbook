#!/bin/bash

declare -rx examples="basics crm-api monitor"

# Run the tests on the examples
declare SCRIPT_PATH=`dirname $0`;
# echo $SCRIPT_PATH

for example in $examples
do
    echo "${SCRIPT_PATH}/test_example.sh -d ${example}"
    ${SCRIPT_PATH}/test_example.sh -d ${example}
done

# Exit with success
exit 0
