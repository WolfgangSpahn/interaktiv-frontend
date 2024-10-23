ifneq (,$(wildcard ./.env))
    include .env
    export
endif

help:           ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e "s/\\$$//" | sed -e "s/##//"

FIND=find

# Convert paths to the correct format for Windows
ifeq ($(OS), Windows_NT)
    # IMG_DIR := $(subst /,\\,$(IMG_DIR))
	FIND=gfind
endif

REMOTE_PATH=~/
EXTRACTION_PATH=/usr/share/nginx/html/interaktiv/docs/
SERVER=aws-server
BUNDLE=built/index.js

init:          	## Initialize the project.
	@npm init -y

install:        ## installs dependencies
	@npm install

build:          ## Bundle js code with rollup.
	@npm run build

push:           ## push to github
	git push origin main

upload:         ## Upload the docs to the server
	scp -r $(BUNDLE) $(SERVER):$(REMOTE_PATH)
