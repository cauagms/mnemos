import { TestBed } from '@angular/core/testing';
import { UploadService } from './upload.service';

describe('UploadService (simulado)', () => {
  let service: UploadService;

  beforeEach(() => {
    vi.useFakeTimers();
    service = TestBed.inject(UploadService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('só termina o envio depois de um tempo de processamento', () => {
    const concluido = vi.fn();
    service.enviar('1', '5', new File(['x'], 'resumo.pdf')).subscribe({ complete: concluido });

    expect(concluido).not.toHaveBeenCalled();

    vi.runAllTimers();

    expect(concluido).toHaveBeenCalled();
  });
});
