import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/** Navegação principal no celular e no tablet: substitui a sidebar abaixo de 1024px. */
@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.scss',
})
export class BottomNav {}
