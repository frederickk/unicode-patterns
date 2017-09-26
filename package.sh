#!/usr/bin/env bash

NAME=$1
PLATFORM=${2:-'all'}

echo $NAME

# clean-up .DS_Store
find . -type f -name './src/*.DS_Store' -ls -delete

# package for Firefox
# $ ./package.sh foo
# $ ./package.sh foo all
# $ ./package.sh foo firefox
if [ $PLATFORM = 'firefox' ] || [ $PLATFORM = 'all' ]; then
  rm ./$NAME.xpi
  7z a $NAME.xpi ./src
fi

# package for Chrome
# $ ./package.sh foo
# $ ./package.sh foo all
# $ ./package.sh foo chrome
if [ $PLATFORM = 'chrome' ] || [ $PLATFORM = 'all' ]; then
    if [ -f ./$NAME.crx ]; then
        rm ./$NAME.crx
        /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --pack-extension=./src --pack-extension-key=./$NAME.pem
        mv ./src.crx ./$NAME.crx
    else
        echo "$NAME doesn't exist, no stress packing it up now"
        /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --pack-extension=./src
        mv ./src.crx ./$NAME.crx
        mv ./src.pem ./$NAME.pem
    fi

    rm ./$NAME.zip
    zip -r -X $NAME.zip ./src
fi


echo "$NAME Packaging complete!"
