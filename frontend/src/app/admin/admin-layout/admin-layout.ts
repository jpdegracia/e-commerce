import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidBoxOpen, faSolidCartShopping, faSolidClipboardList, faSolidHouse, faSolidKey, faSolidUserGear, faSolidUserGroup } from '@ng-icons/font-awesome/solid';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIcon],
  providers: [provideIcons({ faSolidHouse, faSolidUserGroup, faSolidBoxOpen, faSolidCartShopping, faSolidUserGear, faSolidKey, faSolidClipboardList, })],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayoutComponent {}
