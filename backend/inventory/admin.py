from django.contrib import admin
from .models import Product, StockMovement


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'category', 'brand', 'stock_quantity', 'min_stock', 'is_low_stock', 'sale_price', 'is_active')
    list_filter = ('category', 'is_active', 'brand')
    search_fields = ('code', 'name', 'brand')
    list_editable = ('sale_price', 'is_active')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('code', 'name', 'category', 'brand', 'description')
        }),
        ('Stock', {
            'fields': ('stock_quantity', 'min_stock', 'unit')
        }),
        ('Precios', {
            'fields': ('purchase_price', 'sale_price')
        }),
        ('Estado', {
            'fields': ('is_active', 'created_at', 'updated_at')
        }),
    )


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ('product', 'movement_type', 'quantity', 'performed_by', 'created_at')
    list_filter = ('movement_type', 'created_at')
    search_fields = ('product__name', 'product__code', 'reference')
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'
