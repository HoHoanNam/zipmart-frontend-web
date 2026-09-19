import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from '../../shared/components/footer/footer';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Sidebar } from '../../shared/components/sidebar/sidebar';

/**
 * Shell for browsing pages that share the left sidebar (Home, Products —
 * see DESIGN.md layout notes). Category pages should nest under this same
 * layout later without touching it.
 */
@Component({
  selector: 'app-shell-with-sidebar',
  imports: [RouterOutlet, Navbar, Sidebar, Footer],
  templateUrl: './shell-with-sidebar.html',
})
export class ShellWithSidebar {}
