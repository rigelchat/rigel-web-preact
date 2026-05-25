# Source: https://motionarray.com/stock-video/seamless-looped-flight-through-blue-galaxie-and-stars-on-dark-background-2593282

ffmpeg -i "https://cms-public-artifacts.motionarray.com/content/motion-array/2593282/PRD-2593282-FUE7xWCaqr6iUa4I-original_playlist_1718228831.m3u8" \
    -c:v libx264 \
    -vf "scale=1920:-2:flags=lanczos" \
    -pix_fmt yuv420p \
    -an \
    -movflags +faststart \
    -preset veryslow \
    -tune film \
    -x264-params aq-mode=3:aq-strength=1.0 \
    -crf 24 \
    -map_metadata -1 \
    ./public/assets/videos/login-background.mp4

ffmpeg -i ./public/assets/videos/login-background.mp4 -vframes 1 -f image2 ./public/assets/videos/login-background.jpg