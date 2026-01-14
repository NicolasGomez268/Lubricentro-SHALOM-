import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalom_backend.settings')
django.setup()

from inventory.models import Product

# Productos de ejemplo
products_data = [
    {
        'code': 'ACE-001',
        'name': 'Aceite Sintético 5W30',
        'category': 'ACEITE',
        'brand': 'Mobil 1',
        'description': 'Aceite sintético de alta performance',
        'stock_quantity': 25,
        'min_stock': 10,
        'unit': 'LITRO',
        'purchase_price': 8500.00,
        'sale_price': 12000.00,
    },
    {
        'code': 'ACE-002',
        'name': 'Aceite Semi-Sintético 10W40',
        'category': 'ACEITE',
        'brand': 'Castrol',
        'description': 'Aceite semi-sintético para motores de alto rendimiento',
        'stock_quantity': 30,
        'min_stock': 15,
        'unit': 'LITRO',
        'purchase_price': 6000.00,
        'sale_price': 8500.00,
    },
    {
        'code': 'ACE-003',
        'name': 'Aceite Mineral 20W50',
        'category': 'ACEITE',
        'brand': 'YPF',
        'description': 'Aceite mineral para uso general',
        'stock_quantity': 40,
        'min_stock': 20,
        'unit': 'LITRO',
        'purchase_price': 3500.00,
        'sale_price': 5000.00,
    },
    {
        'code': 'FACE-001',
        'name': 'Filtro de Aceite Universal',
        'category': 'FILTRO_ACEITE',
        'brand': 'Mann Filter',
        'description': 'Filtro de aceite para vehículos medianos',
        'stock_quantity': 15,
        'min_stock': 20,
        'unit': 'UNIDAD',
        'purchase_price': 2500.00,
        'sale_price': 3800.00,
    },
    {
        'code': 'FACE-002',
        'name': 'Filtro de Aceite Toyota',
        'category': 'FILTRO_ACEITE',
        'brand': 'Mann Filter',
        'description': 'Filtro específico para vehículos Toyota',
        'stock_quantity': 12,
        'min_stock': 15,
        'unit': 'UNIDAD',
        'purchase_price': 2800.00,
        'sale_price': 4200.00,
    },
    {
        'code': 'FAIR-001',
        'name': 'Filtro de Aire Estándar',
        'category': 'FILTRO_AIRE',
        'brand': 'Bosch',
        'description': 'Filtro de aire para vehículos medianos',
        'stock_quantity': 8,
        'min_stock': 10,
        'unit': 'UNIDAD',
        'purchase_price': 1800.00,
        'sale_price': 2800.00,
    },
    {
        'code': 'FAIR-002',
        'name': 'Filtro de Aire Ford',
        'category': 'FILTRO_AIRE',
        'brand': 'Fram',
        'description': 'Filtro de aire específico para Ford',
        'stock_quantity': 5,
        'min_stock': 8,
        'unit': 'UNIDAD',
        'purchase_price': 2000.00,
        'sale_price': 3200.00,
    },
    {
        'code': 'FCOMB-001',
        'name': 'Filtro de Combustible Diesel',
        'category': 'FILTRO_COMBUSTIBLE',
        'brand': 'Mann Filter',
        'description': 'Filtro de combustible para motores diesel',
        'stock_quantity': 10,
        'min_stock': 12,
        'unit': 'UNIDAD',
        'purchase_price': 3200.00,
        'sale_price': 5000.00,
    },
    {
        'code': 'FCOMB-002',
        'name': 'Filtro de Combustible Nafta',
        'category': 'FILTRO_COMBUSTIBLE',
        'brand': 'Bosch',
        'description': 'Filtro de combustible para motores nafteros',
        'stock_quantity': 7,
        'min_stock': 10,
        'unit': 'UNIDAD',
        'purchase_price': 2500.00,
        'sale_price': 3900.00,
    },
    {
        'code': 'ACE-004',
        'name': 'Aceite Transmisión ATF',
        'category': 'ACEITE',
        'brand': 'Mobil',
        'description': 'Aceite para transmisiones automáticas',
        'stock_quantity': 3,
        'min_stock': 8,
        'unit': 'LITRO',
        'purchase_price': 7500.00,
        'sale_price': 11000.00,
    },
]

created_count = 0
for product_data in products_data:
    product, created = Product.objects.get_or_create(
        code=product_data['code'],
        defaults=product_data
    )
    if created:
        created_count += 1
        status = '✅' if product.is_low_stock else '✓'
        stock_status = ' [STOCK BAJO]' if product.is_low_stock else ''
        print(f"{status} {product.code} - {product.name}{stock_status}")

print(f"\n✅ Se crearon {created_count} productos de prueba")
print(f"📦 Total de productos en sistema: {Product.objects.count()}")
print(f"⚠️ Productos con stock bajo: {len([p for p in Product.objects.all() if p.is_low_stock])}")
