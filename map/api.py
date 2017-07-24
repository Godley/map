from tastypie.resources import ModelResource, ALL
from map.models import Journey, Stay, Activity, Location
from tastypie import fields
from tastypie.authentication import SessionAuthentication

class LocationResource(ModelResource):
    class Meta:
        queryset = Location.objects.all()

class JourneyResource(ModelResource):
    start = fields.ForeignKey(LocationResource, 'start', full=True, full_list=True)
    end = fields.ForeignKey(LocationResource, 'end', full=True, full_list=True)
    class Meta:
        queryset = Journey.objects.all()
        resource_name = 'journey'
        filtering = {
            'method': ALL
        }
        authentication = SessionAuthentication()


class StayResource(ModelResource):
    class Meta:
        queryset = Stay.objects.all()
        resource_name = 'hotel'
        authentication = SessionAuthentication()


class ActivityResource(ModelResource):
    class Meta:
        queryset = Activity.objects.all()
        resource_name = 'activity'
        authentication = SessionAuthentication()