from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication
    path('login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.RegisterView.as_view(), name='register'),
    
    # User Management
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('users/', views.user_list, name='user_list'),
    path('check/', views.check_auth, name='check_auth'),
]
