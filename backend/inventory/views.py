from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from django.core.exceptions import ValidationError
from .models import Product, StockMovement
from .serializers import (
    ProductSerializer,
    ProductCreateUpdateSerializer,
    StockMovementSerializer,
    StockAdjustmentSerializer
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class IsAdminUser(permissions.BasePermission):
    """
    Permiso personalizado: solo administradores pueden modificar
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.is_admin


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar productos del inventario
    """
    queryset = Product.objects.all()
    permission_classes = [IsAdminUser]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'name', 'brand', 'description']
    ordering_fields = ['name', 'stock_quantity', 'sale_price', 'created_at', 'category']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtrar por categoría
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Filtrar solo activos
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Filtrar productos con stock bajo
        low_stock = self.request.query_params.get('low_stock', None)
        if low_stock and low_stock.lower() == 'true':
            queryset = [p for p in queryset if p.is_low_stock]
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """
        Endpoint para obtener productos con stock bajo
        """
        products = [p for p in self.get_queryset() if p.is_low_stock]
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def categories(self, request):
        """
        Endpoint para obtener lista de categorías dinámicas de la base de datos
        """
        # Obtener todas las categorías únicas de productos existentes
        existing_categories = Product.objects.values_list('category', flat=True).distinct().order_by('category')
        
        # Crear lista de categorías con value y label
        all_categories = []
        for cat in existing_categories:
            if cat:
                # Convertir de UPPER_CASE a Title Case para el label
                label = cat.replace('_', ' ').title()
                all_categories.append({'value': cat, 'label': label})
        
        # Si no hay categorías, devolver una lista vacía para que se puedan agregar nuevas
        return Response(all_categories)
    
    @action(detail=True, methods=['post'])
    def adjust_stock(self, request, pk=None):
        """
        Endpoint para ajustar el stock de un producto
        """
        product = self.get_object()
        serializer = StockAdjustmentSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                movement = StockMovement.objects.create(
                    product=product,
                    movement_type=serializer.validated_data['movement_type'],
                    quantity=serializer.validated_data['quantity'],
                    reason=serializer.validated_data.get('reason', ''),
                    reference=serializer.validated_data.get('reference', ''),
                    performed_by=request.user
                )
                
                return Response({
                    'message': 'Stock ajustado correctamente',
                    'new_stock': product.stock_quantity,
                    'movement': StockMovementSerializer(movement).data
                })
            except ValidationError as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para consultar movimientos de stock (solo lectura)
    """
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtrar por producto
        product_id = self.request.query_params.get('product', None)
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        
        # Filtrar por tipo de movimiento
        movement_type = self.request.query_params.get('movement_type', None)
        if movement_type:
            queryset = queryset.filter(movement_type=movement_type)
        
        return queryset
