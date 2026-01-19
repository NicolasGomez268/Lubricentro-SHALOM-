from rest_framework import serializers
from .models import ServiceOrder, ServiceItem
from crm.serializers import VehicleSerializer, CustomerSerializer
from inventory.serializers import ProductSerializer


class ServiceItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    
    class Meta:
        model = ServiceItem
        fields = [
            'id',
            'item_type',
            'product',
            'product_details',
            'description',
            'quantity',
            'unit_price',
            'subtotal',
            'created_at'
        ]
        read_only_fields = ['subtotal', 'created_at']


class ServiceOrderSerializer(serializers.ModelSerializer):
    items = ServiceItemSerializer(many=True, read_only=True)
    vehicle_details = VehicleSerializer(source='vehicle', read_only=True)
    customer_details = CustomerSerializer(source='customer', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = ServiceOrder
        fields = [
            'id',
            'order_number',
            'vehicle',
            'vehicle_details',
            'customer',
            'customer_details',
            'status',
            'status_display',
            'created_at',
            'completed_at',
            'observations',
            'total',
            'created_by',
            'created_by_username',
            'items'
        ]
        read_only_fields = ['order_number', 'total', 'created_at', 'completed_at']


class ServiceOrderCreateSerializer(serializers.ModelSerializer):
    items = ServiceItemSerializer(many=True)
    
    class Meta:
        model = ServiceOrder
        fields = [
            'vehicle',
            'observations',
            'items'
        ]
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Crear la orden
        service_order = ServiceOrder.objects.create(**validated_data)
        
        # Crear los items
        for item_data in items_data:
            ServiceItem.objects.create(service_order=service_order, **item_data)
        
        return service_order
