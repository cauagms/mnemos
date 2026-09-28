import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { Subject, of } from 'rxjs';
import { DisciplinasService } from '../../../disciplinas/services/disciplinas.service';
import { TopicosService } from '../../../disciplinas/services/topicos.service';
import { UploadService } from '../../services/upload.service';
import { EnviarMaterialPage } from './enviar-material-page';

describe('EnviarMaterialPage', () => {
  let fixture: ComponentFixture<EnviarMaterialPage>;
  let el: HTMLElement;
  let navigate: ReturnType<typeof vi.spyOn>;
  let uploadService: { enviar: ReturnType<typeof vi.fn> };
  /** Resposta do envio: fica pendente até o teste mandar concluir. */
  let envio: Subject<void>;

  const texto = (seletor: string) => el.querySelector(seletor)?.textContent?.trim() ?? null;
  const botao = (rotulo: string) =>
    [...el.querySelectorAll('button')].find(
      (b) => b.textContent?.trim() === rotulo || b.getAttribute('aria-label') === rotulo,
    ) ?? null;
  const seletor = () => el.querySelector<HTMLInputElement>('input[type="file"]')!;

  const arquivo = (nome: string, bytes = 2048) => new File(['x'.repeat(bytes)], nome);

  async function selecionar(file: File) {
    Object.defineProperty(seletor(), 'files', { value: [file], configurable: true });
    seletor().dispatchEvent(new Event('change'));
    await fixture.whenStable();
  }

  async function soltar(file: File) {
    const evento = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(evento, 'dataTransfer', { value: { files: [file] } });
    el.querySelector('.area')!.dispatchEvent(evento);
    await fixture.whenStable();
  }

  async function iniciar(disciplinaId = '1', topicoId = '5') {
    envio = new Subject<void>();
    uploadService = { enviar: vi.fn(() => envio) };

    await TestBed.configureTestingModule({
      imports: [EnviarMaterialPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: disciplinaId, topicoId }) } },
        },
        {
          provide: DisciplinasService,
          useValue: { listar: () => of([{ id: '1', nome: 'Matemática' }]) },
        },
        {
          provide: TopicosService,
          useValue: {
            listar: (id: string) =>
              of(
                id === '1'
                  ? [
                      { id: '5', nome: 'Álgebra', formato: 'flashcards' },
                      { id: '6', nome: 'Cálculo', formato: 'quiz' },
                    ]
                  : [],
              ),
          },
        },
        { provide: UploadService, useValue: uploadService },
      ],
    }).compileComponents();

    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(EnviarMaterialPage);
    el = fixture.nativeElement;
    await fixture.whenStable();
  }

  it('mostra o título, onde o usuário está e o link de volta para os tópicos', async () => {
    await iniciar();

    expect(texto('h1')).toBe('Enviar material');
    expect([...el.querySelectorAll('.trilha span')].map((s) => s.textContent?.trim())).toEqual([
      'Matemática',
      '›',
      'Álgebra',
    ]);
    const voltar = [...el.querySelectorAll('a')].find((a) => a.textContent?.trim() === 'Voltar');
    expect(voltar?.getAttribute('href')).toBe('/disciplinas/1');
  });

  it('começa pedindo um arquivo, sem limite de tamanho no texto', async () => {
    await iniciar();

    expect(texto('.area h2')).toBe('Arraste e solte seu arquivo aqui');
    expect(botao('Selecionar arquivo')).not.toBeNull();
    expect(texto('.formatos')).toBe('Formatos aceitos: PDF, DOCX, PPTX');
    expect(seletor().accept).toBe('.pdf,.docx,.pptx');
  });

  it('"Selecionar arquivo" abre o seletor de arquivos', async () => {
    await iniciar();
    const abrir = vi.spyOn(seletor(), 'click');

    botao('Selecionar arquivo')!.click();

    expect(abrir).toHaveBeenCalled();
  });

  it('mostra o arquivo escolhido com o tamanho e o botão de enviar', async () => {
    await iniciar();
    await selecionar(arquivo('resumo.pdf', 2048));

    expect(texto('.arquivo-nome')).toBe('resumo.pdf');
    expect(texto('.arquivo-tamanho')).toBe('2 KB');
    expect(botao('Enviar material')).not.toBeNull();
    expect(texto('.area h2')).toBeNull();
  });

  it('aceita o arquivo arrastado e solto na área', async () => {
    await iniciar();
    await soltar(arquivo('slides.PPTX', 3 * 1024 * 1024));

    expect(texto('.arquivo-nome')).toBe('slides.PPTX');
    expect(texto('.arquivo-tamanho')).toBe('3,0 MB');
  });

  it('recusa formatos que não são PDF, DOCX ou PPTX', async () => {
    await iniciar();
    await selecionar(arquivo('foto.png'));

    expect(texto('.erro')).toBe('Formato não aceito. Envie PDF, DOCX ou PPTX.');
    expect(texto('.arquivo-nome')).toBeNull();
  });

  it('escolher um arquivo válido depois apaga o erro', async () => {
    await iniciar();
    await selecionar(arquivo('foto.png'));
    await selecionar(arquivo('resumo.docx'));

    expect(texto('.erro')).toBeNull();
    expect(texto('.arquivo-nome')).toBe('resumo.docx');
  });

  it('remover o arquivo volta a pedir um arquivo', async () => {
    await iniciar();
    await selecionar(arquivo('resumo.pdf'));

    botao('Remover arquivo')!.click();
    await fixture.whenStable();

    expect(texto('.arquivo-nome')).toBeNull();
    expect(texto('.area h2')).toBe('Arraste e solte seu arquivo aqui');
  });

  describe('ao enviar', () => {
    const escolhido = arquivo('resumo.pdf');

    beforeEach(async () => {
      await iniciar();
      await selecionar(escolhido);
      botao('Enviar material')!.click();
      await fixture.whenStable();
    });

    it('envia o arquivo escolhido para o tópico', () => {
      expect(uploadService.enviar).toHaveBeenCalledWith('1', '5', escolhido);
    });

    it('mostra que o material está sendo processado, no lugar do arquivo', () => {
      expect(texto('.processando h2')).toBe('Processando seu material...');
      expect(texto('.processando p')).toBe('Isso pode levar alguns instantes.');
      expect(el.querySelector('.processando')!.getAttribute('role')).toBe('status');
      expect(texto('.arquivo-nome')).toBeNull();
      expect(botao('Enviar material')).toBeNull();
    });

    it('não aceita outro arquivo enquanto processa', async () => {
      await soltar(arquivo('outro.pdf'));

      expect(texto('.processando h2')).toBe('Processando seu material...');
      expect(texto('.arquivo-nome')).toBeNull();
    });

    describe('quando termina', () => {
      beforeEach(async () => {
        envio.complete();
        await fixture.whenStable();
      });

      it('confirma o envio, diz onde estão os flashcards e leva até Cards Pendentes', () => {
        expect(texto('.processando')).toBeNull();
        expect(el.querySelector('.enviado')!.getAttribute('role')).toBe('status');
        expect(texto('.enviado h2')).toBe('Material enviado com sucesso!');
        expect(texto('.enviado p')).toBe(
          'Seus flashcards já estão em Cards Pendentes. Acesse para revisar e aprovar.',
        );
        const ir = el.querySelector<HTMLAnchorElement>('.enviado a');
        expect(ir?.textContent?.trim()).toBe('Ir para Cards Pendentes');
        expect(ir?.getAttribute('href')).toBe('/cards-pendentes');
      });

      it('"Enviar outro material" volta a pedir um arquivo', async () => {
        botao('Enviar outro material')!.click();
        await fixture.whenStable();

        expect(texto('.enviado')).toBeNull();
        expect(texto('.area h2')).toBe('Arraste e solte seu arquivo aqui');
      });
    });
  });

  it('num tópico de quiz, confirma o envio e diz que as questões estão em Revisão', async () => {
    await iniciar('1', '6');
    await selecionar(arquivo('lista.pdf'));
    botao('Enviar material')!.click();
    await fixture.whenStable();
    envio.complete();
    await fixture.whenStable();

    expect(texto('.enviado h2')).toBe('Material enviado com sucesso!');
    expect(texto('.enviado p')).toBe('Suas questões já estão em Revisão. Acesse para responder.');
    const ir = el.querySelector<HTMLAnchorElement>('.enviado a');
    expect(ir?.textContent?.trim()).toBe('Ir para Revisão');
    expect(ir?.getAttribute('href')).toBe('/revisao');
  });

  it('volta para os tópicos da disciplina se o tópico não existe', async () => {
    await iniciar('1', '99');
    expect(navigate).toHaveBeenCalledWith(['/disciplinas', '1']);
  });
});
