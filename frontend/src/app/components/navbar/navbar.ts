import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCartShopping } from '@ng-icons/font-awesome/solid'

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIcon], // 👈 Import these so your HTML buttons work!
  providers: [provideIcons({ faSolidCartShopping})],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  // We will add state management here later to update the cart badge dynamically!
}

