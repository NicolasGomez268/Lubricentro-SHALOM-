from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count
from .models import Customer, Vehicle
from .serializers import (
    CustomerSerializer, CustomerListSerializer,
    VehicleSerializer, VehicleDetailSerializer
)


class CustomerViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar clientes
    """
    permission_classes = [IsAuthenticated]
    queryset = Customer.objects.all()
    
    def get_serializer_class(self):
        """
        Retorna el serializer apropiado según la acción
        """
        # Siempre usar CustomerSerializer para incluir vehículos
        return CustomerSerializer
    
    def get_queryset(self):
        """
        Filtra clientes según parámetros de búsqueda
        """
        queryset = Customer.objects.annotate(
            vehicles_count=Count('vehicles')
        ).select_related('created_by').prefetch_related('vehicles')
        
        # Búsqueda por nombre, teléfono o email
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(phone__icontains=search) |
                Q(email__icontains=search)
            )
        
        # Filtrar por estado activo/inactivo
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Asigna el usuario actual como creador del cliente
        """
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['get'])
    def vehicles(self, request, pk=None):
        """
        Endpoint para obtener todos los vehículos de un cliente
        """
        customer = self.get_object()
        vehicles = customer.vehicles.all()
        serializer = VehicleSerializer(vehicles, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Endpoint para obtener estadísticas de clientes
        """
        stats = {
            'total_customers': Customer.objects.filter(is_active=True).count(),
            'total_inactive': Customer.objects.filter(is_active=False).count(),
            'total_vehicles': Vehicle.objects.filter(is_active=True).count(),
            'customers_with_multiple_vehicles': Customer.objects.annotate(
                vehicle_count=Count('vehicles')
            ).filter(vehicle_count__gt=1).count()
        }
        return Response(stats)


class VehicleViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar vehículos
    """
    permission_classes = [IsAuthenticated]
    queryset = Vehicle.objects.all()
    
    def get_serializer_class(self):
        """
        Retorna el serializer apropiado según la acción
        """
        if self.action == 'retrieve':
            return VehicleDetailSerializer
        return VehicleSerializer
    
    def get_queryset(self):
        """
        Filtra vehículos según parámetros de búsqueda
        """
        queryset = Vehicle.objects.select_related('customer')
        
        # Búsqueda por patente específica
        plate = self.request.query_params.get('plate', None)
        if plate:
            queryset = queryset.filter(plate__icontains=plate)
        
        # Búsqueda por patente, marca, modelo
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(plate__icontains=search) |
                Q(brand__icontains=search) |
                Q(model__icontains=search) |
                Q(customer__first_name__icontains=search) |
                Q(customer__last_name__icontains=search)
            )
        
        # Filtrar por cliente específico
        customer_id = self.request.query_params.get('customer', None)
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        
        # Filtrar por estado activo/inactivo
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def search_by_plate(self, request):
        """
        Búsqueda específica por patente
        """
        plate = request.query_params.get('plate', '').upper().replace(' ', '')
        
        if not plate:
            return Response(
                {'error': 'Debe proporcionar una patente para buscar'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            vehicle = Vehicle.objects.select_related('customer').get(plate=plate)
            serializer = VehicleDetailSerializer(vehicle)
            return Response(serializer.data)
        except Vehicle.DoesNotExist:
            return Response(
                {'error': 'No se encontró ningún vehículo con esa patente'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['patch'])
    def update_mileage(self, request, pk=None):
        """
        Actualiza solo el kilometraje del vehículo
        """
        vehicle = self.get_object()
        new_mileage = request.data.get('current_mileage')
        
        if new_mileage is None:
            return Response(
                {'error': 'Debe proporcionar el nuevo kilometraje'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            new_mileage = int(new_mileage)
            if new_mileage < 0:
                return Response(
                    {'error': 'El kilometraje no puede ser negativo'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            vehicle.current_mileage = new_mileage
            vehicle.save()
            
            serializer = VehicleDetailSerializer(vehicle)
            return Response(serializer.data)
        
        except ValueError:
            return Response(
                {'error': 'El kilometraje debe ser un número válido'},
                status=status.HTTP_400_BAD_REQUEST
            )
