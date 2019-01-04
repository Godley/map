FROM python:3.7-alpine
RUN mkdir -p /app && mkdir -p /app/frontend && mkdir -p /app/backend
COPY ./frontend/package.json /app/frontend
COPY ./backend/requirements.txt /app/backend
WORKDIR /app
EXPOSE 80
ARG MAPBOX_API_KEY
RUN echo REACT_APP_MAPBOX_API_KEY=$MAPBOX_API_KEY > frontend/.env
RUN apk add nodejs nodejs-npm git python3-dev gcc musl-dev postgresql-dev
RUN cd frontend && npm install
RUN pip install -r backend/requirements.txt
COPY . /app
RUN cd frontend && npm run build && \
    mv build /app/build

ARG DJANGO_SECRET_KEY
ARG DATABASE_URL
RUN mkdir -p build && mkdir -p build/static && cd backend && python manage.py collectstatic --noinput
CMD python backend/manage.py runserver 0.0.0.0:80