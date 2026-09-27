import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { BottomNav } from './bottom-nav';

@Component({ template: '' })
class PaginaVazia {}

describe('BottomNav', () => {
  let el: HTMLElement;

  const links = () => [...el.querySelectorAll<HTMLAnchorElement>('nav a')];
  const nomeAcessivel = (a: HTMLAnchorElement) =>
    a.getAttribute('aria-label') ?? a.textContent?.trim();
  const ativo = () => el.querySelector<HTMLAnchorElement>('nav a[aria-current="page"]');

  async function abrir(url: string) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          ['disciplinas', 'cards-pendentes', 'revisao', 'desempenho'].map((path) => ({
            path,
            component: PaginaVazia,
          })),
        ),
      ],
    });
    const harness = await RouterTestingHarness.create(url);
    const fixture = TestBed.createComponent(BottomNav);
    el = fixture.nativeElement;
    await fixture.whenStable();
    return harness;
  }

  it('mostra os mesmos quatro destinos da sidebar, com "Pendentes" abreviado', async () => {
    await abrir('/disciplinas');

    expect(links().map((a) => a.textContent?.trim())).toEqual([
      'Disciplinas',
      'Pendentes',
      'Revisão',
      'Desempenho',
    ]);
  });

  it('mantém o nome completo para leitores de tela', async () => {
    await abrir('/disciplinas');

    expect(links().map(nomeAcessivel)).toEqual([
      'Disciplinas',
      'Cards Pendentes',
      'Revisão',
      'Desempenho',
    ]);
  });

  it('marca como ativo só o item da rota atual e acompanha a navegação', async () => {
    const harness = await abrir('/disciplinas');
    expect(nomeAcessivel(ativo()!)).toBe('Disciplinas');
    expect(el.querySelectorAll('.item--ativo').length).toBe(1);

    await harness.navigateByUrl('/cards-pendentes');
    expect(nomeAcessivel(ativo()!)).toBe('Cards Pendentes');
  });
});
