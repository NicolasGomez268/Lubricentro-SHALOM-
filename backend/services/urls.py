from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceOrderViewSet

router = DefaultRouter()
router.register(r'orders', ServiceOrderViewSet, basename='serviceorder')

urlpatterns = [
    path('', include(router.urls)),
]
