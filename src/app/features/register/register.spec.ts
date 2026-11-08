import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Register } from './register';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('validates full names between 2 and 30 characters', () => {
    const name = component.registerForm.controls.name;

    name.setValue('A');
    expect(name.hasError('minlength')).toBe(true);

    name.setValue('Ab');
    expect(name.valid).toBe(true);

    name.setValue('a'.repeat(30));
    expect(name.valid).toBe(true);

    name.setValue('a'.repeat(31));
    expect(name.hasError('maxlength')).toBe(true);
  });

  it('validates usernames between 3 and 30 characters when provided', () => {
    const username = component.registerForm.controls.username;

    username.setValue('');
    expect(username.valid).toBe(true);

    username.setValue('ab');
    expect(username.hasError('minlength')).toBe(true);

    username.setValue('abc');
    expect(username.valid).toBe(true);

    username.setValue('a'.repeat(30));
    expect(username.valid).toBe(true);

    username.setValue('a'.repeat(31));
    expect(username.hasError('maxlength')).toBe(true);
  });
});
