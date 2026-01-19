from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, VehicleViewSet

router = DefaultRouter()
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'vehicles', VehicleViewSet, basename='vehicle')

urlpatterns = [
    path('', include(router.urls)),
]
