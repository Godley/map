from django.contrib import admin
from map.models import Location, Journey, Stay, Activity, Transport


# Register your models here.
admin.site.register(Location)
admin.site.register(Journey)
admin.site.register(Stay)
admin.site.register(Activity)
admin.site.register(Transport)