#!/bin/bash

echo "" >> log.txt
echo "" >> log.txt
echo "**********************************************************" >> log.txt
echo "TASK DATE AND TIME: $(date)" >> log.txt
#important to have consistent naming so gitignore works
filename="eow.txt"

#if this file does not exist we create it
if [ ! -f "$filename" ]; then
	echo "1" >> "$filename"
	echo "eow not found, created file & set 1" >> log.txt
fi

#get first character of eow
first=$(head -c 1 "$filename")


if [ "$first" = 0 ]; then
	new="1"
	echo "in case 0" >> log.txt
elif [ "$first" = 1 ]; then
	new="0"
	echo "in case 1" >> log.txt
	curl google.com >> log.txt
	echo "curl executed" >> log.txt
else
	echo "error: invalid character... please check eow.txt or remove the file" >> log.txt
	exit 1
fi

sed -i "1s/^./$new/" "$filename"

echo "character changed to $new" >> log.txt
exit 1

