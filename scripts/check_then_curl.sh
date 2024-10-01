#!/bin/bash

echo "" >> log.txt
echo "" >> log.txt
echo "**********************************************************" >> log.txt
echo "TASK DATE AND TIME: $(date)" >> log.txt
#important to have consistent naming so gitignore works
filename="eow.txt"

#check if our file exists, if not we create it
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
	curl https://tdifielddays.com/api/addperiod?p=Tac7h8WeVHZm3JffWdRmCBp5lHoL8lQ7dVdL850W0Dz >> log.txt
	echo "curl executed" >> log.txt
else
	echo "error: invalid character... please check eow.txt or remove the file" >> log.txt
	exit 1
fi

#modify first character
echo "$new" > "$filename" 

echo "character changed to $new" >> log.txt
exit 0

