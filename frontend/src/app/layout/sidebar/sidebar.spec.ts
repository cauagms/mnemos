import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Sidebar } from './sidebar';

@Component({ template: '' })
class PaginaVazia {}

describe('Sidebar', () => {
  let el: HTMLElement;

  const itens = () =>
    [...el.querySelectorAll<HTMLAnchorElement>('nav a')].map((a) => a.textContent?.trim());
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
    const fixture = TestBed.createComponent(Sidebar);
    el = fixture.nativeElement;
    await fixture.whenStable();
    return harness;
  }

  it('mostra os quatro destinos na ordem do menu', async () => {
    await abrir('/disciplinas');
    expect(itens()).toEqual(['Disciplinas', 'Cards Pendentes', 'Revisão', 'Desempenho']);
  });

  it('marca como ativo só o item da rota atual', async () => {
    await abrir('/disciplinas');

    expect(ativo()?.textContent?.trim()).toBe('Disciplinas');
    expect(ativo()?.classList).toContain('item--ativo');
    expect(el.querySelectorAll('.item--ativo').length).toBe(1);
  });

  it('acompanha a navegação', async () => {
    const harness = await abrir('/disciplinas');
    await harness.navigateByUrl('/revisao');

    expect(ativo()?.textContent?.trim()).toBe('Revisão');
  });
});
