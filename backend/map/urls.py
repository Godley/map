from map.models import Journey, Transport, Stay, Activity, Trip
from django.conf.urls import url, include
from django.contrib.auth.models import User
from rest_framework import routers, serializers, viewsets


class TransportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transport
        fields = ('name', 'color')


# Serializers define the API representation.
class JourneySerializer(serializers.ModelSerializer):
    method = TransportSerializer()

    class Meta:
        model = Journey
        fields = ('start', 'end', 'day', 'method', 'route_info')


class StaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Stay
        fields = ('lat', 'lng', 'day', 'link', 'name', 'end_day')


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ('name', 'day', 'cost', 'link')


class TripSerializer(serializers.ModelSerializer):
    journeys = JourneySerializer(many=True)
    stays = StaySerializer(many=True)
    activities = ActivitySerializer(many=True)

    class Meta:
        model = Trip
        fields = ('start_date', 'end_date', 'country', 'journeys', 'activities', 'stays')


class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer


# Routers provide an easy way of automatically determining the URL conf.
router = routers.DefaultRouter()
router.register(r'trips', TripViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]

