#!/bin/bash

# Script to convert JSX files to TSX

# Function to convert a file from JSX to TSX
convert_file() {
    local file=$1
    local dir=$(dirname "$file")
    local filename=$(basename "$file" .jsx)
    local new_file="$dir/$filename.tsx"
    
    echo "Converting $file to $new_file"
    cp "$file" "$new_file"
    rm "$file"
}

# Find all JSX files in the src directory and convert them
find ./src -name "*.jsx" | while read file; do
    convert_file "$file"
done

echo "Conversion complete!"
