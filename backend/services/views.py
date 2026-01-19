from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.utils import timezone
from .models import ServiceOrder, ServiceItem
from .serializers import ServiceOrderSerializer, ServiceOrderCreateSerializer
from inventory.models import Product, StockMovement


class ServiceOrderViewSet(viewsets.ModelViewSet):
    """
    API endpoint para órdenes de servicio.
    """
    queryset = ServiceOrder.objects.select_related(
        'vehicle',
        'customer',
        'created_by'
    ).prefetch_related('items__product').all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ServiceOrderCreateSerializer
        return ServiceOrderSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtros opcionales
        status_param = self.request.query_params.get('status', None)
        plate = self.request.query_params.get('plate', None)
        customer_id = self.request.query_params.get('customer', None)
        
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        if plate:
            queryset = queryset.filter(vehicle__plate__icontains=plate)
        
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Marca la orden como completada y descuenta el stock de los productos.
        """
        service_order = self.get_object()
        
        if service_order.status == 'COMPLETED':
            return Response(
                {'detail': 'La orden ya está completada.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if service_order.status == 'CANCELLED':
            return Response(
                {'detail': 'No se puede completar una orden cancelada.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                # Descontar stock de productos
                for item in service_order.items.filter(item_type='PRODUCT', product__isnull=False):
                    product = Product.objects.select_for_update().get(pk=item.product.id)
                    
                    if product.stock < item.quantity:
                        raise ValueError(
                            f'Stock insuficiente para {product.name}. '
                            f'Disponible: {product.stock}, Requerido: {item.quantity}'
                        )
                    
                    # Actualizar stock
                    product.stock -= item.quantity
                    product.save()
                    
                    # Registrar movimiento de stock
                    StockMovement.objects.create(
                        product=product,
                        movement_type='OUT',
                        quantity=item.quantity,
                        reason=f'Orden de servicio #{service_order.order_number}',
                        performed_by=request.user
                    )
                
                # Marcar orden como completada
                service_order.status = 'COMPLETED'
                service_order.completed_at = timezone.now()
                service_order.save()
            
            return Response(
                ServiceOrderSerializer(service_order).data,
                status=status.HTTP_200_OK
            )
        
        except ValueError as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'detail': f'Error al completar la orden: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancela una orden de servicio.
        """
        service_order = self.get_object()
        
        if service_order.status == 'COMPLETED':
            return Response(
                {'detail': 'No se puede cancelar una orden completada.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if service_order.status == 'CANCELLED':
            return Response(
                {'detail': 'La orden ya está cancelada.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service_order.status = 'CANCELLED'
        service_order.save()
        
        return Response(
            ServiceOrderSerializer(service_order).data,
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Estadísticas de órdenes de servicio.
        """
        from django.db.models import Count, Sum
        
        total_orders = ServiceOrder.objects.count()
        pending = ServiceOrder.objects.filter(status='PENDING').count()
        completed = ServiceOrder.objects.filter(status='COMPLETED').count()
        cancelled = ServiceOrder.objects.filter(status='CANCELLED').count()
        
        total_revenue = ServiceOrder.objects.filter(
            status='COMPLETED'
        ).aggregate(total=Sum('total'))['total'] or 0
        
        return Response({
            'total_orders': total_orders,
            'pending': pending,
            'completed': completed,
            'cancelled': cancelled,
            'total_revenue': float(total_revenue)
        })

