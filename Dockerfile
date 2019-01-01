FROM python:3.7-alpine
COPY . /app
WORKDIR /app
EXPOSE 80
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
RUN cd backend && python manage.py migrate && djcli ls settings.AUTH_USER_MODEL is_staff=1 username email is_superuser || djcli save settings.AUTH_USER_MODEL email=$DJANGO_SU_EMAIL username=$DJANGO_SU_NAME is_superuser=True is_staff=True first_name=Charlotte password=$DJANGO_SU_PASSWORD
CMD python backend/manage.py runserver 0.0.0.0:80