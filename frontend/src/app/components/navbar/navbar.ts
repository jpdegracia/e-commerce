import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCartShopping, faSolidChevronDown, faSolidUser } from '@ng-icons/font-awesome/solid'
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, NgIcon], // 👈 Import these so your HTML buttons work!
  providers: [provideIcons({ faSolidCartShopping, faSolidChevronDown, faSolidUser})],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  public authService = inject(AuthService); 
  private router = inject(Router);

  isDropdownOpen = false;

  onLogout() {
    this.authService.logout();
    this.isDropdownOpen = false; // Ensure it closes on logout
    this.router.navigate(['/login']);
  }
}

