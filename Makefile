ifneq (,$(wildcard ./.env))
    include .env
    export
endif

help:           ## Show this help.
	@grep -h "##" $(MAKEFILE_LIST) | grep -v fgrep | sed -e "s/\\$$//" | sed -e "s/##//"

FIND=find

# Convert paths to the correct format for Windows
ifeq ($(OS), Windows_NT)
    # IMG_DIR := $(subst /,\\,$(IMG_DIR))
	FIND=gfind
endif


AWS_PREFIX=/usr/share/nginx/
LOC_PREFIX=/usr/share/nginx/
INTERAKTIV_DOCS=html/interaktiv/docs/
INTERAKTIV_ATELIER=html/interaktiv/atelier/
SERVER=aws-server
BUNDLE=built/index.js

init:          	## Initialize the project.
	@npm init -y

install:        ## installs dependencies
	@npm install

build:          ## Bundle js code with rollup.
	@npm run build

build_local:    ## Bundle js code with rollup for local use.
	@npm run build
	sed -i "s|const BASE_URL = 'https://sebayt.ch/interaktiv/';  // AWS endpoint|const BASE_URL = 'http://localhost/interaktiv/';  // localhost endpoint|" built/index.js

push:           ## push to github
	git push origin main

upload:         ## Upload the bundle to the AWS server
	scp -r $(BUNDLE) $(SERVER):$(AWS_PREFIX)$(INTERAKTIV_DOCS)

upload_atelier: ## Upload the bundle to the AWS server
	scp -r $(BUNDLE) $(SERVER):$(AWS_PREFIX)$(INTERAKTIV_ATELIER)

load:           ## load the bundle to local nginx server
	cp -r $(BUNDLE) $(LOC_PREFIX)$(INTERAKTIV_DOCS)
