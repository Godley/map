FROM python:3.5-alpine
COPY . /app
WORKDIR /app
EXPOSE 80
RUN pip install -r requirements.txt
CMD python manage.py runserver 0.0.0.0:80