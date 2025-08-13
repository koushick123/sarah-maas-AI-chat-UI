import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// PrimeNG modules (add more as needed)
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [
    FormsModule,
    HttpClientModule,
    ButtonModule,
    SelectModule,
    CommonModule,
    // CardModule,
    TextareaModule
    // PanelModule
  ],
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent {
  books = [
    { label: 'Select a Book', value: null },
    { label: 'Crescent City - House of Earth and Blood', value: 'book1' },
    { label: 'Crescent City - House of Sky and Breath', value: 'book2' },
    { label: 'Crescent City - House of Flame and Shadow', value: 'book3' }
  ];

  chapters: any[] = [];
  selectedBook: string | null = null;
  selectedChapter: string | null = null;

  summaryOptions = [
    "Summary 1 - Summarize entire chapter using regular ChatGPT",
    "Summary 2 - Summarize chapter part by part and merge",
    "Summary 3 - Merge Summary 1 and Summary 2 using regular ChatGPT"
  ];

  selectedSummary: string | null = null;

  constructor(private http: HttpClient) {}

  onBookChange() {
    if (this.selectedBook === 'book1') {
      this.chapters = [
        { label: 'Select a Chapter', value: null },
        { label: 'Chapter 1', value: 'Chapter 1' },
        { label: 'Chapter 2', value: 'Chapter 2' }
      ];
    } else {
      this.chapters = [];
    }
  }

  generateSummary() {
    const payload = {
      chapter_summary: `Content of ${this.selectedChapter}`,
      summary_option: this.selectedSummary
    };

    this.http.post('http://127.0.0.1:8000/chapter/summary', payload)
      .subscribe({
        next: (res) => console.log('Summary:', res),
        error: (err) => console.error('Error:', err)
      });
  }
}
