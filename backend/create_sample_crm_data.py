"""
Script para crear datos de prueba de clientes y vehículos
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalom_backend.settings')
django.setup()

from crm.models import Customer, Vehicle
from accounts.models import User

def create_sample_data():
    print("🚀 Creando datos de prueba para CRM...")
    
    # Obtener el usuario admin
    try:
        admin = User.objects.filter(role='ADMIN').first()
        if not admin:
            print("❌ No se encontró un usuario administrador")
            return
    except Exception as e:
        print(f"❌ Error al obtener usuario admin: {e}")
        return
    
    # Crear Clientes
    customers_data = [
        {
            'first_name': 'Juan',
            'last_name': 'Pérez',
            'phone': '+541123456789',
            'email': 'juan.perez@email.com',
            'address': 'Av. Corrientes 1234',
            'city': 'Buenos Aires',
            'notes': 'Cliente preferencial'
        },
        {
            'first_name': 'María',
            'last_name': 'González',
            'phone': '+541198765432',
            'email': 'maria.gonzalez@email.com',
            'address': 'Calle San Martín 567',
            'city': 'Rosario',
            'notes': ''
        },
        {
            'first_name': 'Carlos',
            'last_name': 'Rodríguez',
            'phone': '+541187654321',
            'email': 'carlos.rodriguez@email.com',
            'address': 'Av. Libertador 890',
            'city': 'Córdoba',
            'notes': 'Servicio cada 10.000 km'
        },
        {
            'first_name': 'Ana',
            'last_name': 'Martínez',
            'phone': '+541176543210',
            'email': '',
            'address': 'Calle Belgrano 345',
            'city': 'Buenos Aires',
            'notes': ''
        },
        {
            'first_name': 'Luis',
            'last_name': 'Fernández',
            'phone': '+541165432109',
            'email': 'luis.fernandez@email.com',
            'address': '',
            'city': 'La Plata',
            'notes': 'Prefiere contacto por WhatsApp'
        }
    ]
    
    customers = []
    for data in customers_data:
        customer, created = Customer.objects.get_or_create(
            phone=data['phone'],
            defaults={
                'first_name': data['first_name'],
                'last_name': data['last_name'],
                'email': data['email'],
                'address': data['address'],
                'city': data['city'],
                'notes': data['notes'],
                'created_by': admin
            }
        )
        if created:
            print(f"✅ Cliente creado: {customer.full_name}")
        else:
            print(f"ℹ️  Cliente ya existe: {customer.full_name}")
        customers.append(customer)
    
    # Crear Vehículos
    vehicles_data = [
        {
            'plate': 'ABC123',
            'brand': 'Toyota',
            'model': 'Corolla',
            'year': 2020,
            'color': 'Blanco',
            'engine_type': '1.8 Nafta',
            'current_mileage': 45000,
            'customer': customers[0],
            'notes': 'Última revisión: cambio de aceite y filtros'
        },
        {
            'plate': 'DEF456',
            'brand': 'Ford',
            'model': 'Focus',
            'year': 2019,
            'color': 'Negro',
            'engine_type': '2.0 Diesel',
            'current_mileage': 62000,
            'customer': customers[0],
            'notes': ''
        },
        {
            'plate': 'GHI789',
            'brand': 'Chevrolet',
            'model': 'Onix',
            'year': 2022,
            'color': 'Rojo',
            'engine_type': '1.4 Nafta',
            'current_mileage': 18000,
            'customer': customers[1],
            'notes': 'En garantía'
        },
        {
            'plate': 'JKL012',
            'brand': 'Volkswagen',
            'model': 'Gol Trend',
            'year': 2018,
            'color': 'Gris',
            'engine_type': '1.6 Nafta',
            'current_mileage': 85000,
            'customer': customers[2],
            'notes': 'Requiere revisión de frenos'
        },
        {
            'plate': 'MNO345',
            'brand': 'Renault',
            'model': 'Sandero',
            'year': 2021,
            'color': 'Azul',
            'engine_type': '1.6 Nafta',
            'current_mileage': 32000,
            'customer': customers[2],
            'notes': ''
        },
        {
            'plate': 'PQR678',
            'brand': 'Fiat',
            'model': 'Cronos',
            'year': 2023,
            'color': 'Blanco',
            'engine_type': '1.3 Nafta',
            'current_mileage': 8500,
            'customer': customers[3],
            'notes': 'Vehículo nuevo, primer service'
        },
        {
            'plate': 'STU901',
            'brand': 'Peugeot',
            'model': '208',
            'year': 2019,
            'color': 'Gris',
            'engine_type': '1.5 Nafta',
            'current_mileage': 71000,
            'customer': customers[4],
            'notes': 'Cliente solicita aceite sintético'
        },
        {
            'plate': 'AB123CD',
            'brand': 'Honda',
            'model': 'Civic',
            'year': 2020,
            'color': 'Negro',
            'engine_type': '1.8 Nafta',
            'current_mileage': 52000,
            'customer': customers[4],
            'notes': ''
        }
    ]
    
    for data in vehicles_data:
        vehicle, created = Vehicle.objects.get_or_create(
            plate=data['plate'],
            defaults=data
        )
        if created:
            print(f"✅ Vehículo creado: {vehicle.plate} - {vehicle.brand} {vehicle.model}")
        else:
            print(f"ℹ️  Vehículo ya existe: {vehicle.plate}")
    
    print("\n📊 Resumen:")
    print(f"Total de clientes: {Customer.objects.count()}")
    print(f"Total de vehículos: {Vehicle.objects.count()}")
    print("\n✅ Datos de prueba creados exitosamente!")

if __name__ == '__main__':
    create_sample_data()
