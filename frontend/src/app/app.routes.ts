import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list';
import { CartComponent } from './components/cart/cart';
import{ ProductComponent } from './components/products/products'
import { CategoryComponent } from './components/category/category';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password';
import { VerifyEmailComponent } from './components/verify-email/verify-email';
import { CheckoutComponent } from './components/checkout/checkout';

//Admin
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard';
import { AdminProductsComponent } from './admin/admin-products/admin-products';
import { AdminUsersComponent } from './admin/admin-users/admin-users';
import { AdminOrdersComponent } from './admin/admin-orders/admin-orders';
import { CreateProductComponent } from './admin/create-product/create-product';
import { UpdateProductComponent } from './admin/update-product/update-product';
import { CreateUserComponent } from './admin/create-user/create-user';
import { UpdateUserComponent } from './admin/update-user/update-user';
import { ViewProductComponent } from './admin/view-product/view-product';

export const routes: Routes = [
  // 🏠 Homepage
  { path: '', component: ProductListComponent },
  
  // 🔐 Authentication
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'verify-email', component: VerifyEmailComponent },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'products', component: AdminProductsComponent },
      { path: 'products/add', component: CreateProductComponent },
      { path: 'products/view/:id', component: ViewProductComponent },
      { path: 'products/edit/:id', component: UpdateProductComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'users/add', component: CreateUserComponent },
      { path: 'users/edit/:id', component: UpdateUserComponent },
      { path: 'orders', component: AdminOrdersComponent },
    ]
  },

  //Products and Categories
  { path: 'product/:id', component: ProductComponent},
  { path: 'products/category/:id', component: CategoryComponent},

  //Carts and Orders
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },


  
  // 🔄 Fallback: Redirect any typos back to the homepage
  { path: '**', redirectTo: '' }
];