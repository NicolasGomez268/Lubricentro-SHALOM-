from rest_framework import serializers
from .models import Product, StockMovement


class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Product
    """
    is_low_stock = serializers.ReadOnlyField()
    profit_margin = serializers.ReadOnlyField()
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    unit_display = serializers.CharField(source='get_unit_display', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'code', 'name', 'category', 'category_display', 
            'brand', 'description', 'stock_quantity', 'min_stock', 
            'unit', 'unit_display', 'purchase_price', 'sale_price', 
            'is_active', 'is_low_stock', 'profit_margin', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear y actualizar productos
    """
    class Meta:
        model = Product
        fields = [
            'code', 'name', 'category', 'brand', 'description',
            'stock_quantity', 'min_stock', 'unit',
            'purchase_price', 'sale_price', 'is_active'
        ]


class StockMovementSerializer(serializers.ModelSerializer):
    """
    Serializer para movimientos de stock
    """
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_code = serializers.CharField(source='product.code', read_only=True)
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)
    movement_type_display = serializers.CharField(source='get_movement_type_display', read_only=True)
    
    class Meta:
        model = StockMovement
        fields = [
            'id', 'product', 'product_name', 'product_code',
            'movement_type', 'movement_type_display', 'quantity',
            'reason', 'reference', 'performed_by', 'performed_by_name',
            'created_at'
        ]
        read_only_fields = ['created_at', 'performed_by']


class StockAdjustmentSerializer(serializers.Serializer):
    """
    Serializer para ajustar el stock de un producto
    """
    movement_type = serializers.ChoiceField(choices=['ENTRADA', 'SALIDA', 'AJUSTE'])
    quantity = serializers.IntegerField(min_value=0)
    reason = serializers.CharField(required=False, allow_blank=True)
    reference = serializers.CharField(required=False, allow_blank=True)
