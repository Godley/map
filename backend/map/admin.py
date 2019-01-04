from django.contrib import admin
from map.models import Journey, Stay, Activity, Transport, Trip

admin.site.register(Trip)
admin.site.register(Journey)
admin.site.register(Stay)
admin.site.register(Activity)
admin.site.register(Transport)