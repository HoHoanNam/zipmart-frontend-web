import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from '../../shared/components/footer/footer';
import { Navbar } from '../../shared/components/navbar/navbar';

/**
 * Single shared shell for every top-level page (Home, Products, product
 * detail, auth, cart, checkout, order history). The sidebar-based shell was
 * removed — see docs/PROJECT-CATALOG-UI-REVIEW-EXPANSION.md Phần 2.1 — so
 * this is now the only shell in the app.
 */
@Component({
  selector: 'app-shell-simple',
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './shell-simple.html',
})
export class ShellSimple {}
