import { AlertCircle, ArrowUpDown, Edit2, Filter, Package, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import ProductModal from '../components/inventory/ProductModal';
import StockAdjustmentModal from '../components/inventory/StockAdjustmentModal';
import { inventoryService } from '../services/inventoryService';

const InventoryManagementPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, categoryFilter, stockFilter]);

  const applyFilters = () => {
    let filtered = [...products];

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro de categoría
    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    // Filtro de stock
    if (stockFilter === 'LOW') {
      filtered = filtered.filter(p => p.is_low_stock);
    } else if (stockFilter === 'AVAILABLE') {
      filtered = filtered.filter(p => p.stock_quantity > p.min_stock);
    } else if (stockFilter === 'OUT') {
      filtered = filtered.filter(p => p.stock_quantity === 0);
    }

    setFilteredProducts(filtered);
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    const product = products.find(p => p.id === productId);
    if (window.confirm(`¿Estás seguro de eliminar "${product.name}"?\n\nEsta acción no se puede deshacer.`)) {
      try {
        await inventoryService.deleteProduct(productId);
        setProducts(products.filter(p => p.id !== productId));
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar el producto. Intenta nuevamente.');
      }
    }
  };

  const handleAdjustStock = (product) => {
    setSelectedProduct(product);
    setShowStockModal(true);
  };

  const handleModalClose = () => {
    setShowProductModal(false);
    setShowStockModal(false);
    setSelectedProduct(null);
    loadProducts();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shalom-red"></div>
      </div>
    );
  }

  const lowStockCount = products.filter(p => p.is_low_stock).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-shalom-gray mb-2">Gestión de Inventario</h1>
          <p className="text-gray-600">Administra productos, stock y precios</p>
        </div>
        <button onClick={handleCreateProduct} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-2" />
              Buscar Producto
            </label>
            <input
              type="text"
              placeholder="Buscar por código, nombre o marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Filtro de Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Categoría
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field"
            >
              <option value="ALL">Todas</option>
              <option value="ACEITE">Aceite</option>
              <option value="FILTRO_AIRE">Filtro de Aire</option>
              <option value="FILTRO_ACEITE">Filtro de Aceite</option>
              <option value="FILTRO_COMBUSTIBLE">Filtro de Combustible</option>
              <option value="OTROS">Otros</option>
            </select>
          </div>

          {/* Filtro de Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock
            </label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="input-field"
            >
              <option value="ALL">Todos</option>
              <option value="AVAILABLE">Disponible</option>
              <option value="LOW">Stock Bajo</option>
              <option value="OUT">Agotado</option>
            </select>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mt-4 text-sm text-gray-600">
          Mostrando {filteredProducts.length} de {products.length} productos
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Productos</p>
              <p className="text-3xl font-bold text-shalom-gray">{products.length}</p>
            </div>
            <div className="bg-blue-500 p-4 rounded-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Stock Bajo</p>
              <p className="text-3xl font-bold text-shalom-red">{lowStockCount}</p>
            </div>
            <div className="bg-shalom-red p-4 rounded-lg">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Activos</p>
              <p className="text-3xl font-bold text-green-600">
                {products.filter(p => p.is_active).length}
              </p>
            </div>
            <div className="bg-green-500 p-4 rounded-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Valor Total</p>
              <p className="text-2xl font-bold text-shalom-gray">
                ${products.reduce((sum, p) => sum + (p.sale_price * p.stock_quantity), 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-purple-500 p-4 rounded-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <h2 className="text-xl font-bold text-shalom-gray mb-4">Productos</h2>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            {products.length === 0 ? (
              <>
                <p>No hay productos registrados</p>
                <button onClick={handleCreateProduct} className="btn-primary mt-4">
                  Crear Primer Producto
                </button>
              </>
            ) : (
              <p>No se encontraron productos con los filtros aplicados</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P. Compra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P. Venta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Margen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.code}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.brand || '-'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category_display}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAdjustStock(product)}
                          className="text-sm font-semibold hover:text-shalom-red"
                        >
                          <span className={product.is_low_stock ? 'text-shalom-red' : 'text-green-600'}>
                            {product.stock_quantity} {product.unit_display}
                          </span>
                        </button>
                        {product.is_low_stock && (
                          <AlertCircle className="w-4 h-4 text-shalom-red" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.purchase_price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      ${product.sale_price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {product.profit_margin.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAdjustStock(product)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showProductModal && (
        <ProductModal
          product={selectedProduct}
          onClose={handleModalClose}
        />
      )}

      {showStockModal && (
        <StockAdjustmentModal
          product={selectedProduct}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default InventoryManagementPage;
