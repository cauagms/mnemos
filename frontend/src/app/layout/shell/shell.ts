import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNav } from '../bottom-nav/bottom-nav';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Sidebar, BottomNav],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {}
