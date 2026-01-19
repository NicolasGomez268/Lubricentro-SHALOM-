from django.contrib import admin
from .models import Customer, Vehicle


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'phone', 'email', 'city', 'is_active', 'created_at']
    list_filter = ['is_active', 'city', 'created_at']
    search_fields = ['first_name', 'last_name', 'phone', 'email']
    readonly_fields = ['created_at', 'updated_at', 'created_by']
    
    fieldsets = (
        ('Información Personal', {
            'fields': ('first_name', 'last_name', 'phone', 'email')
        }),
        ('Dirección', {
            'fields': ('address', 'city')
        }),
        ('Información Adicional', {
            'fields': ('notes', 'is_active')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ['plate', 'brand', 'model', 'year', 'customer', 'current_mileage', 'is_active']
    list_filter = ['is_active', 'brand', 'year']
    search_fields = ['plate', 'brand', 'model', 'customer__first_name', 'customer__last_name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Información del Vehículo', {
            'fields': ('plate', 'brand', 'model', 'year', 'color')
        }),
        ('Detalles Técnicos', {
            'fields': ('engine_type', 'vin', 'current_mileage')
        }),
        ('Cliente', {
            'fields': ('customer',)
        }),
        ('Información Adicional', {
            'fields': ('notes', 'is_active')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

