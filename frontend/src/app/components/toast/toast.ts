import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCircleCheck, faSolidCircleExclamation, faSolidCircleInfo, faSolidCircleXmark } from '@ng-icons/font-awesome/solid';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [provideIcons({ faSolidCircleCheck, faSolidCircleExclamation, faSolidCircleInfo, faSolidCircleXmark })],
  templateUrl: './toast.html',
  styleUrl: './toast.css'
})
export class ToastComponent {
  // Expose the service to the HTML template
  toastService = inject(ToastService);
}