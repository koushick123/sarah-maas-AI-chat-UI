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
import { MessageModule } from 'primeng/message';
import { ScrollTopModule } from 'primeng/scrolltop';

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
    ProgressSpinnerModule,
    MessageModule,
    ScrollTopModule
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
  parts: any[] = [];
  selectedBook: string | null = null;
  selectedChapter: string | null = null;
  summaryoption: string = '';    
  chapterContent: string = '';
  displayDialog: boolean = false;
  selectedSummary: string | null = null;
  part_chapter_map: Map<string, string[]> = new Map();
  selectedPart: string = '';
  summaryvalue: string = '';
  fetchedsummary: boolean = false;
  BASE_URL: string = 'http://localhost:8000';

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
    this.selectedChapter = selChapter;
    this.dataFetch = false;   
    this.displayDialog = true;
    this.chapterContent = '';
    this.showChapterContent();
  }

  delayAction(ms: number, callback: () => void) {
  setTimeout(() => {
    callback();
  }, ms);
}

  dataFetch: boolean = false;
  url: string = '';

  showChapterContent(){
    this.url = this.BASE_URL+'/book/'+this.selectedBook+'/chapter/'+this.selectedChapter+'/contents';
    console.log(this.url);
    this.http.get<string>(this.url)
      .subscribe({
        next :(data) => {
          this.dataFetch = true;
          this.chapterContent = data;
        },
        error: (err) => {
          this.dataFetch = true;
        }
      });
  }

  onHideDialog(){
    this.displayDialog = false;
  }
  
  fetchChapterNames() {
    this.http.get<Map<string, string[]>>(this.BASE_URL+'/book/'+this.selectedBook+'/chapters')
      .subscribe({
        next: (data) => {
          const sortedEntries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
          this.part_chapter_map = new Map<string, string[]>(sortedEntries);
          
          // Parts list
          this.parts = Array.from(this.part_chapter_map.keys());
        },
        error: (err) => console.error('Error fetching chapters:', err)
      });
  }

  fetchChapterFromPart(){
    if (typeof (this.part_chapter_map.get(this.selectedPart)) != 'undefined'){
      const chaptersList = this.part_chapter_map.get(this.selectedPart);
      if (chaptersList) {
        this.chapters = chaptersList.map(chapter => ({
          label: chapter,
          value: chapter
        }));
      }
    }
  }

  generateSummary() {
    const summary_request_payload = {
      "book_name": this.selectedBook,
      "part": this.selectedPart,
      "chapter_name": this.selectedChapter,
      "chapter_content": this.chapterContent,
      "summary_option": this.selectedSummary
    };

    this.http.post<string>(this.BASE_URL+'/chapter/summary', summary_request_payload)
      .subscribe({
        next: (summary) => {
          this.summaryvalue = summary;
          console.log('Summary:', summary);
          this.fetchedsummary = true;
        },
        error: (err) => {
          console.error('Error:', err)
          this.summaryvalue = err;
          this.fetchedsummary = true;
        }
      });
  }
}
