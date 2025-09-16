# To convert a set of webp images to a smaller size and quality
for f in *.webp ; convert "$f" -coalesce -quality 50 -resize 128x -define webp:lossless=false,method=6 "compressed_${f%}" ;

# Convert all .wav files to mp3
find . -type f -name "*.wav" -exec bash -c 'ffmpeg -i "$0" -vn -acodec libmp3lame -ab 192k "$(dirname "$0")/$(basename "${0%.*}").mp3"' {} \;

# Delete all files in all sub-directories with the word "compressed" in it
find . -type f -name "compressed_*" -delete

# Delete all .wav files
find . -type f -name "*.wav" -delete

# Compress music mp3 files
find . -maxdepth 1 -type f \( -name "*.mp3" -o -name "*.m4a" \) -exec bash -c 'ffmpeg -i "$1" -c:a aac -b:a 96k "${1%.*}_compressed2.m4a"' _ {} \;