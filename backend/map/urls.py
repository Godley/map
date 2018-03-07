from map.models import Journey, Stay, Activity, Location, Transport
from django.conf.urls import url, include
from django.contrib.auth.models import User
from rest_framework import routers, serializers, viewsets

class LocationSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Location
        fields = ('name', 'position')

class TransportSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Transport
        fields = ('name', 'color')

# Serializers define the API representation.
class JourneySerializer(serializers.HyperlinkedModelSerializer):
    start = LocationSerializer(read_only=True)
    end = LocationSerializer(read_only=True)
    method = TransportSerializer()

    class Meta:
        model = Journey
        fields = ('start', 'end', 'datetime', 'duration', 'route_id', 'route_name', 'price', 'method')

# ViewSets define the view behavior.
class JourneyViewSet(viewsets.ModelViewSet):
    queryset = Journey.objects.all()
    serializer_class = JourneySerializer

# Routers provide an easy way of automatically determining the URL conf.
router = routers.DefaultRouter()
router.register(r'journeys', JourneyViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]

