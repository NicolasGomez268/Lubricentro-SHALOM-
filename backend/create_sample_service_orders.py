#!/usr/bin/env python
"""
Script para crear datos de ejemplo de órdenes de servicio
"""
import os
import django
import sys

# Configurar Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalom_backend.settings')
django.setup()

from services.models import ServiceOrder, ServiceItem
from crm.models import Vehicle
from inventory.models import Product
from accounts.models import User
from decimal import Decimal


def create_sample_service_orders():
    """Crear órdenes de servicio de ejemplo"""
    
    # Obtener usuarios y datos necesarios
    try:
        admin = User.objects.filter(role='ADMIN').first()
        if not admin:
            print("❌ No se encontró un usuario administrador")
            return
        
        vehicles = Vehicle.objects.all()[:3]
        if not vehicles:
            print("❌ No hay vehículos en la base de datos")
            return
        
        products = Product.objects.all()[:5]
        if not products:
            print("❌ No hay productos en la base de datos")
            return
        
        # Limpiar órdenes anteriores
        ServiceOrder.objects.all().delete()
        print("🗑️  Órdenes anteriores eliminadas")
        
        # Orden 1: Cambio de aceite completado
        order1 = ServiceOrder.objects.create(
            vehicle=vehicles[0],
            observations="Cambio de aceite y filtro. Revisión general del motor.",
            status='COMPLETED',
            created_by=admin
        )
        ServiceItem.objects.create(
            service_order=order1,
            item_type='PRODUCT',
            product=products[0] if products else None,
            description="Aceite sintético 5W-30",
            quantity=Decimal('4'),
            unit_price=products[0].sale_price if products else Decimal('25.00')
        )
        ServiceItem.objects.create(
            service_order=order1,
            item_type='PRODUCT',
            product=products[1] if len(products) > 1 else None,
            description="Filtro de aceite",
            quantity=Decimal('1'),
            unit_price=products[1].sale_price if len(products) > 1 else Decimal('15.00')
        )
        ServiceItem.objects.create(
            service_order=order1,
            item_type='SERVICE',
            description="Mano de obra - Cambio de aceite",
            quantity=Decimal('1'),
            unit_price=Decimal('30.00')
        )
        order1.calculate_total()
        print(f"✅ Orden #{order1.order_number} creada - {order1.vehicle.plate} - Total: ${order1.total}")
        
        # Orden 2: Cambio de neumáticos pendiente
        if len(vehicles) > 1:
            order2 = ServiceOrder.objects.create(
                vehicle=vehicles[1],
                observations="Cambio de 4 neumáticos. Cliente esperando confirmación de stock.",
                status='PENDING',
                created_by=admin
            )
            ServiceItem.objects.create(
                service_order=order2,
                item_type='PRODUCT',
                product=products[2] if len(products) > 2 else None,
                description="Neumático 195/65 R15",
                quantity=Decimal('4'),
                unit_price=Decimal('85.00')
            )
            ServiceItem.objects.create(
                service_order=order2,
                item_type='SERVICE',
                description="Balanceo y alineación",
                quantity=Decimal('1'),
                unit_price=Decimal('50.00')
            )
            order2.calculate_total()
            print(f"✅ Orden #{order2.order_number} creada - {order2.vehicle.plate} - Total: ${order2.total}")
        
        # Orden 3: Servicio completo pendiente
        if len(vehicles) > 2:
            order3 = ServiceOrder.objects.create(
                vehicle=vehicles[2],
                observations="Service completo 10.000 km. Incluye cambio de aceite, filtros y revisión de frenos.",
                status='PENDING',
                created_by=admin
            )
            ServiceItem.objects.create(
                service_order=order3,
                item_type='PRODUCT',
                product=products[0] if products else None,
                description="Aceite sintético",
                quantity=Decimal('4'),
                unit_price=products[0].sale_price if products else Decimal('25.00')
            )
            ServiceItem.objects.create(
                service_order=order3,
                item_type='PRODUCT',
                product=products[1] if len(products) > 1 else None,
                description="Filtro de aceite",
                quantity=Decimal('1'),
                unit_price=products[1].sale_price if len(products) > 1 else Decimal('15.00')
            )
            ServiceItem.objects.create(
                service_order=order3,
                item_type='PRODUCT',
                description="Filtro de aire",
                quantity=Decimal('1'),
                unit_price=Decimal('20.00')
            )
            ServiceItem.objects.create(
                service_order=order3,
                item_type='SERVICE',
                description="Service completo 10.000 km",
                quantity=Decimal('1'),
                unit_price=Decimal('80.00')
            )
            order3.calculate_total()
            print(f"✅ Orden #{order3.order_number} creada - {order3.vehicle.plate} - Total: ${order3.total}")
        
        # Orden 4: Reparación cancelada
        if len(vehicles) > 1:
            order4 = ServiceOrder.objects.create(
                vehicle=vehicles[1],
                observations="Reparación de sistema eléctrico. Cliente decidió no continuar.",
                status='CANCELLED',
                created_by=admin
            )
            ServiceItem.objects.create(
                service_order=order4,
                item_type='SERVICE',
                description="Diagnóstico sistema eléctrico",
                quantity=Decimal('1'),
                unit_price=Decimal('45.00')
            )
            order4.calculate_total()
            print(f"✅ Orden #{order4.order_number} creada - {order4.vehicle.plate} - Total: ${order4.total}")
        
        total_orders = ServiceOrder.objects.count()
        print(f"\n✨ Se crearon {total_orders} órdenes de servicio de ejemplo")
        print(f"   - Completadas: {ServiceOrder.objects.filter(status='COMPLETED').count()}")
        print(f"   - Pendientes: {ServiceOrder.objects.filter(status='PENDING').count()}")
        print(f"   - Canceladas: {ServiceOrder.objects.filter(status='CANCELLED').count()}")
        
    except Exception as e:
        print(f"❌ Error al crear órdenes: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    print("🚀 Creando órdenes de servicio de ejemplo...")
    print("-" * 50)
    create_sample_service_orders()
    print("-" * 50)
    print("✅ Proceso completado")
