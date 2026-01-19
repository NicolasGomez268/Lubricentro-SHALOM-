from django.contrib import admin
from .models import ServiceOrder, ServiceItem


class ServiceItemInline(admin.TabularInline):
    model = ServiceItem
    extra = 1
    readonly_fields = ('subtotal',)


@admin.register(ServiceOrder)
class ServiceOrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'vehicle', 'customer', 'status', 'total', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['order_number', 'vehicle__plate', 'customer__name']
    readonly_fields = ['order_number', 'total', 'created_at', 'completed_at']
    inlines = [ServiceItemInline]
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('order_number', 'vehicle', 'customer', 'status')
        }),
        ('Detalles', {
            'fields': ('observations', 'total')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'completed_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ServiceItem)
class ServiceItemAdmin(admin.ModelAdmin):
    list_display = ['service_order', 'item_type', 'description', 'quantity', 'unit_price', 'subtotal']
    list_filter = ['item_type', 'created_at']
    search_fields = ['description', 'service_order__order_number']
    readonly_fields = ('subtotal', 'created_at')

