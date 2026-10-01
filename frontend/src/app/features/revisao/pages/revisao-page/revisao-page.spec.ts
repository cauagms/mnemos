import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { RevisaoService } from '../../services/revisao.service';
import { RevisaoPage } from './revisao-page';

describe('RevisaoPage', () => {
  async function iniciar(resumo: { hoje: number; novos: number }) {
    await TestBed.configureTestingModule({
      imports: [RevisaoPage],
      providers: [provideRouter([]), { provide: RevisaoService, useValue: { resumo: () => of(resumo) } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(RevisaoPage);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const link = (el: HTMLElement, texto: string) =>
    [...el.querySelectorAll('a')].find((a) => a.textContent?.includes(texto)) ?? null;

  it('mostra quantos itens esperam hoje e quantos são novos, cada um levando à sua sessão', async () => {
    const el = await iniciar({ hoje: 5, novos: 3 });

    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Revisão');

    const hoje = link(el, 'Continuar de onde parei');
    expect(hoje?.textContent).toContain('5');
    expect(hoje?.textContent).toContain('esperando hoje');
    expect(hoje?.getAttribute('href')).toBe('/revisao/hoje');

    const novos = link(el, 'Descobrir algo novo');
    expect(novos?.textContent).toContain('3');
    expect(novos?.textContent).toContain('recém-chegados');
    expect(novos?.getAttribute('href')).toBe('/revisao/novos');
  });

  it('não leva a uma sessão vazia', async () => {
    const el = await iniciar({ hoje: 0, novos: 2 });

    expect(link(el, 'Continuar de onde parei')).toBeNull();
    expect(el.textContent).toContain('Tudo em dia por hoje');
    expect(link(el, 'Descobrir algo novo')).not.toBeNull();
  });
});
