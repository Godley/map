from django.db import models
from geoposition.fields import GeopositionField

# Create your models here.
class Location(models.Model):
    name = models.CharField(max_length=100)
    position = GeopositionField()

    def __str__(self):
        return self.name


class Journey(models.Model):
    start = models.ForeignKey(Location, related_name="start")
    end = models.ForeignKey(Location)
    datetime = models.DateTimeField()
    duration = models.DurationField()
    route_id = models.CharField(max_length=40, default="")
    route_name = models.CharField(default="", max_length=40)
    method = models.CharField(max_length=40)

    def __str__(self):
        return "{} to {}".format(self.start, self.end)


class Stay(Location):
    datetime = models.DateTimeField()
    duration = models.DurationField()
    link = models.URLField(default="https://airbnb.co.uk")


class Activity(Location):
    link = models.URLField()
    cost = models.FloatField()
    datetime = models.DateField()