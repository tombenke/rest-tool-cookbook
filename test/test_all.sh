#!/bin/bash

declare -rx examples="basics crm-api monitor"

# Run the tests on the examples
declare SCRIPT_PATH=`dirname $0`;
declare -x rest_tool_path=""

# Process the parameters
while [ $# -gt 0 ] ; do
    case "$1" in
    -h | --help) # Show help
        printf "%s\n" \
            "Usage: " \
            "$SCRIPT [OPTION]..." \
            "$SCRIPT_DESCRIPTION" \
            "" \
            "Options:" \
            "   [-h][--help]                   : show this help and exit" \
            "   [-p \"<path-to-rest-tool>\"]   : define the path of the rest-tool command" \
            " " \
        exit 0
        ;;

    -p ) # Define the path to the rest-tool command
        shift
        if [ $# -eq 0 ] ; then
            printf  "$SCRIPT:$LINENO: %s\n" \
                    "command path for -p is missing" >&2
            exit 192
        fi
        rest_tool_path="$1"
        ;;

    -* ) # Unsupported switch
        printf  "$SCRIPT:$LINENO: %s\n" \
                "switch $1 not supported" >&2
        exit 192
        ;;

     * ) # Extra argument of missing switch
        printf "$SCRIPT:$LINENO: %s\n" \
               "extra argument or missing switch: $1" >&2
        exit 192
        ;;
    esac
    shift
done


for example in $examples
do
    case "$rest_tool_path" in
    "")
        echo "${SCRIPT_PATH}/test_example.sh -d ${example}"
        ${SCRIPT_PATH}/test_example.sh -d ${example}
        ;;
    *)
        ${SCRIPT_PATH}/test_example.sh -d ${example} \
        -p $rest_tool_path
        echo "${SCRIPT_PATH}/test_example.sh -d ${example} -p ${rest_tool_path}"
    esac
done

# Exit with success
exit 0
