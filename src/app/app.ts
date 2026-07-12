import { Component, signal, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly STORAGE_KEY = 'b64_converter_mode';
  protected readonly title = signal('base64');
  
  inputText = signal<string>('');
  isEncodingMode = signal<boolean>(this.getInitialMode());

  sourceLabel = computed(() => this.isEncodingMode() ? 'Обычный текст' : 'Код Base64');
  targetLabel = computed(() => this.isEncodingMode() ? 'Код Base64' : 'Обычный текст');
  buttonText = computed(() => this.isEncodingMode() ? 'Кодировать' : 'Декодировать');
  
  outputText = computed(() => {
    const text = this.inputText();
    if (!text) return '';

    const tokens = text.split(/([\n;])/);

    const processedTokens = tokens.map(token => {
      if (token === '\n' || token === ';') {
        return token;
      }

      if (!token.trim()) {
        return token;
      }

      const trimmedToken = token.trim();

      if (this.isEncodingMode()) {
        try {
          const bytes = new TextEncoder().encode(trimmedToken);
          const binaryString = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
          return btoa(binaryString);
        } catch (e) {
          return '[Ошибка]';
        }
      } else {
        try {
          const binaryString = atob(trimmedToken);
          const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0));
          return new TextDecoder().decode(bytes);
        } catch (e) {
          return '[Некорректный Base64]';
        }
      }
    });

    return processedTokens.join('');
  });

  constructor() {
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY, String(this.isEncodingMode()));
    });
  }

  swapModes() {
    this.isEncodingMode.update(val => !val);
    const currentOutput = this.outputText();
    if (currentOutput && !currentOutput.includes('Ошибка') && !currentOutput.includes('Некорректная')) {
      this.inputText.set(currentOutput);
    } else {
      this.inputText.set('');
    }
  }

  private getInitialMode(): boolean {
    const savedMode = localStorage.getItem(this.STORAGE_KEY);
    return savedMode === null ? true : savedMode === 'true';
  }
}


