DX = /home/tombenke/topics/dx/bin/md2html.js
PAGE_TEMPLATE = pageTemplate.html

%.html: %.md
	node $(DX) -t $(PAGE_TEMPLATE) -i $< -o $@

all: rest.html \
	references.html

# .PHONY: clean
# clean:
# 	rm -f *.html
