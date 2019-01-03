from django.db import models


class Transport(models.Model):
    name = models.CharField(max_length=20)
    color = models.CharField(max_length=6)

    def __str__(self):
        return "{} (#{})".format(self.name, self.color)

class Journey(models.Model):
    start = models.CharField(max_length=50, default="")
    end = models.CharField(max_length=50, default="")
    datetime = models.DateTimeField()
    route_info = models.CharField(max_length=200, default="{}")
    method = models.ForeignKey(Transport)

    def __str__(self):
        return "{} to {}".format(self.start, self.end)


class Stay(models.Model):
    lat = models.FloatField()
    lng = models.FloatField()
    datetime = models.DateTimeField()
    duration = models.DurationField()
    link = models.URLField(default="https://airbnb.co.uk")


class Activity(models.Model):
    location = models.CharField(max_length=50, default="")
    link = models.URLField()
    cost = models.FloatField()
    datetime = models.DateField()


