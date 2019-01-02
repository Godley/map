from map.models import Journey, Transport
from django.conf.urls import url, include
from django.contrib.auth.models import User
from rest_framework import routers, serializers, viewsets

class TransportSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Transport
        fields = ('name', 'color')

# Serializers define the API representation.
class JourneySerializer(serializers.HyperlinkedModelSerializer):
    method = TransportSerializer()

    class Meta:
        model = Journey
        fields = ('start', 'end', 'datetime', 'method', 'route_info')

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

