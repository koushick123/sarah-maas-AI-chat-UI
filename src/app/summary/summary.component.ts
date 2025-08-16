import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// PrimeNG modules (add more as needed)
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { CommonModule } from '@angular/common';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

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
    TextareaModule,
    RadioButtonModule,
    Dialog,
    ProgressSpinnerModule
],
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent {
  books = [
    { label: 'Select a Book', value: null },
    { label: 'Crescent City - House of Earth and Blood', value: 'Crescent-City-Book-1' },
    { label: 'Crescent City - House of Sky and Breath', value: 'Crescent-City-Book-2' },
    { label: 'Crescent City - House of Flame and Shadow', value: 'Crescent-City-Book-3' }
  ];

  chapters: any[] = [];
  selectedBook: string | null = null;
  selectedChapter: string | null = null;
  summaryoption: string = '';    
  chapterContent: string = '';
  displayDialog: boolean = false;
  selectedSummary: string | null = null;

  constructor(private http: HttpClient) {}

  onBookChange() {
    if (this.selectedBook !== null) {
      this.fetchChapterNames();
    } else {
      this.chapters = [];
    }
  }

  selectSummaryOption(selectedSummaryOption: string) {
    this.selectedSummary = selectedSummaryOption;
    if(this.selectedSummary === 'summary1') {
      this.summaryoption = 'summary1';
    }
    else if(this.selectedSummary === 'summary2') {
      this.summaryoption = 'summary2';
    }
    else if(this.selectedSummary === 'summary3') {
      this.summaryoption = 'summary3';
    }
  }

  fetchChapterContent(selChapter: string) {
    this.selectedChapter = selChapter.replace(" ","");
    this.dataFetch = false;
    this.displayDialog = true;
    this.showChapterContent();
  }

  dataFetch: boolean = false;
  url: string = '';

  showChapterContent(){
    this.url = 'http://localhost:8000/book/'+this.selectedBook+'/chapter/'+this.selectedChapter+'/contents';
    console.log(this.url);
    this.http.get<string>(this.url)
      .subscribe({
        next :(data) => {
          this.dataFetch = true;
          this.chapterContent = data;
        },
        error: (err) => {
          this.dataFetch = true;
          this.chapterContent = "Unable to Fetch Chapter Summary !!"
        }
      });
  }

  onHideDialog(){
    this.displayDialog = false;
  }

  fetchChapterNames() {
    this.http.get<any[]>('http://localhost:8000/book/'+this.selectedBook+'/chapters')
      .subscribe({
        next: (data) => {
          this.chapters = data.map(chapter => ({
            label: chapter,
            value: chapter
          }));
        },
        error: (err) => console.error('Error fetching chapters:', err)
      });
  }

  onChapterChange(){
    if (this.selectedChapter) {
      console.log('Selected Chapter:', this.selectedChapter);
    } else {
      console.log('No chapter selected');
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
