import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list';
import { CartComponent } from './components/cart/cart';
import { ProductsComponent } from './components/products/products';
import { CategoryComponent } from './components/category/category';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register'
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password'

export const routes: Routes = [
  // 🏠 Homepage
  { path: '', component: ProductListComponent },
  
  // 🛍️ Main Pages
  { path: 'products', component: ProductsComponent },
  { path: 'category', component: CategoryComponent },
  { path: 'cart', component: CartComponent },
  
  // 🔐 Authentication
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },


  
  // 🔄 Fallback: Redirect any typos back to the homepage
  { path: '**', redirectTo: '' }
];