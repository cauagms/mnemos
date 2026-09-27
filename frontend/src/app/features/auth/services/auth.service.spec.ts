import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService (simulado)', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.useFakeTimers();
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('login responde só depois de cerca de 1,5 s', () => {
    const next = vi.fn();
    const complete = vi.fn();
    service.login({ email: 'aluno@email.com', senha: '12345678' }).subscribe({ next, complete });

    vi.advanceTimersByTime(1400);
    expect(next).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(next).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalled();
  });

  it('cadastrar responde só depois de cerca de 1,5 s', () => {
    const next = vi.fn();
    const complete = vi.fn();
    service
      .cadastrar({ nome: 'Aluno', email: 'aluno@email.com', senha: '12345678' })
      .subscribe({ next, complete });

    vi.advanceTimersByTime(1400);
    expect(next).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(next).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalled();
  });
});
