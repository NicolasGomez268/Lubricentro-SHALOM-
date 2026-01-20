from rest_framework import serializers
from .models import ServiceOrder, ServiceItem, Invoice
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


class ServiceOrderUpdateSerializer(serializers.ModelSerializer):
    items = ServiceItemSerializer(many=True)
    
    class Meta:
        model = ServiceOrder
        fields = [
            'observations',
            'items'
        ]
    
    def update(self, instance, validated_data):
        # Solo permitir editar si está en estado PENDING
        if instance.status != 'PENDING':
            raise serializers.ValidationError({
                'detail': 'Solo se pueden editar órdenes pendientes'
            })
        
        items_data = validated_data.pop('items', None)
        
        # Actualizar observaciones
        instance.observations = validated_data.get('observations', instance.observations)
        instance.save()
        
        # Si se enviaron items, reemplazar todos
        if items_data is not None:
            # Eliminar items existentes
            instance.items.all().delete()
            
            # Crear nuevos items
            for item_data in items_data:
                ServiceItem.objects.create(service_order=instance, **item_data)
            
            # Recalcular total
            instance.calculate_total()
        
        return instance


class InvoiceSerializer(serializers.ModelSerializer):
    customer_details = CustomerSerializer(source='customer', read_only=True)
    service_order_number = serializers.CharField(source='service_order.order_number', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    invoice_type_display = serializers.CharField(source='get_invoice_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id',
            'invoice_number',
            'invoice_type',
            'invoice_type_display',
            'service_order',
            'service_order_number',
            'customer',
            'customer_details',
            'issue_date',
            'due_date',
            'paid_date',
            'status',
            'status_display',
            'subtotal',
            'tax_rate',
            'tax_amount',
            'total',
            'notes',
            'created_by',
            'created_by_username',
            'created_at'
        ]
        read_only_fields = ['invoice_number', 'tax_amount', 'total', 'created_at']


class InvoiceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = [
            'service_order',
            'invoice_type',
            'due_date',
            'notes'
        ]
    
    def validate_service_order(self, value):
        # Validar que la orden esté completada
        if value.status != 'COMPLETED':
            raise serializers.ValidationError('Solo se pueden facturar órdenes completadas')
        
        # Validar que no tenga ya una factura
        if hasattr(value, 'invoice'):
            raise serializers.ValidationError('Esta orden ya tiene una factura asociada')
        
        return value
    
    def create(self, validated_data):
        # Obtener el usuario del contexto
        user = self.context['request'].user
        validated_data['created_by'] = user
        
        # Obtener el cliente de la orden
        validated_data['customer'] = validated_data['service_order'].customer
        
        # Crear la factura
        invoice = Invoice.objects.create(**validated_data)
        
        return invoice
