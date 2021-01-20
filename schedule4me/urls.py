from django.urls import path
from . import views

urlpatterns = [
    path('', views.landingPage, name='landing'),
    path('data-enter', views.dataEnterPage, name='data-enter'),
    path('output', views.outputPage, name='output'),
    path('success', views.successPage, name='success'),
    path('import', views.importPage, name='import'),
]