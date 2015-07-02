#!/usr/bin/env bash
set -e


function main {
  case "$1" in

    "bt" )
      testbackend;;

    "ut" )
      testjsunit;;

    "ft" )
      testfunctional;;

    "at" )
      testbackend
      testjsunit
      testfunctional;;

    esac
}


function testbackend {
  source eums/bin/activate
  python manage.py test
}

function testjsunit {
  cd eums/client
  grunt unit
  cd -
}

function testfunctional {
  cd eums/client
  grunt functional
  cd -
}


main $@
exit 0
