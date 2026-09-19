import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from '../../shared/components/footer/footer';
import { Navbar } from '../../shared/components/navbar/navbar';

/**
 * Shell for single-focus pages (auth, cart, checkout, order history, product
 * detail) that shouldn't compete with a sidebar for attention — see
 * DESIGN.md layout notes.
 */
@Component({
  selector: 'app-shell-simple',
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './shell-simple.html',
})
export class ShellSimple {}
