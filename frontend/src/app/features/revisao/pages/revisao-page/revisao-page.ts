import { NgTemplateOutlet } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { RevisaoService } from '../../services/revisao.service';

/** Entrada da Revisão: escolhe entre os itens agendados para hoje e os recém-chegados. */
@Component({
  selector: 'app-revisao-page',
  imports: [RouterLink, NgTemplateOutlet],
  templateUrl: './revisao-page.html',
  // Reaproveita o título da tela de Disciplinas.
  styleUrls: ['../../../disciplinas/pages/disciplinas-page/disciplinas-page.scss', './revisao-page.scss'],
})
export class RevisaoPage {
  /** `undefined` enquanto os dados ainda não chegaram. */
  protected readonly resumo = toSignal(inject(RevisaoService).resumo());
}
