# Map
A Django/React web app for managing travel plans.

# Installation & Usage
```
docker build -t map .
docker run -p 127.0.0.1:8080:80 -e DJANGO_SECRET_KEY=$DJANGO_SECRET_KEY -e GMAPS_KEY=$GMAPS_KEY -d map
```

Recommend deploying this via now.sh - I have it configured to do this for my account via travis.