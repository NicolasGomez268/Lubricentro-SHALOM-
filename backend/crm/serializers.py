from rest_framework import serializers
from .models import Customer, Vehicle


class VehicleSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Vehicle
    """
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    customer_details = serializers.SerializerMethodField()
    display_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = Vehicle
        fields = [
            'id', 'plate', 'brand', 'model', 'year', 'color',
            'engine_type', 'vin', 'current_mileage', 'customer',
            'customer_name', 'customer_details', 'notes', 'is_active', 'created_at',
            'updated_at', 'display_name'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_customer_details(self, obj):
        """
        Retorna información básica del cliente
        """
        if obj.customer:
            return {
                'id': obj.customer.id,
                'full_name': obj.customer.full_name,
                'phone': obj.customer.phone,
                'email': obj.customer.email
            }
        return None
    
    def validate_plate(self, value):
        """
        Normaliza la patente a mayúsculas y sin espacios
        """
        return value.upper().replace(' ', '')
    
    def validate_year(self, value):
        """
        Valida que el año sea razonable
        """
        from datetime import datetime
        if value:
            current_year = datetime.now().year
            if value < 1950 or value > current_year + 1:
                raise serializers.ValidationError(
                    f"El año debe estar entre 1950 y {current_year + 1}"
                )
        return value


class CustomerSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Customer
    """
    full_name = serializers.CharField(read_only=True)
    vehicles = VehicleSerializer(many=True, read_only=True)
    vehicles_count = serializers.IntegerField(source='vehicles.count', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Customer
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email',
            'phone', 'address', 'city', 'notes', 'is_active',
            'vehicles', 'vehicles_count', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by']
    
    def validate_phone(self, value):
        """
        Limpia el número de teléfono
        """
        # Eliminar espacios y guiones
        return value.replace(' ', '').replace('-', '')


class CustomerListSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listados de clientes (sin vehículos anidados)
    """
    full_name = serializers.CharField(read_only=True)
    vehicles_count = serializers.IntegerField(source='vehicles.count', read_only=True)
    
    class Meta:
        model = Customer
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email',
            'phone', 'city', 'vehicles_count', 'is_active', 'created_at'
        ]


class VehicleDetailSerializer(VehicleSerializer):
    """
    Serializer detallado para vehículo con información del cliente
    """
    customer_data = CustomerListSerializer(source='customer', read_only=True)
    
    class Meta(VehicleSerializer.Meta):
        fields = VehicleSerializer.Meta.fields + ['customer_data']
