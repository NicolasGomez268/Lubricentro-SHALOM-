from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceOrderViewSet, InvoiceViewSet

router = DefaultRouter()
router.register(r'orders', ServiceOrderViewSet, basename='serviceorder')
router.register(r'invoices', InvoiceViewSet, basename='invoice')

urlpatterns = [
    path('', include(router.urls)),
]
