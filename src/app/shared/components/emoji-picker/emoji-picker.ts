import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { DEFAULT_FREQUENT, EMOJI_CATEGORIES, EmojiCategory } from './emoji-data';

const FREQUENT_KEY = 'frequentEmojis';
const FREQUENT_MAX = 16;

/**
 * Shared emoji picker (comments, posts, ...).
 * Emits `emojiSelect` with the picked emoji and `closed` when the user clicks outside.
 * The trigger button in the host should call `$event.stopPropagation()`.
 */
@Component({
  selector: 'app-emoji-picker',
  templateUrl: './emoji-picker.html',
  host: {
    class: 'block',
  },
})
export class EmojiPicker {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly scrollArea = viewChild<ElementRef<HTMLDivElement>>('scrollArea');

  emojiSelect = output<string>();
  closed = output<void>();

  search = signal('');
  activeCategory = signal('frequent');
  frequent = signal<string[]>(this.loadFrequent());

  readonly categories = computed<EmojiCategory[]>(() => [
    {
      id: 'frequent',
      label: 'Frequently used',
      icon: 'fa-regular fa-clock',
      emojis: this.frequent().map((char) => ({ char, name: '' })),
    },
    ...EMOJI_CATEGORIES,
  ]);

  readonly searchResults = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return [];
    return EMOJI_CATEGORIES.flatMap((c) => c.emojis).filter((e) => e.name.includes(term));
  });

  readonly activeIndex = computed(() =>
    Math.max(0, this.categories().findIndex((c) => c.id === this.activeCategory()))
  );

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.closed.emit();
    }
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  pick(char: string): void {
    this.emojiSelect.emit(char);
    const updated = [char, ...this.frequent().filter((e) => e !== char)].slice(0, FREQUENT_MAX);
    this.frequent.set(updated);
    localStorage.setItem(FREQUENT_KEY, JSON.stringify(updated));
  }

  goToCategory(id: string): void {
    this.search.set('');
    this.activeCategory.set(id);
    // Wait for the list to render (search may have hidden it).
    setTimeout(() => {
      const area = this.scrollArea()?.nativeElement;
      const section = area?.querySelector<HTMLElement>(`[data-category="${id}"]`);
      if (area && section) {
        area.scrollTo({ top: section.offsetTop, behavior: 'smooth' });
      }
    });
  }

  /** Highlights the category whose section is currently at the top of the scroll area. */
  onScroll(): void {
    const area = this.scrollArea()?.nativeElement;
    if (!area || this.search()) return;
    const sections = Array.from(area.querySelectorAll<HTMLElement>('[data-category]'));
    const top = area.scrollTop + 8;
    let current = sections[0]?.dataset['category'] ?? 'frequent';
    for (const section of sections) {
      if (section.offsetTop <= top) {
        current = section.dataset['category'] ?? current;
      }
    }
    this.activeCategory.set(current);
  }

  private loadFrequent(): string[] {
    try {
      const saved = JSON.parse(localStorage.getItem(FREQUENT_KEY) ?? 'null');
      if (Array.isArray(saved) && saved.length) return saved;
    } catch {
      /* ignore broken storage */
    }
    return DEFAULT_FREQUENT;
  }
}
