from django.db import models, transaction
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from decimal import Decimal


class Product(models.Model):
    """
    Modelo para gestionar productos del inventario (Aceites, Filtros, etc.)
    """
    UNIT_CHOICES = (
        ('LITRO', 'Litro'),
        ('UNIDAD', 'Unidad'),
        ('PACK', 'Pack'),
    )
    
    code = models.CharField('Código', max_length=50, unique=True)
    name = models.CharField('Nombre', max_length=200)
    category = models.CharField('Categoría', max_length=50)  # Sin choices para permitir categorías dinámicas
    brand = models.CharField('Marca', max_length=100, blank=True, null=True)
    description = models.TextField('Descripción', blank=True, null=True)
    
    # Stock
    stock_quantity = models.IntegerField('Cantidad en Stock', default=0, validators=[MinValueValidator(0)])
    min_stock = models.IntegerField('Stock Mínimo', default=5, validators=[MinValueValidator(0)])
    unit = models.CharField('Unidad de Medida', max_length=10, choices=UNIT_CHOICES, default='UNIDAD')
    
    # Precios
    purchase_price = models.DecimalField('Precio de Compra', max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    sale_price = models.DecimalField('Precio de Venta', max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    
    # Metadata
    is_active = models.BooleanField('Activo', default=True)
    created_at = models.DateTimeField('Fecha de creación', auto_now_add=True)
    updated_at = models.DateTimeField('Fecha de actualización', auto_now=True)
    
    class Meta:
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['category']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    @property
    def is_low_stock(self):
        """Verifica si el stock está por debajo del mínimo"""
        return self.stock_quantity <= self.min_stock
    
    @property
    def profit_margin(self):
        """Calcula el margen de ganancia"""
        if self.purchase_price > 0:
            return ((self.sale_price - self.purchase_price) / self.purchase_price) * 100
        return 0


class StockMovement(models.Model):
    """
    Modelo para registrar movimientos de stock (entradas y salidas)
    """
    MOVEMENT_TYPE_CHOICES = (
        ('COMPRA', 'Compra'),
        ('VENTA', 'Venta'),
        ('AJUSTE', 'Ajuste'),
    )
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='movements', verbose_name='Producto')
    movement_type = models.CharField('Tipo de Movimiento', max_length=10, choices=MOVEMENT_TYPE_CHOICES)
    quantity = models.IntegerField('Cantidad', validators=[MinValueValidator(1)])
    reason = models.TextField('Motivo/Observaciones', blank=True, null=True)
    reference = models.CharField('Referencia', max_length=100, blank=True, null=True, help_text='Ej: Orden de servicio #123')
    
    performed_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, verbose_name='Realizado por')
    created_at = models.DateTimeField('Fecha', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Movimiento de Stock'
        verbose_name_plural = 'Movimientos de Stock'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_movement_type_display()} - {self.product.name} ({self.quantity})"
    
    def save(self, *args, **kwargs):
        """Al guardar, actualiza el stock del producto"""
        is_new = self.pk is None
        
        if is_new:
            with transaction.atomic():
                # Bloquear el producto para evitar condiciones de carrera
                product = Product.objects.select_for_update().get(pk=self.product.pk)
                
                if self.movement_type == 'COMPRA':
                    product.stock_quantity += self.quantity
                elif self.movement_type == 'VENTA':
                    new_stock = product.stock_quantity - self.quantity
                    if new_stock < 0:
                        raise ValidationError(
                            f'Stock insuficiente. Stock actual: {product.stock_quantity}, '
                            f'Cantidad solicitada: {self.quantity}'
                        )
                    product.stock_quantity = new_stock
                elif self.movement_type == 'AJUSTE':
                    if self.quantity < 0:
                        raise ValidationError('El ajuste de stock no puede ser negativo')
                    product.stock_quantity = self.quantity
                
                product.save()
                super().save(*args, **kwargs)
