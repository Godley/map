FROM python:3.6-alpine
COPY . /app
WORKDIR /app
EXPOSE 8000
RUN pip install -r requirements.txt
CMD ["python", "manage.py", "runserver"]