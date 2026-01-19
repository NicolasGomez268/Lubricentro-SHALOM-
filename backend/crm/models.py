from django.db import models
from django.core.validators import RegexValidator


class Customer(models.Model):
    """
    Modelo para gestionar clientes del lubricentro
    """
    # Información personal
    first_name = models.CharField('Nombre', max_length=100)
    last_name = models.CharField('Apellido', max_length=100)
    email = models.EmailField('Email', blank=True, null=True)
    
    # Validador de teléfono argentino
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="El teléfono debe estar en formato: '+999999999'. Hasta 15 dígitos permitidos."
    )
    phone = models.CharField('Teléfono', validators=[phone_regex], max_length=17)
    
    # Información adicional
    address = models.CharField('Dirección', max_length=255, blank=True, null=True)
    city = models.CharField('Ciudad', max_length=100, blank=True, null=True)
    notes = models.TextField('Notas', blank=True, null=True)
    
    # Metadata
    is_active = models.BooleanField('Activo', default=True)
    created_at = models.DateTimeField('Fecha de creación', auto_now_add=True)
    updated_at = models.DateTimeField('Fecha de actualización', auto_now=True)
    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='customers_created', verbose_name='Creado por')
    
    class Meta:
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['phone']),
            models.Index(fields=['last_name', 'first_name']),
        ]
    
    def __str__(self):
        return f"{self.last_name}, {self.first_name}"
    
    @property
    def full_name(self):
        """Retorna el nombre completo del cliente"""
        return f"{self.first_name} {self.last_name}"


class Vehicle(models.Model):
    """
    Modelo para gestionar vehículos de los clientes
    """
    # Validador de patente argentina (ej: ABC123, AB123CD)
    plate_regex = RegexValidator(
        regex=r'^[A-Z]{2,3}\d{3}[A-Z]{0,2}$',
        message="Formato de patente inválido. Use formato argentino (ej: ABC123 o AB123CD)"
    )
    
    # Información del vehículo
    plate = models.CharField('Patente', max_length=10, unique=True, validators=[plate_regex], help_text='Formato: ABC123 o AB123CD')
    brand = models.CharField('Marca', max_length=50)
    model = models.CharField('Modelo', max_length=50)
    year = models.IntegerField('Año', null=True, blank=True)
    color = models.CharField('Color', max_length=30, blank=True, null=True)
    
    # Motor y detalles técnicos
    engine_type = models.CharField('Tipo de Motor', max_length=50, blank=True, null=True, help_text='Ej: 1.6 Nafta, 2.0 Diesel')
    vin = models.CharField('VIN/Nº Chasis', max_length=17, blank=True, null=True, unique=True)
    
    # Kilometraje
    current_mileage = models.IntegerField('Kilometraje Actual', default=0, help_text='En kilómetros')
    
    # Relación con cliente
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='vehicles', verbose_name='Cliente')
    
    # Notas
    notes = models.TextField('Notas', blank=True, null=True, help_text='Observaciones especiales del vehículo')
    
    # Metadata
    is_active = models.BooleanField('Activo', default=True)
    created_at = models.DateTimeField('Fecha de creación', auto_now_add=True)
    updated_at = models.DateTimeField('Fecha de actualización', auto_now=True)
    
    class Meta:
        verbose_name = 'Vehículo'
        verbose_name_plural = 'Vehículos'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['plate']),
            models.Index(fields=['customer']),
        ]
    
    def __str__(self):
        return f"{self.plate} - {self.brand} {self.model} ({self.customer.full_name})"
    
    @property
    def display_name(self):
        """Retorna una representación legible del vehículo"""
        year_str = f"{self.year} " if self.year else ""
        return f"{year_str}{self.brand} {self.model}"

