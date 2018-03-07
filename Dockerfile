FROM python:3.5-alpine
COPY . /app
WORKDIR /app
EXPOSE 80
RUN apk add --no-cache nodejs git && \
    cd frontend && npm install && \
    npm run build && \
    mv build /app/build && \
    cd ../ && pip install -r backend/requirements.txt
CMD python backend/manage.py runserver 0.0.0.0:80