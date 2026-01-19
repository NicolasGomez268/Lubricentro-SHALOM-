from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class ServiceOrder(models.Model):
    """
    Orden de servicio - Registro de trabajos realizados en vehículos
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pendiente'),
        ('COMPLETED', 'Completada'),
        ('CANCELLED', 'Cancelada'),
    ]
    
    # Número de orden único y autoincrementable
    order_number = models.CharField('Número de Orden', max_length=20, unique=True, editable=False)
    
    # Relaciones
    vehicle = models.ForeignKey('crm.Vehicle', on_delete=models.PROTECT, related_name='service_orders', verbose_name='Vehículo')
    customer = models.ForeignKey('crm.Customer', on_delete=models.PROTECT, related_name='service_orders', verbose_name='Cliente')
    
    # Estado y fechas
    status = models.CharField('Estado', max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField('Fecha de Creación', auto_now_add=True)
    completed_at = models.DateTimeField('Fecha de Finalización', null=True, blank=True)
    
    # Observaciones
    observations = models.TextField('Observaciones', blank=True, help_text='Trabajo a realizar o detalles del servicio')
    
    # Totales
    total = models.DecimalField('Total', max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(Decimal('0'))])
    
    # Usuario que creó la orden
    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='service_orders_created', verbose_name='Creado por')
    
    class Meta:
        verbose_name = 'Orden de Servicio'
        verbose_name_plural = 'Órdenes de Servicio'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order_number']),
            models.Index(fields=['vehicle']),
            models.Index(fields=['customer']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"Orden #{self.order_number} - {self.vehicle.plate}"
    
    def save(self, *args, **kwargs):
        # Generar número de orden automático
        if not self.order_number:
            last_order = ServiceOrder.objects.order_by('-id').first()
            if last_order and last_order.order_number:
                try:
                    last_number = int(last_order.order_number.split('-')[1])
                    new_number = last_number + 1
                except (IndexError, ValueError):
                    new_number = 1
            else:
                new_number = 1
            self.order_number = f"OS-{new_number:05d}"
        
        # Asignar cliente desde el vehículo si no está asignado
        if self.vehicle_id and not self.customer_id:
            self.customer_id = self.vehicle.customer_id
        
        super().save(*args, **kwargs)
    
    def calculate_total(self):
        """Calcula el total de la orden sumando todos los items"""
        total = sum(item.subtotal for item in self.items.all())
        self.total = total
        self.save(update_fields=['total'])
        return self.total


class ServiceItem(models.Model):
    """
    Item de servicio - Productos o servicios incluidos en una orden
    """
    ITEM_TYPE_CHOICES = [
        ('PRODUCT', 'Producto'),
        ('SERVICE', 'Servicio'),
    ]
    
    # Relación con la orden
    service_order = models.ForeignKey(ServiceOrder, on_delete=models.CASCADE, related_name='items', verbose_name='Orden de Servicio')
    
    # Tipo de item
    item_type = models.CharField('Tipo', max_length=10, choices=ITEM_TYPE_CHOICES, default='SERVICE')
    
    # Producto (opcional, solo si es tipo PRODUCT)
    product = models.ForeignKey('inventory.Product', on_delete=models.SET_NULL, null=True, blank=True, related_name='service_items', verbose_name='Producto')
    
    # Descripción
    description = models.CharField('Descripción', max_length=255, help_text='Descripción del servicio o producto')
    
    # Cantidad y precios
    quantity = models.DecimalField('Cantidad', max_digits=10, decimal_places=2, default=1, validators=[MinValueValidator(Decimal('0.01'))])
    unit_price = models.DecimalField('Precio Unitario', max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0'))])
    subtotal = models.DecimalField('Subtotal', max_digits=10, decimal_places=2, editable=False)
    
    # Metadata
    created_at = models.DateTimeField('Fecha de Creación', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Item de Servicio'
        verbose_name_plural = 'Items de Servicio'
        ordering = ['id']
    
    def __str__(self):
        return f"{self.description} x{self.quantity}"
    
    def save(self, *args, **kwargs):
        # Calcular subtotal automáticamente
        self.subtotal = self.quantity * self.unit_price
        
        # Si es un producto y no hay descripción, usar el nombre del producto
        if self.product and not self.description:
            self.description = self.product.name
        
        # Si es un producto y no hay precio, usar el precio de venta del producto
        if self.product and self.unit_price == 0:
            self.unit_price = self.product.sale_price
        
        super().save(*args, **kwargs)
        
        # Recalcular el total de la orden
        self.service_order.calculate_total()

