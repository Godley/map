FROM python:3.7-alpine
COPY . /app
WORKDIR /app
EXPOSE 80
ARG MAPBOX_API_KEY
RUN echo REACT_APP_MAPBOX_API_KEY=$MAPBOX_API_KEY > frontend/.env
RUN apk add --no-cache --update nodejs nodejs-npm git python3-dev gcc musl-dev postgresql-dev && \
    cd frontend && npm install && \
    npm run build && \
    mv build /app/build && \
    cd ../ && pip install -r backend/requirements.txt
ENV DJANGO_DB_NAME=default
ENV DJANGO_SU_NAME=admin
ENV DJANGO_SU_EMAIL=me@charlottegodley.co.uk
ARG DJANGO_SU_PASSWORD
ARG DJANGO_SECRET_KEY
ARG DATABASE_URL

RUN cd backend && python manage.py migrate && mkdir -p ../build && mkdir -p ../build/static && python manage.py collectstatic --noinput
CMD python backend/manage.py runserver 0.0.0.0:80