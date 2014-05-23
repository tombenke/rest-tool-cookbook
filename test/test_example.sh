#!/bin/bash

declare -rx SCRIPT_DESCRIPTION="Manual testing of the cookbook projects."
declare -rx SCRIPT=${0##*/}         # SCRIPT is the name of this script
declare -x test_project="basics"
declare -x rest_tool_cmd="rest-tool"

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
            "   [-h][--help]                : show this help and exit" \
            "   [-p \"<path-to-rest-tool>\"]   : define the path of the rest-tool command" \
            "   [-d \"<example-directory>\"]   : define the directory name of the example project to test (default: basics)" \
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
        rest_tool_cmd="$1"

        # Sanity check
        if test ! -x "$rest_tool_cmd" ; then
           printf "$SCRIPT:$LINENO: the command $rest_tool_cmd is not available — aborting\n " >&2
           exit 192
        fi
        ;;

    -d ) # Define the directory name of the example project to test
        shift
        if [ $# -eq 0 ] ; then
            printf  "$SCRIPT:$LINENO: %s\n" \
                    "command path for -d is missing" >&2
            exit 192
        fi
        test_project="$1"
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

# Print out the current rest-tool version used for testing
$rest_tool_cmd -V

test_example () {
    # Move into the project root folder
    cd examples/$1

    # Install node module dependencies
    # npm install

    # Update the documentation
    # rm -fr test/*
    $rest_tool_cmd test --update --overwrite
 
    # Update the test cases
    $rest_tool_cmd docs --update

    # Start the server
    node server/server.js &
    declare -rx server_pid=$!

    # Wait until server is stable and listening on port
    sleep 5

    # run the test cases
    mocha

    # Stop the server
    kill -9 $server_pid

}

# Run the tests on the examples
test_example $test_project

# Exit with success
exit 0
