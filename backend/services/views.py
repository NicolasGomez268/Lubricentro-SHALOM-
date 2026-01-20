from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from .models import ServiceOrder, ServiceItem, Invoice
from .serializers import (
    ServiceOrderSerializer, 
    ServiceOrderCreateSerializer, 
    ServiceOrderUpdateSerializer,
    InvoiceSerializer,
    InvoiceCreateSerializer
)
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
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'customer', 'vehicle']
    search_fields = ['order_number', 'vehicle__plate', 'customer__name']
    ordering_fields = ['created_at', 'total', 'order_number']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ServiceOrderCreateSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return ServiceOrderUpdateSerializer
        return ServiceOrderSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtros opcionales adicionales
        plate = self.request.query_params.get('plate', None)
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        min_total = self.request.query_params.get('min_total', None)
        max_total = self.request.query_params.get('max_total', None)
        
        if plate:
            queryset = queryset.filter(vehicle__plate__icontains=plate)
        
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        
        if min_total:
            queryset = queryset.filter(total__gte=min_total)
        
        if max_total:
            queryset = queryset.filter(total__lte=max_total)
        
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
                    
                    if product.stock_quantity < item.quantity:
                        raise ValueError(
                            f'Stock insuficiente para {product.name}. '
                            f'Disponible: {product.stock_quantity}, Requerido: {item.quantity}'
                        )
                    
                    # Actualizar stock
                    product.stock_quantity -= item.quantity
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
    
    @action(detail=False, methods=['get'])
    def by_vehicle(self, request):
        """
        Obtiene el historial completo de órdenes de un vehículo.
        """
        from django.db.models import Sum, Count
        
        vehicle_id = request.query_params.get('vehicle_id', None)
        
        if not vehicle_id:
            return Response(
                {'error': 'Debe proporcionar un vehicle_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener todas las órdenes del vehículo
        orders = ServiceOrder.objects.filter(
            vehicle_id=vehicle_id
        ).select_related('vehicle', 'customer', 'created_by').prefetch_related('items__product').order_by('-created_at')
        
        # Calcular estadísticas
        stats = {
            'total_orders': orders.count(),
            'completed_orders': orders.filter(status='COMPLETED').count(),
            'pending_orders': orders.filter(status='PENDING').count(),
            'total_spent': float(orders.filter(status='COMPLETED').aggregate(
                total=Sum('total')
            )['total'] or 0),
            'last_visit': orders.first().created_at if orders.exists() else None,
        }
        
        # Serializar órdenes
        serializer = ServiceOrderSerializer(orders, many=True)
        
        return Response({
            'statistics': stats,
            'orders': serializer.data
        })


class InvoiceViewSet(viewsets.ModelViewSet):
    """
    API endpoint para facturas.
    """
    queryset = Invoice.objects.select_related(
        'customer',
        'service_order',
        'created_by'
    ).all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'invoice_type', 'customer']
    search_fields = ['invoice_number', 'customer__name']
    ordering_fields = ['issue_date', 'total', 'invoice_number']
    ordering = ['-issue_date']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return InvoiceCreateSerializer
        return InvoiceSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtros adicionales
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        min_total = self.request.query_params.get('min_total', None)
        max_total = self.request.query_params.get('max_total', None)
        
        if date_from:
            queryset = queryset.filter(issue_date__gte=date_from)
        
        if date_to:
            queryset = queryset.filter(issue_date__lte=date_to)
        
        if min_total:
            queryset = queryset.filter(total__gte=min_total)
        
        if max_total:
            queryset = queryset.filter(total__lte=max_total)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def mark_as_paid(self, request, pk=None):
        """
        Marca una factura como pagada.
        """
        invoice = self.get_object()
        
        if invoice.status == 'PAID':
            return Response(
                {'detail': 'La factura ya está marcada como pagada.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if invoice.status == 'CANCELLED':
            return Response(
                {'detail': 'No se puede marcar como pagada una factura anulada.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        invoice.status = 'PAID'
        invoice.paid_date = timezone.now().date()
        invoice.save()
        
        return Response(
            InvoiceSerializer(invoice).data,
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Anula una factura.
        """
        invoice = self.get_object()
        
        if invoice.status == 'CANCELLED':
            return Response(
                {'detail': 'La factura ya está anulada.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        invoice.status = 'CANCELLED'
        invoice.save()
        
        return Response(
            InvoiceSerializer(invoice).data,
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Estadísticas de facturación.
        """
        from django.db.models import Sum, Count
        
        total_invoices = Invoice.objects.count()
        issued = Invoice.objects.filter(status='ISSUED').count()
        paid = Invoice.objects.filter(status='PAID').count()
        cancelled = Invoice.objects.filter(status='CANCELLED').count()
        
        total_revenue = Invoice.objects.filter(
            status__in=['ISSUED', 'PAID']
        ).aggregate(total=Sum('total'))['total'] or 0
        
        pending_amount = Invoice.objects.filter(
            status='ISSUED'
        ).aggregate(total=Sum('total'))['total'] or 0
        
        return Response({
            'total_invoices': total_invoices,
            'issued': issued,
            'paid': paid,
            'cancelled': cancelled,
            'total_revenue': float(total_revenue),
            'pending_amount': float(pending_amount)
        })
