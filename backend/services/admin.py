from django.contrib import admin
from .models import ServiceOrder, ServiceItem, Invoice


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


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'invoice_type', 'customer', 'status', 'total', 'issue_date']
    list_filter = ['status', 'invoice_type', 'issue_date']
    search_fields = ['invoice_number', 'customer__name', 'service_order__order_number']
    readonly_fields = ['invoice_number', 'tax_amount', 'total', 'created_at']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('invoice_number', 'invoice_type', 'service_order', 'customer', 'status')
        }),
        ('Fechas', {
            'fields': ('issue_date', 'due_date', 'paid_date')
        }),
        ('Montos', {
            'fields': ('subtotal', 'tax_rate', 'tax_amount', 'total')
        }),
        ('Adicional', {
            'fields': ('notes',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at'),
            'classes': ('collapse',)
        }),
    )
