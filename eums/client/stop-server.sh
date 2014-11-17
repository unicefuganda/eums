#!/bin/bash
echo "stop django server"
kill -9 $(lsof -t -i:8000)
echo "drop test database"
dropdb eums_test