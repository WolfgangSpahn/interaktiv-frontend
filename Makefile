ifneq (,$(wildcard ./.env))
    include .env
    export
endif

help:           ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e "s/\\$$//" | sed -e "s/##//"

IMG_DIR = docs/images
FIND=find
# use env var PRESENTAION_NAME=presentation
QMD=$(PRESENTATION_NAME).qmd

DOCS_PATH=docs.tar.gz
REMOTE_PATH=~/
EXTRACTION_PATH=/usr/share/nginx/html/interaktiv/
SERVER = aws-server

# Convert paths to the correct format for Windows
ifeq ($(OS), Windows_NT)
    # IMG_DIR := $(subst /,\\,$(IMG_DIR))
	FIND=gfind
endif

init:          	## Initialize the project.
	@npm init -y

install:        ## installs dependencies
	@npm install

build: install  ## Bundle js code with rollup.
	@npm run build

render:	build   ## Render the markdown with quarto
	@quarto render $(QMD)

pdf:            ## Render the markdown with quarto
	@quarto render $(QMD) --to pdf

.PHONY: images
images: render        ## copy images to the docs folder
	cp images/*.webp $(IMG_DIR)
	cp images/*.gif $(IMG_DIR)
	cp -r images/icons/ $(IMG_DIR)

test:		   ## run pytest
	cd backend && make test

convert:		## Convert the png and jpq to webp
	find images/orig -type f \( -iname "*.png" -o -iname "*.jpg" \) -exec sh -c 'cwebp "$$1" -q 80 -o "$${1%.*}.webp"' _ {} \;

serve:          ## Serves the project
serve: build
	cd backend && make run

dev:
	cd backend && make dev

upload:  	 ## Upload the docs to the server
	scp -r $(DOCS_PATH) $(SERVER):$(REMOTE_PATH) && \
	ssh $(SERVER) "rm -rf $(EXTRACTION_PATH)docs" && \
	ssh $(SERVER) "tar -xvf $(REMOTE_PATH)$(DOCS_PATH) -C $(EXTRACTION_PATH)"
	

web:			## Serves the project in development mode
	cd docs && python -m http.server 5050

docker:			## Build the docker image
	docker build -t intro .

.PHONY: docs
docs:           ## package docs into a zip tarball
	cp pdfs/*.pdf docs && \
	tar -cvf docs.tar docs/ && gzip -9 docs.tar 
	echo "docs.tar.gz created"

clean:          ## clean up
	rm -rf docs
	rm -rf .quarto
	rm -rf node_modules
	rm -rf __pycache__ .pytest_cache
	gfind . -type f -name '*~' -delete
	cd backend && make clean

push:           ## push to github
	git push origin main

ssh_key: 	## make NEW ssh key
	ssh-keygen -t rsa -b 4096 -C "wolfgang.spahn@gmail.com"

ssh_gh_test:	## test github connection
	ssh -T git@github.com
