from django.db import models


class Trip(models.Model):
    country = models.CharField(max_length=50, default="USA")
    start_date = models.DateField()
    end_date = models.DateField()


class Transport(models.Model):
    name = models.CharField(max_length=20)
    color = models.CharField(max_length=6)

    def __str__(self):
        return "{} (#{})".format(self.name, self.color)


class Journey(models.Model):
    trip = models.ForeignKey(Trip, related_name='journeys', on_delete=models.CASCADE)
    start = models.CharField(max_length=50, default="")
    end = models.CharField(max_length=50, default="")
    day = models.IntegerField()
    route_info = models.CharField(max_length=200, default="{}")
    method = models.ForeignKey(Transport)

    def __str__(self):
        return "{} to {}".format(self.start, self.end)


class Stay(models.Model):
    trip = models.ForeignKey(Trip, related_name="stays", on_delete=models.CASCADE)
    name = models.CharField(max_length=50, default="")
    lat = models.FloatField()
    lng = models.FloatField()
    day = models.IntegerField()
    end_day = models.IntegerField()
    link = models.URLField(default="https://airbnb.co.uk")


class Activity(models.Model):
    trip = models.ForeignKey(Trip, related_name="activities", on_delete=models.CASCADE)
    name = models.CharField(max_length=50, default="")
    link = models.URLField()
    cost = models.FloatField()
    day = models.IntegerField()


