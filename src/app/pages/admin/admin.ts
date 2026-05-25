import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';


@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {
  constructor(private router: Router) {}
  }